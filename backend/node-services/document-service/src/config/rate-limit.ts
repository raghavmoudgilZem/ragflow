import rateLimit, { type Options } from "express-rate-limit";
import logger from "./logger/logger.js";
import { RATE_LIMIT_PROPS } from "./constants.js";

const RATE_LIMIT_OPTIONS: Partial<Options> = {
  windowMs: RATE_LIMIT_PROPS.WINDOW_MS,
  limit: RATE_LIMIT_PROPS.WINDOW_MAX_LIMIT,
  statusCode: RATE_LIMIT_PROPS.STATUS_CODE,
  legacyHeaders: RATE_LIMIT_PROPS.LEGACY_HEADERS,
  standardHeaders: RATE_LIMIT_PROPS.STANDARD_HEADERS,
  message: { message: RATE_LIMIT_PROPS.ERROR_MESSAGE_TXT },
  logger,
};
export const rateLimiter = rateLimit(RATE_LIMIT_OPTIONS);
