import { it, describe, jest, expect, beforeEach } from "@jest/globals";
import { DocumentController } from "../../../modules/documents/document.controller.js";
import {
  BadRequestError,
  InternalServerError,
  ConflictError,
  NotFoundError,
} from "../../../utils/error.js";
import type { DocumentService } from "../../../modules/documents/document.service.js";
import {
  SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD,
  SAMPLE_ERROR_MESSAGE,
  SAMPLE_DOCUMENT_ID,
  SAMPLE_USER_ID,
  SAMPLE_PAGINATED_DOCUMENTS,
  SAMPLE_DATASET_KB_ID,
  SAMPLE_DOCUMENT_DETAILS_RESPONSE,
} from "../../mockedValues.js";
import { mockRequest, mockResponse } from "../../utils.js";
import { HEADER_USER_ID_KEY } from "../../../config/constants.js";

const reqHeaders = {} as any;
reqHeaders[HEADER_USER_ID_KEY] = SAMPLE_USER_ID;

describe("DocumentController", () => {
  let service: jest.Mocked<DocumentService>;
  let controller: DocumentController;
  beforeEach(() => {
    service = {
      createNew: jest.fn(),
      listDocuments: jest.fn(),
      getDocument: jest.fn<DocumentService["getDocument"]>(),
      updateDocumentName: jest.fn<DocumentService["updateDocumentName"]>(),
    } as unknown as jest.Mocked<DocumentService>;

    controller = new DocumentController(service);
  });

  describe("createNewDocumentHandler()", () => {
    it("should throw bad request error if userId is missing", async () => {
      const req = mockRequest({}, SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD);
      const res = mockResponse();
      await expect(controller.createNew(req, res)).rejects.toBeInstanceOf(
        BadRequestError,
      );
    });
    it("should throw bad request error if it misses any field", async () => {
      const req = mockRequest(reqHeaders);
      const res = mockResponse();
      await expect(controller.createNew(req, res)).rejects.toBeInstanceOf(
        BadRequestError,
      );
    });

    it("should throw error if createNew throws conflict error", async () => {
      const req = mockRequest(reqHeaders, SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD);
      const res = mockResponse();
      service.createNew.mockRejectedValue(
        new ConflictError(SAMPLE_ERROR_MESSAGE),
      );
      expect.assertions(4);
      try {
        await controller.createNew(req, res);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e).toBeInstanceOf(ConflictError);
        expect((e as Error).message).toBe(SAMPLE_ERROR_MESSAGE);
        expect(service.createNew).toHaveBeenCalled();
      }
    });
    it("should throw error if createNew fails", async () => {
      const req = mockRequest(reqHeaders, SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD);
      const res = mockResponse();
      service.createNew.mockRejectedValue(
        new InternalServerError(SAMPLE_ERROR_MESSAGE),
      );
      expect.assertions(4);
      try {
        await controller.createNew(req, res);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e).toBeInstanceOf(InternalServerError);
        expect((e as Error).message).toBe(SAMPLE_ERROR_MESSAGE);
        expect(service.createNew).toHaveBeenCalled();
      }
    });

    it("send 201 response on successfull", async () => {
      const req = mockRequest(reqHeaders, SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD);
      const res = mockResponse();
      service.createNew.mockResolvedValue({ id: SAMPLE_DOCUMENT_ID });

      await controller.createNew(req, res);

      expect(service.createNew).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        status_code: 201,
        data: {
          document_id: SAMPLE_DOCUMENT_ID,
        },
      });
    });
    it("send 201 response on successfull even if user id is sent in array", async () => {
      const req = mockRequest(reqHeaders, SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD);
      const res = mockResponse();
      service.createNew.mockResolvedValue({ id: SAMPLE_DOCUMENT_ID });

      await controller.createNew(req, res);

      expect(service.createNew).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        status_code: 201,
        data: {
          document_id: SAMPLE_DOCUMENT_ID,
        },
      });

    });
  });

  describe("listDocuments()", () => {

    it("throws BadRequestError for invalid query", async () => {

      const req = mockRequest(
        reqHeaders,
        {},
        {
          page: -1,
        },
      );

      req.params = {
        datasetId: "dataset-1",
      };

      const res = mockResponse();

      await expect(
        controller.listDocuments(req, res),
      ).rejects.toBeInstanceOf(
        BadRequestError,
      );

    });

    it("should call service", async () => {

      const req = mockRequest(
        reqHeaders,
        {},
        {},
      );

      req.params = {
        datasetId: "dataset-1",
      };

      req.query = {};

      const res = mockResponse();

      service.listDocuments.mockResolvedValue(
        SAMPLE_PAGINATED_DOCUMENTS,
      );

      await controller.listDocuments(req, res);

      expect(service.listDocuments).toHaveBeenCalledWith(
        {
          datasetId: "dataset-1",
          page: 1,
          pageSize: 10,
          sort: "uploadedAt",
        },
      );

    });

    it("returns 200 with paginated response", async () => {

      const req = mockRequest(reqHeaders);

      req.params = {
        datasetId: "dataset-1",
      };

      req.query = {};

      const res = mockResponse();

      service.listDocuments.mockResolvedValue(
        SAMPLE_PAGINATED_DOCUMENTS,
      );

      await controller.listDocuments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        status_code: 200,
        data: {
          documents: expect.any(Array),
          pagination: {
            total: 1,
            page: 1,
            pageSize: 10,
            totalPages: 1,
          },
        },
      });

    });

    it("propagates service error", async () => {

      const req = mockRequest(reqHeaders);

      req.params = {
        datasetId: "dataset-1",
      };

      req.query = {};

      const res = mockResponse();

      service.listDocuments.mockRejectedValue(
        new InternalServerError(),
      );

      await expect(
        controller.listDocuments(req, res),
      ).rejects.toBeInstanceOf(
        InternalServerError,
      );
    });

    it("throws BadRequestError when datasetId is missing", async () => {
      const req = mockRequest(reqHeaders);

      req.params = {};

      req.query = {};

      const res = mockResponse();

      await expect(
        controller.listDocuments(req, res),
      ).rejects.toBeInstanceOf(BadRequestError);
    });

  });

  describe("getDocument()", () => {

    it("returns 200 with document", async () => {
      const req = mockRequest(reqHeaders);

      req.params = {
        datasetId: SAMPLE_DATASET_KB_ID,
        documentId: SAMPLE_DOCUMENT_ID,
      };

      const res = mockResponse();

      service.getDocument.mockResolvedValue(
        SAMPLE_DOCUMENT_DETAILS_RESPONSE,
      );

      await controller.getDocument(req, res);

      expect(service.getDocument).toHaveBeenCalledWith(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        status_code: 200,
        data: SAMPLE_DOCUMENT_DETAILS_RESPONSE,
      });

    });

    it("throws BadRequestError for invalid params", async () => {
      const req = mockRequest(reqHeaders);

      req.params = {
        datasetId: "invalid",
        documentId: "invalid",
      };

      const res = mockResponse();

      await expect(
        controller.getDocument(req, res),
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("propagates NotFoundError", async () => {
      const req = mockRequest(reqHeaders);

      req.params = {
        datasetId: SAMPLE_DATASET_KB_ID,
        documentId: SAMPLE_DOCUMENT_ID,
      };

      const res = mockResponse();

      service.getDocument.mockRejectedValue(
        new NotFoundError("Document not found"),
      );

      await expect(
        controller.getDocument(req, res),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

  });

  describe("updateDocumentName()", () => {

    it("returns 200 with updated document", async () => {
      const req = mockRequest(
        reqHeaders,
        {
          name: "updated_document.pdf",
        },
      );

      req.params = {
        datasetId: SAMPLE_DATASET_KB_ID,
        documentId: SAMPLE_DOCUMENT_ID,
      };

      const res = mockResponse();

      service.updateDocumentName.mockResolvedValue(
        SAMPLE_DOCUMENT_DETAILS_RESPONSE,
      );

      await controller.updateDocumentName(req, res);

      expect(service.updateDocumentName).toHaveBeenCalledWith(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
        "updated_document.pdf",
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        status_code: 200,
        data: SAMPLE_DOCUMENT_DETAILS_RESPONSE,
      });
    });

    it("throws BadRequestError for invalid params", async () => {
      const req = mockRequest(
        reqHeaders,
        {
          name: "updated_document.pdf",
        },
      );

      req.params = {
        datasetId: "invalid",
        documentId: "invalid",
      };

      const res = mockResponse();

      await expect(
        controller.updateDocumentName(req, res),
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("throws BadRequestError for invalid request body", async () => {
      const req = mockRequest(
        reqHeaders,
        {},
      );

      req.params = {
        datasetId: SAMPLE_DATASET_KB_ID,
        documentId: SAMPLE_DOCUMENT_ID,
      };

      const res = mockResponse();

      await expect(
        controller.updateDocumentName(req, res),
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("propagates NotFoundError", async () => {
      const req = mockRequest(
        reqHeaders,
        {
          name: "updated_document.pdf",
        },
      );

      req.params = {
        datasetId: SAMPLE_DATASET_KB_ID,
        documentId: SAMPLE_DOCUMENT_ID,
      };

      const res = mockResponse();

      service.updateDocumentName.mockRejectedValue(
        new NotFoundError("Document not found"),
      );

      await expect(
        controller.updateDocumentName(req, res),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("propagates InternalServerError", async () => {
      const req = mockRequest(
        reqHeaders,
        {
          name: "updated_document.pdf",
        },
      );

      req.params = {
        datasetId: SAMPLE_DATASET_KB_ID,
        documentId: SAMPLE_DOCUMENT_ID,
      };

      const res = mockResponse();

      service.updateDocumentName.mockRejectedValue(
        new InternalServerError(SAMPLE_ERROR_MESSAGE),
      );

      await expect(
        controller.updateDocumentName(req, res),
      ).rejects.toBeInstanceOf(InternalServerError);
    });
    
  });
});
