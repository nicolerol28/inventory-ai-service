export const THRESHOLDS: Record<string, number> = {
  // agent.eval.test.ts
  "answer-relevancy-scorer": 0.7,
  "answer-relevancy-scorer:rag": 0.55,
  "completeness-scorer": 0.6,
  "response-language": 0.9,
  "response-language:rag": 0.6,
  // rag.eval.test.ts
  "context-precision-scorer": 0.6,
  "context-precision-scorer:boundary": 0.4,
  // memory.eval.test.ts
  "response-completeness": 1.0,
  "context-retention": 1.0,
  // tools.eval.test.ts
  "tool-selection": 0.6,
  "tool-call-efficiency": 0.8,
};
