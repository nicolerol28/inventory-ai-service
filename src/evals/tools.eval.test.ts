import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { evalAgent as inventoryAgent } from "./eval-agent.js";
import { directCases, toolChainCases } from "./data/dataset.js";
import type { EvalCase } from "./types.js";
import { addEvalResult } from "./reports/eval-results-writer.js";
import { THRESHOLDS } from "./thresholds.js";

const MEMORY_RESOURCE = "eval-tools-resource";

describe("Tool Call Count — Direct Queries", () => {
  it("should not exceed maxToolCalls for simple queries", async () => {
    const cases = directCases
      .filter((c: EvalCase) => c.groundTruth.maxToolCalls !== undefined)
      .slice(0, 6);

    let total = 0;
    let withinLimit = 0;

    for (const c of cases) {
      const thread = `eval-tools-count-${randomUUID()}`;
      const result = await inventoryAgent.generate(c.question, {
        memory: { resource: MEMORY_RESOURCE, thread },
        modelSettings: { maxOutputTokens: 4096 },
      });
      const count = result.toolCalls.length;
      total++;
      if (count <= c.groundTruth.maxToolCalls!) withinLimit++;

      expect(
        count,
        `"${c.question}" used ${count} tool calls, max allowed is ${c.groundTruth.maxToolCalls}`,
      ).toBeLessThanOrEqual(c.groundTruth.maxToolCalls!);
    }

    const score = total > 0 ? withinLimit / total : 0;
    addEvalResult("Tool Call Count — Direct Queries", "tool call efficiency", {
      "tool-call-efficiency": score,
    });
  });
});

describe("Tool Selection Accuracy — Direct Queries", () => {
  it("should call at least one expected tool", async () => {
    const cases = directCases
      .filter((c: EvalCase) => (c.groundTruth.expectedTools?.length ?? 0) > 0)
      .slice(0, 5);

    let hits = 0;

    for (const c of cases) {
      const thread = `eval-tools-select-${randomUUID()}`;
      const result = await inventoryAgent.generate(c.question, {
        memory: { resource: MEMORY_RESOURCE, thread },
        modelSettings: { maxOutputTokens: 4096 },
      });

      const calledTools = new Set(
        result.toolCalls.map((tc) => tc.payload.toolName),
      );
      const expectedTools = c.groundTruth.expectedTools!;
      const hit = expectedTools.some((t) => calledTools.has(t));
      if (hit) hits++;

      expect(
        hit,
        `"${c.question}"\n  expected one of [${expectedTools}]\n  but called  [${[...calledTools]}]`,
      ).toBe(true);
    }

    const score = cases.length > 0 ? hits / cases.length : 0;
    addEvalResult("Tool Selection Accuracy — Direct Queries", "tool selection", {
      "tool-selection": score,
    });
  });
});

describe("Tool Selection Accuracy — Tool Chain Queries", () => {
  it("should use expected tools for multi-step queries", async () => {
    const cases = toolChainCases
      .filter((c: EvalCase) => (c.groundTruth.expectedTools?.length ?? 0) > 0)
      .slice(0, 4);

    let hits = 0;

    for (const c of cases) {
      const thread = `eval-tools-chain-${randomUUID()}`;
      const result = await inventoryAgent.generate(c.question, {
        memory: { resource: MEMORY_RESOURCE, thread },
        modelSettings: { maxOutputTokens: 4096 },
      });

      const calledTools = new Set(
        result.toolCalls.map((tc) => tc.payload.toolName),
      );
      const expectedTools = c.groundTruth.expectedTools!;
      if (expectedTools.some((t) => calledTools.has(t))) hits++;
    }

    const hitRate = cases.length > 0 ? hits / cases.length : 0;
    addEvalResult("Tool Selection Accuracy — Tool Chain Queries", "tool selection", {
      "tool-selection": hitRate,
    });

    expect(
      hitRate,
      `Tool selection hit rate ${hitRate.toFixed(2)} is below ${THRESHOLDS["tool-selection"]} threshold`,
    ).toBeGreaterThanOrEqual(THRESHOLDS["tool-selection"]);
  });
});
