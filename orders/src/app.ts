import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import {
    errorHandler,
    NotFoundError,
    currentUser,
} from '@zgoksutickets/common-utils';

import deleteOrderRouter from './routes/delete';
import showOrderRouter from './routes/show';
import indexOrderRouter from './routes/index';
import newOrderRouter from './routes/new';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
    cookieSession({
        signed: false,
        secure: false,
        httpOnly: true,
    })
);

// Custom middleware
app.use(currentUser);

// Route handlers
app.use(deleteOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);

// Other routes get precidence to route string paths, the glob modifier captures everything else
// that fails
app.all('*', async (req, res) => {
    //const err = new NotFoundError();
    //res.status(err.statusCode).send(err.serializeErrors());
    throw new NotFoundError();
});

app.use(errorHandler);

export default app;
