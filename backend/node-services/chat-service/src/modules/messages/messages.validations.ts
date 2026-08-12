import * as yup from "yup";

/**
 * Validation schema for GET /api/v1/conversations/:conversationId/messages
 * Validates route parameters and pagination queries.
 */
export const getHistorySchema = yup.object({
  params: yup.object({
    // Constrained to 32 characters based on PostgreSQL VARCHAR(32) schema[cite: 1]
    conversationId: yup
      .string()
      .max(32, "Conversation ID cannot exceed 32 characters")
      .required("Conversation ID is required"),
  }),
  query: yup.object({
    cursor: yup.string().optional(),
    limit: yup
      .number()
      .integer()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(20),
  }),
});

/**
 * Validation schema for PATCH /api/v1/messages/:id/feedback
 * Validates message identifier and nullable feedback properties.
 */
export const updateFeedbackSchema = yup.object({
  params: yup.object({
    // Constrained to 32 characters based on PostgreSQL VARCHAR(32) schema[cite: 1]
    id: yup
      .string()
      .max(32, "Message ID cannot exceed 32 characters")
      .required("Message ID is required"),
  }),
  body: yup
    .object({
      // Maps to BOOLEAN NULLABLE[cite: 1]
      thumbup: yup.boolean().nullable().default(null),
      // Maps to TEXT NULLABLE[cite: 1]
      feedback: yup
        .string()
        .nullable()
        .max(5000, "Feedback cannot exceed 5000 characters")
        .default(null),
    })
    .test(
      "has-feedback-or-rating",
      "Must provide either 'thumbup' rating or 'feedback' text",
      (value) =>
        value.thumbup !== null ||
        (value.feedback !== null && value.feedback !== ""),
    ),
});
