<script lang="ts">
  export let versions: Array<{ tag: string; webpackVersion: string; approved: boolean }> = [];
  export let current: string;
  export let onChange: (tag: string) => void = () => {};

  let open = false;
</script>

<div class="switcher">
  <button class="trigger" on:click={() => (open = !open)} aria-haspopup="listbox" aria-expanded={open}>
    <span>{current.toUpperCase()}</span>
    <svg width="12" height="12" viewBox="0 0 12 12" class:rotated={open}><path d="M2 4 L6 8 L10 4" stroke="currentColor" stroke-width="1.6" fill="none" /></svg>
  </button>

  {#if open}
    <ul class="menu" role="listbox">
      {#each versions as v}
        <li>
          <button
            class:active={v.tag === current}
            role="option"
            aria-selected={v.tag === current}
            on:click={() => {
              onChange(v.tag);
              open = false;
            }}
          >
            {v.tag.toUpperCase()}
            <span class="wp-version">{v.webpackVersion}</span>
            {#if !v.approved}<span class="unapproved-badge" title="Not yet human-approved">preview</span>{/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .switcher {
    position: relative;
    font-family: theme("fontFamily.medieval");
    font-size: 0.85rem;
  }
  .trigger {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.7rem;
    background: theme("colors.iron.900");
    border: 1px solid theme("colors.iron.700");
    border-radius: 0.375rem;
    color: theme("colors.silver.200");
  }
  .trigger:hover {
    border-color: theme("colors.ember.600");
  }
  svg.rotated {
    transform: rotate(180deg);
  }
  .menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 200px;
    background: theme("colors.charcoal.900");
    border: 1px solid theme("colors.iron.700");
    border-radius: 0.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    overflow: hidden;
    z-index: 20;
  }
  .menu button {
    width: 100%;
    text-align: left;
    padding: 0.6rem 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: theme("colors.silver.200");
  }
  .menu button:hover,
  .menu button.active {
    background: rgba(255, 136, 0, 0.1);
    color: theme("colors.ember.400");
  }
  .wp-version {
    margin-left: auto;
    font-family: theme("fontFamily.mono");
    font-size: 0.7rem;
    color: theme("colors.silver.400");
  }
  .unapproved-badge {
    font-size: 0.6rem;
    padding: 0.1rem 0.35rem;
    background: theme("colors.wisp.700");
    color: theme("colors.wisp.300");
    border-radius: 999px;
  }
</style>
