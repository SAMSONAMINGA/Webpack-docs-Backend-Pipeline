<script lang="ts">
  import KnightHelmetIcon from "./KnightHelmetIcon.svelte";
  import AuthButtons from "./AuthButtons.svelte";
  import { headerGlow, isTransitioning } from "$lib/stores/knight";
  import { sidebarOpen } from "$lib/stores/ui";

  const wisps = Array.from({ length: 6 }, (_, i) => i);
</script>

<header class="site-header" class:glow-ember={$headerGlow === "ember"} class:glow-wisp={$headerGlow === "wisp"}>
  <div class="header-inner">
    <div class="header-left">
      <button
        class="hamburger"
        class:open={$sidebarOpen}
        aria-label={$sidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={$sidebarOpen}
        on:click={() => sidebarOpen.update((v) => !v)}
      >
        <span></span><span></span><span></span>
      </button>

      <div class="brand">
        <div class="helmet-wrap">
          <KnightHelmetIcon size={42} glow={$headerGlow} />
          {#if $isTransitioning}
            <div class="wisp-burst" aria-hidden="true">
              {#each wisps as w}
                <span class="wisp-particle" style="left:{10 + w * 12}px; animation-delay:{w * 0.09}s;"></span>
              {/each}
            </div>
          {/if}
        </div>
        <a href="/" class="title">SHADOWFALL</a>
      </div>
    </div>

    <AuthButtons />
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 40;
    backdrop-filter: blur(6px);
    background: rgba(10, 10, 12, 0.72);
    border-bottom: 1px solid theme("colors.iron.800");
    transition: box-shadow 500ms ease, border-color 500ms ease;
  }
  .site-header.glow-ember {
    box-shadow: 0 2px 26px 0 rgba(255, 136, 0, 0.28);
    border-bottom-color: theme("colors.ember.600");
  }
  .site-header.glow-wisp {
    box-shadow: 0 2px 26px 0 rgba(95, 179, 224, 0.28);
    border-bottom-color: theme("colors.wisp.500");
  }
  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .helmet-wrap {
    position: relative;
    display: inline-flex;
  }
  .title {
    font-family: theme("fontFamily.blackletter");
    font-size: 1.6rem;
    letter-spacing: 0.06em;
    color: theme("colors.silver.100");
    text-shadow: 0 0 12px rgba(255, 136, 0, 0.25);
  }

  /* Hamburger: folds inward like an accordion when closed, stretches when open */
  .hamburger {
    width: 34px;
    height: 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px 3px;
    transition: width 320ms cubic-bezier(0.65, 0, 0.35, 1);
  }
  .hamburger span {
    display: block;
    height: 2px;
    background: theme("colors.silver.200");
    border-radius: 2px;
    transform-origin: center;
    transition: transform 320ms cubic-bezier(0.65, 0, 0.35, 1), width 320ms ease, opacity 200ms ease;
  }
  .hamburger:not(.open) {
    width: 22px; /* accordion compress */
  }
  .hamburger.open {
    width: 34px;
  }
  .hamburger.open span:nth-child(1) {
    transform: translateY(11px) rotate(45deg);
  }
  .hamburger.open span:nth-child(2) {
    opacity: 0;
  }
  .hamburger.open span:nth-child(3) {
    transform: translateY(-11px) rotate(-45deg);
  }

  /* Spectral wisps drifting up out of the helmet on page transitions */
  .wisp-burst {
    position: absolute;
    bottom: 60%;
    left: 0;
    width: 100%;
    height: 0;
    pointer-events: none;
  }
  .wisp-particle {
    position: absolute;
    bottom: 0;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168, 219, 245, 0.9) 0%, rgba(95, 179, 224, 0.4) 60%, transparent 100%);
    animation: wispDrift 1.4s ease-out forwards;
  }
  @keyframes wispDrift {
    0% {
      transform: translateY(0) scale(0.6);
      opacity: 0;
    }
    25% {
      opacity: 0.9;
    }
    100% {
      transform: translateY(-46px) scale(1.6);
      opacity: 0;
    }
  }
</style>
