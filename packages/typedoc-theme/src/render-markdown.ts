/**
 * MARKDOWN GENERATION STAGE (the "custom TypeDoc theme")
 * --------------------------------------------------------
 * Consumes an IntermediateDoc and renders clean, structured Markdown files,
 * one per symbol, organized into category directories:
 *   Configuration/, Plugins/, Loaders/, API/, Uncategorized/
 *
 * Also writes a per-version `manifest.json` (JSON representation used by
 * the frontend's sidebar/TOC/search) and a category `index.md` for each
 * category directory.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { DocSymbol, IntermediateDoc } from "@webpack-docs/extractor";

export interface GeneratedFile {
  path: string;
  symbolId: string;
  category: string;
}

function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

function slug(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderSignature(sig: DocSymbol["signatures"][number]): string {
  const params = sig.parameters.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ");
  return `(${params}): ${sig.returnType}`;
}

function renderSymbolMarkdown(symbol: DocSymbol): string {
  const lines: string[] = [];
  lines.push(`# ${symbol.name}`);
  lines.push("");
  lines.push(`\`${symbol.kind}\` · defined in \`${symbol.sourceFile}${symbol.sourceLine ? ":" + symbol.sourceLine : ""}\``);
  if (symbol.deprecated) lines.push("\n> ⚠️ **Deprecated**");
  lines.push("");
  if (symbol.description) {
    lines.push(symbol.description);
    lines.push("");
  }

  if (symbol.extends.length > 0) {
    lines.push(`**Extends:** ${symbol.extends.map((e) => `\`${e}\``).join(", ")}`);
    lines.push("");
  }

  if (symbol.signatures.length > 0) {
    lines.push("## Signature");
    lines.push("");
    for (const sig of symbol.signatures) {
      lines.push("```typescript");
      lines.push(`${symbol.name}${renderSignature(sig)}`);
      lines.push("```");
      if (sig.description) lines.push(sig.description);
      if (sig.parameters.length > 0) {
        lines.push("");
        lines.push("| Parameter | Type | Optional | Description |");
        lines.push("|---|---|---|---|");
        for (const p of sig.parameters) {
          lines.push(`| \`${p.name}\` | \`${p.type}\` | ${p.optional ? "yes" : "no"} | ${p.description ?? ""} |`);
        }
      }
      lines.push("");
    }
  }

  if (symbol.properties.length > 0) {
    lines.push("## Properties");
    lines.push("");
    lines.push("| Property | Type | Optional | Readonly | Description |");
    lines.push("|---|---|---|---|---|");
    for (const p of symbol.properties) {
      lines.push(
        `| \`${p.name}\` | \`${p.type}\` | ${p.optional ? "yes" : "no"} | ${p.readonly ? "yes" : "no"} | ${p.description ?? ""} |`,
      );
    }
    lines.push("");
  }

  if (symbol.enumMembers.length > 0) {
    lines.push("## Members");
    lines.push("");
    lines.push("| Member | Value |");
    lines.push("|---|---|");
    for (const m of symbol.enumMembers) {
      lines.push(`| \`${m.name}\` | ${m.value ? `\`${m.value}\`` : "—"} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export interface GenerationResult {
  files: GeneratedFile[];
  categories: string[];
}

export function generateMarkdown(doc: IntermediateDoc, outDir: string): GenerationResult {
  const files: GeneratedFile[] = [];
  const included = doc.symbols.filter((s) => s.included);
  const byCategory = new Map<string, DocSymbol[]>();

  for (const symbol of included) {
    if (!byCategory.has(symbol.category)) byCategory.set(symbol.category, []);
    byCategory.get(symbol.category)!.push(symbol);
  }

  for (const [category, symbols] of byCategory) {
    const categoryDir = join(outDir, category);

    // Category index page.
    const indexLines = [
      `# ${category}`,
      "",
      `${symbols.length} documented symbol${symbols.length === 1 ? "" : "s"} in this category.`,
      "",
      ...symbols
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((s) => `- [\`${s.name}\`](./${slug(s.name)}.md) — ${s.kind}`),
    ];
    write(join(categoryDir, "index.md"), indexLines.join("\n"));

    for (const symbol of symbols) {
      const filePath = join(categoryDir, `${slug(symbol.name)}.md`);
      write(filePath, renderSymbolMarkdown(symbol));
      // Also emit the JSON representation alongside the markdown, per spec
      // ("Output both Markdown and a JSON representation").
      write(join(categoryDir, `${slug(symbol.name)}.json`), JSON.stringify(symbol, null, 2));
      files.push({ path: filePath, symbolId: symbol.id, category });
    }
  }

  const manifest = {
    webpackVersion: doc.webpackVersion,
    generatedAt: doc.generatedAt,
    categories: [...byCategory.keys()].sort(),
    symbols: included
      .map((s) => ({ id: s.id, name: s.name, category: s.category, kind: s.kind, slug: slug(s.name) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
  write(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  return { files, categories: [...byCategory.keys()].sort() };
}
