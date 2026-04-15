import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { evalAgent } from "./eval-agent.js";
import { ragCases, ragBoundaryCases } from "./data/dataset.js";
import { addEvalResult } from "./reports/eval-results-writer.js";
import { THRESHOLDS } from "./thresholds.js";

type AnyRecord = Record<string, unknown>;

function extractSemanticSearchChunks(response: unknown): string[] {
  const chunks: string[] = [];

  const toolResults = (response as AnyRecord)?.toolResults;
  if (Array.isArray(toolResults)) {
    for (const tr of toolResults) {
      const payload = (tr as AnyRecord)?.payload as AnyRecord | undefined;
      const toolName = (tr as AnyRecord)?.toolName ?? payload?.toolName;
      if (toolName !== "semanticSearch") continue;

      const rawResult = (tr as AnyRecord)?.result ?? payload?.result;
      const results = (rawResult as AnyRecord)?.results ?? rawResult;

      if (Array.isArray(results)) {
        for (const item of results) {
          if (typeof item === "string") chunks.push(item);
          else if ((item as AnyRecord)?.content) chunks.push(String((item as AnyRecord).content));
          else if ((item as AnyRecord)?.text) chunks.push(String((item as AnyRecord).text));
        }
      } else if (typeof rawResult === "string") {
        chunks.push(rawResult);
      }
    }
  }

  return chunks;
}

function chunksContainContext(chunks: string[], expectedContext: string[]): boolean {
  const combined = chunks.join(" ").toLowerCase();
  return expectedContext.some((term) =>
    term.toLowerCase().split(/\s+/).some((word) => word.length > 2 && combined.includes(word.toLowerCase())),
  );
}

async function evaluateContextRecall(
  cases: typeof ragCases,
  threshold: number,
  label: string,
): Promise<number> {
  let hits = 0;
  let evaluated = 0;

  for (const c of cases) {
    if (!c.groundTruth.expectedContext) continue;

    const resourceId = "eval-resource";
    const threadId = `${label}-${randomUUID()}`;

    const response = await evalAgent.generate(c.question, {
      memory: { resource: resourceId, thread: threadId },
    });

    const chunks = extractSemanticSearchChunks(response);

    if (chunks.length === 0) {
      console.warn(`[RAG eval] No semanticSearch chunks for: "${c.question}"`);
      continue;
    }

    evaluated++;
    const hit = chunksContainContext(chunks, c.groundTruth.expectedContext);
    if (hit) hits++;

    console.log(
      `[RAG eval] "${c.question}" → ${hit ? "HIT" : "MISS"} (chunks: ${chunks.length})`,
    );
  }

  if (evaluated === 0) {
    console.warn(`[RAG eval] ${label}: no cases evaluated (semanticSearch never called)`);
    return 0;
  }

  const hitRate = hits / evaluated;
  console.log(`[RAG eval] ${label} hit rate: ${hits}/${evaluated} = ${hitRate.toFixed(2)}`);
  expect(hitRate).toBeGreaterThanOrEqual(threshold);

  return hitRate;
}

describe("RAG Quality — Context Recall", () => {
  it(
    "semantic search retrieves relevant chunks for conceptual queries",
    async () => {
      const hitRate = await evaluateContextRecall(ragCases, THRESHOLDS["context-precision-scorer"], "rag");
      addEvalResult("RAG Quality — Context Recall", "context precision", {
        "context-precision-scorer": hitRate,
      });
    },
    120_000,
  );
});

describe("RAG Boundary — Context Recall", () => {
  it(
    "semantic search retrieves relevant chunks for boundary queries",
    async () => {
      const hitRate = await evaluateContextRecall(ragBoundaryCases, THRESHOLDS["context-precision-scorer:boundary"], "rag-boundary");
      addEvalResult("RAG Boundary — Context Recall", "context precision", {
        "context-precision-scorer:boundary": hitRate,
      });
    },
    120_000,
  );
});
