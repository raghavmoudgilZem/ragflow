import { Connector } from "../models/index.js";

// This allows the Service layer to depend on the Interface, not the concrete implementation.
export interface IConnectorRepository {
  findByIdAndTenant(connectorId: string, tenantId: string): Promise<Connector | null>;
}

export class ConnectorRepository implements IConnectorRepository {
  /**
   * Retrieves a connector by its ID and the associated Tenant ID.
   * 
   * @param connectorId - The UUID/String ID of the connector
   * @param tenantId - The UUID/String ID of the tenant owning the connector
   * @returns A Promise resolving to the Connector instance or null if not found
   */
  public async findByIdAndTenant(
    connectorId: string, 
    tenantId: string
  ): Promise<Connector | null> {
    // Note: We assume the Controller/Service layer has already validated 
    // that connectorId and tenantId are valid strings/UUIDs via Zod.
    
    const connector = await Connector.findOne({
      where: { 
        id: connectorId, 
        tenantId 
      },
    });

    return connector;
  }
}

// Export the class itself so it can be instantiated by your DI container or service layer
export default ConnectorRepository;