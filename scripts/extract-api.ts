#!/usr/bin/env tsx
/**
 * STAGE ENTRYPOINT: extraction + normalization
 *
 * Usage:
 *   pnpm extract                       # auto-detect installed webpack version
 *   pnpm extract --webpack-version 6.0.0-beta.3   # documented for CI's manual dispatch
 *
 * Can be re-run independently of every other stage (per the human-in-the-loop
 * requirement "allow the human to re-run any individual stage independently").
 */
import {
  StageLogger,
  detectWebpackVersion,
  loadAdapterForMajor,
  extractFromTypesFile,
  normalize,
  diffAgainstPrevious,
  buildExtractionReport,
  writeExtractionReport,
  writeNormalizationReport,
  writeIntermediateJson,
} from "@webpack-docs/extractor";
import { parseArgs, reportsDirFor, intermediateJsonPathFor } from "./lib/paths.js";
import { resolve } from "node:path";
import { cpSync, existsSync } from "node:fs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const logDir = resolve(process.cwd(), "reports/_logs");
  const logger = new StageLogger("extract-api", resolve(logDir, `extract-${Date.now()}.log.jsonl`));

  logger.info("=== EXTRACTION STAGE STARTED ===", { trigger: args.trigger ?? "unspecified" });

  // 1. VERSION DETECTION
  const detected = detectWebpackVersion(logger);
  const webpackVersion = typeof args["webpack-version"] === "string" ? args["webpack-version"] : detected.version;

  // 2. ADAPTER LOADING
  const adapter = loadAdapterForMajor(detected.major, logger);

  // 3. EXTRACTION
  const extraction = await extractFromTypesFile(detected.typesPath, adapter, logger);

  // 4. NORMALIZATION
  const doc = normalize(extraction, webpackVersion, adapter, logger);

  const reportsDir = reportsDirFor(webpackVersion);
  const previousIntermediatePath = intermediateJsonPathFor(webpackVersion);

  // Snapshot previous run's intermediate.json (if any) before we overwrite it,
  // so the diff below compares against the LAST run, not the one we're about
  // to write.
  const previousSnapshotPath = resolve(reportsDir, "_previous-intermediate.json");
  if (existsSync(previousIntermediatePath)) {
    cpSync(previousIntermediatePath, previousSnapshotPath);
  }

  const diff = diffAgainstPrevious(doc, previousSnapshotPath, logger);

  // 5. WRITE ARTIFACTS — always available for inspection/download.
  writeIntermediateJson(doc, reportsDir);
  const extractionReport = buildExtractionReport(doc);
  writeExtractionReport(extractionReport, reportsDir);
  writeNormalizationReport(diff, doc, reportsDir);

  logger.info("=== EXTRACTION STAGE COMPLETE ===", {
    webpackVersion,
    adapter: adapter.id,
    totalIncluded: doc.stats.totalIncluded,
    totalExcluded: doc.stats.totalExcluded,
    warnings: doc.warnings.length,
    reportsDir,
  });

  console.log(`\n📄 Reports written to: ${reportsDir}`);
  console.log(`   - intermediate.json`);
  console.log(`   - extraction-report.md / .json`);
  console.log(`   - normalization-report.md / .json\n`);
}

main().catch((err) => {
  console.error("❌ Extraction stage failed:", err);
  process.exit(1);
});
