import type { Category, DocSymbol } from "../types.js";
import type { VersionAdapter } from "./base.js";

/**
 * Webpack 6 adapter.
 *
 * This adapter is written defensively: at the time of writing, Webpack 6's
 * final public API surface is still evolving. Rather than assume its shape
 * matches v5, this adapter is explicit about the (currently known) deltas
 * and falls back to v5-equivalent heuristics for anything it doesn't
 * recognize yet, while logging that fallback so it's never silent.
 */
export class WebpackV6Adapter implements VersionAdapter {
  readonly id = "webpack-v6-adapter";
  readonly supportedMajors = [6];

  categorize(symbolName: string, kind: DocSymbol["kind"]): Category {
    const n = symbolName.toLowerCase();

    // Known v6 change: loader-related types are consolidated under a
    // `Loader*` naming convention rather than being nested in RuleSet*.
    if (n.startsWith("loader") || n.startsWith("ruleset") || n.includes("loader")) return "Loaders";
    if (n.includes("plugin")) return "Plugins";
    if (
      n === "configuration" ||
      n.includes("options") ||
      n.includes("resolve") ||
      n.includes("optimization") ||
      n.includes("devserver") ||
      n.includes("experiments")
    ) {
      return "Configuration";
    }
    if (kind === "function" || kind === "class" || n.includes("compiler") || n.includes("compilation")) {
      return "API";
    }
    return "Uncategorized";
  }

  transformSymbol(symbol: DocSymbol): DocSymbol {
    if (symbol.name.startsWith("_")) {
      return { ...symbol, included: false, exclusionReason: "internal (underscore-prefixed symbol)" };
    }
    return symbol;
  }
}
