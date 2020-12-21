import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    requireAuth,
    validateRequest,
    DatabaseConnectionError,
} from '@zgoksutickets/common-utils';
import Ticket from '../models/ticket';
import db from 'mongoose';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/tickets',
    requireAuth,
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be greater than 0'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { title, price } = req.body;
        const session = await db.startSession();
        session.startTransaction();
        try {
            const ticket = Ticket.build({
                title,
                price,
                userId: req.currentUser!.id,
            });

            await ticket.save();
            new TicketCreatedPublisher(natsWrapper.client).publish({
                id: ticket.id!,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId,
            });
            await session.commitTransaction();
            res.status(201).send(ticket);
        } catch (err) {
            await session.abortTransaction();
            throw new DatabaseConnectionError();
        }
    }
);

export default router;
