import {
    Publisher,
    Subjects,
    TicketUpdatedEvent,
} from '@zgoksutickets/common-utils';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
