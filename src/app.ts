import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('home route');
});

//global error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const status = err.statusCode || 500;

  res.status(status).json({
    type: err.name,
    message: err.message,
    path: '',
    location: '',
  });
});

export default app;
