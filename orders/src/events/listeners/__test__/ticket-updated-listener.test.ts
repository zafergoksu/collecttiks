import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@zgoksutickets/common-utils';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import Ticket from '../../../models/ticket';

const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    // Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 999,
        userId: 'asdf',
    };

    // Create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, msg, data, ticket };
};

// Stubs
describe('ticket-updated-listener.ts', () => {
    it('finds, updates, and saves a ticket', async () => {
        const { listener, msg, data, ticket } = await setup();

        await listener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(ticket.id);
        expect(updatedTicket!.title).toEqual(data.title);
        expect(updatedTicket!.price).toEqual(data.price);
        expect(updatedTicket!.version).toEqual(data.version);
    });

    it('acks the message', async () => {
        const { listener, msg, data } = await setup();
        await listener.onMessage(data, msg);
        expect(msg.ack).toHaveBeenCalled();
    });

    it('does not call ack if the event has a skipped version number', async () => {
        const { listener, msg, data, ticket } = await setup();

        data.version = data.version + 1;

        expect(listener.onMessage(data, msg)).rejects.toThrow();
        expect(msg.ack).not.toHaveBeenCalled();
    });
});
