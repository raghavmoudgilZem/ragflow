export interface IChatCompletionDto {
  conversation_id: string;
  content: string; // The user's actual prompt
  llm_id: string; // Target model
}
