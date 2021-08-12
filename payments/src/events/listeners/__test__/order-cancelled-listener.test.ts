import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@zgoksutickets/common-utils';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import Order from '../../../models/order';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.CREATED,
        price: 10,
        userId: 'asdf',
        version: 0,
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asdf'
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, order };
};

describe('order-cancelled-listener.ts', () => {
    it('updates the status of the order', async () => {
        const { listener, data, msg, order } = await setup();

        await listener.onMessage(data, msg);
        const updatedOrder = await Order.findById(order.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
    });

    it('acks the message', async () => {
        const { listener, data, msg } = await setup();

        await listener.onMessage(data, msg);
        expect(msg.ack).toHaveBeenCalled();
    })
});
