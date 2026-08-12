import ENV from "../env.js";
import pino from "pino";
import type { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "async_hooks";

//Global context to hold the Request object
export const requestContext = new AsyncLocalStorage<Request>();

// Middleware to initialize the scope globally
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  requestContext.run(req, next);
};

const pinoLogger = pino({
  level: ENV.LOGGER_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
  },
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "SYS:standard",
    },
  },
});

// Helper to dynamically format messages with the global request context
const formatMessage = (message: string) => {
  const req = requestContext.getStore(); // Retrieve the request automatically!
  
  if (req) {
    const requestId = req.headers["x-request-id"] || "N/A";
    return `Request ID: ${requestId}, Method: ${req.method}, URL: ${req.originalUrl}, msg:${message}`;
  }
  
  return `msg:${message}`;
};

const logger = {
  info: (message: string) => pinoLogger.info(formatMessage(message)),
  error: (message: string, err?: unknown) => {
    if (err !== undefined) {
      pinoLogger.error({ err }, formatMessage(message));
    } else {
      pinoLogger.error(formatMessage(message));
    }
  },
  debug: (message: string) => pinoLogger.debug(formatMessage(message)),
  warn: (message: string) => pinoLogger.warn(formatMessage(message)),
};

export const getLogger = () => logger;

export default logger;
