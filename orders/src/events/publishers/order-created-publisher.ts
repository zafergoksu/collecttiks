import {
    Publisher,
    OrderCreatedEvent,
    Subjects,
} from '@zgoksutickets/common-utils';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
