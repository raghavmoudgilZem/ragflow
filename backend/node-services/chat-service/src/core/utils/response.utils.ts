// src/core/utils/response.util.ts
import { Response } from "express";

export const sendSuccess = (
  res: Response,
  statusCode: number,
  data?: any,
): void => {
  res.status(statusCode).json({
    status_code: statusCode,
    success: true,
    data,
  });
};
