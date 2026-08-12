// src/modules/conversation/conversation.validation.ts
import * as yup from "yup";

/**
 * POST /api/v1/dialogs/:dialog_id/conversations
 * Validates req.body based on your controller's logic.
 */
export const initSessionSchema = yup.object({
  body: yup.object({
    dialog_id: yup.string().required("Dialog ID is required").trim(),
  }),
});

/**
 * GET /api/v1/dialogs/:dialog_id/conversations
 * Validates req.params for pulling conversations.
 */
export const listConversationsSchema = yup.object({
  params: yup.object({
    d_id: yup.string().required("Dialog ID parameter is required").trim(),
  }),
});

/**
 * PATCH /api/v1/conversations/:id
 * Validates req.params for the ID and req.body for the metadata.
 */
export const updateConversationSchema = yup.object({
  params: yup.object({
    id: yup.string().required("Conversation ID parameter is required").trim(),
  }),
  body: yup.object({
    name: yup
      .string()
      .required("Conversation name is required")
      .trim()
      .min(1, "Conversation name cannot be empty")
      .max(100, "Conversation name cannot exceed 100 characters"),
  }),
});

/**
 * DELETE /api/v1/conversations/:id
 * Validates req.params for deletion.
 */
export const deleteConversationSchema = yup.object({
  params: yup.object({
    id: yup.string().required("Conversation ID parameter is required").trim(),
  }),
});

// TypeScript Types inferred from Yup schemas
export type InitSessionInput = yup.InferType<typeof initSessionSchema>;
export type ListConversationsInput = yup.InferType<
  typeof listConversationsSchema
>;
export type UpdateConversationInput = yup.InferType<
  typeof updateConversationSchema
>;
export type DeleteConversationInput = yup.InferType<
  typeof deleteConversationSchema
>;
