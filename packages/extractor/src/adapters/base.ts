import type { Category, DocSymbol } from "../types.js";

/**
 * A Version Adapter is a small, deliberately "thin and readable" (per spec)
 * translation layer that knows how a specific Webpack major release differs
 * from the others, and normalizes those differences away before the rest of
 * the pipeline sees the data.
 *
 * Keep adapters boring on purpose: they should contain *only* version-specific
 * quirks (renamed symbols, moved namespaces, new/removed categories) — never
 * general extraction logic, which lives in extract.ts and applies uniformly.
 */
export interface VersionAdapter {
  /** Human-readable id, logged so a human can see exactly which adapter ran. */
  readonly id: string;
  /** Webpack majors this adapter is known to support, e.g. [5] or [6]. */
  readonly supportedMajors: number[];

  /**
   * Assign a Category to a raw symbol name/kind. Adapters differ mainly in
   * naming conventions between majors (e.g. Webpack 6 renaming or moving
   * loader-related types).
   */
  categorize(symbolName: string, kind: DocSymbol["kind"]): Category;

  /**
   * Optional per-symbol rewriting hook (e.g. renaming a symbol that changed
   * names between majors so historical docs/links stay comparable). Return
   * the symbol unchanged if no adjustment is needed.
   */
  transformSymbol(symbol: DocSymbol): DocSymbol;
}

/**
 * Fallback adapter used when no adapter declares support for the detected
 * major version. It behaves like the "latest" adapter but is explicit about
 * being a best-effort guess, so reports clearly flag it rather than silently
 * mis-documenting a brand-new Webpack major.
 */
export class FallbackAdapter implements VersionAdapter {
  readonly id = "fallback (best-effort, unverified)";
  readonly supportedMajors: number[] = [];

  categorize(symbolName: string, kind: DocSymbol["kind"]): Category {
    const n = symbolName.toLowerCase();
    if (n.includes("plugin")) return "Plugins";
    if (n.includes("loader")) return "Loaders";
    if (n.includes("config") || n.includes("options") || n.includes("rule")) return "Configuration";
    if (kind === "function" || kind === "class") return "API";
    return "Uncategorized";
  }

  transformSymbol(symbol: DocSymbol): DocSymbol {
    return symbol;
  }
}
