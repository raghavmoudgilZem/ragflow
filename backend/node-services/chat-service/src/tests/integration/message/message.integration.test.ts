import express, { Express } from "express";
import { constants } from "node:http2";
import request from "supertest";
import { MessagesController } from "../../../modules/messages/messages.controller";
import setupMessagesRoutes from "../../../modules/messages/messages.routes";
import { MessagesService } from "../../../modules/messages/messages.service";

// Assuming sendSuccess is available globally or we simulate its Express middleware behavior.
// For the sake of the test, we rely on the actual controller invoking it.
// If `sendSuccess` is heavily abstracted, ensure its import path is correctly mapped in your test environment.

describe("Messages API Integration Tests", () => {
  let app: Express;
  let mockMessagesService: jest.Mocked<MessagesService>;
  let messagesController: MessagesController;

  const mockMessage = {
    id: "msg_123",
    conversation_id: "conv_456",
    parent_id: "prompt_789",
    role: "assistant",
    content: "RAG flow explained...",
    llm_id: "llama3.2",
    reference: [],
    thumbup: null,
    feedback: null,
    is_deleted: false,
    created_at: "2026-07-10T11:36:00.000Z",
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // 1. Mock the Service Layer
    mockMessagesService = {
      getHistory: jest.fn(),
      updateFeedback: jest.fn(),
      deletePair: jest.fn(),
    } as unknown as jest.Mocked<MessagesService>;

    // 2. Instantiate Controller
    messagesController = new MessagesController(mockMessagesService);

    // 3. Bind Routes using the provided setup function
    // Assuming a base path of /api/v1/messages based on standard domain mapping
    app.use("/api/v1/messages", setupMessagesRoutes(messagesController));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Test Cases ---

  describe("GET /api/v1/messages/conversation/:conversationId", () => {
    it("should return paginated message history with exact envelope structure", async () => {
      const mockCursor = "2026-07-10T11:36:28.262Z";
      const mockServiceResult = {
        data: [mockMessage],
        next_cursor: mockCursor,
        has_more: false,
      };

      mockMessagesService.getHistory.mockResolvedValue(
        mockServiceResult as any,
      );

      const response = await request(app)
        .get("/api/v1/messages/conversation/conv_456")
        .query({ cursor: mockCursor, limit: "20" });

      expect(response.status).toBe(constants.HTTP_STATUS_OK);
      expect(mockMessagesService.getHistory).toHaveBeenCalledWith({
        conversationId: "conv_456",
        cursor: mockCursor,
        limit: 20, // Controller parses limit string to Int base-10
      });

      // Validating against the provided standard envelope screenshot
      expect(response.body).toMatchObject({
        status_code: 200,
        success: true,
        data: {
          data: [mockMessage],
          next_cursor: mockCursor,
          has_more: false,
        },
      });
    });
  });

  describe("PATCH /api/v1/messages/:id/feedback", () => {
    it("should successfully update message feedback and return 200 OK", async () => {
      mockMessagesService.updateFeedback.mockResolvedValue(undefined);

      const payload = {
        thumbup: false,
        feedback: "Incomplete explanation regarding Docker.",
      };

      const response = await request(app)
        .patch("/api/v1/messages/msg_123/feedback")
        .send(payload);

      expect(response.status).toBe(constants.HTTP_STATUS_OK);
      expect(mockMessagesService.updateFeedback).toHaveBeenCalledWith(
        "msg_123",
        payload,
      );
      expect(response.body).toMatchObject({
        status_code: 200,
        success: true,
        data: "Feedback updated successfully.",
      });
    });
  });

  describe("DELETE /api/v1/messages/pair/:parentId", () => {
    it("should process pair deletion and return 204 No Content", async () => {
      mockMessagesService.deletePair.mockResolvedValue(undefined);

      const response = await request(app).delete(
        "/api/v1/messages/pair/prompt_789",
      );

      expect(response.status).toBe(constants.HTTP_STATUS_NO_CONTENT);
      expect(response.text).toBe(""); // 204 enforces empty body

      // Note: Test currently aligns with the route parameter logic mapping to the controller extraction.
      expect(mockMessagesService.deletePair).toHaveBeenCalled();
    });
  });
});
