import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { GenerationResult } from "./render-markdown.js";

function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

/**
 * Diffs the newly generated file list against whatever markdown already
 * exists in `outDir` from a previous run, so the report can say what was
 * created vs. updated vs. left untouched — per spec ("Produce a Generation
 * Report showing what was created or updated").
 */
export function writeGenerationReport(result: GenerationResult, outDir: string, reportDir: string, previouslyExisted: Set<string>) {
  const created = result.files.filter((f) => !previouslyExisted.has(f.path));
  const updated = result.files.filter((f) => previouslyExisted.has(f.path));

  const report = {
    outDir,
    totalFiles: result.files.length,
    categories: result.categories,
    created: created.map((f) => f.path),
    updated: updated.map((f) => f.path),
  };
  write(join(reportDir, "generation-report.json"), JSON.stringify(report, null, 2));

  const md = `# Generation Report

**Output directory:** \`${outDir}\`
**Total files generated:** ${result.files.length}
**Categories:** ${result.categories.join(", ") || "_none_"}

## Created (${created.length})
${created.length === 0 ? "_None_" : created.slice(0, 50).map((f) => `- \`${f.path}\``).join("\n")}
${created.length > 50 ? `\n_...and ${created.length - 50} more_` : ""}

## Updated (${updated.length})
${updated.length === 0 ? "_None_" : updated.slice(0, 50).map((f) => `- \`${f.path}\``).join("\n")}
${updated.length > 50 ? `\n_...and ${updated.length - 50} more_` : ""}
`;
  write(join(reportDir, "generation-report.md"), md);
}

/** Collects the set of markdown file paths that already exist, before generation runs. */
export function collectExistingFiles(outDir: string): Set<string> {
  const existing = new Set<string>();
  if (!existsSync(outDir)) return existing;

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) existing.add(full);
    }
  };
  walk(outDir);
  return existing;
}
