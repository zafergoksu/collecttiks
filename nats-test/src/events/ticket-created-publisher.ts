import { Publisher } from '@zgoksutickets/common-utils';
import { TicketCreatedEvent } from '@zgoksutickets/common-utils';
import { Subjects } from '@zgoksutickets/common-utils';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
