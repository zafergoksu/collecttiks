import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import Ticket from '../../models/ticket';

describe('show.ts', () => {
    it('should display an order given by an id of a valid user', async () => {
        // Create a ticket
        const ticket = Ticket.build({
            title: 'concert',
            price: 20,
        });

        await ticket.save();

        // make a request to build an order with this ticket
        const user = global.signin();
        const result = await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id })
            .expect(201);

        // Make request to fetch the order
        const response = await request(app)
            .get(`/api/orders/${result.body.id}`)
            .set('Cookie', user)
            .expect(200);

        expect(response.body.id).toBe(result.body.id);
        expect(response.body.ticket).toBe(result.body.ticket.id);
    });

    it('should return an error if ticket is not found', async () => {
        const fakeMongoId = mongoose.Types.ObjectId();
        const user = global.signin();
        await request(app)
            .get(`/api/orders/${fakeMongoId}`)
            .set('Cookie', user)
            .expect(404);
    });

    it('should return an error if a user already has an order of ticket', async () => {
        // Create a ticket
        const ticket = Ticket.build({
            title: 'concert',
            price: 20,
        });

        const anotherTicket = Ticket.build({
            title: 'concert',
            price: 20,
        });

        await ticket.save();
        await anotherTicket.save();

        // make a request to build an order with this ticket
        const user = global.signin();
        const anotherUser = global.signin();

        const result = await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id })
            .expect(201);
        await request(app)
            .post('/api/orders')
            .set('Cookie', anotherUser)
            .send({ ticketId: anotherTicket.id })
            .expect(201);

        // Make request to fetch the order
        const response = await request(app)
            .get(`/api/orders/${result.body.id}`)
            .set('Cookie', anotherUser)
            .expect(401);
    });
});
