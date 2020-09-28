import request from 'supertest';
import app from '../../app';

it('fails when an email that does not exist is supplied', async () => {
    await request(app)
    .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'test'
        })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
    await request(app)
    .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'test'
        })
    .expect(201);

    return request(app)
    .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: ''
        })
    .expect(400);

});

it('responds with a cookie when valid credentials are supplied', async () => {
    await request(app)
    .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'test'
        })
    .expect(201);

    const response = await request(app)
    .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'test'
        })
    .expect(200);

    return expect(response.get('Set-Cookie')).toBeDefined();
});
