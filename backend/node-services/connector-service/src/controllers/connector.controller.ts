import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ConnectorService } from "../services/connector.service.js";
import { ConnectorRepository } from "../repositories/connector.repository.js";
import { AppError } from "../utils/AppError.js";

// 1. Define strict validation schemas at the system boundary
const createConnectorSchema = z.object({
  name: z.string().trim().min(1, "Connector name is required"),
  source: z.string().trim().min(1, "Connector source is required"),
  tenantId: z.string().trim().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  refreshFreq: z.number().int().nonnegative().optional(),
});

export class ConnectorController {
  /**
   * 2. Constructor Injection
   * By injecting the service here, we decouple the controller from concrete implementations.
   * This allows us to pass a MockService during unit testing.
   */
  constructor(private readonly connectorService: ConnectorService) {}

  public create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // 3. Parse and validate the incoming request body.
      // Zod strips out unknown fields and ensures types are mathematically sound.
      const validatedBody = createConnectorSchema.parse(req.body);

      // Delegate the strictly-typed payload to the domain service
      const result = await this.connectorService.create(validatedBody);
      
      res.status(201).json({
        success: true,
        status_code: 201,
        error: null,
        data: result,
      });
    } catch (error: unknown) {
      // Gracefully handle Zod validation errors
      if (error instanceof z.ZodError) {
        // Map Zod's detailed error array into a readable string
        const errorMessage = error.errors.map(e => e.message).join(", ");
        return next(new AppError(errorMessage, 400));
      }
      next(error); 
    }
  };

  public get = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // If auth middleware fails, this could technically be undefined. 
      // A quick defensive check prevents silent failures.
      if (!req.tenantId) {
        throw new AppError("Missing tenant context", 401);
      }
      
      const result = await this.connectorService.get(req.params.connectorId, req.tenantId);
      
      res.status(200).json({
        success: true,
        status_code: 200,
        error: null,
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

// 4. Export the wired singleton for the routes file
// The routes file remains unchanged: import { connectorController } from ...
export const connectorController = new ConnectorController(
  new ConnectorService(new ConnectorRepository())
);