import { OrderStatus } from '@zgoksutickets/common-utils';
import request from 'supertest';
import app from '../../app';
import Order from '../../models/orders';
import Ticket from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('delete.ts', () => {
    it('should mark an order as cancelled', async () => {
        // Create a ticket with Ticket model
        const ticket = Ticket.build({
            title: 'concert',
            price: 20,
        });
        await ticket.save();

        // Make a request to create an order
        const user = global.signin();

        const order = await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id })
            .expect(201);

        // Make a request to cancel the order
        await request(app)
            .delete(`/api/orders/${order.body.id}`)
            .set('Cookie', user)
            .expect(204);

        // Expect the order to be cancelled
        const updatedOrder = await Order.findById(order.body.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
    });

    it('emits an order cancelled event', async () => {
        // Create a ticket with Ticket model
        const ticket = Ticket.build({
            title: 'concert',
            price: 20,
        });
        await ticket.save();

        // Make a request to create an order
        const user = global.signin();

        const order = await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id })
            .expect(201);

        expect(natsWrapper.client.publish).toHaveBeenCalled();

        // Make a request to cancel the order
        await request(app)
            .delete(`/api/orders/${order.body.id}`)
            .set('Cookie', user)
            .expect(204);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});
