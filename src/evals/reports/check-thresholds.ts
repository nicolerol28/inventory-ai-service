import { THRESHOLDS } from "../thresholds.js";

export interface ThresholdCheckResult {
  passed: boolean;
  failures: string[];
}

/**
 * Checks a map of scorer → score against the defined thresholds.
 * Returns `passed: true` only when every scored metric meets its threshold.
 */
export function checkThresholds(
  scores: Record<string, number>,
  suite: string,
): ThresholdCheckResult {
  const failures: string[] = [];

  for (const [scorer, score] of Object.entries(scores)) {
    const threshold = THRESHOLDS[scorer];
    if (threshold !== undefined && score < threshold) {
      failures.push(
        `[${suite}] ${scorer}: ${score.toFixed(3)} < ${threshold} (threshold)`,
      );
    }
  }

  return { passed: failures.length === 0, failures };
}

/**
 * Prints threshold failures and exits the process with a non-zero code.
 * Intended for use in CI scripts that run after the eval suite.
 */
export function assertThresholds(
  scores: Record<string, number>,
  suite: string,
): void {
  const { passed, failures } = checkThresholds(scores, suite);

  if (!passed) {
    for (const f of failures) {
      console.error(f);
    }
    process.exit(1);
  }
}
