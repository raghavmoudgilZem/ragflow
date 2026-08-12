// src/modules/dialog/dialog.repository.ts
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { DrizzleDB } from "../../core/database";
import { dialogs } from "../../core/database/schema";
import { logger } from "../../core/services/logger.service";

export class DialogRepository {
  constructor(private readonly db: DrizzleDB) {}

  /**
   * Creates a new Dialog configuration.
   */
  async create(data: any) {
    const [record] = await this.db
      .insert(dialogs)
      .values(data)
      .returning()
      .catch((e) => {
        logger.error(`Error creating Dialogs --> ${e.message}`);
        throw new Error("Something went wrong. Failed to create a chat!");
      });

    return record;
  }

  /**
   * Lists all valid dialogs sorted chronologically.
   */
  async findAll(limit: number, offset: number, search: string) {
    const whereClause = search
      ? and(eq(dialogs.status, "1"), ilike(dialogs.name, `%${search}%`))
      : eq(dialogs.status, "1");

    return this.db
      .select()
      .from(dialogs)
      .where(whereClause)
      .orderBy(desc(dialogs.created_at))
      .limit(limit)
      .offset(offset)
      .catch((e) => {
        logger.error(`Error fetching Dialog --> ${e.message}`);
        throw new Error("Something went wrong. Failed to fetch chats!");
      });
  }

  /**
   * Counts total valid dialogs for pagination metadata.
   */
  async countValidDialogs(search: string): Promise<number> {
    const whereClause = search
      ? and(eq(dialogs.status, "1"), ilike(dialogs.name, `%${search}%`))
      : eq(dialogs.status, "1");

    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(dialogs)
      .where(whereClause)
      .catch((e) => {
        logger.error(`Error counting Dialogs --> ${e.message}`);
        throw new Error("Something went wrong. Failed to count chats!");
      });

    // Drizzle raw count queries return as string/BigInt depending on dialect, ensure Number cast
    return Number(result[0]?.count || 0);
  }

  /**
   * Partially updates a Dialog configuration.
   */
  async update(id: string, payload: any) {
    const [updatedRecord] = await this.db
      .update(dialogs)
      .set(payload)
      .where(eq(dialogs.id, id))
      .returning()
      .catch((e) => {
        logger.error(`Error updating the Dialog --> ${e.message}`);
        throw new Error("Something went wrong. Failed to update the chat!");
      });

    return updatedRecord;
  }

  /**
   * Soft deletes a dialog by setting status to '0' (wasted).
   */
  async softDelete(id: string) {
    await this.db
      .update(dialogs)
      .set({ status: "0" })
      .where(eq(dialogs.id, id))
      .catch((e) => {
        logger.error(`Error deleting the Dialog --> ${e.message}`);
        throw new Error("Something went wrong. Failed to delete the chat!");
      });
  }

  async findDialogById(id: string) {
    return await this.db
      .select()
      .from(dialogs)
      .where(eq(dialogs.id, id))
      .catch((e) => {
        logger.error(`Error finding Dialog by ID --> ${e.message}`);
        throw new Error("This chat does not exist or deleted already.");
      });
  }
}
