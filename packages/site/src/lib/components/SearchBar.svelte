<script lang="ts">
  export let index: Array<{ title: string; category: string; href: string; content: string }> = [];

  let query = "";
  let scope: "page" | "all" = "all";
  let open = false;

  $: results =
    query.trim().length < 2
      ? []
      : index
          .filter(
            (item) =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.content.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 12);
</script>

<div class="search-wrap">
  <div class="search-input-row">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" /><line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" stroke-width="1.5" /></svg>
    <input
      type="search"
      placeholder="Search the tomes..."
      bind:value={query}
      on:focus={() => (open = true)}
      on:blur={() => setTimeout(() => (open = false), 150)}
    />
    <select bind:value={scope} aria-label="Search scope">
      <option value="all">All docs</option>
      <option value="page">This page</option>
    </select>
  </div>

  {#if open && results.length > 0}
    <ul class="results">
      {#each results as r}
        <li>
          <a href={r.href}>
            <span class="result-title">{r.title}</span>
            <span class="result-category">{r.category}</span>
          </a>
        </li>
      {/each}
    </ul>
  {:else if open && query.trim().length >= 2}
    <div class="no-results">No matching symbols found.</div>
  {/if}
</div>

<style>
  .search-wrap {
    position: relative;
    width: 100%;
    max-width: 360px;
  }
  .search-input-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: theme("colors.charcoal.900");
    border: 1px solid theme("colors.iron.700");
    border-radius: 0.5rem;
    padding: 0.4rem 0.7rem;
    color: theme("colors.silver.400");
  }
  .search-input-row:focus-within {
    border-color: theme("colors.ember.600");
  }
  input {
    flex: 1;
    background: transparent;
    color: theme("colors.silver.100");
    font-size: 0.85rem;
  }
  input::placeholder {
    color: theme("colors.silver.400");
  }
  select {
    background: theme("colors.iron.900");
    color: theme("colors.silver.300");
    font-size: 0.72rem;
    border-radius: 0.25rem;
    padding: 0.15rem 0.3rem;
  }
  .results {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    max-height: 340px;
    overflow-y: auto;
    background: theme("colors.charcoal.900");
    border: 1px solid theme("colors.iron.700");
    border-radius: 0.5rem;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
    z-index: 30;
  }
  .results a {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.55rem 0.8rem;
    font-size: 0.85rem;
  }
  .results a:hover {
    background: rgba(255, 136, 0, 0.08);
  }
  .result-title {
    color: theme("colors.silver.100");
  }
  .result-category {
    font-size: 0.7rem;
    color: theme("colors.silver.400");
    align-self: center;
  }
  .no-results {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    padding: 0.75rem;
    font-size: 0.8rem;
    color: theme("colors.silver.400");
    background: theme("colors.charcoal.900");
    border: 1px solid theme("colors.iron.700");
    border-radius: 0.5rem;
  }
</style>
