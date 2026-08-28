import { error } from "@sveltejs/kit";
import { getDocSource, getManifest, buildSearchIndex, listAllDocPaths, getVersionsFile } from "$lib/content";
import type { PageLoad, EntryGenerator } from "./$types";

export const prerender = true;

// Tells SvelteKit (adapter-static) every concrete [version]/[...slug] path
// to prerender, derived straight from whatever the backend pipeline
// actually generated — no route is guessed or hand-maintained.
export const entries: EntryGenerator = () => {
  return listAllDocPaths().map((p) => ({ version: p.version, slug: `${p.category}/${p.slug}` }));
};

export const load: PageLoad = ({ params }) => {
  const parts = params.slug.split("/");
  if (parts.length !== 2) {
    throw error(404, "That page doesn't exist in this tome.");
  }
  const [category, slug] = parts;

  const source = getDocSource(params.version, category, slug);
  if (!source) {
    throw error(404, `No documentation found for "${slug}" in ${category} (${params.version}).`);
  }

  const manifest = getManifest(params.version);
  const versionsFile = getVersionsFile();

  return {
    version: params.version,
    category,
    slug,
    source,
    categories: manifest?.categories ?? [],
    searchIndex: buildSearchIndex(params.version),
    versions: versionsFile.versions,
  };
};
