import { Router } from "express";
import { catchAsync } from "../../core/middleware/catchAsync";
import { validateRequest } from "../../core/middleware/requestValidation";
import { ChatEngineController } from "./chat-engine.controller";
import { ChatEngineService } from "./chat-engine.service";
import { messageCompletionSchema } from "./chat-engine.validations";
import { messagesService } from "../messages/index";

const router = Router();

const engineService = new ChatEngineService(messagesService);

const controller = new ChatEngineController(engineService);

router.post(
  "/",
  validateRequest(messageCompletionSchema),
  catchAsync(controller.streamCompletion.bind(controller)),
);

export default router;
