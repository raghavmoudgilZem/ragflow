import express, { Express } from "express";
import request from "supertest";
import { DialogController } from "../../../modules/dialog/dialog.controller";
import { DialogService } from "../../../modules/dialog/dialog.service";
import { testResponseEnvelop } from "../helper";

describe("Dialog API Integration Tests", () => {
  let app: Express;
  let mockDialogService: jest.Mocked<DialogService>;
  let dialogController: DialogController;

  // Mock Data aligned with standard snake_case schema constraints
  const mockDialog = {
    name: "Customer Support Assistant",
    llm_id: "gpt-4-turbo",
    llm_setting: {
      temperature: 0.3,
      max_tokens: 2048,
      presence_penalty: 0.1,
    },
    prompt_config: {
      system_prompt: "You are a helpful customer support assistant.",
    },
    kb_ids: ["kb_abc123", "kb_def456"],
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // 1. Mock the DialogService methods
    mockDialogService = {
      createDialog: jest.fn(),
      listDialogs: jest.fn(),
      updateDialog: jest.fn(),
      deleteDialog: jest.fn(),
    } as unknown as jest.Mocked<DialogService>;

    // 2. Instantiate controller with the mocked service
    dialogController = new DialogController(mockDialogService);

    // 3. Bind routes exactly matching your controller annotations
    app.post("/api/v1/dialogs", (req, res) =>
      dialogController.createDialog(req, res),
    );
    app.get("/api/v1/dialogs", (req, res) =>
      dialogController.listDialogs(req, res),
    );
    app.patch("/api/v1/dialogs/:id", (req, res) =>
      dialogController.updateDialog(req, res),
    );
    app.delete("/api/v1/dialogs/:id", (req, res) =>
      dialogController.deleteDialog(req, res),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Test Cases ---

  describe("POST /api/v1/dialogs", () => {
    it("should create a new Dialog configuration and return 201 Created", async () => {
      mockDialogService.createDialog.mockResolvedValue(
        testResponseEnvelop(201, mockDialog) as any,
      );

      const payload = mockDialog;

      const response = await request(app).post("/api/v1/dialogs").send(payload);

      // Supertest serializes Dates into strings in JSON responses, so we convert mockDialog for exact match
      expect(response.status).toBe(201);

      expect(response.body.data.data).toEqual(mockDialog);
      expect(mockDialogService.createDialog).toHaveBeenCalledWith(payload);
    });
  });

  describe("GET /api/v1/dialogs", () => {
    it("should list all dialogs and return 200 OK", async () => {
      const mockList = [mockDialog];
      mockDialogService.listDialogs.mockResolvedValue(mockList as any);

      const response = await request(app).get("/api/v1/dialogs");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(JSON.parse(JSON.stringify(mockList)));
      expect(mockDialogService.listDialogs).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/v1/dialogs/:id", () => {
    it("should return dialog with same id and return 200 OK", async () => {
      const dialogWithId = { ...mockDialog, id: 123 };
      mockDialogService.getDialogById.mockResolvedValue(dialogWithId as any);

      const response = await request(app).get("/api/v1/dialogs/123");

      console.log("response", response.body);

      expect(response.status).toBe(200);
      // If your response structure wraps the payload in `{ data: ... }`

      expect(response.body.data).toEqual(dialogWithId);

      // Assert the correct service method was called
      expect(mockDialogService.getDialogById).toHaveBeenCalledTimes(1);
      expect(mockDialogService.getDialogById).toHaveBeenCalledWith(123); // Optional: verify correct argument
    });
  });

  describe("PATCH /api/v1/dialogs/:id", () => {
    it("should partially update a Dialog configuration and return 200 OK", async () => {
      const updatePayload = {
        name: "Updated Support Bot",
        similarity_threshold: 0.85,
      };
      const updatedDialog = { ...mockDialog, ...updatePayload };

      mockDialogService.updateDialog.mockResolvedValue(
        testResponseEnvelop(200, updatedDialog) as any,
      );

      const response = await request(app)
        .patch("/api/v1/dialogs/dialog_abc")
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual(
        JSON.parse(JSON.stringify(updatedDialog)),
      );
      expect(mockDialogService.updateDialog).toHaveBeenCalledWith(
        "dialog_abc",
        updatePayload,
      );
    });
  });

  describe("DELETE /api/v1/dialogs/:id", () => {
    it("should delete the dialog and return 204 No Content", async () => {
      mockDialogService.deleteDialog.mockResolvedValue(undefined);

      const response = await request(app).delete("/api/v1/dialogs/dialog_abc");

      expect(response.status).toBe(204);
      expect(response.text).toBe(""); // 204 No Content has empty body
      expect(mockDialogService.deleteDialog).toHaveBeenCalledWith("dialog_abc");
    });
  });
});
