/**
 * EXTRACTION STAGE
 * ----------------
 * Reads webpack/types.d.ts, parses it with TypeDoc, and converts every
 * reflection TypeDoc gives us into a raw DocSymbol. This stage does NOT
 * categorize (that's the adapter's job) — it focuses purely on faithfully
 * reading what TypeDoc found, applying exclusion rules, and being fail-soft:
 * anything we don't understand is logged as a warning and marked
 * `included: false` rather than crashing the pipeline.
 */
import { Application, TSConfigReader, ReflectionKind, type DeclarationReflection, type ProjectReflection } from "typedoc";
import type { StageLogger } from "./logger.js";
import type { VersionAdapter } from "./adapters/base.js";
import type { DocSymbol, ExtractionWarning, SymbolKind } from "./types.js";

export interface ExtractionResult {
  symbols: DocSymbol[];
  warnings: ExtractionWarning[];
  totalFound: number;
}

const KIND_MAP: Array<[ReflectionKind, SymbolKind]> = [
  [ReflectionKind.Interface, "interface"],
  [ReflectionKind.TypeAlias, "type"],
  [ReflectionKind.Class, "class"],
  [ReflectionKind.Function, "function"],
  [ReflectionKind.Enum, "enum"],
  [ReflectionKind.Variable, "variable"],
  [ReflectionKind.Namespace, "namespace"],
];

function mapKind(reflectionKind: ReflectionKind): SymbolKind {
  const found = KIND_MAP.find(([rk]) => rk === reflectionKind);
  return found ? found[1] : "unknown";
}

function shouldExclude(refl: DeclarationReflection): string | undefined {
  const flags = refl.flags;
  if (flags?.isPrivate) return "private";
  if (flags?.isProtected) return "protected";
  // TSDoc @internal tag
  const hasInternalTag = refl.comment?.getTags("@internal")?.length ? true : false;
  if (hasInternalTag) return "internal (@internal tag)";
  if (refl.name.startsWith("__")) return "external/synthetic (double-underscore name)";
  return undefined;
}

function extractDescription(refl: DeclarationReflection): string {
  const summary = refl.comment?.summary ?? [];
  return summary.map((part) => ("text" in part ? part.text : "")).join("").trim();
}

/**
 * Runs TypeDoc against the given entry file (webpack/types.d.ts) and
 * converts its reflections into raw DocSymbols. Adapter is used only for
 * per-symbol `transformSymbol` hooks (e.g. version-specific renames) — NOT
 * for categorization, which happens in normalize.ts.
 */
export async function extractFromTypesFile(
  typesPath: string,
  adapter: VersionAdapter,
  logger: StageLogger,
): Promise<ExtractionResult> {
  logger.info("Starting TypeDoc extraction", { typesPath, adapter: adapter.id });

  const app = await Application.bootstrapWithPlugins({
    entryPoints: [typesPath],
    skipErrorChecking: true, // fail-soft: malformed/edge-case TS should not crash the run
    excludeExternals: true,
    excludePrivate: true,
    excludeProtected: true,
    excludeInternal: true,
  });
  app.options.addReader(new TSConfigReader());

  let project: ProjectReflection | undefined;
  try {
    project = await app.convert();
  } catch (err) {
    // Fail-soft at the top level too: a totally unparsable file should not
    // take down the whole pipeline — it should produce a loud, clear report.
    logger.error("TypeDoc failed to convert the entry file", {
      typesPath,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      symbols: [],
      warnings: [
        {
          message: `TypeDoc could not parse ${typesPath}: ${err instanceof Error ? err.message : String(err)}`,
          severity: "unknown-construct",
        },
      ],
      totalFound: 0,
    };
  }

  if (!project) {
    logger.error("TypeDoc produced no project reflection");
    return { symbols: [], warnings: [{ message: "No project reflection produced", severity: "unknown-construct" }], totalFound: 0 };
  }

  const symbols: DocSymbol[] = [];
  const warnings: ExtractionWarning[] = [];
  const children = project.children ?? [];

  for (const refl of children) {
    const kind = mapKind(refl.kind);
    if (kind === "unknown") {
      warnings.push({
        message: `Encountered a TypeScript construct with no known mapping (TypeDoc kind: ${ReflectionKind[refl.kind]}). Marked as undocumented.`,
        symbolName: refl.name,
        sourceFile: refl.sources?.[0]?.fileName,
        sourceLine: refl.sources?.[0]?.line,
        severity: "unknown-construct",
      });
    }

    const exclusionReason = shouldExclude(refl);

    let symbol: DocSymbol = {
      id: refl.name,
      name: refl.name,
      kind,
      category: "Uncategorized", // assigned later by normalize.ts via the adapter
      description: extractDescription(refl),
      properties: (refl.children ?? [])
        .filter((c) => c.kind === ReflectionKind.Property)
        .map((c) => ({
          name: c.name,
          type: c.type?.toString() ?? "unknown",
          optional: !!c.flags?.isOptional,
          readonly: !!c.flags?.isReadonly,
          description: extractDescription(c as DeclarationReflection),
        })),
      signatures: (refl.signatures ?? []).map((sig) => ({
        parameters: (sig.parameters ?? []).map((p) => ({
          name: p.name,
          type: p.type?.toString() ?? "unknown",
          optional: !!p.flags?.isOptional,
          description: extractDescription(p as unknown as DeclarationReflection),
        })),
        returnType: sig.type?.toString() ?? "void",
        description: extractDescription(sig as unknown as DeclarationReflection),
      })),
      enumMembers: (refl.children ?? [])
        .filter((c) => c.kind === ReflectionKind.EnumMember)
        .map((c) => ({ name: c.name, value: (c as unknown as { defaultValue?: string }).defaultValue })),
      extends: (refl.extendedTypes ?? []).map((t) => t.toString()),
      sourceFile: refl.sources?.[0]?.fileName ?? "unknown",
      sourceLine: refl.sources?.[0]?.line,
      visibility: refl.flags?.isPrivate ? "private" : refl.flags?.isProtected ? "protected" : "public",
      deprecated: !!refl.comment?.getTag("@deprecated"),
      included: !exclusionReason,
      exclusionReason,
    };

    symbol = adapter.transformSymbol(symbol);
    symbols.push(symbol);
  }

  logger.info("TypeDoc extraction complete", {
    totalFound: symbols.length,
    included: symbols.filter((s) => s.included).length,
    excluded: symbols.filter((s) => !s.included).length,
    warnings: warnings.length,
  });

  return { symbols, warnings, totalFound: symbols.length };
}
