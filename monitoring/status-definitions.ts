/**
 * Status Definitions
 * -------------------
 * The single shared vocabulary for "how is the system doing" across the
 * pipeline, the dashboards, and the frontend's status indicators. Keeping
 * this in one place means a human never has to reverse-engineer what
 * "warning" means in one context vs. another.
 */

export type PipelineStageStatus = "pending" | "running" | "succeeded" | "failed" | "skipped";

export type HealthStatus = "healthy" | "warning" | "alert";

export const HEALTH_STATUS_MEANING: Record<HealthStatus, string> = {
  healthy: "Last run completed with no unrecognized constructs and no significant symbol drift.",
  warning:
    "Last run completed, but something is worth a human glance: unrecognized TypeScript constructs, or a " +
    "moderate (5-20%) change in documented symbol count since the previous run.",
  alert:
    "Last run either failed, produced a large (>20%) symbol-count drift, or an expected category " +
    "(Configuration/Plugins/Loaders/API) came back empty. Needs human attention before the next scheduled run.",
};

export const PIPELINE_STAGES = [
  "trigger",
  "environment-preparation",
  "version-detection",
  "extraction",
  "normalization",
  "markdown-generation",
  "approval-gate",
  "site-build",
  "deployment",
  "health-check",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface PipelineRunStatus {
  runId: string;
  webpackVersion: string;
  trigger: "push" | "schedule" | "release-webhook" | "manual";
  startedAt: string;
  stages: Record<PipelineStage, PipelineStageStatus>;
  currentStage: PipelineStage | "complete";
}
