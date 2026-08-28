import { resolve } from "node:path";

export const REPORTS_ROOT = resolve(process.cwd(), "reports");
export const DOCS_ROOT = resolve(process.cwd(), "packages/site/content/docs");

export function versionTag(webpackVersion: string): string {
  // "5.94.0" -> "v5", "6.0.0-beta.1" -> "v6"
  return `v${webpackVersion.split(".")[0]}`;
}

export function reportsDirFor(version: string): string {
  return resolve(REPORTS_ROOT, versionTag(version));
}

export function docsDirFor(version: string): string {
  return resolve(DOCS_ROOT, versionTag(version));
}

export function intermediateJsonPathFor(version: string): string {
  return resolve(reportsDirFor(version), "intermediate.json");
}

/** Parses `--flag value` / `--flag=value` style args. */
export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const [key, inlineValue] = token.slice(2).split("=");
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
    } else if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
      args[key] = argv[i + 1];
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}
