import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { SAMPLE_REQUEST_ID } from "../mockedValues.js";
import { requestIdMiddleware } from "../../middlewares/request-id.js";
import { mockRequest, mockResponse, mockNextFn } from "../utils.js";
import { appUtilFunctions } from "../../utils/util-function.js";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("requestIdMiddleware", () => {
  it("request proceeds with the existsing request id", () => {
    let req = mockRequest({ "x-request-id": SAMPLE_REQUEST_ID });
    let res = mockResponse();
    let uniqueIdSpy = jest
      .spyOn(appUtilFunctions, "getUniqueId")
      .mockReturnValue(SAMPLE_REQUEST_ID);
    requestIdMiddleware(req, res, mockNextFn);
    expect(uniqueIdSpy).not.toHaveBeenCalled();
    expect(req.headers["x-request-id"]).toBe(SAMPLE_REQUEST_ID);
    expect(res.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      SAMPLE_REQUEST_ID,
    );
  });
  it("request proceeds without having request id", () => {
    let req = mockRequest();
    let res = mockResponse();
    let uniqueIdSpy = jest
      .spyOn(appUtilFunctions, "getUniqueId")
      .mockReturnValue(SAMPLE_REQUEST_ID);
    requestIdMiddleware(req, res, mockNextFn);
    expect(uniqueIdSpy).toHaveBeenCalled();
    expect(req.headers["x-request-id"]).toBe(SAMPLE_REQUEST_ID);
    expect(res.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      SAMPLE_REQUEST_ID,
    );
  });
  it("should call next only once", () => {
    let req = mockRequest();
    let res = mockResponse();
    requestIdMiddleware(req, res, mockNextFn);
    expect(mockNextFn).toHaveBeenCalledTimes(1);
  });
});
