import { Message } from 'node-nats-streaming';
import {
    Subjects,
    Listener,
    TicketCreatedEvent,
} from '@zgoksutickets/common-utils';
import Ticket from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    // When a listener subscribes to a channel, the channel has a queue group.
    // This queue group ensures that an event being emitted only gets received by
    // one and only one listener and not by multiple.
    queueGroupName = queueGroupName;

    // A message tells about the underlying data of the event, with methods.
    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data;

        const ticket = Ticket.build({
            id,
            title,
            price,
        });
        await ticket.save();

        // Acknowledge that the message has been received by the listener,
        // coming from the publisher.
        msg.ack();
    }
}
