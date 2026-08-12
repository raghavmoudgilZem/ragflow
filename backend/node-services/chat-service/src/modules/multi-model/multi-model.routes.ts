import { Router } from "express";
import { catchAsync } from "../../core/middleware/catchAsync";
import { validateRequest } from "../../core/middleware/requestValidation";
import { multiModelController } from "./multi-model.factory";
import {
  multiModelCompletionSchema,
  selectModelSchema,
} from "./multi-model.validations";

const multiModelRoutes = Router({ mergeParams: true });

multiModelRoutes.post(
  "/completion",
  validateRequest(multiModelCompletionSchema),
  catchAsync(multiModelController.multiCompletion.bind(multiModelController)),
);

multiModelRoutes.post(
  "/select/:dialogId",
  validateRequest(selectModelSchema),
  catchAsync(multiModelController.selectModel.bind(multiModelController)),
);

export default multiModelRoutes;
