export interface Conversation {
  id: string;
  userId: number;
  title: string;
  isSeed: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface ConversationWithLastMessage extends Conversation {
  lastMessage: string | null;
  messageCount: number;
}