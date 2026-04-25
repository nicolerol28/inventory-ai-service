// A2A protocol types — only the subset needed for this implementation (no streaming, no FilePart/DataPart).

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: AgentCapabilities;
  skills: AgentSkill[];
  securitySchemes?: Record<string, SecurityScheme>;
  security?: SecurityRequirement[];
}

export interface AgentCapabilities {
  streaming: boolean;
  pushNotifications: boolean;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
}

export interface SecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
}

export type SecurityRequirement = Record<string, string[]>;

export type TaskStatus =
  | "submitted"
  | "working"
  | "completed"
  | "failed"
  | "canceled"
  | "input-required";

export interface TaskState {
  state: TaskStatus;
  message?: Message;
  timestamp: string;
}

export interface Task {
  id: string;
  status: TaskState;
  messages?: Message[];
  artifacts?: Artifact[];
}

export interface Message {
  role: "user" | "agent";
  parts: Part[];
}

export interface TextPart {
  type: "text";
  text: string;
}

export type Part = TextPart;

export interface Artifact {
  name?: string;
  description?: string;
  parts: Part[];
}

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
  id: string | number;
}

export interface JsonRpcSuccessResponse {
  jsonrpc: "2.0";
  result: unknown;
  id: string | number;
}

export interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  error: JsonRpcError;
  id: string | number | null;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

export interface MessageSendParams {
  id?: string;
  message: Message;
}