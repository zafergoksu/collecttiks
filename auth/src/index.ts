import express from 'express';
import 'express-async-errors';

import currentUserRouter from './routes/current-user';
import signinRouter from './routes/signin';
import signoutRouter from './routes/signout';
import signupRouter from './routes/signup';
import errorHandler from './middleware/error-handler';
import NotFoundError from './errors/not-found-error';

const app = express();
app.use(express.json());

// Route handlers
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.use(errorHandler);

// Other routes get precidence to route string paths, the glob modifier captures everything else
// that fails
app.all('*', async (req, res) => {
    //const err = new NotFoundError();
    //res.status(err.statusCode).send(err.serializeErrors());
    throw new NotFoundError();
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
