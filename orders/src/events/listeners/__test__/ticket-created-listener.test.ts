import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@zgoksutickets/common-utils';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import Ticket from '../../../models/ticket';

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // Create a fake data event
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };
};

describe('ticket-created-listener.ts', () => {
    it('creates and saves a ticket', async () => {
        const { listener, data, msg } = await setup();
        // Call onMessage function with the data object + message object
        await listener.onMessage(data, msg);

        const ticket = await Ticket.findById(data.id);
        expect(ticket).toBeDefined();
        expect(ticket!.title).toEqual(data.title);
        expect(ticket!.price).toEqual(data.price);
    });

    it('acks the message', async () => {
        const { listener, data, msg } = await setup();
        // Call onMessage function with the data object + message object
        await listener.onMessage(data, msg);
        // Assert ack
        expect(msg.ack).toHaveBeenCalled();
    });
});
