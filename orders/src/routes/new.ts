import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
    BadRequestError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from '@zgoksutickets/common-utils';
import { body } from 'express-validator';
import Ticket from '../models/ticket';
import Order from '../models/orders';

const router = express.Router();

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .notEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('TicketId must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;
        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }

        // Make sure that this ticket is not already reserved
        const isReserved = await ticket.isReserved();

        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }

        // Calculate the expiration date for this order

        // Build the order and save it to the database

        // Publish an event saying that an order was created
        res.send({});
    }
);

export default router;
