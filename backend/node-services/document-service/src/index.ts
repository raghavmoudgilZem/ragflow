import logger from "./config/logger/logger.js";
import { initializeServer } from "./server.js";

process.on("unhandledRejection", (err) => {
  logger.error(
    `Unhandled Rejection: ${err instanceof Error ? err.stack : err}`,
  );
});
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.stack}`);
});
process.on("exit", (code) => {
  logger.info(`exit fired, code=${code}`);
});

const initMain = () => {
  initializeServer();
};

initMain();
