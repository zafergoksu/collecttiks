import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';

describe('show.ts', () => {
    it('returns 404 if the ticket is not found', async () => {
        const id = new mongoose.Types.ObjectId().toHexString();
        await request(app).get(`/api/tickets/${id}`).send().expect(404);
    });

    it('returns the ticket if the ticket is found', async () => {
        //const ticketDoc = Ticket.build({ title, price, userId: '1234567890' });
        //Ticket.save();
        //const ticket = Ticket.find({});
        //const ticketResponse = await request(app)
        //.get(`/api/tickets/${ticket[0].id}`)
        //.send()
        //.expect(200);
        //expect(ticketResponse.body.title).toEqual(ticketDoc.title);
        //expect(ticketResponse.body.price).toEqual(ticketDoc.price);
        //expect(ticketResponse.body.userId).toEqual(ticketDoc.userId);
        const title = 'concert';
        const price = 20;

        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signin())
            .send({
                title,
                price,
            })
            .expect(201);

        const ticketResponse = await request(app)
            .get(`/api/tickets/${response.body.id}`)
            .send()
            .expect(200);

        expect(ticketResponse.body.title).toEqual(title);
        expect(ticketResponse.body.price).toEqual(price);
    });
});
