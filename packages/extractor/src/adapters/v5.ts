import type { Category, DocSymbol } from "../types.js";
import type { VersionAdapter } from "./base.js";

/**
 * Webpack 5 adapter.
 *
 * Notes specific to v5 that justify this adapter's existence:
 * - Loader-related types live under `RuleSetRule` / `RuleSetUseItem` rather
 *   than a dedicated `Loaders` namespace, so we categorize by name pattern.
 * - `Configuration` is the single top-level options interface (no split
 *   between "core config" and "experiments config" the way later majors
 *   may introduce).
 */
export class WebpackV5Adapter implements VersionAdapter {
  readonly id = "webpack-v5-adapter";
  readonly supportedMajors = [5];

  categorize(symbolName: string, kind: DocSymbol["kind"]): Category {
    const n = symbolName.toLowerCase();

    if (n.startsWith("ruleset") || n.includes("loader")) return "Loaders";
    if (n.includes("plugin")) return "Plugins";
    if (
      n === "configuration" ||
      n.includes("options") ||
      n.includes("resolve") ||
      n.includes("optimization") ||
      n.includes("devserver")
    ) {
      return "Configuration";
    }
    if (kind === "function" || kind === "class" || n.includes("compiler") || n.includes("compilation")) {
      return "API";
    }
    return "Uncategorized";
  }

  transformSymbol(symbol: DocSymbol): DocSymbol {
    // v5 ships a small number of symbols under a `_` prefixed internal
    // naming convention that should never be documented publicly.
    if (symbol.name.startsWith("_")) {
      return { ...symbol, included: false, exclusionReason: "internal (v5 underscore-prefixed symbol)" };
    }
    return symbol;
  }
}
