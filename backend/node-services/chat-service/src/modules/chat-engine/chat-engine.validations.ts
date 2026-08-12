import * as yup from "yup";

export const messageCompletionSchema = yup.object({
  body: yup.object({
    content: yup
      .string()
      .required("Message Content can't be empty!")
      .trim()
      .min(2, "Message content must be at least 2 characters long."),
    documents: yup.array().of(yup.string()).optional(),
    dialog_id: yup.string().required("Dialog ID is required.").trim(),
    conversation_id: yup
      .string()
      .required("Conversation ID is required.")
      .trim(),
  }),
});
