import app from "./app";
import { logger } from "./core/services/logger.service";

const PORT = process.env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`[Server]: Process initialized and listening on port ${PORT}`);
});

// Graceful shutdown handling ensures open connections (like SSE streams) are closed
process.on("SIGTERM", () => {
  logger.info("[Server]: SIGTERM received. Shutting down gracefully.");
  server.close(() => {
    process.exit(0);
  });
});
