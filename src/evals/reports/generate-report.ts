import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import type { EvalResult } from "./eval-results-writer.js";
import { THRESHOLDS } from "../thresholds.js";

export interface EvalSuiteResult {
  suite: string;
  scores: Record<string, number>;
}

function aggregateBySuite(results: EvalResult[]): EvalSuiteResult[] {
  const suiteMap: Record<string, Record<string, number[]>> = {};

  for (const { suite, scores } of results) {
    if (!suiteMap[suite]) suiteMap[suite] = {};
    for (const [scorer, value] of Object.entries(scores)) {
      if (!suiteMap[suite][scorer]) suiteMap[suite][scorer] = [];
      suiteMap[suite][scorer].push(value);
    }
  }

  return Object.entries(suiteMap).map(([suite, scorerArrays]) => ({
    suite,
    scores: Object.fromEntries(
      Object.entries(scorerArrays).map(([k, vals]) => [
        k,
        vals.reduce((a, b) => a + b, 0) / vals.length,
      ]),
    ),
  }));
}

function generateMarkdownReport(results: EvalSuiteResult[]): string {
  const lines: string[] = [
    "# Inventory AI Service — Eval Report",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    "",
    "## Results",
    "",
    "| Suite | Scorer | Score | Threshold | Status |",
    "|-------|--------|-------|-----------|--------|",
  ];

  for (const result of results) {
    for (const [scorer, score] of Object.entries(result.scores)) {
      const threshold = THRESHOLDS[scorer] ?? 0;
      const status = score >= threshold ? "PASS" : "FAIL";
      lines.push(
        `| ${result.suite} | ${scorer} | ${score.toFixed(3)} | ${threshold} | ${status} |`,
      );
    }
  }

  const allPassed = results.every((r) =>
    Object.entries(r.scores).every(
      ([scorer, score]) => score >= (THRESHOLDS[scorer] ?? 0),
    ),
  );

  lines.push(
    "",
    "## Summary",
    "",
    allPassed ? "All evals passed" : "One or more evals failed",
  );

  return lines.join("\n");
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const htmlLines: string[] = [];
  let inTable = false;
  let isFirstTableRow = true;

  for (const line of lines) {
    if (line.startsWith("|")) {
      if (!inTable) {
        htmlLines.push("<table>");
        inTable = true;
        isFirstTableRow = true;
      }
      if (line.match(/^\|[-| ]+\|$/)) continue;

      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (isFirstTableRow) {
        htmlLines.push(`<thead><tr>${cells.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>`);
        isFirstTableRow = false;
      } else {
        htmlLines.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`);
      }
    } else {
      if (inTable) {
        htmlLines.push("</tbody></table>");
        inTable = false;
      }
      if (line.startsWith("# ")) {
        htmlLines.push(`<h1>${line.slice(2)}</h1>`);
      } else if (line.startsWith("## ")) {
        htmlLines.push(`<h2>${line.slice(3)}</h2>`);
      } else if (line.trim() === "") {
        htmlLines.push("<br>");
      } else {
        const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        htmlLines.push(`<p>${formatted}</p>`);
      }
    }
  }

  if (inTable) htmlLines.push("</tbody></table>");

  return htmlLines
    .join("\n")
    .replace(/PASS/g, '<span class="pass">PASS</span>')
    .replace(/FAIL/g, '<span class="fail">FAIL</span>');
}

// ── Main ──────────────────────────────────────────────────────────────────────
const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: tsx generate-report.ts <eval-results.json> <output.html>");
  process.exit(1);
}

const fileContent = readFileSync(resolve(inputPath), "utf-8");

// Parse JSONL — one EvalResult per line
const rawResults: EvalResult[] = fileContent
  .split("\n")
  .filter((line) => line.trim().length > 0)
  .map((line) => JSON.parse(line) as EvalResult);

const suiteResults = aggregateBySuite(rawResults);
const markdown = generateMarkdownReport(suiteResults);

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Eval Report — Inventory AI Service</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 960px;
      margin: 48px auto;
      padding: 0 24px;
      color: #111827;
      background: #ffffff;
    }
    h1 {
      font-size: 1.75rem;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 14px;
      margin-bottom: 8px;
    }
    h2 {
      font-size: 1.2rem;
      margin-top: 32px;
      color: #374151;
    }
    p { margin: 4px 0; color: #6b7280; font-size: 0.9rem; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0 24px;
      font-size: 0.92rem;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
      color: #374151;
      padding: 10px 14px;
      text-align: left;
      border: 1px solid #e5e7eb;
    }
    td {
      padding: 9px 14px;
      border: 1px solid #e5e7eb;
      color: #1f2937;
    }
    tr:nth-child(even) td { background: #f9fafb; }
    .pass { color: #16a34a; font-weight: 600; }
    .fail { color: #dc2626; font-weight: 600; }
  </style>
</head>
<body>
  ${markdownToHtml(markdown)}
</body>
</html>`;

writeFileSync(resolve(outputPath), html, "utf-8");
console.log(`Report generated: ${outputPath}`);
