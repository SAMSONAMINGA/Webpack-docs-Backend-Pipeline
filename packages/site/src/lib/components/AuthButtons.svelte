<script lang="ts">
  import { auth } from "$lib/stores/auth";
</script>

<div class="flex items-center gap-2">
  {#if $auth.isLoggedIn}
    <span class="hidden sm:inline text-sm text-silver-300 font-medieval mr-1">
      Sir {$auth.username}
    </span>
    <button class="auth-btn" style="--btn-color:#ff3333" on:click={() => auth.logout()}>
      Logout
    </button>
  {:else}
    <button class="auth-btn" style="--btn-color:#00cc66" on:click={() => auth.login("Wanderer")}>
      Login
    </button>
    <button class="auth-btn" style="--btn-color:#ff8800" on:click={() => auth.signup("Wanderer")}>
      Sign Up
    </button>
  {/if}
</div>

<style>
  .auth-btn {
    background: var(--btn-color);
    color: white;
    font-family: theme("fontFamily.medieval");
    font-weight: 600;
    letter-spacing: 0.03em;
    padding: 0.45rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.85rem;
    transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  }
  .auth-btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow: 0 0 16px 2px color-mix(in srgb, var(--btn-color) 65%, transparent), 0 4px 10px rgba(0, 0, 0, 0.5);
  }
  .auth-btn:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }
  .auth-btn:active {
    transform: translateY(0);
  }
</style>
