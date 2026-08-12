import { Request, Response, NextFunction } from "express";

// 1. Extend the Express Request interface globally
// This ensures any controller accessing req.tenantId gets full IDE support and type safety.
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

// 2. Define a custom AppError class
// This allows us to attach HTTP status codes to our errors.
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    // Essential for extending built-in classes in TS to maintain prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 3. The Refactored Auth Middleware
export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const tenantId = req.headers["x-tenant-id"];

  // Defensive check: headers can technically be arrays if passed multiple times.
  // We ensure it's a single string before proceeding.
  if (!tenantId || typeof tenantId !== "string") {
    // We delegate the response formatting by passing the error to next()
    return next(new AppError("Unauthorized: Missing or invalid x-tenant-id header", 401));
  }

  req.tenantId = tenantId;
  next();
}