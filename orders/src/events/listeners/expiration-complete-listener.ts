import { Listener, ExpirationCompleteEvent, Subjects, OrderStatus } from '@zgoksutickets/common-utils';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import Order from '../../models/orders';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status === OrderStatus.COMPLETE) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.CANCELLED,
        });

        await order.save();
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        msg.ack();
    }
}
