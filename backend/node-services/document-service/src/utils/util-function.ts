import { v4 as uuidv4 } from "uuid";
import type { Request } from "express";
import { HEADER_USER_ID_KEY } from "../config/constants.js";
import type { Document } from "../generated/prisma/client.js";
import type { DocumentDetails, DocumentDetailsResponse, DocumentResponse, GetDocumentParams } from "../modules/documents/document.interface.js";
import { GetDocumentParamsSchema } from "../modules/documents/document.validator.js";
import { BadRequestError } from "./error.js";

const extractDataFromHeaders = (req: Request) => {
  const userIdHeaderValue = req.headers[HEADER_USER_ID_KEY];
  const userId = Array.isArray(userIdHeaderValue)
    ? userIdHeaderValue[0]
    : userIdHeaderValue || "";
  return { userId };
};

const getUniqueId = () => {
  return uuidv4();
};

export const appUtilFunctions = {
  extractDataFromHeaders,
  getUniqueId,
};

export function toDocumentResponse(doc: Document): DocumentResponse {
  return {
    id: doc.id,
    name: doc.name,
    fileSizeBytes: Number(doc.fileSizeBytes),
    fileType: doc.fileType,
    ingestStatus: doc.ingestStatus,
    uploadedAt: doc.uploadedAt,
  };
}

export function toDocumentListItemResponse(
  document: DocumentDetails,
): DocumentDetailsResponse {
  return {
    id: document.id,
    workspaceId: document.workspaceId,
    kbId: document.kbId,
    fileId: document.fileId,
    name: document.name,
    fileSizeBytes: Number(document.fileSizeBytes),
    fileType: document.fileType,
    source: document.source,
    parseType: document.parseType,
    chunks: document.chunks,
    ingestStatus: document.ingestStatus,
    ingestProgressPercentage: document.ingestProgressPercentage,
    uploadedBy: document.uploadedBy,
    uploadedAt: document.uploadedAt,
  };
}

export function validateDocumentParams(
  params: unknown,
): GetDocumentParams {
  const { error, value } = GetDocumentParamsSchema.validate(params, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationError = error.details[0];

    switch (validationError?.path[0]) {
      case "documentId":
        throw new BadRequestError("Invalid document id");

      case "datasetId":
        throw new BadRequestError("Invalid dataset id");

      default:
        throw new BadRequestError("Invalid request");
    }
  }

  return value;
}
