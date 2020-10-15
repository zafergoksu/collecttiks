import { Message } from 'node-nats-streaming';
import { Listener } from '@zgoksutickets/common-utils';
import { TicketCreatedEvent } from '@zgoksutickets/common-utils';
import { Subjects } from '@zgoksutickets/common-utils';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = 'payments-service';

    onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        console.log('Event data!', data);
        console.log(data.id);
        console.log(data.title);
        console.log(data.price);
        msg.ack();
    }
}
