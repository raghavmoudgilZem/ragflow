import { Router } from "express";
// 1. MUST use .js extension for ESM imports.
// 2. Destructure the exact controller instance we exported in the last step.
import { connectorController } from "../controllers/connector.controller.js";

// Use descriptive variable names
const connectorRouter = Router();

/**
 * Route: POST /
 * Purpose: Create a new connector.
 * Note: We removed "/set". The POST method already implies creation.
 */
connectorRouter.post("/", connectorController.create);

/**
 * Route: GET /:connectorId
 * Purpose: Retrieve a specific connector by its ID.
 */
connectorRouter.get("/:connectorId", connectorController.get);

export default connectorRouter;