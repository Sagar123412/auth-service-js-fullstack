import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import tenanatRouter from './routes/tenant';
import userRouter from './routes/user';

const app = express();
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Welcome to home route');
});

app.use('/auth/', authRouter);
app.use('/tenants', tenanatRouter);
app.use('/users', userRouter);

//global error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const status = err.statusCode || err.status || 500;

  res.status(status).json({
    type: err.name,
    message: err.message,
    path: '',
    location: '',
  });
});

export default app;
