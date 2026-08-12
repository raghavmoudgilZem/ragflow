/**
 * Custom Error class extending the built-in Error.
 * Allows us to attach HTTP status codes to our thrown errors
 * for the global error handler to process.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    
    // Essential workaround for extending built-in classes in TypeScript
    // to ensure the prototype chain is correctly maintained.
    Object.setPrototypeOf(this, new.target.prototype);
    
    // Captures the stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}