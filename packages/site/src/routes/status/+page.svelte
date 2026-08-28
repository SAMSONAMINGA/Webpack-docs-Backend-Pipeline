<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;

  function healthFor(webpackVersion: string) {
    return data.health.find((h) => h.webpackVersion === webpackVersion);
  }

  const statusMeta: Record<string, { emoji: string; label: string; color: string }> = {
    healthy: { emoji: "✅", label: "Healthy", color: "#00cc66" },
    warning: { emoji: "⚠️", label: "Warning", color: "#ff8800" },
    alert: { emoji: "🚨", label: "Alert", color: "#ff3333" },
  };
</script>

<svelte:head>
  <title>The Watchtower · SHADOWFALL</title>
</svelte:head>

<section class="watchtower">
  <h1>The Watchtower</h1>
  <p class="subtitle">A clear view of what the archive-keepers are doing, and whether anything needs a human's eye.</p>

  <div class="version-table">
    {#each data.versionsFile.versions as v}
      {@const h = healthFor(v.webpackVersion)}
      {@const meta = statusMeta[h?.status ?? "healthy"]}
      <div class="row">
        <div class="row-main">
          <span class="tag">{v.tag.toUpperCase()}</span>
          <span class="wp">{v.webpackVersion}</span>
          <span class="status" style="--c:{meta.color}">{meta.emoji} {meta.label}</span>
        </div>
        <div class="row-detail">
          <span>{v.totalIncluded} symbols documented</span>
          {#if h?.driftPercent !== null && h?.driftPercent !== undefined}
            <span>· drift {(h.driftPercent * 100).toFixed(1)}%</span>
          {/if}
          {#if h && h.unknownConstructCount > 0}
            <span>· {h.unknownConstructCount} unrecognized construct(s)</span>
          {/if}
          <span>· {v.approved ? "approved" : "awaiting approval"}</span>
        </div>
        {#if h && h.reasons.length > 0}
          <ul class="reasons">
            {#each h.reasons as r}<li>{r}</li>{/each}
          </ul>
        {/if}
      </div>
    {:else}
      <p class="empty">No runs recorded yet.</p>
    {/each}
  </div>

  <p class="footnote">Last synced: {new Date(data.versionsFile.generatedAt).toLocaleString()}</p>
</section>

<style>
  .watchtower {
    max-width: 900px;
    margin: 0 auto;
    padding: 4rem 1.5rem 5rem;
  }
  h1 {
    font-family: theme("fontFamily.blackletter");
    font-size: 2.6rem;
    color: theme("colors.silver.100");
  }
  .subtitle {
    color: theme("colors.silver.300");
    margin: 0.5rem 0 2rem;
  }
  .version-table {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .row {
    background: theme("colors.charcoal.900");
    border: 1px solid theme("colors.iron.700");
    border-radius: 0.6rem;
    padding: 1rem 1.25rem;
  }
  .row-main {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: theme("fontFamily.medieval");
  }
  .tag {
    font-size: 1.1rem;
    color: theme("colors.silver.100");
  }
  .wp {
    font-family: theme("fontFamily.mono");
    font-size: 0.8rem;
    color: theme("colors.silver.400");
  }
  .status {
    margin-left: auto;
    color: var(--c);
    font-size: 0.85rem;
  }
  .row-detail {
    margin-top: 0.4rem;
    font-size: 0.8rem;
    color: theme("colors.silver.400");
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .reasons {
    margin-top: 0.6rem;
    padding-left: 1.1rem;
    font-size: 0.8rem;
    color: theme("colors.silver.300");
  }
  .empty {
    color: theme("colors.silver.400");
  }
  .footnote {
    margin-top: 2rem;
    font-size: 0.75rem;
    color: theme("colors.silver.400");
  }
</style>
