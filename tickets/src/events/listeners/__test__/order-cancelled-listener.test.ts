import { OrderCancelledEvent, OrderStatus } from '@zgoksutickets/common-utils';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import Ticket from '../../../models/ticket';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = mongoose.Types.ObjectId().toHexString();

    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 10,
        userId: 'asdf',
    });
    ticket.set({ orderId });
    await ticket.save();

    // Create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id!,
        },
    };

    // Create fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, data, msg };
};

describe('order-cancelled-listener.ts', () => {
    it('updates the ticket, publishes an event, and acks the message', async () => {
        const { listener, ticket, data, msg } = await setup();

        await listener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(ticket.id);
        expect(updatedTicket!.orderId).not.toBeDefined();
        expect(msg.ack).toHaveBeenCalled();
        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});
