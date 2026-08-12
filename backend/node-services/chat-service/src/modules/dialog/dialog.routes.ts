// src/modules/dialog/dialog.routes.ts
import { Router } from "express";
import { DialogController } from "./dialog.controller";
import { DialogRepository } from "./dialog.repository";
import { DialogService } from "./dialog.service";

import { db } from "../../core/database";
import { catchAsync } from "../../core/middleware/catchAsync";
import { validateRequest } from "../../core/middleware/requestValidation";
import {
  createDialogSchema,
  deleteDialogSchema,
  updateDialogSchema,
} from "./dialog.validations";

const router = Router();

const dialogRepo = new DialogRepository(db);

const dialogService = new DialogService(dialogRepo);

const controller = new DialogController(dialogService);

router.post(
  "/",
  validateRequest(createDialogSchema),
  catchAsync(controller.createDialog.bind(controller)),
);

router.get("/:id", catchAsync(controller.getDialogById.bind(controller)));

router.get("/", catchAsync(controller.listDialogs.bind(controller)));

router.patch(
  "/:id",
  validateRequest(updateDialogSchema),
  catchAsync(controller.updateDialog.bind(controller)),
);

router.delete(
  "/:id",
  validateRequest(deleteDialogSchema),
  catchAsync(controller.deleteDialog.bind(controller)),
);

export default router;
