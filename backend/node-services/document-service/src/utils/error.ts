import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger/logger.js";
import { StatusCodes } from "http-status-codes";
import {
  DEFAULT_NOTFOUND_ERROR_MESSAGE,
  DEFAULT_BADREQUEST_ERROR_MESSAGE,
  DEFAULT_INTERNALSERVER_ERROR_MESSAGE,
  DEFAULT_CONFLICT_ERROR_MESSAGE,
} from "../config/constants.js";

export class DocMSError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends DocMSError {
  constructor(message: string = DEFAULT_NOTFOUND_ERROR_MESSAGE) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class BadRequestError extends DocMSError {
  constructor(message: string = DEFAULT_BADREQUEST_ERROR_MESSAGE) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class InternalServerError extends DocMSError {
  constructor(message: string = DEFAULT_INTERNALSERVER_ERROR_MESSAGE) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export class ConflictError extends DocMSError {
  constructor(message: string = DEFAULT_CONFLICT_ERROR_MESSAGE) {
    super(message, StatusCodes.CONFLICT);
  }
}

export const DocMSErrorApiErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.headers["x-request-id"];

  if (err instanceof DocMSError) {
    res.status(err.statusCode).json({
      success: false,
      status_code: err.statusCode,
      error: err.message,
      requestId,
    });
    return;
  }

  // Uses global scope context initialized by the middleware automatically
  // This will catch 500 Internal Server Errors, syntax errors, missing DB connections, etc.
  logger.error("Unhandled Endpoint Error", err);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    status_code: StatusCodes.INTERNAL_SERVER_ERROR,
    error: "Internal Server Error",
    requestId,
  });
};
