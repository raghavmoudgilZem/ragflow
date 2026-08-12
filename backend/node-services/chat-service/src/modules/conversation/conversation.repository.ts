// src/modules/conversation/conversation.repository.ts
import { and, desc, eq, ilike } from "drizzle-orm";
import { DrizzleDB } from "../../core/database";
import { conversations } from "../../core/database/schema";
import { logger } from "../../core/services/logger.service";
import { sql } from "drizzle-orm";

export class ConversationRepository {
  // Injecting the Drizzle DB instance (which wraps the pg pool)
  constructor(private readonly db: DrizzleDB) {}

  /**
   * Initializes a new conversation session.
   */
  async create(data: {
    id: string;
    dialog_id: string;
    name?: string;
    user_id?: string;
  }) {
    const [record] = await this.db
      .insert(conversations)
      .values(data)
      .returning()
      .catch((e) => {
        logger.error(`Error creating Conversation --> ${e.message}`);
        throw new Error("Something went wrong. Failed to create conversation.");
      });

    return record;
  }

  /**
   * Lists conversations for a specific dialog, excluding deleted ones,
   * sorted chronologically.
   */
  async findByDialogId(
    dialogId: string,
    limit: number,
    offset: number,
    search: string,
  ) {
    const whereClause = search
      ? and(
          eq(conversations.dialog_id, dialogId),
          eq(conversations.is_deleted, false),
          ilike(conversations.name, `%${search}%`),
        )
      : and(
          eq(conversations.dialog_id, dialogId),
          eq(conversations.is_deleted, false),
        );

    return this.db
      .select()
      .from(conversations)
      .where(and(whereClause))
      .orderBy(desc(conversations.created_at))
      .limit(limit)
      .offset(offset)
      .catch((e) => {
        logger.error(`Error finding Conversations --> ${e.message}`);
        throw new Error("Something went wrong. Failed to fetch conversation.");
      });
  }

  /**
   * Counts total valid dialogs for pagination metadata.
   */
  async countValidDialogs(search: string): Promise<number> {
    const whereClause = search
      ? and(
          eq(conversations.is_deleted, false),
          ilike(conversations.name, `%${search}%`),
        )
      : eq(conversations.is_deleted, false);

    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(whereClause)
      .catch((e) => {
        logger.error(`Error counting Conversations --> ${e.message}`);
        throw new Error("Something went wrong. Failed to count conversations!");
      });

    // Drizzle raw count queries return as string/BigInt depending on dialect, ensure Number cast
    return Number(result[0]?.count || 0);
  }

  /**
   * Updates conversation metadata (e.g., updating the title).
   */
  async update(id: string, name: string) {
    const [updatedRecord] = await this.db
      .update(conversations)
      .set({ name })
      .where(eq(conversations.id, id))
      .returning()
      .catch((e) => {
        logger.error(`Error updating Conversation --> ${e.message}`);
        throw new Error("Something went wrong. Failed to update conversation.");
      });

    return updatedRecord;
  }

  /**
   * Soft deletes a conversation by setting is_deleted to true.
   */
  async softDelete(id: string) {
    await this.db
      .update(conversations)
      .set({ is_deleted: true })
      .where(eq(conversations.id, id))
      .catch((e) => {
        logger.error(`Error deleting Conversation --> ${e.message}`);
        throw new Error("Something went wrong. Failed to delete conversation.");
      });
  }

  async findConvoById(id: string) {
    return await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .catch((e) => {
        logger.error(`Error finding Conversation by ID --> ${e.message}`);
        throw new Error("This conversation does not exist or deleted already.");
      });
  }
}
