import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import {
    errorHandler,
    NotFoundError,
    currentUser,
} from '@zgoksutickets/common-utils';
import { createChargeRouter } from './routes/new';

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
app.use(createChargeRouter);

// Other routes get precidence to route string paths, the glob modifier captures everything else
// that fails
app.all('*', async (req, res) => {
    //const err = new NotFoundError();
    //res.status(err.statusCode).send(err.serializeErrors());
    throw new NotFoundError();
});

app.use(errorHandler);

export default app;
