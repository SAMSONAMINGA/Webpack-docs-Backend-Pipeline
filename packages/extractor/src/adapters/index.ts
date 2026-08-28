import type { StageLogger } from "../logger.js";
import type { VersionAdapter } from "./base.js";
import { FallbackAdapter } from "./base.js";
import { WebpackV5Adapter } from "./v5.js";
import { WebpackV6Adapter } from "./v6.js";
import { WebpackLatestAdapter } from "./latest.js";

const REGISTRY: VersionAdapter[] = [new WebpackV5Adapter(), new WebpackV6Adapter()];

/**
 * Loads the correct Version Adapter for a detected Webpack major.
 *
 * Behavior (per spec):
 *  - Exact match on `supportedMajors` -> use that adapter, log why.
 *  - No exact match, but major is newer than any registered adapter ->
 *    use WebpackLatestAdapter, log a clear WARNING that this is a new,
 *    unverified major version.
 *  - No exact match and major is *older* than anything registered (should
 *    not normally happen) -> fall back to FallbackAdapter and warn loudly.
 */
export function loadAdapterForMajor(major: number, logger: StageLogger): VersionAdapter {
  const exact = REGISTRY.find((a) => a.supportedMajors.includes(major));
  if (exact) {
    logger.info("Loaded version adapter (exact match)", { major, adapter: exact.id });
    return exact;
  }

  const highestKnownMajor = Math.max(...REGISTRY.flatMap((a) => a.supportedMajors));

  if (major > highestKnownMajor) {
    logger.warn(
      `No adapter registered for webpack major ${major}. This looks like a NEW major version. ` +
        `Falling back to the 'latest' adapter (best-effort). A human should review and add a dedicated ` +
        `adapter in packages/extractor/src/adapters/.`,
      { major, highestKnownMajor, fallback: "webpack-latest-adapter" },
    );
    return new WebpackLatestAdapter();
  }

  logger.warn(
    `No adapter registered for webpack major ${major} and it is OLDER than the oldest supported major ` +
      `(${Math.min(...REGISTRY.flatMap((a) => a.supportedMajors))}). Using generic fallback adapter — ` +
      `output quality for this version is not guaranteed.`,
    { major },
  );
  return new FallbackAdapter();
}

export function listRegisteredAdapters(): VersionAdapter[] {
  return REGISTRY;
}
