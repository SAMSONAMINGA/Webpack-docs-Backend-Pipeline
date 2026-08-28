import { getVersionsFile } from "$lib/content";
import type { PageLoad } from "./$types";

export const prerender = true;

// Monitoring health snapshots (monitoring/data/health-<version>.json) are
// copied into content/monitoring at build time by scripts/sync-versions.ts
// / CI, mirroring how versions.json is produced. Loaded the same
// glob-at-build-time way as the rest of the static content.
const healthModules = import.meta.glob("/content/monitoring/health-*.json", { eager: true, import: "default" }) as Record<
  string,
  { webpackVersion: string; status: "healthy" | "warning" | "alert"; reasons: string[]; totalIncluded: number; driftPercent: number | null; unknownConstructCount: number }
>;

export const load: PageLoad = () => {
  const versionsFile = getVersionsFile();
  const health = Object.values(healthModules);
  return { versionsFile, health };
};
