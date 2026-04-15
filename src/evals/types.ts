export type EvalCase = {
  question: string;
  groundTruth: {
    expectedAnswer: string;
    expectedTools?: string[];
    maxToolCalls?: number;
    expectedContext?: string[];
  };
  category:
    | "direct"
    | "rag"
    | "rag-boundary"
    | "tool-chain"
    | "memory"
    | "edge-case";
  threadId?: string;
  turnOrder?: number;
};