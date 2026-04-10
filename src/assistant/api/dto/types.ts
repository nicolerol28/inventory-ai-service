export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
}

export interface IndexResponse {
  message: string;
  indexed: number;
  skipped: number;
}