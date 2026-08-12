import * as yup from "yup";

const modelConfigSchema = yup.object({
  llm_id: yup.string().trim().required(),
  llm_setting: yup.object().required(),
  prompt_config: yup.object().optional(),
  prompt_type: yup.string().optional(),
  meta_data_filter: yup.object().optional(),
  vector_similarity_weight: yup.number().optional(),
  top_n: yup.number().optional(),
  top_k: yup.number().optional(),
  do_refer: yup.string().optional(),
  rerank_id: yup.string().optional(),
  kb_ids: yup.array().of(yup.string().required()).optional(),
  similarity_threshold: yup
    .number()
    .min(0, "Threshold cannot be less than 0")
    .max(1, "Threshold cannot be greater than 1")
    .optional(),
});

export const selectModelSchema = yup.object({
  body: modelConfigSchema
    .required()
    .noUnknown(true, "Unknown fields are not allowed in the update payload"),
});

export const multiModelCompletionSchema = yup.object({
  body: yup
    .object({
      prompt: yup
        .string()
        .min(2, "The minimum character count for a prompt is 2")
        .required("Please provide a valid prompt!"),
      models: yup
        .array()
        .of(modelConfigSchema.required())
        .required("Provide valid model configurations!"),
    })
    .noUnknown(true, "Unknown fields are not allowed in the update payload"),
});
