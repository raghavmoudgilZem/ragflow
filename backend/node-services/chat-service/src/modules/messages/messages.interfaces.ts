export interface IMessage {
  id: string;
  conversation_id: string;
  parent_id: string | null;
  role: "user" | "assistant";
  content: string;
  llm_id?: string | null;
  reference?: Record<string, any>[];
  thumbup?: boolean | null;
  feedback?: string | null;
  is_deleted: boolean;
  created_at: Date;
}

export interface IGetHistoryDto {
  conversationId: string;
  cursor?: string; // ISO Date string
  limit?: number;
}

export interface IFeedbackDto {
  thumbup: boolean;
  feedback?: string;
}
