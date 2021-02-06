import { OrderStatus } from '@zgoksutickets/common-utils';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import Order from '../../models/orders';
import Ticket from '../../models/ticket';

describe('new.ts', () => {
    it('returns an error if the ticket does not exist', async () => {
        const ticketId = mongoose.Types.ObjectId();

        await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({ ticketId })
            .expect(404);
    });

    it('returns an error if the ticket is already reserved', async () => {
        const ticket = Ticket.build({
            title: 'concert',
            price: 20,
        });

        await ticket.save();

        const order = Order.build({
            ticket,
            userId: 'asdf',
            status: OrderStatus.CREATED,
            expiresAt: new Date(),
        });

        await order.save();

        await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({ ticketId: ticket.id })
            .expect(400);
    });

    it('reserves a ticket', async () => {
        const ticket = Ticket.build({
            title: 'concert',
            price: 20,
        });

        const createdTicket = await ticket.save();

        const response = await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({ ticketId: ticket.id })
            .expect(201);

        expect(response.body.status).toBe(OrderStatus.CREATED);
        expect(response.body.ticket.title).toBe(createdTicket.title);
        expect(response.body.ticket.price).toBe(createdTicket.price);
    });

    it.todo('emits an order created event');
});
