import { Publisher, PaymentCreatedEvent, Subjects } from '@zgoksutickets/common-utils';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
