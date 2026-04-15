import { clearEvalResults } from "./reports/eval-results-writer.js";

export function setup(): void {
  clearEvalResults("eval-results.json");
}
