<script lang="ts">
  import { sidebarOpen } from "$lib/stores/ui";
  import { fly } from "svelte/transition";
  import { getVersionsFile } from "$lib/content";

  const versionsFile = getVersionsFile();

  $: links = [
    { href: "/", label: "The Hall" },
    ...versionsFile.versions.map((v) => ({ href: `/docs/${v.tag}`, label: `Tome of ${v.tag.toUpperCase()}` })),
    { href: "/status", label: "Watchtower (Status)" },
  ];
</script>

{#if $sidebarOpen}
  <div
    class="scrim"
    role="button"
    tabindex="0"
    aria-label="Close navigation"
    on:click={() => sidebarOpen.set(false)}
    on:keydown={(e) => e.key === "Escape" && sidebarOpen.set(false)}
    transition:fly={{ opacity: 0, duration: 200 }}
  ></div>

  <nav class="sidebar" aria-label="Primary navigation">
    <ul>
      {#each links as link, i}
        <li in:fly={{ x: -30, duration: 260, delay: i * 60 }}>
          <a href={link.href} on:click={() => sidebarOpen.set(false)}>{link.label}</a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 45;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    width: min(320px, 82vw);
    background: linear-gradient(180deg, #1b1b20 0%, #121215 100%);
    border-right: 1px solid theme("colors.iron.800");
    box-shadow: 8px 0 30px rgba(0, 0, 0, 0.6);
    padding: 6rem 1.25rem 2rem;
  }
  .sidebar ul {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .sidebar a {
    display: block;
    font-family: theme("fontFamily.medieval");
    font-size: 1.1rem;
    letter-spacing: 0.03em;
    color: theme("colors.silver.200");
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    border-left: 2px solid transparent;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
  }
  .sidebar a:hover,
  .sidebar a:focus-visible {
    background: rgba(255, 136, 0, 0.08);
    border-left-color: theme("colors.ember.500");
    color: theme("colors.ember.400");
    outline: none;
  }
</style>
