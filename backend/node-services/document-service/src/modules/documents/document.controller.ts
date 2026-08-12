import type { Request, Response } from "express";
import { ListDocumentsQuerySchema, NewDocumentRequestPayloadSchema, UpdateDocumentRequestSchema } from "./document.validator.js";
import type { DocumentId, ListDocumentsQuery } from "./document.interface.js";
import logger from "../../config/logger/logger.js";
import { BadRequestError } from "../../utils/error.js";
import type { DocumentService } from "./document.service.js";
import { StatusCodes } from "http-status-codes";
import { appUtilFunctions, toDocumentResponse, validateDocumentParams } from "../../utils/util-function.js";

export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }
  createNew = async (req: Request, res: Response) => {
    const { userId } = appUtilFunctions.extractDataFromHeaders(req);
    const { error, value } = NewDocumentRequestPayloadSchema.validate(req.body);

    if (error || !userId) {
      logger.error("Payload Schema Validation Error", error);
      throw new BadRequestError(
        "Missing some fields or request is not properly constructed.",
      );
    }

    const docCreatedResponse: DocumentId = await this.documentService.createNew(
      value,
      userId
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      status_code: StatusCodes.CREATED,
      data: { document_id: docCreatedResponse.id },
    });
  };

  listDocuments = async (req: Request, res: Response) => {
    const { error, value } = ListDocumentsQuerySchema.validate(req.query);

    if (error) {
      logger.error("Query validation failed", error);
      throw new BadRequestError(error.message);
    }

    if (!req.params.datasetId || Array.isArray(req.params.datasetId)) {
      throw new BadRequestError("datasetId is required");
    }

    const query: ListDocumentsQuery = {
      datasetId: req.params.datasetId,
      page: value.page,
      pageSize: value.pageSize,
      search: value.search,
      status: value.status,
      sort: value.sort,
    };

    const result = await this.documentService.listDocuments(query);

    res.status(StatusCodes.OK).json({
      success: true,
      status_code: StatusCodes.OK,
      data: {
        documents: result.documents.map(toDocumentResponse),
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: Math.ceil(result.total / result.pageSize),
        },
      },
    });
  };

  getDocument = async (req: Request, res: Response) => {
    const params = validateDocumentParams(req.params);

    const document = await this.documentService.getDocument(
      params.documentId,
      params.datasetId
    );

    res.status(StatusCodes.OK).json({
      success: true,
      status_code: StatusCodes.OK,
      data: document,
    });
  };

  updateDocumentName = async (req: Request, res: Response) => {

    const params = validateDocumentParams(req.params);
    const { error, value } = UpdateDocumentRequestSchema.validate(req.body);

    if (error) {
      logger.error("Payload Schema Validation Error", error);
      throw new BadRequestError(error.message);
    }

    const document = await this.documentService.updateDocumentName(
      params.documentId,
      params.datasetId,
      value.name
    );

    res.status(StatusCodes.OK).json({
      success: true,
      status_code: StatusCodes.OK,
      data: document,
    });
  }
}
