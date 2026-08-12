import { Router } from "express";
import chatEngineRouter from "../../modules/chat-engine/chat-engine.routes";
import conversationRouter from "../../modules/conversation/conversation.routes";
import dialogRouter from "../../modules/dialog/dialog.routes";
import { messagesRoutes } from "../../modules/messages";
import multiModelRouter from "../../modules/multi-model/multi-model.routes";

const router = Router();

router.use("/conversation", conversationRouter);
router.use("/dialog", dialogRouter);
router.use("/message", messagesRoutes);
router.use("/completion", chatEngineRouter);
router.use("/multi-model", multiModelRouter);

export default router;
