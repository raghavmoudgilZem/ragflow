import {
  expect,
  it,
  jest,
  describe,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { DocumentRepository } from "../../../modules/documents/document.repository.js";
import { Prisma } from "../../../generated/prisma/client.js";
import {
  SAMPLE_NEW_DOCUMENT_SAVE_DATA,
  SAMPLE_DOCUMENT_DB_ROW,
  SAMPLE_FILE_ID,
  SAMPLE_FILE_NAME,
  SAMPLE_DOCUMENT_ID,
  SAMPLE_LIST_DOCUMENTS_QUERY,
  SAMPLE_PAGINATED_DOCUMENTS,
  SAMPLE_DOCUMENT_DETAILS,
  SAMPLE_DATASET_KB_ID,
} from "../../mockedValues.js";

describe("DocumentRepository", () => {

  let db: {
    document: {
      findFirst: jest.Mock<
        (args: Prisma.DocumentFindFirstArgs) => Promise<{ id: string } | null>
      >;
      create: jest.Mock<(args: Prisma.DocumentCreateArgs) => Promise<Document>>;
    };
  };
  let repo: DocumentRepository;

  beforeEach(() => {
    db = {
      document: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    // Cast the mock to the injected type.
    repo = new DocumentRepository(db as unknown as Prisma.TransactionClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("exists", () => {
    it("returns true when a matching record is found", async () => {
      db.document.findFirst.mockResolvedValue({ id: SAMPLE_DOCUMENT_ID });

      const result = await repo.exists({ fileId: SAMPLE_FILE_ID });

      expect(result).toBe(true);
    });

    it("returns false when no record is found", async () => {
      db.document.findFirst.mockResolvedValue(null);

      const result = await repo.exists({ fileId: SAMPLE_FILE_ID });

      expect(result).toBe(false);
    });

    it("queries with the given where clause and selects only id", async () => {
      db.document.findFirst.mockResolvedValue(null);
      const where: Prisma.DocumentWhereInput = { name: SAMPLE_FILE_NAME };

      await repo.exists(where);

      expect(db.document.findFirst).toHaveBeenCalledTimes(1);
      expect(db.document.findFirst).toHaveBeenCalledWith({
        where,
        select: { id: true },
      });
    });

    it("propagates errors from the db client", async () => {
      const dbError = new Error("connection lost");
      db.document.findFirst.mockRejectedValue(dbError);

      await expect(repo.exists({ id: "doc-1" })).rejects.toThrow(
        "connection lost",
      );
    });
  });

  describe("create", () => {
    it("creates a document with the provided data and returns it", async () => {
      const data = SAMPLE_NEW_DOCUMENT_SAVE_DATA as Prisma.DocumentCreateInput;
      db.document.create.mockResolvedValue(SAMPLE_DOCUMENT_DB_ROW);

      const result = await repo.create(data);

      expect(db.document.create).toHaveBeenCalledTimes(1);
      expect(db.document.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(SAMPLE_DOCUMENT_DB_ROW);
    });

    it("propagates errors from the db client", async () => {
      db.document.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: "7.8.0",
        }),
      );

      await expect(
        repo.create({ name: "dup.pdf" } as Prisma.DocumentCreateInput),
      ).rejects.toMatchObject({ code: "P2002" });
    });
  });

  describe("listDocuments", () => {

    it("returns paginated documents", async () => {

      db.document.findMany.mockResolvedValue([
        SAMPLE_DOCUMENT_DB_ROW,
      ]);

      db.document.count.mockResolvedValue(1);

      const result = await repo.listDocuments(
        SAMPLE_LIST_DOCUMENTS_QUERY,
      );

      expect(db.document.findMany).toHaveBeenCalled();

      expect(db.document.count).toHaveBeenCalled();

      expect(result).toEqual(
        SAMPLE_PAGINATED_DOCUMENTS,
      );
    });

    it("passes pagination correctly", async () => {

      db.document.findMany.mockResolvedValue([]);

      db.document.count.mockResolvedValue(0);

      await repo.listDocuments({
        ...SAMPLE_LIST_DOCUMENTS_QUERY,
        page: 2,
        pageSize: 20,
      });

      expect(db.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            uploadedAt: "desc",
          },
        }),
      );

      expect(
        db.document.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        }),
      );
    });

    it("applies search filter", async () => {

      db.document.findMany.mockResolvedValue([]);

      db.document.count.mockResolvedValue(0);

      await repo.listDocuments({
        ...SAMPLE_LIST_DOCUMENTS_QUERY,
        search: "invoice",
      });



      expect(db.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: {
              contains: "invoice",
            },
          }),
        }),
      );
    });

    it("applies ingest status filter", async () => {

      db.document.findMany.mockResolvedValue([]);

      db.document.count.mockResolvedValue(0);

      await repo.listDocuments({
        ...SAMPLE_LIST_DOCUMENTS_QUERY,
        status: "pending",
      });

      expect(db.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ingestStatus: "pending",
          }),
        }),
      );
    });

    it("propagates database errors", async () => {

      db.document.findMany.mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(
        repo.listDocuments(
          SAMPLE_LIST_DOCUMENTS_QUERY,
        ),
      ).rejects.toThrow("DB Error");
    });

  });

  describe("getDocument()", () => {
    it("returns document", async () => {
      db.document.findFirst.mockResolvedValue(
        SAMPLE_DOCUMENT_DETAILS,
      );

      const result = await repo.getDocument(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
      );

      expect(db.document.findFirst).toHaveBeenCalled();

      expect(result).toEqual(
        SAMPLE_DOCUMENT_DETAILS,
      );
    });

  });

  it("returns null when document doesn't exist", async () => {
    db.document.findFirst.mockResolvedValue(null);

    const result = await repo.getDocument(
      SAMPLE_DOCUMENT_ID,
      SAMPLE_DATASET_KB_ID,
    );

    expect(result).toBeNull();
  });

  it("propagates DB errors", async () => {
    db.document.findFirst.mockRejectedValue(
      new Error("DB Error"),
    );

    await expect(
      repo.getDocument(
        SAMPLE_DOCUMENT_ID,
        SAMPLE_DATASET_KB_ID,
      ),
    ).rejects.toThrow("DB Error");
  });

  describe("updateDocumentName()", () => {
    it("updates the document name", async () => {
      const updatedDocument = {
        ...SAMPLE_DOCUMENT_DETAILS,
        name: "updated_document.pdf",
      };

      db.document.update.mockResolvedValue(updatedDocument);

      const result = await repo.updateDocumentName(
        SAMPLE_DOCUMENT_ID,
        "updated_document.pdf",
      );

      expect(db.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: SAMPLE_DOCUMENT_ID },
          data: { name: "updated_document.pdf" },
          select: expect.any(Object),
        }),
      );

      expect(result).toEqual(updatedDocument);
    });

    it("propagates database errors", async () => {
      db.document.update.mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(
        repo.updateDocumentName(
          SAMPLE_DOCUMENT_ID,
          "updated_document.pdf",
        ),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("existsByNameInDataset()", () => {
    it("returns true when a matching document exists", async () => {
      db.document.count.mockResolvedValue(1);

      const result = await repo.existsByNameInDataset(
        SAMPLE_FILE_NAME,
        SAMPLE_DATASET_KB_ID,
      );

      expect(db.document.count).toHaveBeenCalledWith({
        where: {
          name: SAMPLE_FILE_NAME,
          kbId: SAMPLE_DATASET_KB_ID,
          active: true,
        },
      });

      expect(result).toBe(true);
    });

    it("returns false when no matching document exists", async () => {
      db.document.count.mockResolvedValue(0);

      const result = await repo.existsByNameInDataset(
        SAMPLE_FILE_NAME,
        SAMPLE_DATASET_KB_ID,
      );

      expect(result).toBe(false);
    });

    it("propagates database errors", async () => {
      db.document.count.mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(
        repo.existsByNameInDataset(
          SAMPLE_FILE_NAME,
          SAMPLE_DATASET_KB_ID,
        ),
      ).rejects.toThrow("DB Error");
    });
  });
});
