/**
 * Structured logging used by every pipeline stage.
 *
 * Human-in-the-loop principle: every log line is machine-parseable (JSON,
 * for CI log aggregation / dashboards) AND human-readable (pretty printed
 * to stdout), so nothing requires a human to dig through raw JSON to
 * understand what happened.
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  stage: string;
  message: string;
  meta?: Record<string, unknown>;
}

const ICON: Record<LogLevel, string> = {
  debug: "🔍",
  info: "ℹ️ ",
  warn: "⚠️ ",
  error: "❌",
};

export class StageLogger {
  private records: LogRecord[] = [];

  constructor(private readonly stage: string, private readonly logFilePath?: string) {}

  private emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      stage: this.stage,
      message,
      meta,
    };
    this.records.push(record);

    // Human-readable line to stdout/stderr (shows up directly in CI logs).
    const line = `${ICON[level]} [${this.stage}] ${message}${meta ? " " + JSON.stringify(meta) : ""}`;
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);

    // Machine-readable JSON line, appended to a stage log file so the human
    // (or a dashboard) can inspect exactly what happened, in order, later.
    if (this.logFilePath) {
      mkdirSync(dirname(this.logFilePath), { recursive: true });
      appendFileSync(this.logFilePath, JSON.stringify(record) + "\n", "utf-8");
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.emit("debug", message, meta);
  }
  info(message: string, meta?: Record<string, unknown>) {
    this.emit("info", message, meta);
  }
  warn(message: string, meta?: Record<string, unknown>) {
    this.emit("warn", message, meta);
  }
  error(message: string, meta?: Record<string, unknown>) {
    this.emit("error", message, meta);
  }

  getRecords(): LogRecord[] {
    return this.records;
  }
}
