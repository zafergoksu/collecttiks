import { Listener, Subjects, OrderStatus, PaymentCreatedEvent } from '@zgoksutickets/common-utils';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import Order from '../../models/orders';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({
            status: OrderStatus.COMPLETE
        });
        await order.save();
        msg.ack();
    }
}
