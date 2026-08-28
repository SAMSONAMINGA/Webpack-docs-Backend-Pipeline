import { redirect, error } from "@sveltejs/kit";
import { getManifest } from "$lib/content";
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = ({ params }) => {
  const manifest = getManifest(params.version);
  if (!manifest || manifest.symbols.length === 0) {
    throw error(404, `No documentation has been generated yet for ${params.version}.`);
  }
  const first = [...manifest.symbols].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))[0];
  throw redirect(307, `/docs/${params.version}/${first.category}/${first.slug}`);
};
