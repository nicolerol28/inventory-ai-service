export interface ChatRequest {
  question: string;
  threadId?: string;
}

export interface ChatResponse {
  answer: string;
  threadId: string;
}

export interface IndexResponse {
  message: string;
  indexed: number;
  skipped: number;
}