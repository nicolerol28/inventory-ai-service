export interface ChatRequest {
  question: string;
  threadId?: string;
  conversationId?: string;
}

export interface ChatResponse {
  answer: string;
  threadId: string;
  conversationId?: string;
}

export interface IndexResponse {
  message: string;
  indexed: number;
  skipped: number;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface UpdateConversationRequest {
  title: string;
}