import { v4 as uuid } from "uuid";
// ✅ FIXED: Using .js extension for ESM module resolution
import { AppError } from "../utils/AppError.js"; 
import type { Connector } from "../models/index.js";

// 1. Data Transfer Objects (DTOs) for strict input typing
export interface CreateConnectorDTO {
  name: string;
  source: string;
  tenantId?: string;
  config?: Record<string, unknown>;
  refreshFreq?: number;
}

// 2. Repository Interface Contract
// The service depends on this contract, not the concrete implementation.
export interface IConnectorRepository {
  findByNameAndTenant(name: string, tenantId: string): Promise<Connector | null>;
  findByIdAndTenant(connectorId: string, tenantId: string): Promise<Connector | null>;
  create(data: Partial<Connector>): Promise<Connector>;
}

// 3. The Unified Domain Service Class
export class ConnectorService {
  /**
   * We inject the repository. This makes unit testing incredibly easy
   * because we can pass in a mock object that implements IConnectorRepository.
   */
  constructor(private readonly connectorRepo: IConnectorRepository) {}

  /**
   * Creates a new connector enforcing tenant uniqueness.
   */
  public async create(payload: CreateConnectorDTO): Promise<Connector> {
    // Note: Zod should handle this at the controller layer, but defensive 
    // programming dictates we ensure safety here as well.
    if (!payload.name?.trim()) {
      throw new AppError("Connector name is required", 400);
    }
    if (!payload.source?.trim()) {
      throw new AppError("Connector source is required", 400);
    }

    const tenantId = payload.tenantId || "default";

    // Enforce business rule: Name must be unique per tenant
    const existingConnector = await this.connectorRepo.findByNameAndTenant(
      payload.name,
      tenantId
    );

    if (existingConnector) {
      throw new AppError("Connector already exists for this tenant", 409);
    }

    // Use ?? (nullish coalescing) instead of || for refreshFreq. 
    // If someone passes 0, || would incorrectly override it to 30.
    return this.connectorRepo.create({
      id: uuid(),
      tenantId,
      name: payload.name,
      source: payload.source,
      config: payload.config ?? {},
      refreshFreq: payload.refreshFreq ?? 30,
      status: "CREATED",
    });
  }

  /**
   * Retrieves a connector, ensuring it belongs to the requesting tenant.
   */
  public async get(connectorId: string, tenantId: string): Promise<Connector> {
    if (!connectorId?.trim() || !tenantId?.trim()) {
      throw new AppError("Connector ID and Tenant ID are required", 400);
    }

    const connector = await this.connectorRepo.findByIdAndTenant(
      connectorId,
      tenantId
    );

    // Enforce business rule: Resource must exist
    if (!connector) {
      throw new AppError("Connector not found", 404);
    }

    return connector;
  }
}