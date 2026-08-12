import { db } from "../../core/database";
import { DialogRepository } from "../dialog/dialog.repository";
import { DialogService } from "../dialog/dialog.service";
import { RagProviderService } from "../rag-provider/rag-provider.service";
import { MultiModelController } from "./multi-model.controller";
import { MultiModelService } from "./multi-model.service";

// Instantiate dependencies
const ragProvider = new RagProviderService();
const dialogRepo = new DialogRepository(db);
const dialogService = new DialogService(dialogRepo);

export const multiModelService = new MultiModelService(
  ragProvider,
  dialogService,
);

// Export the fully constructed controller
export const multiModelController = new MultiModelController(multiModelService);
