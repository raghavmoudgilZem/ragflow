import express from "express";
import ENV from "./config/env.js";
import logger, { requestLoggerMiddleware } from "./config/logger/logger.js";
import helmet from "helmet";
import { rateLimiter } from "./config/rate-limit.js";
import { NotImplementedEndpoints } from "./middlewares/default-endpoints.js";
import { requestIdMiddleware } from "./middlewares/request-id.js";
import { DocMSErrorApiErrorHandler } from "./utils/error.js";
import documentsRouter from "./modules/documents/document.route.js";

export const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);

app.use((req, res, next) => {
  requestLoggerMiddleware(req, res, () => next());
});

app.use((req, res, next) => {
  logger.info("Incoming Request"); 
  next();
});

app.use(rateLimiter);

app.use("/v1/documents", documentsRouter);

app.use("/{*splat}", NotImplementedEndpoints);

//error callback
app.use(DocMSErrorApiErrorHandler);

export const initializeServer = () => {
  app.listen(ENV.PORT, () => {
    logger.info(`App listening on port ${ENV.PORT}`);
  });
};
