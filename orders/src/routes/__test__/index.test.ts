import request from 'supertest';
import app from '../../app';
import Ticket from '../../models/ticket';

const buildTicket = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
    });

    await ticket.save();
    return ticket;
};
describe('index.ts', () => {
    it('should displays all orders from the current user', async () => {
        // Create three tickets
        const ticketOne = await buildTicket();
        const ticketTwo = await buildTicket();
        const ticketThree = await buildTicket();

        const userOne = global.signin();
        const userTwo = global.signin();

        // Create one order as User #1
        const responseOne = await request(app)
            .post('/api/orders')
            .set('Cookie', userOne)
            .send({ ticketId: ticketOne.id })
            .expect(201);

        // Create two orders as User #2
        const responseTwo = await request(app)
            .post('/api/orders')
            .set('Cookie', userTwo)
            .send({ ticketId: ticketTwo.id })
            .expect(201);

        const responseThree = await request(app)
            .post('/api/orders')
            .set('Cookie', userTwo)
            .send({ ticketId: ticketThree.id })
            .expect(201);

        // Make request to get orders for User #1
        const responseUserOne = await request(app)
            .get('/api/orders')
            .set('Cookie', userOne)
            .expect(200);

        expect(responseUserOne.body.length).toEqual(1);
        expect(responseUserOne.body[0].id).toEqual(responseOne.body.id);
        expect(responseUserOne.body[0].ticket.id).toEqual(ticketOne.id);

        // Make request to get orders for User #2
        const responseUserTwo = await request(app)
            .get('/api/orders')
            .set('Cookie', userTwo)
            .expect(200);

        // Make sure we only go the orders for User #2
        expect(responseUserTwo.body.length).toEqual(2);
        expect(responseUserTwo.body[0].id).toEqual(responseTwo.body.id);
        expect(responseUserTwo.body[1].id).toEqual(responseThree.body.id);
        expect(responseUserTwo.body[0].ticket.id).toEqual(ticketTwo.id);
        expect(responseUserTwo.body[1].ticket.id).toEqual(ticketThree.id);
    });
});
