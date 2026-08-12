import type { Request, Response, NextFunction } from "express";
import { jest } from "@jest/globals";

export const mockRequest = (
  headers: Record<string, unknown> = {},
  body: Record<string, unknown> = {},
  query: Record<string, unknown> = {},
  params: Record<string, unknown> = {},
) => {
  return {
    headers,
    body,
    query,
    params,
  } as unknown as Request;
};

export const mockResponse = () => {
  let res = {} as unknown as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response["status"];
  res.send = jest.fn().mockReturnValue(res) as unknown as Response["send"];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response["json"];
  res.setHeader = jest
    .fn()
    .mockReturnValue(res) as unknown as Response["setHeader"];
  return res;
};

export const mockNextFn = jest.fn() as unknown as NextFunction;

export const mockPost =
  jest.fn<(url: string, data?: unknown) => Promise<{ data: unknown }>>();

export const mockIsAxiosError = jest.fn<(err: unknown) => boolean>();
