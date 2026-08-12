import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { SAMPLE_REQUEST_ID } from "../mockedValues.js";
import { NotImplementedEndpoints } from "../../middlewares/default-endpoints.js";
import { mockRequest, mockResponse, mockNextFn } from "../utils.js";
import { NotFoundError } from "../../utils/error.js";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("NotImplementedEndpoints", () => {
  it("request proceeds with the existsing request id", () => {
    let req = mockRequest({ "x-request-id": SAMPLE_REQUEST_ID });
    let res = mockResponse();
    NotImplementedEndpoints(req, res, mockNextFn);
    expect(mockNextFn).toHaveBeenCalledWith(
      new NotFoundError(
        `Route not found: Method:undefined, OriginalURL:undefined`,
      ),
    );
  });
});
