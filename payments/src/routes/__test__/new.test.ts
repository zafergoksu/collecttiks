import request from 'supertest';
import { OrderStatus } from '@zgoksutickets/common-utils';
import mongoose from 'mongoose';
import app from '../../app';
import { stripe } from '../../stripe';
import Order from '../../models/order';
import Payment from '../../models/payment';

jest.mock('../../stripe');

describe('new.ts', () => {
    it('returns a 404 when purchasing an order that does not exist', async () => {
        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin())
            .send({
                token: 'asdf',
                orderId: mongoose.Types.ObjectId().toHexString(),
            })
            .expect(404);
    });

    it('returns a 401 when purchasing an order that does not belong to the user', async () => {
        const order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            userId: mongoose.Types.ObjectId().toHexString(),
            version: 0,
            price: 20,
            status: OrderStatus.CREATED,
        });
        await order.save();

        await request(app)
            .post('/api/payments')
            .send({
                token: 'asdf',
                orderId: order.id
            })
            .expect(401);
    });

    it('returns a 400 when purchasing a cancelled order', async () => {
        const userId = mongoose.Types.ObjectId().toHexString();
        const order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            userId,
            version: 0,
            price: 20,
            status: OrderStatus.CANCELLED,
        });
        await order.save();

        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin(userId))
            .send({
                token: 'asdf',
                orderId: order.id
            })
            .expect(400);
    });

    it('returns a 201 with a valid inputs', async () => {
        const userId = mongoose.Types.ObjectId().toHexString();
        const order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            userId,
            version: 0,
            price: 20,
            status: OrderStatus.CREATED,
        });
        await order.save();

        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin(userId))
            .send({
                token: 'tok_visa',
                orderId: order.id
            })
            .expect(201);

        const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
        const chargeResult = await (stripe.charges.create as jest.Mock).mock.results[0].value;

        expect(chargeOptions.source).toEqual('tok_visa');
        expect(chargeOptions.amount).toEqual(20 * 100);
        expect(chargeOptions.currency).toEqual('usd');

        const payment = await Payment.findOne({
            orderId: order.id,
            stripeId: chargeResult.id,
        });

        expect(payment).toBeDefined();
        expect(payment!.orderId).toEqual(order.id);
        expect(payment!.stripeId).toEqual(chargeResult.id);
    });
});
