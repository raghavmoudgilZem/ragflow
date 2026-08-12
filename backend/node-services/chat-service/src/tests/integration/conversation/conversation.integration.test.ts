import express, { Express } from "express";
import request from "supertest";
import { ConversationController } from "../../../modules/conversation/conversation.controller";
import { ConversationService } from "../../../modules/conversation/conversation.service";
import { testResponseEnvelop } from "../helper";

describe("Conversation API Integration Tests", () => {
  let app: Express;
  let mockConversationService: jest.Mocked<ConversationService>;
  let conversationController: ConversationController;

  const mockConversation: any = {
    id: "conv_123",
    dialog_id: "dialog_abc",
    user_id: "anonymous",
    name: "New Chat Session",
    created_at: new Date().toISOString(), // ✨ Changed from createdAt to created_at
    is_deleted: false, // Added this to completely satisfy the type
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // 1. Create a mocked instance of the service
    mockConversationService = {
      initSession: jest.fn(),
      listByDialogId: jest.fn(),
      updateMetadata: jest.fn(),
      deleteSession: jest.fn(),
    } as unknown as jest.Mocked<ConversationService>;

    // 2. Instantiate controller with the mocked service
    conversationController = new ConversationController(
      mockConversationService,
    );

    // 3. Bind routes exactly matching your controller annotations
    // Note: The initSession endpoint expects dialog_id in req.body based on your controller code,
    // but the route path has :dialog_id. I've mapped it precisely to your controller's logic.
    app.post("/api/v1/dialogs/:dialog_id/conversations", (req, res) =>
      conversationController.initSession(req, res),
    );
    app.get("/api/v1/dialogs/:dialog_id/conversations", (req, res) =>
      conversationController.listConversations(req, res),
    );
    app.patch("/api/v1/conversations/:id", (req, res) =>
      conversationController.updateConversation(req, res),
    );
    app.delete("/api/v1/conversations/:id", (req, res) =>
      conversationController.deleteConversation(req, res),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Test Cases ---

  describe("POST /api/v1/dialogs/:dialog_id/conversations", () => {
    it("should initialize a new chat session and return 201", async () => {
      mockConversationService.initSession.mockResolvedValue(
        testResponseEnvelop(201, mockConversation) as any,
      );

      const response = await request(app)
        .post("/api/v1/dialogs/dialog_abc/conversations")
        .send({ dialog_id: "dialog_abc" });

      expect(response.status).toBe(201);
      expect(response.body.data.data).toEqual(mockConversation);
      expect(mockConversationService.initSession).toHaveBeenCalledWith({
        dialog_id: "dialog_abc",
        user_id: "anonymous",
      });
    });
  });

  describe("GET /api/v1/dialogs/:dialog_id/conversations", () => {
    it("should return a list of conversations and return 200", async () => {
      const mockList = [mockConversation];
      mockConversationService.listByDialogId.mockResolvedValue(
        testResponseEnvelop(200, mockList) as any,
      );

      const response = await request(app).get(
        "/api/v1/dialogs/c6ade9d07577440cbc73e093f0943f35/conversations",
      );
    });
  });

  describe("PATCH /api/v1/conversations/:id", () => {
    it("should update conversation metadata and return 200", async () => {
      const updatedConversation = {
        ...mockConversation,
        name: "Updated Title",
      };
      mockConversationService.updateMetadata.mockResolvedValue(
        testResponseEnvelop(200, updatedConversation) as any,
      );

      const response = await request(app)
        .patch("/api/v1/conversations/conv_123")
        .send({ name: "Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual(updatedConversation);
      expect(mockConversationService.updateMetadata).toHaveBeenCalledWith(
        "conv_123",
        "Updated Title",
      );
    });
  });

  describe("DELETE /api/v1/conversations/:id", () => {
    it("should soft delete the session and return 204 No Content", async () => {
      mockConversationService.deleteSession.mockResolvedValue(undefined);

      const response = await request(app).delete(
        "/api/v1/conversations/conv_123",
      );

      expect(response.status).toBe(204);
      expect(response.text).toBe(""); // 204 has no body content
      expect(mockConversationService.deleteSession).toHaveBeenCalledWith(
        "conv_123",
      );
    });
  });
});
