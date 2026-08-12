import express, { Application, Request, Response } from "express";
import cors from "cors";
import { catchAsync } from "./core/middleware/catchAsync";
import { errorHandler } from "./core/middleware/errorHandler";
import router from "./core/routes";

const app: Application = express();

// Global Middleware
app.use(express.json());
app.use(cors());

// Health Check API Endpoint
app.get(
  "/chat/health",
  catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }),
);

app.use("/api/chat/v1/", router);

// MUST BE LAST: Centralized Error Handler
app.use(errorHandler);

export default app;
