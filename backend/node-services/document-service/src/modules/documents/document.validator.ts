import Joi from "joi";
import {
  DOC_FILE_TYPES,
  DOC_SOURCE,
  DOC_PARSE_TYPE_OPTIONS,
} from "../../config/constants.js";

export const NewDocumentRequestPayloadSchema = Joi.object({
  workspace_id: Joi.string().required(),
  kb_id: Joi.string().required(),
  file_id: Joi.string().required(),
  name: Joi.string().required(),
  file_size_bytes: Joi.number().required(),
  file_type: Joi.string()
    .valid(...DOC_FILE_TYPES)
    .required(),
  source: Joi.string()
    .valid(...DOC_SOURCE)
    .default("manual_upload")
    .optional(),
  parse_type: Joi.string()
    .valid(...DOC_PARSE_TYPE_OPTIONS)
    .required(),
});

export const ListDocumentsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  pageSize: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  search: Joi.string()
    .allow("")
    .optional(),

  status: Joi.string()
    .valid(
      "pending",
      "in_queue",
      "in_progress",
      "completed",
      "failed",
      "cancelled",
    )
    .optional(),

  sort: Joi.string()
    .valid(
      "uploadedAt",
      "createdAt",
      "updatedAt",
      "name",
    )
    .default("uploadedAt"),

  order: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});

export const GetDocumentParamsSchema = Joi.object({
  datasetId: Joi.string()
    .uuid()
    .required(),

  documentId: Joi.string()
    .uuid()
    .required(),
});

export const UpdateDocumentRequestSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required(),
});
