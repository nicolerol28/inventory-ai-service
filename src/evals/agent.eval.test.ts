import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { runEvals } from "@mastra/core/evals";
import {
  createAnswerRelevancyScorer,
  createCompletenessScorer,
} from "@mastra/evals/scorers/prebuilt";
import { evalAgent as inventoryAgent } from "./eval-agent.js";
import { responseLanguageScorer } from "./scorers/response-language.scorer.js";
import { directCases, ragCases, edgeCases } from "./data/dataset.js";
import type { EvalCase } from "./types.js";
import { addEvalResult } from "./reports/eval-results-writer.js";
import { THRESHOLDS } from "./thresholds.js";

const judgeModel = "google/gemini-2.5-flash";

describe("Agent Quality — Direct Queries", () => {
  const answerRelevancy = createAnswerRelevancyScorer({ model: judgeModel });
  const completeness = createCompletenessScorer();

  it("should answer direct queries relevantly and completely", async () => {
    const result = await runEvals({
      target: inventoryAgent,
      data: directCases.map((c: EvalCase) => ({
        input: c.question,
        groundTruth: c.groundTruth.expectedAnswer,
        threadId: `eval-direct-${randomUUID()}`,
      })),
      scorers: [answerRelevancy, completeness, responseLanguageScorer],
      concurrency: 2,
    });

    addEvalResult("Agent Quality — Direct Queries", "relevancy + completeness", {
      "answer-relevancy-scorer": result.scores["answer-relevancy-scorer"],
      "completeness-scorer": result.scores["completeness-scorer"],
      "response-language": result.scores["response-language"],
    });

    expect(result.scores["answer-relevancy-scorer"]).toBeGreaterThanOrEqual(THRESHOLDS["answer-relevancy-scorer"]);
    expect(result.scores["completeness-scorer"]).toBeGreaterThanOrEqual(THRESHOLDS["completeness-scorer"]);
    expect(result.scores["response-language"]).toBeGreaterThanOrEqual(THRESHOLDS["response-language"]);
  });
});

describe("Agent Quality — RAG Queries", () => {
  const answerRelevancy = createAnswerRelevancyScorer({ model: judgeModel });

  it("should answer RAG queries relevantly in Spanish", async () => {
    const result = await runEvals({
      target: inventoryAgent,
      data: ragCases.map((c: EvalCase) => ({
        input: c.question,
        groundTruth: c.groundTruth.expectedAnswer,
        threadId: `eval-rag-${randomUUID()}`,
      })),
      scorers: [answerRelevancy, responseLanguageScorer],
      concurrency: 2,
    });

    addEvalResult("Agent Quality — RAG Queries", "relevancy + language", {
      "answer-relevancy-scorer:rag": result.scores["answer-relevancy-scorer"],
      "response-language:rag": result.scores["response-language"],
    });

    expect(result.scores["answer-relevancy-scorer"]).toBeGreaterThanOrEqual(THRESHOLDS["answer-relevancy-scorer:rag"]);
    expect(result.scores["response-language"]).toBeGreaterThanOrEqual(THRESHOLDS["response-language:rag"]);
  });
});

describe("Agent Quality — Edge Cases", () => {
  it("should handle edge cases gracefully in Spanish", async () => {
    const validEdgeCases = edgeCases.filter(
      (c: EvalCase) => c.question.trim() !== "",
    );

    const result = await runEvals({
      target: inventoryAgent,
      data: validEdgeCases.map((c: EvalCase) => ({
        input: c.question,
        groundTruth: c.groundTruth.expectedAnswer,
        threadId: `eval-edge-${randomUUID()}`,
      })),
      scorers: [responseLanguageScorer],
      concurrency: 2,
    });

    addEvalResult("Agent Quality — Edge Cases", "language", {
      "response-language": result.scores["response-language"],
    });

    expect(result.scores["response-language"]).toBeGreaterThanOrEqual(THRESHOLDS["response-language"]);
  });
});
