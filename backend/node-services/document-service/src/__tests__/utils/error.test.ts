import { describe, it, expect, jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import {
  ConflictError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  DocMSError,
  DocMSErrorApiErrorHandler,
} from "../../utils/error.js";
import { SAMPLE_ERROR_MESSAGE, SAMPLE_REQUEST_ID } from "../mockedValues.js";
import {
  DEFAULT_NOTFOUND_ERROR_MESSAGE,
  DEFAULT_BADREQUEST_ERROR_MESSAGE,
  DEFAULT_INTERNALSERVER_ERROR_MESSAGE,
  DEFAULT_CONFLICT_ERROR_MESSAGE,
} from "../../config/constants.js";
import { StatusCodes } from "http-status-codes";
import { mockRequest, mockResponse, mockNextFn } from "../utils.js";

describe("NotFoundError", () => {
  it("should have statuscode and default message", () => {
    let customError = new NotFoundError();
    expect(customError.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(customError.message).toBe(DEFAULT_NOTFOUND_ERROR_MESSAGE);
  });
  it("should have statuscode and accept custom message", () => {
    let customError = new NotFoundError(SAMPLE_ERROR_MESSAGE);
    expect(customError.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(customError.message).toBe(SAMPLE_ERROR_MESSAGE);
  });
  it("should be instance of DocMSError", () => {
    let customError = new NotFoundError();
    expect(customError).toBeInstanceOf(DocMSError);
    expect(customError).toBeInstanceOf(Error);
  });
});

describe("BadRequestError", () => {
  it("should have statuscode and default message", () => {
    let customError = new BadRequestError();
    expect(customError.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(customError.message).toBe(DEFAULT_BADREQUEST_ERROR_MESSAGE);
  });
  it("should have statuscode and accept custom message", () => {
    let customError = new BadRequestError(SAMPLE_ERROR_MESSAGE);
    expect(customError.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(customError.message).toBe(SAMPLE_ERROR_MESSAGE);
  });
  it("should be instance of DocMSError", () => {
    let customError = new BadRequestError();
    expect(customError).toBeInstanceOf(DocMSError);
    expect(customError).toBeInstanceOf(Error);
  });
});

describe("ConflictError", () => {
  it("should have statuscode and default message", () => {
    let customError = new ConflictError();
    expect(customError.statusCode).toBe(StatusCodes.CONFLICT);
    expect(customError.message).toBe(DEFAULT_CONFLICT_ERROR_MESSAGE);
  });
  it("should have statuscode and accept custom message", () => {
    let customError = new ConflictError(SAMPLE_ERROR_MESSAGE);
    expect(customError.statusCode).toBe(StatusCodes.CONFLICT);
    expect(customError.message).toBe(SAMPLE_ERROR_MESSAGE);
  });
  it("should be instance of DocMSError", () => {
    let customError = new ConflictError();
    expect(customError).toBeInstanceOf(DocMSError);
    expect(customError).toBeInstanceOf(Error);
  });
});

describe("InternalServerError", () => {
  it("should have statuscode and default message", () => {
    let customError = new InternalServerError();
    expect(customError.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(customError.message).toBe(DEFAULT_INTERNALSERVER_ERROR_MESSAGE);
  });
  it("should have statuscode and accept custom message", () => {
    let customError = new InternalServerError(SAMPLE_ERROR_MESSAGE);
    expect(customError.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(customError.message).toBe(SAMPLE_ERROR_MESSAGE);
  });
  it("should be instance of DocMSError", () => {
    let customError = new InternalServerError();
    expect(customError).toBeInstanceOf(DocMSError);
    expect(customError).toBeInstanceOf(Error);
  });
});

describe("DocMSErrorApiErrorHandler", () => {
  it("throw internal server error if general error is thrown", () => {
    let req = mockRequest({ "x-request-id": SAMPLE_REQUEST_ID });
    let res = mockResponse();
    DocMSErrorApiErrorHandler(
      new Error(SAMPLE_ERROR_MESSAGE),
      req,
      res,
      mockNextFn,
    );
    expect(res.status).toHaveBeenCalledWith(
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
      requestId: SAMPLE_REQUEST_ID,
    });
  });
  it("throw internal server error if DocMSError is thrown", () => {
    let req = mockRequest({ "x-request-id": SAMPLE_REQUEST_ID });
    let res = mockResponse();
    DocMSErrorApiErrorHandler(
      new ConflictError(SAMPLE_ERROR_MESSAGE),
      req,
      res,
      mockNextFn,
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.json).toHaveBeenCalledWith({
      message: SAMPLE_ERROR_MESSAGE,
      requestId: SAMPLE_REQUEST_ID,
    });
  });
});
