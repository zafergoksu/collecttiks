import { Subjects, Publisher, ExpirationCompleteEvent } from '@zgoksutickets/common-utils';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
