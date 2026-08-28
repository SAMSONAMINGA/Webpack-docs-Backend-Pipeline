/**
 * NORMALIZATION STAGE
 * --------------------
 * Takes the raw ExtractionResult and turns it into a validated
 * IntermediateDoc (the version-agnostic single source of truth). This is
 * also where per-symbol categorization happens, via the Version Adapter.
 */
import { readFileSync, existsSync } from "node:fs";
import type { StageLogger } from "./logger.js";
import type { VersionAdapter } from "./adapters/base.js";
import type { ExtractionResult } from "./extract.js";
import {
  IJS_SCHEMA_VERSION,
  validateIntermediateDoc,
  type Category,
  type IntermediateDoc,
  type SymbolKind,
} from "./types.js";

export interface NormalizationDiff {
  previousRunFound: boolean;
  symbolCountDelta: number;
  addedSymbols: string[];
  removedSymbols: string[];
  categoryDeltas: Record<string, number>;
}

export function normalize(
  extraction: ExtractionResult,
  webpackVersion: string,
  adapter: VersionAdapter,
  logger: StageLogger,
): IntermediateDoc {
  logger.info("Starting normalization", { adapter: adapter.id, symbolCount: extraction.symbols.length });

  const symbols = extraction.symbols.map((s) => ({
    ...s,
    category: adapter.categorize(s.name, s.kind),
  }));

  const byCategory: Record<string, number> = {};
  const byKind: Record<string, number> = {};
  for (const s of symbols) {
    if (!s.included) continue;
    byCategory[s.category] = (byCategory[s.category] ?? 0) + 1;
    byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
  }

  const doc: IntermediateDoc = {
    schemaVersion: IJS_SCHEMA_VERSION,
    webpackVersion,
    adapter: adapter.id,
    generatedAt: new Date().toISOString(),
    symbols,
    warnings: extraction.warnings,
    stats: {
      totalFound: extraction.totalFound,
      totalIncluded: symbols.filter((s) => s.included).length,
      totalExcluded: symbols.filter((s) => !s.included).length,
      byCategory: byCategory as Record<Category, number>,
      byKind: byKind as Record<SymbolKind, number>,
    },
  };

  // Validate against the zod schema before it goes anywhere near disk or
  // downstream stages — this is the contract every later stage relies on.
  const validated = validateIntermediateDoc(doc);
  logger.info("Normalization complete, schema validated", {
    schemaVersion: validated.schemaVersion,
    totalIncluded: validated.stats.totalIncluded,
    totalExcluded: validated.stats.totalExcluded,
  });

  return validated;
}

/**
 * Compares against the previous run's Intermediate JSON (if present) so the
 * Normalization Report can answer "what changed since the last successful
 * run?" without a human having to diff raw JSON by hand.
 */
export function diffAgainstPrevious(
  current: IntermediateDoc,
  previousPath: string,
  logger: StageLogger,
): NormalizationDiff {
  if (!existsSync(previousPath)) {
    logger.info("No previous run found, skipping drift comparison", { previousPath });
    return {
      previousRunFound: false,
      symbolCountDelta: current.stats.totalIncluded,
      addedSymbols: current.symbols.filter((s) => s.included).map((s) => s.id),
      removedSymbols: [],
      categoryDeltas: { ...current.stats.byCategory },
    };
  }

  const previous = validateIntermediateDoc(JSON.parse(readFileSync(previousPath, "utf-8")));
  const prevIds = new Set(previous.symbols.filter((s) => s.included).map((s) => s.id));
  const currIds = new Set(current.symbols.filter((s) => s.included).map((s) => s.id));

  const addedSymbols = [...currIds].filter((id) => !prevIds.has(id));
  const removedSymbols = [...prevIds].filter((id) => !currIds.has(id));

  const categoryDeltas: Record<string, number> = {};
  const allCategories = new Set([...Object.keys(previous.stats.byCategory), ...Object.keys(current.stats.byCategory)]);
  for (const cat of allCategories) {
    const before = previous.stats.byCategory[cat as Category] ?? 0;
    const after = current.stats.byCategory[cat as Category] ?? 0;
    if (before !== after) categoryDeltas[cat] = after - before;
  }

  const diff: NormalizationDiff = {
    previousRunFound: true,
    symbolCountDelta: current.stats.totalIncluded - previous.stats.totalIncluded,
    addedSymbols,
    removedSymbols,
    categoryDeltas,
  };

  logger.info("Drift comparison against previous run complete", {
    symbolCountDelta: diff.symbolCountDelta,
    added: addedSymbols.length,
    removed: removedSymbols.length,
  });

  return diff;
}
