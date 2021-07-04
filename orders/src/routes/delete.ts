import {
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
} from '@zgoksutickets/common-utils';
import express, { Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import Order from '../models/orders';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId', async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    // Publishing an event saying this was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        },
    });

    res.status(204).send(order);
});

export default router;
