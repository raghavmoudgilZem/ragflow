import { Prisma } from "../../generated/prisma/client.js";
import type { DocumentDetails, ListDocumentsQuery, PaginatedDocuments } from "./document.interface.js";

export class DocumentRepository {
  constructor(private readonly db: Prisma.TransactionClient) { }

  private static readonly documentDetailsSelect = {
    id: true,
    workspaceId: true,
    kbId: true,
    fileId: true,
    name: true,
    fileSizeBytes: true,
    fileType: true,
    source: true,
    parseType: true,
    chunks: true,
    ingestStatus: true,
    ingestProgressPercentage: true,
    uploadedBy: true,
    uploadedAt: true,
  } satisfies Prisma.DocumentSelect;

  async exists(where: Prisma.DocumentWhereInput): Promise<boolean> {
    const found = await this.db.document.findFirst({
      where,
      select: { id: true },
    });
    return found !== null;
  }

  create(data: Prisma.DocumentCreateInput) {
    return this.db.document.create({ data });
  }

  async listDocuments(query: ListDocumentsQuery): Promise<PaginatedDocuments> {
    const skip = (query.page - 1) * query.pageSize;

    const where: Prisma.DocumentWhereInput = {
      kbId: query.datasetId,
      active: true,
    };

    if (query.search) {
      where.name = {
        contains: query.search,
      };
    }

    if (query.status) {
      where.ingestStatus = query.status;
    }

    const sortField = query.sort ?? "uploadedAt";

    const orderBy: Prisma.DocumentOrderByWithRelationInput = {
      [sortField]: query.order ?? "desc",
    };

    const [documents, total] = await Promise.all([
      this.db.document.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
      }),

      this.db.document.count({ where }),
    ]);

    return {
      documents,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getDocument(
    documentId: string,
    datasetId: string,
  ): Promise<DocumentDetails | null> {
    return this.db.document.findFirst({
      where: {
        id: documentId,
        kbId: datasetId,
        active: true,
      },
      select: DocumentRepository.documentDetailsSelect,
    });
  }

  async updateDocumentName(
    documentId: string,
    name: string,
  ): Promise<DocumentDetails> {
    return this.db.document.update({
      where: {
        id: documentId,
      },
      data: {
        name,
      },
      select: DocumentRepository.documentDetailsSelect,
    });
  }

  async existsByNameInDataset(name: string, datasetId: string): Promise<boolean> {
    const count = await this.db.document.count({
      where: {
        name,
        kbId: datasetId,
        active: true
      },
    });
    return count > 0;
  }
}
