import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import {
    errorHandler,
    NotFoundError,
    currentUser,
} from '@zgoksutickets/common-utils';

import createTicketRouter from './routes/new';
import showTicketRouter from './routes/show';
import indexTicketRouter from './routes/index';
import updateTicketRouter from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
        httpOnly: true,
    })
);

// Custom middleware
app.use(currentUser);

// Route handlers
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

// Other routes get precidence to route string paths, the glob modifier captures everything else
// that fails
app.all('*', async (req, res) => {
    //const err = new NotFoundError();
    //res.status(err.statusCode).send(err.serializeErrors());
    throw new NotFoundError();
});

app.use(errorHandler);

export default app;
