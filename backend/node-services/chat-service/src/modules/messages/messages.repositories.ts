import { and, desc, eq, lt, or, ne } from "drizzle-orm";
import { DrizzleDB } from "../../core/database";
import { messages } from "../../core/database/schema";
import { logger } from "../../core/services/logger.service";
import { IMessage } from "./messages.interfaces";

export class MessagesRepository {
  // Assuming 'db' is your Drizzle ORM instance initialized elsewhere
  constructor(private readonly db: DrizzleDB) {}

  async create(data: Partial<IMessage>): Promise<IMessage> {
    if (!data?.id) {
      logger.error("Error creating message --> message id is required");
      throw new Error("Failed to create message. Message Id is missing.");
    }

    const [result] = await this.db
      .insert(messages)
      .values({
        id: data.id!,
        conversation_id: data.conversation_id!,
        parent_id: data.parent_id ?? null,
        role: data.role!,
        content: data.content!,
        llm_id: data.llm_id ?? null,
        reference: Array.isArray(data.reference)
          ? JSON.stringify(data.reference)
          : data.reference || "[]",
      })
      .returning()
      .catch((e) => {
        logger.error(`Error creating message --> ${e.message}`);
        throw new Error("Something went wrong. Failed to create message.");
      });

    return result as IMessage;
  }

  async getHistoryByCursor(
    conversationId: string,
    cursor: Date,
    limit: number,
  ): Promise<IMessage[]> {
    const result = await this.db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversation_id, conversationId),
          lt(messages.created_at, cursor),
          eq(messages.is_deleted, false),
        ),
      )
      .orderBy(desc(messages.created_at))
      .limit(limit)
      .catch((e) => {
        logger.error(`Error getting message history --> ${e.message}`);
        throw new Error("Something went wrong. Failed to get message history.");
      });

    return result as IMessage[];
  }

  async updateFeedback(
    id: string,
    thumbup: boolean,
    feedback: string | null,
  ): Promise<void> {
    await this.db
      .update(messages)
      .set({
        thumbup,
        feedback,
      })
      .where(eq(messages.id, id))
      .catch((e) => {
        logger.error(`Error updating message feedback--> ${e.message}`);
        throw new Error(
          "Something went wrong. Failed to update message feedback.",
        );
      });
  }

  async softDeletePair(parentId: string): Promise<void> {
    if (!parentId) {
      throw new Error("Message Id is required!");
    }

    await this.db
      .update(messages)
      .set({
        is_deleted: true,
      })
      .where(
        and(
          ne(messages.is_deleted, true),
          or(eq(messages.id, parentId), eq(messages.parent_id, parentId)),
        ),
      )
      .catch((e) => {
        logger.error(`Error deleting message pair--> ${e.message}`);
        throw new Error("Something went wrong. Failed to delete message pair.");
      });
  }
}
