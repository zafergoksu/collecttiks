import {
    Publisher,
    OrderCancelledEvent,
    Subjects,
} from '@zgoksutickets/common-utils';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
