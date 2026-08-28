#!/usr/bin/env tsx
/**
 * STAGE ENTRYPOINT: markdown generation
 *
 * Usage:
 *   pnpm generate                         # generate for the version found in reports/
 *   pnpm generate --webpack-version 5.94.0
 *   pnpm generate --preview               # generate + report, but do NOT write an
 *                                          # "approved" marker — site build stage checks
 *                                          # for that marker and will refuse to run
 *                                          # without it when APPROVAL_GATE=1.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { StageLogger, validateIntermediateDoc } from "@webpack-docs/extractor";
import { generateMarkdown, writeGenerationReport, collectExistingFiles } from "@webpack-docs/typedoc-theme";
import { parseArgs, reportsDirFor, docsDirFor, intermediateJsonPathFor, versionTag } from "./lib/paths.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const logger = new StageLogger("generate-md", resolve(process.cwd(), `reports/_logs/generate-${Date.now()}.log.jsonl`));

  const webpackVersion = typeof args["webpack-version"] === "string" ? args["webpack-version"] : findLatestVersionWithReport();
  if (!webpackVersion) {
    logger.error("No webpack version specified and none found in reports/. Run `pnpm extract` first.");
    process.exit(1);
  }

  const intermediatePath = intermediateJsonPathFor(webpackVersion);
  if (!existsSync(intermediatePath)) {
    logger.error("intermediate.json not found — run the extraction stage first", { intermediatePath });
    process.exit(1);
  }

  logger.info("=== MARKDOWN GENERATION STAGE STARTED ===", { webpackVersion, preview: !!args.preview });

  const doc = validateIntermediateDoc(JSON.parse(readFileSync(intermediatePath, "utf-8")));
  const outDir = docsDirFor(webpackVersion);
  const reportsDir = reportsDirFor(webpackVersion);

  const previouslyExisted = collectExistingFiles(outDir);
  const result = generateMarkdown(doc, outDir);
  writeGenerationReport(result, outDir, reportsDir, previouslyExisted);

  // HUMAN CONTROL POINT: Preview Mode.
  // Preview mode always stops here — it never writes the approval marker,
  // so the site build stage (which checks for it when APPROVAL_GATE=1)
  // will not proceed automatically.
  const approvalMarkerPath = resolve(reportsDir, "APPROVED");
  if (args.preview) {
    logger.info("Preview mode: stopping before deployment. No approval marker written.", { reportsDir });
    console.log(`\n👀 Preview complete for ${versionTag(webpackVersion)}. Review:`);
    console.log(`   - ${outDir} (generated markdown)`);
    console.log(`   - ${reportsDir}/generation-report.md`);
    console.log(`\nTo continue past the approval gate, run:`);
    console.log(`   pnpm exec tsx scripts/generate-md.ts --webpack-version ${webpackVersion} --approve\n`);
    return;
  }

  if (args.approve || process.env.APPROVAL_GATE !== "1") {
    // Either explicitly approved, or the approval gate isn't enabled for
    // this run (e.g. scheduled/automated runs where APPROVAL_GATE=0).
    writeFileSync(approvalMarkerPath, new Date().toISOString(), "utf-8");
    logger.info("Approval marker written — site build stage may proceed.", { approvalMarkerPath });
  } else {
    logger.warn("APPROVAL_GATE=1 and --approve was not passed. Site build will refuse to run until a human approves.", {
      hint: `pnpm exec tsx scripts/generate-md.ts --webpack-version ${webpackVersion} --approve`,
    });
  }

  console.log(`\n📄 Generated ${result.files.length} markdown files across ${result.categories.length} categories.`);
  console.log(`   Output: ${outDir}`);
  console.log(`   Report: ${reportsDir}/generation-report.md\n`);
}

function findLatestVersionWithReport(): string | undefined {
  // Best-effort convenience lookup: reads reports/_logs is not it — instead
  // scan reports/ for any vX dir containing intermediate.json and pick the
  // most recently modified one. Kept intentionally simple.
  const { readdirSync, statSync } = require("node:fs") as typeof import("node:fs");
  const root = resolve(process.cwd(), "reports");
  if (!existsSync(root)) return undefined;
  const candidates = readdirSync(root)
    .filter((d) => /^v\d+$/.test(d))
    .map((d) => resolve(root, d, "intermediate.json"))
    .filter((p) => existsSync(p));
  if (candidates.length === 0) return undefined;
  candidates.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  const doc = JSON.parse(readFileSync(candidates[0], "utf-8"));
  return doc.webpackVersion;
}

main().catch((err) => {
  console.error("❌ Markdown generation stage failed:", err);
  process.exit(1);
});
