import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { DocumentController } from "./document.controller.js";
import { DocumentRepository } from "./document.repository.js";
import { DocumentService } from "./document.service.js";
import axios, { type AxiosInstance } from "axios";
import ENV from "../../config/env.js";
const router = Router();

const datasetServiceAPI: AxiosInstance = axios.create({
  baseURL: ENV.DATASET_SERVICE_API_BASE_URL,
  timeout: ENV.API_CALL_TIMEOUT_IN_MS,
  headers: { "content-type": "application/json" },
});

const documentRepository = new DocumentRepository(prisma);
const documentService = new DocumentService(
  documentRepository,
  datasetServiceAPI,
);
const documentController = new DocumentController(documentService);

router.get("/datasets/:datasetId/documents", documentController.listDocuments);

router.post("/", documentController.createNew);

router.get("/datasets/:datasetId/documents/:documentId", documentController.getDocument);

router.patch("/datasets/:datasetId/documents/:documentId", documentController.updateDocumentName);

export default router;
