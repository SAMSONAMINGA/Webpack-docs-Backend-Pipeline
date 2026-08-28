#!/usr/bin/env tsx
/**
 * STAGE ENTRYPOINT: post-run health check & monitoring
 *
 * Runs after deployment. Produces the "Final Summary Report" a human should
 * be able to read in under 60 seconds, updates the monitoring dashboard
 * data files, and exits non-zero (failing the CI job, which triggers
 * GitHub's built-in workflow-failure notifications) if anything looks wrong
 * enough to warrant an alert.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { validateIntermediateDoc } from "@webpack-docs/extractor";
import { parseArgs, reportsDirFor } from "./lib/paths.js";

const DRIFT_WARN_THRESHOLD = 0.05; // 5% symbol-count change triggers a warning
const DRIFT_ALERT_THRESHOLD = 0.2; // 20% triggers a hard alert

interface HealthStatus {
  webpackVersion: string;
  status: "healthy" | "warning" | "alert";
  reasons: string[];
  totalIncluded: number;
  driftPercent: number | null;
  unknownConstructCount: number;
  deployment?: { url: string; deployedAt: string };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const webpackVersion = typeof args["webpack-version"] === "string" ? args["webpack-version"] : undefined;
  if (!webpackVersion) {
    console.error("❌ --webpack-version is required for health-check.ts");
    process.exit(1);
  }

  const reportsDir = reportsDirFor(webpackVersion);
  const intermediatePath = resolve(reportsDir, "intermediate.json");
  const previousPath = resolve(reportsDir, "_previous-intermediate.json");
  const normalizationReportPath = resolve(reportsDir, "normalization-report.json");
  const deploymentPath = resolve(reportsDir, "deployment.json");

  if (!existsSync(intermediatePath)) {
    console.error(`❌ No intermediate.json found for ${webpackVersion} — run extract + generate first.`);
    process.exit(1);
  }

  const doc = validateIntermediateDoc(JSON.parse(readFileSync(intermediatePath, "utf-8")));
  const reasons: string[] = [];
  let status: HealthStatus["status"] = "healthy";

  const unknownConstructCount = doc.warnings.filter((w) => w.severity === "unknown-construct").length;
  if (unknownConstructCount > 0) {
    status = "warning";
    reasons.push(`${unknownConstructCount} unrecognized TypeScript construct(s) encountered during extraction.`);
  }

  let driftPercent: number | null = null;
  if (existsSync(previousPath)) {
    const previous = validateIntermediateDoc(JSON.parse(readFileSync(previousPath, "utf-8")));
    if (previous.stats.totalIncluded > 0) {
      driftPercent = (doc.stats.totalIncluded - previous.stats.totalIncluded) / previous.stats.totalIncluded;
      const absDrift = Math.abs(driftPercent);
      if (absDrift >= DRIFT_ALERT_THRESHOLD) {
        status = "alert";
        reasons.push(
          `Symbol count drifted ${(driftPercent * 100).toFixed(1)}% since the last successful run ` +
            `(${previous.stats.totalIncluded} → ${doc.stats.totalIncluded}). This exceeds the ${DRIFT_ALERT_THRESHOLD * 100}% alert threshold.`,
        );
      } else if (absDrift >= DRIFT_WARN_THRESHOLD) {
        status = "warning";
        reasons.push(
          `Symbol count drifted ${(driftPercent * 100).toFixed(1)}% since the last successful run — worth a quick look.`,
        );
      }
    }
  }

  // Missing-category check: did a whole category disappear?
  const expectedCategories = ["Configuration", "Plugins", "Loaders", "API"];
  const missing = expectedCategories.filter((c) => !(c in doc.stats.byCategory) || doc.stats.byCategory[c as keyof typeof doc.stats.byCategory] === 0);
  if (missing.length > 0) {
    status = "alert";
    reasons.push(`These expected categories have zero documented symbols: ${missing.join(", ")}.`);
  }

  const deployment = existsSync(deploymentPath) ? JSON.parse(readFileSync(deploymentPath, "utf-8")) : undefined;

  const health: HealthStatus = {
    webpackVersion,
    status,
    reasons,
    totalIncluded: doc.stats.totalIncluded,
    driftPercent,
    unknownConstructCount,
    deployment,
  };

  // Write monitoring dashboard data.
  mkdirSync(resolve(process.cwd(), "monitoring/data"), { recursive: true });
  writeFileSync(resolve(process.cwd(), `monitoring/data/health-${webpackVersion}.json`), JSON.stringify(health, null, 2));

  // Write the Final Summary Report — readable in under 60 seconds.
  const statusEmoji = { healthy: "✅", warning: "⚠️", alert: "🚨" }[status];
  const summary = `# Run Summary — Webpack ${webpackVersion}

## ${statusEmoji} Status: ${status.toUpperCase()}

- **Symbols documented:** ${doc.stats.totalIncluded} (${doc.stats.totalExcluded} excluded)
- **Drift vs. previous run:** ${driftPercent === null ? "n/a (first run)" : `${(driftPercent * 100).toFixed(1)}%`}
- **Unrecognized constructs:** ${unknownConstructCount}
- **Adapter used:** ${doc.adapter}
${deployment ? `- **Deployed to:** ${deployment.url} at ${deployment.deployedAt}` : "- **Deployment:** not yet deployed"}

${reasons.length > 0 ? `## Why this status?\n${reasons.map((r) => `- ${r}`).join("\n")}` : "No issues detected."}
`;
  writeFileSync(resolve(reportsDir, "summary-report.md"), summary, "utf-8");
  writeFileSync(resolve(reportsDir, "summary-report.json"), JSON.stringify(health, null, 2), "utf-8");

  console.log(summary);

  if (status === "alert") {
    console.error("🚨 Health check ALERT — failing the job so CI surfaces this to a human.");
    process.exit(1);
  }
}

main();
