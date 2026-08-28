/**
 * REPORTING
 * ---------
 * Every report produced by this module is written twice:
 *  - a `.json` file (machine-readable, for dashboards/CI artifacts)
 *  - a `.md` file (human-readable, meant to be skimmable in under a minute)
 *
 * This directly implements the "no stage should be completely opaque"
 * human-in-the-loop principle.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { IntermediateDoc } from "./types.js";
import type { NormalizationDiff } from "./normalize.js";

function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

export interface ExtractionReport {
  webpackVersion: string;
  adapter: string;
  totalFound: number;
  totalIncluded: number;
  totalExcluded: number;
  byCategory: Record<string, number>;
  byKind: Record<string, number>;
  warnings: IntermediateDoc["warnings"];
  exclusions: Array<{ name: string; reason: string }>;
}

export function buildExtractionReport(doc: IntermediateDoc): ExtractionReport {
  return {
    webpackVersion: doc.webpackVersion,
    adapter: doc.adapter,
    totalFound: doc.stats.totalFound,
    totalIncluded: doc.stats.totalIncluded,
    totalExcluded: doc.stats.totalExcluded,
    byCategory: doc.stats.byCategory,
    byKind: doc.stats.byKind,
    warnings: doc.warnings,
    exclusions: doc.symbols
      .filter((s) => !s.included)
      .map((s) => ({ name: s.name, reason: s.exclusionReason ?? "unspecified" })),
  };
}

export function writeExtractionReport(report: ExtractionReport, outDir: string) {
  write(`${outDir}/extraction-report.json`, JSON.stringify(report, null, 2));

  const unknowns = report.warnings.filter((w) => w.severity === "unknown-construct");
  const md = `# Extraction Report — Webpack ${report.webpackVersion}

**Adapter used:** ${report.adapter}

## Summary
| Metric | Count |
|---|---|
| Symbols found | ${report.totalFound} |
| Included | ${report.totalIncluded} |
| Excluded | ${report.totalExcluded} |

## By Category
${Object.entries(report.byCategory).map(([k, v]) => `- **${k}**: ${v}`).join("\n") || "_none_"}

## By Kind
${Object.entries(report.byKind).map(([k, v]) => `- **${k}**: ${v}`).join("\n") || "_none_"}

## ⚠️ Unrecognized constructs (${unknowns.length})
${unknowns.length === 0 ? "_None — everything TypeDoc found was mapped to a known kind._" : unknowns.map((w) => `- \`${w.symbolName ?? "?"}\` at ${w.sourceFile ?? "?"}:${w.sourceLine ?? "?"} — ${w.message}`).join("\n")}

## Exclusions (${report.exclusions.length})
${report.exclusions.length === 0 ? "_None._" : report.exclusions.map((e) => `- \`${e.name}\` — ${e.reason}`).join("\n")}
`;
  write(`${outDir}/extraction-report.md`, md);
}

export function writeNormalizationReport(diff: NormalizationDiff, doc: IntermediateDoc, outDir: string) {
  write(`${outDir}/normalization-report.json`, JSON.stringify(diff, null, 2));

  const md = `# Normalization Report — Webpack ${doc.webpackVersion}

${diff.previousRunFound ? "Compared against the previous successful run." : "_No previous run found — this is treated as a baseline._"}

**Net symbol delta:** ${diff.symbolCountDelta > 0 ? "+" : ""}${diff.symbolCountDelta}

## Added symbols (${diff.addedSymbols.length})
${diff.addedSymbols.length === 0 ? "_None_" : diff.addedSymbols.slice(0, 50).map((s) => `- \`${s}\``).join("\n")}
${diff.addedSymbols.length > 50 ? `\n_...and ${diff.addedSymbols.length - 50} more_` : ""}

## Removed symbols (${diff.removedSymbols.length})
${diff.removedSymbols.length === 0 ? "_None_" : diff.removedSymbols.slice(0, 50).map((s) => `- \`${s}\``).join("\n")}
${diff.removedSymbols.length > 50 ? `\n_...and ${diff.removedSymbols.length - 50} more_` : ""}

## Category deltas
${Object.keys(diff.categoryDeltas).length === 0 ? "_No category-level changes_" : Object.entries(diff.categoryDeltas).map(([k, v]) => `- **${k}**: ${v > 0 ? "+" : ""}${v}`).join("\n")}
`;
  write(`${outDir}/normalization-report.md`, md);
}

export function writeIntermediateJson(doc: IntermediateDoc, outDir: string) {
  write(`${outDir}/intermediate.json`, JSON.stringify(doc, null, 2));
}
