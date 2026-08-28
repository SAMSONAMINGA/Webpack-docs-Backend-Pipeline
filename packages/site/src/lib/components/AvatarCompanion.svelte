<script lang="ts">
  import { cursor } from "$lib/stores/ui";
  import { auth } from "$lib/stores/auth";
  import { onMount } from "svelte";

  let el: HTMLDivElement;
  let center = { x: 0, y: 0 };
  let bodyTilt = 0;
  let eyeOffset = { x: 0, y: 0 };

  function updateCenter() {
    if (!el) return;
    const r = el.getBoundingClientRect();
    center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  onMount(() => {
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  });

  $: {
    const dx = $cursor.x - center.x;
    const dy = $cursor.y - center.y;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(Math.hypot(dx, dy), 400);
    eyeOffset = { x: Math.cos(angle) * 3, y: Math.sin(angle) * 2.4 };
    bodyTilt = (dx / 400) * 6 * (dist / 400);
  }

  $: outfitColor = $auth.isLoggedIn ? "#e8c34a" : "#9ea3ab";
  $: outfitShade = $auth.isLoggedIn ? "#b8912a" : "#63666f";
</script>

<div class="avatar-dock" bind:this={el} aria-hidden="true">
  <svg viewBox="0 0 140 140" width="88" height="88" style="transform: rotate({bodyTilt}deg)">
    <!-- bean body -->
    <ellipse cx="70" cy="88" rx="46" ry="40" fill={outfitColor} stroke={outfitShade} stroke-width="2" />
    <!-- tiny cape -->
    <path d="M30 70 Q10 90 22 118 L40 108 Z" fill="#1b1b20" opacity="0.85" />
    <!-- tiny helmet -->
    <path
      d="M40 58 C40 40 52 28 70 28 C88 28 100 40 100 58 L100 66 L40 66 Z"
      fill="#26262d"
      stroke="#4c4f59"
      stroke-width="1.5"
    />
    <rect x="46" y="62" width="48" height="10" rx="3" fill="#0a0a0c" />
    <!-- crest -->
    <path d="M70 16 L75 28 L65 28 Z" fill="#ff8800" />

    <!-- big expressive eyes, tracking cursor -->
    <g>
      <ellipse cx="56" cy="86" rx="12" ry="14" fill="white" />
      <ellipse cx="84" cy="86" rx="12" ry="14" fill="white" />
      <circle cx={56 + eyeOffset.x} cy={86 + eyeOffset.y} r="6" fill="#121215" />
      <circle cx={84 + eyeOffset.x} cy={86 + eyeOffset.y} r="6" fill="#121215" />
    </g>

    <!-- tiny sword -->
    <rect x="112" y="80" width="5" height="46" rx="1.5" fill="#b8bcc4" transform="rotate(18 112 80)" />
  </svg>
</div>

<style>
  .avatar-dock {
    position: fixed;
    right: 1.25rem;
    bottom: 1.25rem;
    z-index: 30;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.55));
    transition: filter 200ms ease;
  }
  .avatar-dock svg {
    transition: transform 120ms ease-out;
  }
  @media (max-width: 640px) {
    .avatar-dock {
      right: 0.75rem;
      bottom: 0.75rem;
      transform: scale(0.8);
    }
  }
</style>
