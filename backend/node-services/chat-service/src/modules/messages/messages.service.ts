import { IFeedbackDto, IGetHistoryDto, IMessage } from "./messages.interfaces";
import { MessagesRepository } from "./messages.repositories";

export class MessagesService {
  constructor(private readonly repository: MessagesRepository) {}

  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    return await this.repository.create(data);
  }

  async getHistory(dto: IGetHistoryDto): Promise<{
    data: IMessage[];
    next_cursor: string | null;
    has_more: boolean;
  }> {
    const limit = dto.limit || 20;
    // Default to current time if no cursor is provided
    const cursorTime = dto.cursor ? new Date(dto.cursor) : new Date();

    const messages = await this.repository.getHistoryByCursor(
      dto.conversationId,
      cursorTime,
      limit + 1,
    );

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // Remove the extra record used to determine 'has_more'
    }

    const nextCursor = !messages.length
      ? null
      : (messages[messages.length - 1]?.created_at.toISOString() ?? null);

    return {
      data: messages,
      next_cursor: hasMore ? nextCursor : null,
      has_more: hasMore,
    };
  }

  async updateFeedback(id: string, dto: IFeedbackDto): Promise<void> {
    // Business Logic: Only store written feedback if it's a negative rating (thumbup === false)
    const storedFeedback = dto.thumbup === false ? dto.feedback || null : null;
    await this.repository.updateFeedback(id, dto.thumbup, storedFeedback);
  }

  async deletePair(parentId: string): Promise<void> {
    await this.repository.softDeletePair(parentId);
  }
}
