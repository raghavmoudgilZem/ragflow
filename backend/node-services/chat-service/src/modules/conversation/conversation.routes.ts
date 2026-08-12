import { Router } from "express";
import { ConversationService } from "./conversation.service";
import { ConversationController } from "./conversation.controller";
import { ConversationRepository } from "./conversation.repository";
import { db } from "../../core/database";
import { catchAsync } from "../../core/middleware/catchAsync";
import { validateRequest } from "../../core/middleware/requestValidation";
import {
  deleteConversationSchema,
  initSessionSchema,
  listConversationsSchema,
  updateConversationSchema,
} from "./conversation.validations";

const conversationRouter = Router({ mergeParams: true });

const repository = new ConversationRepository(db);
const service = new ConversationService(repository);
const controller = new ConversationController(service);

conversationRouter.post(
  "/",
  validateRequest(initSessionSchema),
  catchAsync(controller.initSession.bind(controller)),
);

conversationRouter.get(
  "/:d_id",
  validateRequest(listConversationsSchema),
  catchAsync(controller.listConversations.bind(controller)),
);

conversationRouter.patch(
  "/:id",
  validateRequest(updateConversationSchema),
  catchAsync(controller.updateConversation.bind(controller)),
);

conversationRouter.delete(
  "/:id",
  validateRequest(deleteConversationSchema),
  catchAsync(controller.deleteConversation.bind(controller)),
);

export default conversationRouter;
