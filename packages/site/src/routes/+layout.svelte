<script lang="ts">
  import "../lib/styles/app.css";
  import { afterNavigate } from "$app/navigation";
  import KnightBackground from "$lib/components/KnightBackground.svelte";
  import Header from "$lib/components/Header.svelte";
  import SidebarMenu from "$lib/components/SidebarMenu.svelte";
  import AvatarCompanion from "$lib/components/AvatarCompanion.svelte";
  import { triggerPageTransition } from "$lib/stores/knight";

  afterNavigate(() => {
    triggerPageTransition();
  });
</script>

<KnightBackground />
<Header />
<SidebarMenu />

<main class="relative z-10 min-h-[calc(100vh-4rem)]">
  <slot />
</main>

<AvatarCompanion />
