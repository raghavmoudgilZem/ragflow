import { db } from "../../core/database";
import { MessagesController } from "./messages.controller";
import { MessagesRepository } from "./messages.repositories";
import setupMessagesRoutes from "./messages.routes";
import { MessagesService } from "./messages.service";

const messagesRepository = new MessagesRepository(db);
const messagesService = new MessagesService(messagesRepository);
const messagesController = new MessagesController(messagesService);

const router = setupMessagesRoutes(messagesController);

export { router as messagesRoutes, messagesService };
