<script lang="ts">
  export let crumbs: Array<{ label: string; href?: string }> = [];
</script>

<nav aria-label="Breadcrumb" class="breadcrumbs">
  {#each crumbs as crumb, i}
    {#if crumb.href && i < crumbs.length - 1}
      <a href={crumb.href}>{crumb.label}</a>
    {:else if i === crumbs.length - 1}
      <span class="current" aria-current="page">{crumb.label}</span>
    {:else}
      <span>{crumb.label}</span>
    {/if}
    {#if i < crumbs.length - 1}<span class="sep">›</span>{/if}
  {/each}
</nav>

<style>
  .breadcrumbs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem;
    font-family: theme("fontFamily.medieval");
    font-size: 0.8rem;
    color: theme("colors.silver.400");
    margin-bottom: 1rem;
  }
  .breadcrumbs a {
    color: theme("colors.silver.300");
  }
  .breadcrumbs a:hover {
    color: theme("colors.ember.400");
  }
  .current {
    color: theme("colors.ember.400");
  }
  .sep {
    opacity: 0.5;
  }
</style>
