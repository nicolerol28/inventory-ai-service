import { appendFileSync, existsSync, unlinkSync } from "fs";
import { resolve } from "path";

export interface EvalResult {
  suite: string;
  test: string;
  scores: Record<string, number>;
}

const DEFAULT_PATH = "eval-results.json";

export function clearEvalResults(outputPath = DEFAULT_PATH): void {
  const resolved = resolve(outputPath);
  if (existsSync(resolved)) unlinkSync(resolved);
}

export function addEvalResult(
  suite: string,
  test: string,
  scores: Record<string, number>,
  outputPath = DEFAULT_PATH,
): void {
  const result: EvalResult = { suite, test, scores };
  appendFileSync(resolve(outputPath), JSON.stringify(result) + "\n", "utf-8");
}
