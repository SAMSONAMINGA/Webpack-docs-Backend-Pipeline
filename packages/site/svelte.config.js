import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html", // SPA fallback so client-side doc routing always works
      precompress: false,
    }),
    prerender: {
      // A version/category can legitimately have no page yet right after a
      // partial pipeline run — don't fail the whole site build over it,
      // just warn, since the SPA fallback handles it client-side anyway.
      handleHttpError: ({ status, path, message }) => {
        if (status === 404) {
          console.warn(`[prerender] skipping ${path}: ${message}`);
          return;
        }
        throw new Error(message);
      },
    },
  },
};

export default config;
