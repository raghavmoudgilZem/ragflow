import { Router } from "express";
import { validateRequest } from "../../core/middleware/requestValidation";
import { MessagesController } from "./messages.controller";
import { updateFeedbackSchema } from "./messages.validations";

export default function setupMessagesRoutes(
  controller: MessagesController,
): Router {
  const router = Router();

  router.get(
    "/conversation/:conversationId",
    controller.getHistory.bind(controller),
  );

  router.patch(
    "/:id/feedback",
    validateRequest(updateFeedbackSchema),
    controller.updateFeedback.bind(controller),
  );

  router.delete("/pair/:parentId", controller.deletePair.bind(controller));

  return router;
}
