/**
 * Alerting
 * --------
 * Deliberately minimal and pluggable: the pipeline already fails the CI job
 * (non-zero exit) on alert-level health, which triggers GitHub's native
 * workflow-failure notifications with zero extra config. This module is for
 * teams that want richer routing (Slack, PagerDuty, email) on top of that.
 *
 * Wire a real channel by implementing `AlertChannel` and adding it to
 * `CHANNELS` — nothing else in the pipeline needs to change.
 */
import type { HealthStatus } from "./status-definitions.js";

export interface AlertPayload {
  webpackVersion: string;
  status: HealthStatus;
  reasons: string[];
  runUrl?: string;
}

export interface AlertChannel {
  name: string;
  send(payload: AlertPayload): Promise<void>;
}

class ConsoleAlertChannel implements AlertChannel {
  name = "console";
  async send(payload: AlertPayload): Promise<void> {
    console.error(
      `🚨 ALERT [${payload.webpackVersion}] status=${payload.status}\n` +
        payload.reasons.map((r) => `  - ${r}`).join("\n") +
        (payload.runUrl ? `\n  Run: ${payload.runUrl}` : ""),
    );
  }
}

/**
 * Example Slack webhook channel. Only activates if SLACK_WEBHOOK_URL is set,
 * so this file is safe to import in any environment.
 */
class SlackAlertChannel implements AlertChannel {
  name = "slack";
  async send(payload: AlertPayload): Promise<void> {
    const url = process.env.SLACK_WEBHOOK_URL;
    if (!url) return;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text:
          `:rotating_light: *Webpack docs pipeline alert* — \`${payload.webpackVersion}\` is *${payload.status}*\n` +
          payload.reasons.map((r) => `• ${r}`).join("\n") +
          (payload.runUrl ? `\n<${payload.runUrl}|View run>` : ""),
      }),
    });
  }
}

const CHANNELS: AlertChannel[] = [new ConsoleAlertChannel(), new SlackAlertChannel()];

export async function dispatchAlert(payload: AlertPayload): Promise<void> {
  if (payload.status === "healthy") return;
  await Promise.all(CHANNELS.map((c) => c.send(payload).catch((err) => console.error(`Alert channel ${c.name} failed:`, err))));
}
