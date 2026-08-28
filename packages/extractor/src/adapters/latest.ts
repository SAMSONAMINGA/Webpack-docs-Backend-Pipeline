import type { Category, DocSymbol } from "../types.js";
import type { VersionAdapter } from "./base.js";

/**
 * "latest" adapter — intentionally permissive. Used for any major version
 * newer than the last one we've explicitly hand-verified (currently v6).
 * It behaves like v6 but every categorization decision is marked as
 * best-effort in the Extraction Report via the `id`, so a human immediately
 * knows: "a new major shipped and nobody has reviewed it yet."
 */
export class WebpackLatestAdapter implements VersionAdapter {
  readonly id = "webpack-latest-adapter (unverified for this major)";
  readonly supportedMajors: number[] = []; // deliberately empty: never "owns" a major, always a fallback

  categorize(symbolName: string, kind: DocSymbol["kind"]): Category {
    const n = symbolName.toLowerCase();
    if (n.includes("loader")) return "Loaders";
    if (n.includes("plugin")) return "Plugins";
    if (n === "configuration" || n.includes("options") || n.includes("config")) return "Configuration";
    if (kind === "function" || kind === "class") return "API";
    return "Uncategorized";
  }

  transformSymbol(symbol: DocSymbol): DocSymbol {
    return symbol;
  }
}
