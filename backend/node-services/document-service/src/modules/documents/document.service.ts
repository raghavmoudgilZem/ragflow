import type {
  NewDocumentRequestPayload,
  FileOwnershipChainValidationProps,
  ListDocumentsQuery,
  PaginatedDocuments,
  DocumentDetailsResponse,
} from "./document.interface.js";
import logger from "../../config/logger/logger.js";
import type { DocumentRepository } from "./document.repository.js";
import {
  ConflictError,
  InternalServerError,
  DocMSError,
  BadRequestError,
  NotFoundError,
} from "../../utils/error.js";
import { type AxiosInstance, isAxiosError } from "axios";
import { Prisma } from "../../generated/prisma/client.js";
import { toDocumentListItemResponse } from "../../utils/util-function.js";

export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly datasetServiceAPI: AxiosInstance,
  ) { }

  async validateFileOwnershipChain(data: FileOwnershipChainValidationProps) {
    // This is temporary function, only at the the time of integration we need to replace with proper endpoint.
    // For development. create mock or just return true/false
    try {
      const res = await this.datasetServiceAPI.post<{ exists: boolean }>(
        "v1/dataset/internal/validate/",
        data,
      );
      return res.data.exists;
    } catch (err) {
      if (isAxiosError(err)) {
        logger.error("Dataset API request failed", err);
      } else {
        logger.error("Unexpected error while calling Dataset API", err);
      }
      throw err;
    }
  }

  async createNew(data: NewDocumentRequestPayload, userId: string) {
    try {
      const isFileAlreadyExists = await this.documentRepository.exists({
        fileId: data.file_id,
        kbId: data.kb_id,
      });

      if (isFileAlreadyExists) {
        throw new ConflictError("File Id already exists");
      }

      const isChainValid = await this.validateFileOwnershipChain({
        userId,
        workspaceId: data.workspace_id,
        kbId: data.kb_id,
        fileId: data.file_id,
      });

      if (!isChainValid) {
        throw new BadRequestError("Mismatch with file / dataset / user / workspace info");
      }

      const documentData = {
        kbId: data.kb_id,
        fileId: data.file_id,
        workspaceId: data.workspace_id,
        name: data.name,
        fileSizeBytes: data.file_size_bytes,
        fileType: data.file_type,
        parseType: data.parse_type,
        source: data.source,
        uploadedBy: userId,
        uploadedAt: new Date(),
      };

      const docSaveResponseData = await this.documentRepository.create(documentData);

      return { id: docSaveResponseData.id };
    } catch (e) {
      if (e instanceof DocMSError) throw e;
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictError("File already exists");
      }
      logger.error("Exception caught while creating a new document", e);
      throw new InternalServerError();
    }
  }

  async listDocuments(query: ListDocumentsQuery): Promise<PaginatedDocuments> {
    try {
      return await this.documentRepository.listDocuments(query);
    } catch (e) {
      logger.error("Exception while listing documents", e);
      throw new InternalServerError();
    }
  }

  async getDocument(documentId: string, datasetId: string): Promise<DocumentDetailsResponse> {
    try {
      const document = await this.documentRepository.getDocument(documentId, datasetId);
      if (!document) {
        throw new NotFoundError("Document not found");
      }
      return toDocumentListItemResponse(document);
    } catch (e) {
      if (e instanceof DocMSError) throw e;
      logger.error("Exception while fetching document", e);
      throw new InternalServerError();
    }
  }

  async updateDocumentName(
    documentId: string,
    datasetId: string,
    name: string,
  ): Promise<DocumentDetailsResponse> {
    try {
      const document = await this.documentRepository.getDocument(documentId, datasetId);
      if (!document) {
        throw new NotFoundError("Document not found");
      }

      if (document.name.trim().toLowerCase() === name.trim().toLowerCase()) {
        throw new BadRequestError("Document name is unchanged");
      }

      const updateDocRes = await this.documentRepository.updateDocumentName(documentId, name);
      return toDocumentListItemResponse(updateDocRes);
    }
    catch (e) {
      if (e instanceof DocMSError) {
        throw e;
      }

      logger.error("Exception while updating document name", e);
      throw new InternalServerError();
    }
  }
}
