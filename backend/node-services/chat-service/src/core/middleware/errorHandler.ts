import { Request, Response, NextFunction } from "express";
import { logger } from "../services/logger.service";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log the stack trace internally for debugging
  logger.error(`[Unhandled Error]: ${err.message}\n`, err.stack);

  // Standardized JSON response format per LLD
  const statusCode = err.statusCode || 500;

  let responseBody: Record<string, any> = {
    status_code: statusCode,
    error: err.message || "An unexpected error occurred.",
    success: false,
  };

  if (err.cause) {
    if (typeof err.cause === "object") {
      responseBody["metadata"] = err.cause;
    }
  }

  res.status(statusCode).json(responseBody);
};
