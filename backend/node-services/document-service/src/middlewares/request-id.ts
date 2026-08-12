import type { Request, Response, NextFunction } from "express";
import { appUtilFunctions } from "../utils/util-function.js";
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId =
    req.headers["x-request-id"] || appUtilFunctions.getUniqueId();
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
