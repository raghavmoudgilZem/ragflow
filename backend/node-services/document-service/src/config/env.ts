import "dotenv/config";
import {
  DEFAULT_PORT,
  DEFAULT_LOG_LEVEL,
  DEFAULT_API_CALL_TIMEOUT_IN_MS,
} from "./constants.js";
const ENV = {
  PORT: process.env["PORT"] ?? DEFAULT_PORT,
  LOGGER_LEVEL: process.env["LOGGER_LEVEL"] ?? DEFAULT_LOG_LEVEL,
  DATABASE_URL: process.env["DATABASE_URL"] ?? "",
  SHADOW_DATABASE_URL: process.env["SHADOW_DATABASE_URL"] ?? "",
  DATASET_SERVICE_API_BASE_URL:
    process.env["DATASET_SERVICE_API_BASE_URL"] ?? "",
  API_CALL_TIMEOUT_IN_MS:
    Number(process.env["API_CALL_TIMEOUT_IN_MS"]) ??
    DEFAULT_API_CALL_TIMEOUT_IN_MS,
};

export default ENV;
