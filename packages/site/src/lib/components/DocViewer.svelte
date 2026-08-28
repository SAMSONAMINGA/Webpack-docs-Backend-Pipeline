<script lang="ts">
  import { renderMarkdown } from "$lib/markdown/parse";
  import { enhanceCodeBlocks } from "$lib/markdown/enhanceCodeBlocks";
  import TableOfContents from "./TableOfContents.svelte";
  import Breadcrumbs from "./Breadcrumbs.svelte";
  import VersionSwitcher from "./VersionSwitcher.svelte";
  import SearchBar from "./SearchBar.svelte";

  export let markdownSource: string;
  export let crumbs: Array<{ label: string; href?: string }> = [];
  export let versions: Array<{ tag: string; webpackVersion: string; approved: boolean }> = [];
  export let currentVersion: string;
  export let searchIndex: Array<{ title: string; category: string; href: string; content: string }> = [];
  export let onVersionChange: (tag: string) => void = () => {};

  $: ({ html, headings } = renderMarkdown(markdownSource));
</script>

<div class="viewer-grid">
  <div class="viewer-topbar">
    <Breadcrumbs {crumbs} />
    <div class="topbar-actions">
      <SearchBar index={searchIndex} />
      <VersionSwitcher {versions} current={currentVersion} onChange={onVersionChange} />
    </div>
  </div>

  <div class="viewer-body">
    <article class="parchment-panel" use:enhanceCodeBlocks>
      {@html html}
    </article>

    <aside class="toc-rail">
      <TableOfContents {headings} />
    </aside>
  </div>
</div>

<style>
  .viewer-grid {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1.5rem 1.25rem 4rem;
  }
  .viewer-topbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .viewer-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 2rem;
  }
  @media (max-width: 900px) {
    .viewer-body {
      grid-template-columns: 1fr;
    }
    .toc-rail {
      display: none;
    }
  }

  /* Parchment / ancient-tome panel styling, per spec */
  .parchment-panel {
    background: linear-gradient(180deg, rgba(233, 225, 204, 0.05) 0%, rgba(233, 225, 204, 0.02) 100%),
      theme("colors.charcoal.900");
    background-image: theme("backgroundImage.stone-texture");
    border: 1px solid theme("colors.iron.700");
    border-radius: 0.75rem;
    padding: 2rem 2.25rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45), inset 0 0 60px rgba(0, 0, 0, 0.3);
    color: theme("colors.parchment.100");
    line-height: 1.75;
  }

  .parchment-panel :global(h1),
  .parchment-panel :global(h2),
  .parchment-panel :global(h3) {
    font-family: theme("fontFamily.medieval");
    color: theme("colors.silver.100");
    scroll-margin-top: 6rem;
  }
  .parchment-panel :global(h1) {
    font-size: 1.9rem;
    border-bottom: 1px solid theme("colors.iron.700");
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  .parchment-panel :global(h2) {
    font-size: 1.35rem;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    color: theme("colors.ember.400");
  }
  .parchment-panel :global(p) {
    margin: 0.75rem 0;
  }
  .parchment-panel :global(a) {
    color: theme("colors.wisp.400");
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .parchment-panel :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.88rem;
  }
  .parchment-panel :global(th),
  .parchment-panel :global(td) {
    border: 1px solid theme("colors.iron.700");
    padding: 0.5rem 0.7rem;
    text-align: left;
  }
  .parchment-panel :global(th) {
    background: theme("colors.iron.900");
    color: theme("colors.silver.100");
    font-family: theme("fontFamily.medieval");
  }
  .parchment-panel :global(code) {
    font-family: theme("fontFamily.mono");
    background: theme("colors.iron.900");
    padding: 0.1rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
  }
  .parchment-panel :global(ul),
  .parchment-panel :global(ol) {
    margin: 0.5rem 0 0.5rem 1.4rem;
  }

  /* Code block chrome injected by the enhanceCodeBlocks action */
  .parchment-panel :global(.md-code-toolbar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: theme("colors.iron.900");
    border: 1px solid theme("colors.iron.700");
    border-bottom: none;
    border-radius: 0.5rem 0.5rem 0 0;
    padding: 0.35rem 0.7rem;
    margin-top: 1rem;
  }
  .parchment-panel :global(.md-lang-tag) {
    font-family: theme("fontFamily.mono");
    font-size: 0.68rem;
    text-transform: uppercase;
    color: theme("colors.silver.400");
    letter-spacing: 0.05em;
  }
  .parchment-panel :global(.md-copy-btn) {
    font-family: theme("fontFamily.mono");
    font-size: 0.68rem;
    padding: 0.15rem 0.55rem;
    border-radius: 0.25rem;
    background: theme("colors.iron.800");
    color: theme("colors.silver.200");
  }
  .parchment-panel :global(.md-copy-btn:hover) {
    background: theme("colors.ember.700");
    color: white;
  }
  .parchment-panel :global(.md-code-block) {
    background: theme("colors.charcoal.950") !important;
    border: 1px solid theme("colors.iron.700");
    border-top: none;
    border-radius: 0 0 0.5rem 0.5rem;
    padding: 0.9rem 1rem;
    overflow-x: auto;
    margin-bottom: 1rem;
    box-shadow: inset 0 0 30px rgba(255, 136, 0, 0.03);
  }
  .parchment-panel :global(.md-code-block code) {
    background: transparent;
    padding: 0;
    font-size: 0.85rem;
  }

  @media (max-width: 640px) {
    .parchment-panel {
      padding: 1.25rem 1.25rem;
    }
  }
</style>
