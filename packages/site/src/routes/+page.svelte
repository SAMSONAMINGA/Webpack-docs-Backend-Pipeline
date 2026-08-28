<script lang="ts">
  import { getVersionsFile } from "$lib/content";

  const versionsFile = getVersionsFile();
</script>

<svelte:head>
  <title>SHADOWFALL — Webpack Documentation</title>
</svelte:head>

<section class="hero">
  <p class="eyebrow">The Black Guard's Archive</p>
  <h1>SHADOWFALL</h1>
  <p class="tagline">
    Ancient tomes of build configuration, forged automatically from Webpack's own source,
    and kept honest by a watchful human hand.
  </p>

  <div class="cta-row">
    {#if versionsFile.latestTag}
      <a class="cta-primary" href="/docs/{versionsFile.latestTag}">Enter the Archive ({versionsFile.latestTag})</a>
    {:else}
      <span class="cta-empty">No tomes have been forged yet — run the extraction pipeline.</span>
    {/if}
    <a class="cta-secondary" href="/status">Visit the Watchtower</a>
  </div>
</section>

<section class="version-cards">
  {#each versionsFile.versions as v}
    <a class="version-card" href="/docs/{v.tag}">
      <div class="version-tag">{v.tag.toUpperCase()}</div>
      <div class="version-meta">{v.webpackVersion}</div>
      <div class="version-count">{v.totalIncluded} symbols documented</div>
      {#if !v.approved}<div class="unapproved">awaiting human approval</div>{/if}
    </a>
  {:else}
    <p class="empty-state">
      No versions have been documented yet. Run <code>pnpm extract &amp;&amp; pnpm generate &amp;&amp; pnpm sync-versions</code>
      from the repository root to forge the first tome.
    </p>
  {/each}
</section>

<style>
  .hero {
    max-width: 900px;
    margin: 0 auto;
    padding: 6rem 1.5rem 3rem;
    text-align: center;
  }
  .eyebrow {
    font-family: theme("fontFamily.medieval");
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: theme("colors.ember.500");
    margin-bottom: 0.5rem;
  }
  h1 {
    font-family: theme("fontFamily.blackletter");
    font-size: clamp(3rem, 9vw, 6rem);
    color: theme("colors.silver.100");
    text-shadow: 0 0 40px rgba(255, 136, 0, 0.25);
    margin-bottom: 1rem;
  }
  .tagline {
    font-size: 1.05rem;
    color: theme("colors.silver.300");
    max-width: 560px;
    margin: 0 auto 2rem;
    line-height: 1.7;
  }
  .cta-row {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .cta-primary,
  .cta-secondary {
    font-family: theme("fontFamily.medieval");
    padding: 0.7rem 1.4rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }
  .cta-primary {
    background: theme("colors.ember.600");
    color: white;
    box-shadow: 0 4px 20px rgba(255, 136, 0, 0.3);
  }
  .cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(255, 136, 0, 0.5);
  }
  .cta-secondary {
    border: 1px solid theme("colors.iron.700");
    color: theme("colors.silver.200");
  }
  .cta-secondary:hover {
    border-color: theme("colors.wisp.500");
    color: theme("colors.wisp.300");
  }
  .cta-empty {
    color: theme("colors.silver.400");
    font-size: 0.9rem;
  }

  .version-cards {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1rem 1.5rem 6rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
  }
  .version-card {
    background: theme("colors.charcoal.900");
    border: 1px solid theme("colors.iron.700");
    border-radius: 0.75rem;
    padding: 1.5rem;
    transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
  }
  .version-card:hover {
    border-color: theme("colors.ember.600");
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(255, 136, 0, 0.12);
  }
  .version-tag {
    font-family: theme("fontFamily.medieval");
    font-size: 1.3rem;
    color: theme("colors.silver.100");
  }
  .version-meta {
    font-family: theme("fontFamily.mono");
    font-size: 0.8rem;
    color: theme("colors.silver.400");
    margin-top: 0.25rem;
  }
  .version-count {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: theme("colors.silver.300");
  }
  .unapproved {
    margin-top: 0.5rem;
    display: inline-block;
    font-size: 0.68rem;
    padding: 0.15rem 0.5rem;
    background: theme("colors.wisp.700");
    color: theme("colors.wisp.300");
    border-radius: 999px;
  }
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    color: theme("colors.silver.400");
    font-size: 0.9rem;
  }
  .empty-state code {
    background: theme("colors.iron.900");
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
    font-family: theme("fontFamily.mono");
  }
</style>
