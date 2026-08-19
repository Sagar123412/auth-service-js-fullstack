import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "../config/logger";
import { Config } from "../config";
import { v4 as uuidv4 } from "uuid";

//global error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorId = uuidv4();
  const isProduction = Config.NODE_ENV === "production";

  const statusCode = err.statusCode || err.status || 500;
  const errMessage = isProduction ? "Internal Server Error" : err.message;

  logger.error(err.message, {
    id: errorId,
    statusCode,
    error: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: [
      {
        ref: errorId,
        type: err.name,
        message: errMessage,
        path: req.path,
        method: req.path,
        location: "server",
        stack: isProduction ? null : err.stack,
      },
    ],
  });
};
