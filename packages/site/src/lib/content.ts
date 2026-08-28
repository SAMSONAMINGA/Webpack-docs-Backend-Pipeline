/**
 * Build-time content index.
 *
 * The backend pipeline (scripts/generate-md.ts) writes markdown into
 * packages/site/content/docs/<version>/<Category>/<slug>.md, plus a
 * manifest.json per version and a top-level versions.json (written by
 * scripts/sync-versions.ts). This module uses Vite's `import.meta.glob` to
 * pull all of that in eagerly at build time — no server/API needed, which
 * keeps the whole site static-adapter friendly.
 */

export interface DocPage {
  version: string; // "v5"
  category: string; // "Configuration"
  slug: string; // "configuration"
  source: string; // raw markdown
}

export interface ManifestSymbol {
  id: string;
  name: string;
  category: string;
  kind: string;
  slug: string;
}

export interface VersionManifest {
  webpackVersion: string;
  generatedAt: string;
  categories: string[];
  symbols: ManifestSymbol[];
}

export interface VersionsFile {
  generatedAt: string;
  latestTag: string | null;
  versions: Array<{
    tag: string;
    webpackVersion: string;
    adapter?: string;
    totalIncluded: number;
    generatedAt: string;
    approved: boolean;
  }>;
}

// Eagerly import every generated markdown file as raw text.
const rawDocs = import.meta.glob("/content/docs/**/*.md", { as: "raw", eager: true }) as Record<string, string>;

// Per-version manifest.json (symbol -> category/slug index), written by the
// typedoc-theme generation stage.
const manifestModules = import.meta.glob("/content/docs/*/manifest.json", { eager: true, import: "default" }) as Record<
  string,
  VersionManifest
>;

// Top-level version coverage manifest, written by scripts/sync-versions.ts.
// Loaded eagerly via glob (avoids top-level await) with a safe empty fallback
// for the very first run, before any pipeline has executed.
const versionsModules = import.meta.glob("/content/versions.json", { eager: true, import: "default" }) as Record<
  string,
  VersionsFile
>;

export function getVersionsFile(): VersionsFile {
  return (
    versionsModules["/content/versions.json"] ?? {
      generatedAt: new Date().toISOString(),
      latestTag: null,
      versions: [],
    }
  );
}

/** Flat list of every generated doc page, parsed out of the glob'd paths. */
export const allDocPages: DocPage[] = Object.entries(rawDocs)
  .map(([path, source]) => {
    // /content/docs/v5/Configuration/configuration.md
    const match = path.match(/\/content\/docs\/([^/]+)\/([^/]+)\/([^/]+)\.md$/);
    if (!match) return null;
    const [, version, category, slug] = match;
    if (slug === "index") return null; // category index pages, not individual symbol pages
    return { version, category, slug, source };
  })
  .filter((p): p is DocPage => p !== null);

export function getDocSource(version: string, category: string, slug: string): string | undefined {
  return allDocPages.find(
    (p) => p.version === version && p.category.toLowerCase() === category.toLowerCase() && p.slug === slug,
  )?.source;
}

export function getManifest(version: string): VersionManifest | undefined {
  const entry = Object.entries(manifestModules).find(([path]) => path === `/content/docs/${version}/manifest.json`);
  return entry?.[1];
}

/** Every concrete {version, category, slug} triple that actually exists, for prerender entry generation. */
export function listAllDocPaths(): Array<{ version: string; category: string; slug: string }> {
  return allDocPages.map(({ version, category, slug }) => ({ version, category, slug }));
}

/** Builds the flat search index (title/category/href/content) SearchBar consumes. */
export function buildSearchIndex(version: string) {
  return allDocPages
    .filter((p) => p.version === version)
    .map((p) => ({
      title: p.slug.replace(/-/g, " "),
      category: p.category,
      href: `/docs/${p.version}/${p.category}/${p.slug}`,
      content: p.source,
    }));
}
