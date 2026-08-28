#!/usr/bin/env tsx
/**
 * STAGE ENTRYPOINT: version sync
 *
 * Scans reports/ and packages/site/content/docs/ for every version that has
 * been successfully documented, and writes a single `versions.json` manifest
 * consumed by:
 *   - the frontend's version switcher
 *   - the monitoring "version coverage dashboard"
 *
 * Also determines which version should be labeled "latest" (highest major +
 * highest semver within that major that has a completed, approved run).
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { validateIntermediateDoc } from "@webpack-docs/extractor";

interface VersionEntry {
  tag: string; // "v5", "v6"
  webpackVersion: string;
  adapter: string;
  totalIncluded: number;
  generatedAt: string;
  approved: boolean;
}

function main() {
  const reportsRoot = resolve(process.cwd(), "reports");
  if (!existsSync(reportsRoot)) {
    console.error("❌ No reports/ directory found. Run the extraction stage for at least one version first.");
    process.exit(1);
  }

  const versionDirs = readdirSync(reportsRoot).filter((d) => /^v\d+$/.test(d));
  const entries: VersionEntry[] = [];

  for (const tag of versionDirs) {
    const intermediatePath = resolve(reportsRoot, tag, "intermediate.json");
    if (!existsSync(intermediatePath)) continue;

    const doc = validateIntermediateDoc(JSON.parse(readFileSync(intermediatePath, "utf-8")));
    const approved = existsSync(resolve(reportsRoot, tag, "APPROVED"));

    entries.push({
      tag,
      webpackVersion: doc.webpackVersion,
      adapter: doc.adapter,
      totalIncluded: doc.stats.totalIncluded,
      generatedAt: doc.generatedAt,
      approved,
    });
  }

  entries.sort((a, b) => Number.parseInt(b.tag.slice(1)) - Number.parseInt(a.tag.slice(1)));

  const latest = entries.find((e) => e.approved) ?? entries[0];

  const manifest = {
    generatedAt: new Date().toISOString(),
    latestTag: latest?.tag ?? null,
    versions: entries,
  };

  const outPath = resolve(process.cwd(), "packages/site/content/versions.json");
  mkdirSync(resolve(process.cwd(), "packages/site/content"), { recursive: true });
  writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf-8");

  // Also drop a copy in monitoring/ for the version coverage dashboard.
  mkdirSync(resolve(process.cwd(), "monitoring/data"), { recursive: true });
  writeFileSync(resolve(process.cwd(), "monitoring/data/version-coverage.json"), JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`✅ Synced ${entries.length} version(s). Latest: ${manifest.latestTag ?? "none"}`);
  console.log(`   ${outPath}`);
}

main();
