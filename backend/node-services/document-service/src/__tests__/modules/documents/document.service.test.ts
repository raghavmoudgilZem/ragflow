import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { AxiosError, type AxiosInstance } from "axios";
import {
  SAMPLE_DOCUMENT_ID,
  SAMPLE_ERROR_MESSAGE,
  SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD,
  SAMPLE_USER_ID,
  SAMPLE_DOCUMENT_DB_ROW,
  SAMPLE_FILE_CHAIN_VALIDATION_INPUT,
  SAMPLE_PAGINATED_DOCUMENTS,
  SAMPLE_LIST_DOCUMENTS_QUERY,
  SAMPLE_DATASET_KB_ID,
  SAMPLE_DOCUMENT_DETAILS,
  SAMPLE_DOCUMENT_DETAILS_RESPONSE,
} from "../../mockedValues.js";
import { mockRequest } from "../../utils.js";
import { getLogger } from "../../../config/logger/logger.js";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../utils/error.js";
import { DocumentService } from "../../../modules/documents/document.service.js";
import type { DocumentRepository } from "../../../modules/documents/document.repository.js";

const makeRepo = () =>
  ({
    exists: jest.fn<DocumentRepository["exists"]>(),
    create: jest.fn<DocumentRepository["create"]>(),
    listDocuments: jest.fn<DocumentRepository["listDocuments"]>(),
    getDocument: jest.fn<DocumentRepository["getDocument"]>(),
    updateDocumentName: jest.fn<DocumentRepository["updateDocumentName"]>(),
  }) as unknown as jest.Mocked<DocumentRepository>;

const makeDatasetAPI = () =>
  ({ post: jest.fn() }) as unknown as jest.Mocked<AxiosInstance>;

describe("DocumentService.validateFileOwnershipChain", () => {
  let repo: jest.Mocked<DocumentRepository>;
  let datasetAPI: jest.Mocked<AxiosInstance>;
  let service: DocumentService;

  beforeEach(() => {
    repo = makeRepo();
    datasetAPI = makeDatasetAPI();
    service = new DocumentService(repo, datasetAPI);
  });

  it("returns true when the dataset API says the chain exists", async () => {
    (datasetAPI.post as jest.Mock).mockResolvedValue({
      data: { exists: true },
    } as never);

    const result = await service.validateFileOwnershipChain(
      SAMPLE_FILE_CHAIN_VALIDATION_INPUT,
    );

    expect(result).toBe(true);
    expect(datasetAPI.post).toHaveBeenCalledWith(
      "v1/dataset/internal/validate/",
      SAMPLE_FILE_CHAIN_VALIDATION_INPUT,
    );
  });

  it("returns false when the dataset API says the chain does not exist", async () => {
    (datasetAPI.post as jest.Mock).mockResolvedValue({
      data: { exists: false },
    } as never);

    const result = await service.validateFileOwnershipChain(
      SAMPLE_FILE_CHAIN_VALIDATION_INPUT,
    );

    expect(result).toBe(false);
  });

  it("logs the axios branch and rethrows when the request fails with an axios error", async () => {
    expect.assertions(2);
    const axiosErr = new AxiosError(SAMPLE_ERROR_MESSAGE);
    (datasetAPI.post as jest.Mock).mockRejectedValue(axiosErr as never);

    const logger = getLogger();
    const errorSpy = jest.spyOn(logger, "error");

    try {
      await service.validateFileOwnershipChain(
        SAMPLE_FILE_CHAIN_VALIDATION_INPUT,
      );
    } catch (e) {
      expect(e).toBe(axiosErr);

      expect(errorSpy).toHaveBeenCalledWith(
        "Dataset API request failed",
        axiosErr,
      );
    }
  });

  it("logs the non-axios branch and rethrows on an unexpected error", async () => {
    expect.assertions(2);
    const unexpectedErr = new Error(SAMPLE_ERROR_MESSAGE);
    (datasetAPI.post as jest.Mock).mockRejectedValue(unexpectedErr as never);

    const logger = getLogger();
    const errorSpy = jest.spyOn(logger, "error");

    try {
      await service.validateFileOwnershipChain(
        SAMPLE_FILE_CHAIN_VALIDATION_INPUT,
      );
    } catch (e) {
      expect(e).toBe(unexpectedErr);
      expect(errorSpy).toHaveBeenCalledWith(
        "Unexpected error while calling Dataset API",
        unexpectedErr,
      );
    }
  });
});

describe("DocumentService.createNew", () => {
  let repo: jest.Mocked<DocumentRepository>;
  let datasetAPI: jest.Mocked<AxiosInstance>;
  let service: DocumentService;

  beforeEach(() => {
    repo = makeRepo();
    datasetAPI = makeDatasetAPI();
    service = new DocumentService(repo, datasetAPI);
  });

  it("throw conflict error if file already exists", async () => {
    expect.assertions(1);
    repo.exists.mockResolvedValue(true);
    try {
      await service.createNew(
        SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD,
        SAMPLE_USER_ID,
      );
    } catch (e) {
      expect(e).toBeInstanceOf(ConflictError);
    }
  });

  it("throw bad request error if file chain doesnt exists", async () => {
    expect.assertions(1);
    repo.exists.mockResolvedValue(false);
    jest.spyOn(service, "validateFileOwnershipChain").mockResolvedValue(false);
    try {
      await service.createNew(
        SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD,
        SAMPLE_USER_ID,
      );
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestError);
    }
  });

  it("throw error if create fails", async () => {
    expect.assertions(2);
    repo.exists.mockResolvedValue(false);
    jest.spyOn(service, "validateFileOwnershipChain").mockResolvedValue(true);
    repo.create.mockRejectedValue(new Error(SAMPLE_ERROR_MESSAGE));
    try {
      await service.createNew(
        SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD,
        SAMPLE_USER_ID,
      );
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(InternalServerError);
    }
  });

  it("document created successfully", async () => {
    repo.exists.mockResolvedValue(false);
    jest.spyOn(service, "validateFileOwnershipChain").mockResolvedValue(true);
    repo.create.mockResolvedValue(SAMPLE_DOCUMENT_DB_ROW);
    const newDoc = await service.createNew(
      SAMPLE_NEW_DOCUMENT_REQUEST_PAYLOAD,
      SAMPLE_USER_ID,
    );
    expect(newDoc).toEqual({ id: SAMPLE_DOCUMENT_ID });
  });
});

describe("DocumentService.listDocuments", () => {
  let repo: jest.Mocked<DocumentRepository>;
  let datasetAPI: jest.Mocked<AxiosInstance>;
  let service: DocumentService;

  beforeEach(() => {
    repo = makeRepo();
    datasetAPI = makeDatasetAPI();
    service = new DocumentService(repo, datasetAPI);
  });

  it("should return paginated documents", async () => {
    repo.listDocuments.mockResolvedValue(
      SAMPLE_PAGINATED_DOCUMENTS,
    );

    const result = await service.listDocuments(
      SAMPLE_LIST_DOCUMENTS_QUERY,
    );

    expect(repo.listDocuments).toHaveBeenCalledWith(
      SAMPLE_LIST_DOCUMENTS_QUERY,
    );

    expect(result.documents).toHaveLength(1);

    expect(result).toEqual(
      SAMPLE_PAGINATED_DOCUMENTS,
    );
  });

  it("should throw InternalServerError on repository failure", async () => {

    repo.listDocuments.mockRejectedValue(
      new Error(SAMPLE_ERROR_MESSAGE),
    );

    await expect(
      service.listDocuments(
        SAMPLE_LIST_DOCUMENTS_QUERY,
      ),
    ).rejects.toBeInstanceOf(
      InternalServerError,
    );
  });
});

describe("DocumentService.getDocument", () => {
  let repo: jest.Mocked<DocumentRepository>;
  let datasetAPI: jest.Mocked<AxiosInstance>;
  let service: DocumentService;

  beforeEach(() => {
    repo = makeRepo();
    datasetAPI = makeDatasetAPI();
    service = new DocumentService(repo, datasetAPI);
  });

  it("returns document details", async () => {
    repo.getDocument.mockResolvedValue(
      SAMPLE_DOCUMENT_DETAILS,
    );

    const result = await service.getDocument(
      SAMPLE_DOCUMENT_ID,
      SAMPLE_DATASET_KB_ID,
    );

    expect(repo.getDocument).toHaveBeenCalledWith(
      SAMPLE_DOCUMENT_ID,
      SAMPLE_DATASET_KB_ID,
    );

    expect(result).toEqual(
      SAMPLE_DOCUMENT_DETAILS_RESPONSE,
    );
  });

  it("maps repository response into API response", async () => {
    repo.getDocument.mockResolvedValue(SAMPLE_DOCUMENT_DETAILS);

    const result = await service.getDocument(
      SAMPLE_DOCUMENT_ID,
      SAMPLE_DATASET_KB_ID,
    );

    expect(result).toEqual({
      id: SAMPLE_DOCUMENT_DETAILS.id,
      workspaceId: SAMPLE_DOCUMENT_DETAILS.workspaceId,
      kbId: SAMPLE_DOCUMENT_DETAILS.kbId,
      fileId: SAMPLE_DOCUMENT_DETAILS.fileId,
      name: SAMPLE_DOCUMENT_DETAILS.name,
      fileSizeBytes: Number(SAMPLE_DOCUMENT_DETAILS.fileSizeBytes),
      fileType: SAMPLE_DOCUMENT_DETAILS.fileType,
      source: SAMPLE_DOCUMENT_DETAILS.source,
      parseType: SAMPLE_DOCUMENT_DETAILS.parseType,
      chunks: SAMPLE_DOCUMENT_DETAILS.chunks,
      ingestStatus: SAMPLE_DOCUMENT_DETAILS.ingestStatus,
      ingestProgressPercentage:
        SAMPLE_DOCUMENT_DETAILS.ingestProgressPercentage,
      uploadedBy: SAMPLE_DOCUMENT_DETAILS.uploadedBy,
      uploadedAt: SAMPLE_DOCUMENT_DETAILS.uploadedAt,
    });
  });

  it("throws NotFoundError", async () => {
    repo.getDocument.mockResolvedValue(null);

    await expect(
      service.getDocument(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws InternalServerError on repository failure", async () => {
    repo.getDocument.mockRejectedValue(
      new Error("DB Error"),
    );

    await expect(
      service.getDocument(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
      ),
    ).rejects.toBeInstanceOf(
      InternalServerError,
    );
  })

  it("re-throws DocMSError", async () => {
    const error = new BadRequestError("Invalid");

    repo.getDocument.mockRejectedValue(error);

    await expect(
      service.getDocument(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
      ),
    ).rejects.toBe(error);
  })

  describe("DocumentService.updateDocumentName", () => {
    let repo: jest.Mocked<DocumentRepository>;
    let datasetAPI: jest.Mocked<AxiosInstance>;
    let service: DocumentService;

    beforeEach(() => {
      repo = makeRepo();
      datasetAPI = makeDatasetAPI();
      service = new DocumentService(repo, datasetAPI);
    });

    it("updates document name successfully", async () => {
      const updatedDocument = {
        ...SAMPLE_DOCUMENT_DETAILS,
        name: "updated_document.pdf",
      };

      repo.getDocument.mockResolvedValue(SAMPLE_DOCUMENT_DETAILS);
      repo.updateDocumentName.mockResolvedValue(updatedDocument);

      const result = await service.updateDocumentName(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
        "updated_document.pdf",
      );

      expect(repo.getDocument).toHaveBeenCalledWith(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
      );

      expect(repo.updateDocumentName).toHaveBeenCalledWith(
        SAMPLE_DOCUMENT_ID,
        "updated_document.pdf",
      );

      expect(result.name).toBe("updated_document.pdf");
    });

    it("throws NotFoundError when document does not exist", async () => {
      repo.getDocument.mockResolvedValue(null);

      await expect(
        service.updateDocumentName(
          SAMPLE_DOCUMENT_ID,
          SAMPLE_DATASET_KB_ID,
          "updated_document.pdf",
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws ConflictError when document name is unchanged", async () => {
      repo.getDocument.mockResolvedValue(SAMPLE_DOCUMENT_DETAILS);

      await expect(
        service.updateDocumentName(
          SAMPLE_DOCUMENT_ID,
          SAMPLE_DATASET_KB_ID,
          SAMPLE_DOCUMENT_DETAILS.name,
        ),
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("throws InternalServerError when repository update fails", async () => {
      repo.getDocument.mockResolvedValue(SAMPLE_DOCUMENT_DETAILS);

      repo.updateDocumentName.mockRejectedValue(
        new Error(SAMPLE_ERROR_MESSAGE),
      );

      await expect(
        service.updateDocumentName(
          SAMPLE_DOCUMENT_ID,
          SAMPLE_DATASET_KB_ID,
          "updated_document.pdf",
        ),
      ).rejects.toBeInstanceOf(InternalServerError);
    });

    it("re-throws DocMSError from getDocument", async () => {
      const error = new BadRequestError("Invalid");

      repo.getDocument.mockRejectedValue(error);

      await expect(
        service.updateDocumentName(
          SAMPLE_DOCUMENT_ID,
          SAMPLE_DATASET_KB_ID,
          "updated_document.pdf",
        ),
      ).rejects.toBe(error);
    });

    it("re-throws DocMSError from updateDocumentName", async () => {
      repo.getDocument.mockResolvedValue(SAMPLE_DOCUMENT_DETAILS);

      const error = new BadRequestError("Invalid");

      repo.updateDocumentName.mockRejectedValue(error);

      await expect(
        service.updateDocumentName(
          SAMPLE_DOCUMENT_ID,
          SAMPLE_DATASET_KB_ID,
          "updated_document.pdf",
        ),
      ).rejects.toBe(error);
    });

    it("throws ConflictError when document name is unchanged", async () => {
      repo.getDocument.mockResolvedValue(SAMPLE_DOCUMENT_DETAILS);

      await expect(
        service.updateDocumentName(
          SAMPLE_DOCUMENT_ID,
          SAMPLE_DATASET_KB_ID,
          SAMPLE_DOCUMENT_DETAILS.name,
        ),
      ).rejects.toBeInstanceOf(BadRequestError);

      expect(repo.updateDocumentName).not.toHaveBeenCalled();
    });
  });
})
