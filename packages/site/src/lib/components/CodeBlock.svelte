<script lang="ts">
  import { onMount } from "svelte";

  export let code: string;
  export let lang = "typescript";

  let highlightedHtml = "";
  let copied = false;

  onMount(async () => {
    try {
      const { codeToHtml } = await import("shiki");
      highlightedHtml = await codeToHtml(code, {
        lang,
        theme: "github-dark-dimmed", // closest bundled dark theme; recolored via CSS below
      });
    } catch {
      highlightedHtml = `<pre><code>${escapeHtml(code)}</code></pre>`;
    }
  });

  function escapeHtml(s: string) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="code-block">
  <div class="code-toolbar">
    <span class="lang-tag">{lang}</span>
    <button class="copy-btn" on:click={copyCode} aria-label="Copy code">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  </div>
  <div class="code-body">
    {#if highlightedHtml}
      {@html highlightedHtml}
    {:else}
      <pre><code>{code}</code></pre>
    {/if}
  </div>
</div>

<style>
  .code-block {
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid theme("colors.iron.700");
    background: theme("colors.charcoal.900");
    box-shadow: theme("boxShadow.iron-inset"), 0 0 0 1px rgba(255, 136, 0, 0.04);
    margin: 1rem 0;
  }
  .code-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.75rem;
    background: theme("colors.iron.900");
    border-bottom: 1px solid theme("colors.iron.700");
  }
  .lang-tag {
    font-family: theme("fontFamily.mono");
    font-size: 0.7rem;
    color: theme("colors.silver.400");
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .copy-btn {
    font-family: theme("fontFamily.mono");
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 0.25rem;
    background: theme("colors.iron.800");
    color: theme("colors.silver.200");
    transition: background 150ms ease, color 150ms ease;
  }
  .copy-btn:hover {
    background: theme("colors.ember.700");
    color: white;
  }
  .code-body {
    padding: 0.85rem 1rem;
    overflow-x: auto;
    font-family: theme("fontFamily.mono");
    font-size: 0.85rem;
    line-height: 1.6;
  }
  .code-body :global(pre) {
    background: transparent !important;
  }
</style>
