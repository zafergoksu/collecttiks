import {
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
} from '@zgoksutickets/common-utils';
import express, { Request, Response } from 'express';
import Order from '../models/orders';

const router = express.Router();

router.get(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        res.send(order);
    }
);

export default router;
