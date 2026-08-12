import { describe, expect, it } from "@jest/globals";
import { GetDocumentParamsSchema, UpdateDocumentRequestSchema } from "../../../modules/documents/document.validator.js";

describe("GetDocumentParamsSchema", () => {
  const valid = {
    datasetId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    documentId: "019fa803-aa88-72e8-b931-61169297eec4",
  };

  it("valid datasetId + documentId", () => {
    const { error } = GetDocumentParamsSchema.validate(valid);

    expect(error).toBeUndefined();
  });

  it("missing datasetId", () => {
    const { error } = GetDocumentParamsSchema.validate({
      documentId: valid.documentId,
    });

    expect(error).toBeDefined();
    expect(error?.details?.[0]?.path).toContain("datasetId");
  });

  it("missing documentId", () => {
    const { error } = GetDocumentParamsSchema.validate({
      datasetId: valid.datasetId,
    });

    expect(error).toBeDefined();
    expect(error?.details?.[0]?.path).toContain("documentId");
  });

  it("invalid datasetId UUID", () => {
    const { error } = GetDocumentParamsSchema.validate({
      ...valid,
      datasetId: "invalid",
    });

    expect(error).toBeDefined();
  });

  it("invalid documentId UUID", () => {
    const { error } = GetDocumentParamsSchema.validate({
      ...valid,
      documentId: "invalid",
    });

    expect(error).toBeDefined();
  });
});

describe("GetDocumentParamsSchema", () => {
  const valid = {
    name: "valid_updated_name",
  };

  it("valid document name", () => {
    const { error } = UpdateDocumentRequestSchema.validate(valid);

    expect(error).toBeUndefined();
  });

  it("empty document name", () => {
    const { error } = UpdateDocumentRequestSchema.validate({
      name: "",
    });

    expect(error).toBeDefined();
    expect(error?.details?.[0]?.path).toContain("name");
  });

  it("length must be less than or equal to 255 characters long", () => {
    const { error } = UpdateDocumentRequestSchema.validate({
      name: "Lorem sit amet, consectetur adipiscin Lorem ipsum dolor sit amet, consectetur adipiscin Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse imperdiet sit amet nisl vel mattis. Integer sodales ligula eu dolor sodales, vel tincidunt ipsum consequat",
    });

    expect(error).toBeDefined();
    expect(error?.details?.[0]?.message).toContain("length must be less than or equal to 255 characters long");
  });
});

