import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/error.js";
export const NotImplementedEndpoints = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(
    new NotFoundError(
      `Route not found: Method:${req.method}, OriginalURL:${req.originalUrl}`,
    ),
  );
};
