import { describe, it, expect } from "vitest";
import { evalAgent as inventoryAgent } from "./eval-agent.js";
import { getMemoryThreads } from "./data/dataset.js";
import type { EvalCase } from "./types.js";
import { addEvalResult } from "./reports/eval-results-writer.js";

const MEMORY_RESOURCE = "eval-user-memory";

describe("Memory — Multi-turn Context Retention", () => {
  it("should produce a non-empty response for every turn in every thread", async () => {
    const threads = getMemoryThreads();
    let total = 0;
    let nonEmpty = 0;

    for (const [threadId, turns] of threads) {
      for (const turn of turns) {
        const result = await inventoryAgent.generate(turn.question, {
          memory: { resource: MEMORY_RESOURCE, thread: threadId },
          modelSettings: { maxOutputTokens: 4096 },
        });
        total++;
        if (result.text.trim().length > 0) nonEmpty++;

        expect(
          result.text.trim().length,
          `Thread "${threadId}" turn ${turn.turnOrder} returned empty text`,
        ).toBeGreaterThan(0);
      }
    }

    const score = total > 0 ? nonEmpty / total : 0;
    addEvalResult("Memory — Multi-turn Context Retention", "response completeness", {
      "response-completeness": score,
    });
  });

  it("should resolve follow-up questions using prior turn context", async () => {
    const threads = getMemoryThreads();
    let total = 0;
    let resolved = 0;

    for (const [, turns] of threads) {
      const followUps = (turns as EvalCase[]).filter(
        (t) => (t.turnOrder ?? 1) > 1,
      );

      for (const followUp of followUps) {
        const result = await inventoryAgent.generate(followUp.question, {
          memory: { resource: MEMORY_RESOURCE, thread: followUp.threadId! },
          modelSettings: { maxOutputTokens: 4096 },
        });

        total++;
        const asksClarification =
          /(?:¿a qué|¿de qué|¿cuál.*te refieres|por favor especifica)/i.test(
            result.text,
          );
        if (!asksClarification && result.text.trim().length > 0) resolved++;

        expect(
          result.text.trim().length,
          `Follow-up "${followUp.question}" returned empty — context was likely lost`,
        ).toBeGreaterThan(0);

        expect(
          asksClarification,
          `Follow-up "${followUp.question}" response suggests missing context:\n${result.text}`,
        ).toBe(false);
      }
    }

    const score = total > 0 ? resolved / total : 0;
    addEvalResult("Memory — Multi-turn Context Retention", "context retention", {
      "context-retention": score,
    });
  });
});
