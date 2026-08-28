import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { StageLogger } from "./logger.js";

export interface DetectedVersion {
  version: string; // e.g. "5.94.0"
  major: number; // e.g. 5
  typesPath: string; // resolved path to webpack/types.d.ts
}

/**
 * Detects the Webpack version currently installed in node_modules and
 * locates its `types.d.ts`. Logs exactly what it found so a human can
 * always answer "which version is this run documenting, and where did
 * that come from?"
 */
export function detectWebpackVersion(
  logger: StageLogger,
  webpackRoot = resolve(process.cwd(), "node_modules/webpack"),
): DetectedVersion {
  const pkgJsonPath = resolve(webpackRoot, "package.json");

  if (!existsSync(pkgJsonPath)) {
    logger.error("Could not find an installed webpack package.json", { pkgJsonPath });
    throw new Error(
      `webpack is not installed at ${webpackRoot}. Run 'pnpm install webpack@<version>' first, ` +
        `or pass --webpack-version to the manual workflow dispatch.`,
    );
  }

  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as { version: string };
  const major = Number.parseInt(pkg.version.split(".")[0], 10);

  const typesPath = resolve(webpackRoot, "types.d.ts");
  if (!existsSync(typesPath)) {
    logger.error("webpack is installed but types.d.ts was not found", { typesPath });
    throw new Error(
      `Expected ${typesPath} to exist. This webpack version may not ship bundled types, ` +
        `or the package layout has changed upstream.`,
    );
  }

  logger.info("Detected installed webpack version", {
    version: pkg.version,
    major,
    typesPath,
  });

  return { version: pkg.version, major, typesPath };
}
