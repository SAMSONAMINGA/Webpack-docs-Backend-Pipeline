<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let headings: Array<{ id: string; text: string; depth: number }> = [];

  let activeId = "";
  let observer: IntersectionObserver | undefined;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) activeId = visible[0].target.id;
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
  });

  onDestroy(() => observer?.disconnect());

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
</script>

{#if headings.length > 0}
  <nav class="toc" aria-label="On this page">
    <p class="toc-title">On this page</p>
    <ul>
      {#each headings as h}
        <li style="padding-left: {(h.depth - 1) * 0.75}rem">
          <button class:active={activeId === h.id} on:click={() => scrollTo(h.id)}>
            {h.text}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc {
    position: sticky;
    top: 5.5rem;
    max-height: calc(100vh - 7rem);
    overflow-y: auto;
    padding-left: 1rem;
    border-left: 1px solid theme("colors.iron.800");
  }
  .toc-title {
    font-family: theme("fontFamily.medieval");
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: theme("colors.silver.400");
    margin-bottom: 0.5rem;
  }
  .toc ul {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .toc button {
    text-align: left;
    font-size: 0.82rem;
    color: theme("colors.silver.400");
    padding: 0.2rem 0;
    border-left: 2px solid transparent;
    padding-left: 0.6rem;
    transition: color 150ms ease, border-color 150ms ease;
  }
  .toc button:hover {
    color: theme("colors.silver.200");
  }
  .toc button.active {
    color: theme("colors.ember.400");
    border-left-color: theme("colors.ember.500");
  }
</style>
