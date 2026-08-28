/**
 * Dashboard Schema
 * -----------------
 * Describes the shape of everything under monitoring/data/, which is what
 * scripts/health-check.ts and scripts/sync-versions.ts write, and what a
 * dashboard UI (or the docs site's "status" page) would read.
 */
import type { HealthStatus } from "./status-definitions.js";

/** Shape of monitoring/data/health-<version>.json */
export interface VersionHealthRecord {
  webpackVersion: string;
  status: HealthStatus;
  reasons: string[];
  totalIncluded: number;
  driftPercent: number | null;
  unknownConstructCount: number;
  deployment?: { url: string; deployedAt: string };
}

/** Shape of monitoring/data/version-coverage.json (written by sync-versions.ts) */
export interface VersionCoverageManifest {
  generatedAt: string;
  latestTag: string | null;
  versions: Array<{
    tag: string;
    webpackVersion: string;
    adapter: string;
    totalIncluded: number;
    generatedAt: string;
    approved: boolean;
  }>;
}

/**
 * Aggregates individual health records + the coverage manifest into a single
 * payload a dashboard can render in one fetch. Pure function, no I/O, so it
 * can be unit-tested and reused by both a CLI report and a future web
 * dashboard endpoint.
 */
export function buildDashboardPayload(
  coverage: VersionCoverageManifest,
  healthRecords: VersionHealthRecord[],
): {
  generatedAt: string;
  overallStatus: HealthStatus;
  versions: Array<VersionCoverageManifest["versions"][number] & { health?: VersionHealthRecord }>;
} {
  const healthByVersion = new Map(healthRecords.map((h) => [h.webpackVersion, h]));
  const versions = coverage.versions.map((v) => ({ ...v, health: healthByVersion.get(v.webpackVersion) }));

  const severityRank: Record<HealthStatus, number> = { healthy: 0, warning: 1, alert: 2 };
  const overallStatus = versions.reduce<HealthStatus>((worst, v) => {
    const s = v.health?.status ?? "healthy";
    return severityRank[s] > severityRank[worst] ? s : worst;
  }, "healthy");

  return { generatedAt: new Date().toISOString(), overallStatus, versions };
}
