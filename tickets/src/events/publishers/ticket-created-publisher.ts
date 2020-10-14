import {
    Publisher,
    Subjects,
    TicketCreatedEvent,
} from '@zgoksutickets/common-utils';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
