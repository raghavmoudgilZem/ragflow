// src/modules/dialog/dialog.validation.ts
import * as yup from "yup";

/**
 * POST /api/v1/dialogs
 * Validates the entire payload required to configure a new Dialog.
 */
export const createDialogSchema = yup.object({
  body: yup.object({
    name: yup
      .string()
      .trim()
      .min(2, "Dialog name must be at least 2 characters long"),

    llm_id: yup.string().trim(),

    // Validates JSON configurations often sent with LLM parameters
    llm_setting: yup.object().default({}),

    // Validates prompt configs like system templates/messages
    prompt_config: yup
      .object()

      .default({}),

    // Array of knowledge base string IDs
    kb_ids: yup.array().of(yup.string()).ensure(),
  }),
});

/**
 * PATCH /api/v1/dialogs/:id
 * Validates route parameters and accepts a partial body payload for flexible updates.
 */
export const updateDialogSchema = yup.object({
  params: yup.object({
    id: yup.string().required("Dialog ID parameter is required").trim(),
  }),
  body: yup
    .object({
      name: yup
        .string()
        .trim()
        .min(2, "Dialog name must be at least 2 characters long")
        .optional(),
      llm_id: yup.string().trim().optional(),
      llm_setting: yup.object().optional(),
      prompt_config: yup.object().optional(),
      kb_ids: yup.array().of(yup.string().required()).optional(),
      similarity_threshold: yup
        .number()
        .min(0, "Threshold cannot be less than 0")
        .max(1, "Threshold cannot be greater than 1")
        .optional(),
    })
    .noUnknown(true, "Unknown fields are not allowed in the update payload"),
  // .noUnknown strictly rejects fields not defined here to clean up incoming payloads
});

/**
 * DELETE /api/v1/dialogs/:id
 * Validates the route parameter ID.
 */
export const deleteDialogSchema = yup.object({
  params: yup.object({
    id: yup.string().required("Dialog ID parameter is required").trim(),
  }),
});

// TypeScript Types inferred from Dialog schemas
export type CreateDialogInput = yup.InferType<typeof createDialogSchema>;
export type UpdateDialogInput = yup.InferType<typeof updateDialogSchema>;
export type DeleteDialogInput = yup.InferType<typeof deleteDialogSchema>;
