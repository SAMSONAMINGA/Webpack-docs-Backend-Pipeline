<script lang="ts">
  export let size = 40;
  export let glow: "ember" | "wisp" = "ember";
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 100 100"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="knight-helmet"
  class:glow-ember={glow === "ember"}
  class:glow-wisp={glow === "wisp"}
  role="img"
  aria-label="Black Knight helmet"
>
  <!-- crest -->
  <path d="M50 4 L56 20 L50 16 L44 20 Z" fill="currentColor" class="text-ember-500" />
  <path d="M50 8 C46 14 46 20 50 24 C54 20 54 14 50 8 Z" fill="currentColor" class="text-iron-800" />

  <!-- dome -->
  <path
    d="M22 46 C22 24 34 12 50 12 C66 12 78 24 78 46 L78 54 L22 54 Z"
    fill="#1b1b20"
    stroke="#63666f"
    stroke-width="1.5"
  />

  <!-- side ridges -->
  <path d="M30 20 C26 28 24 38 24 50" stroke="#4c4f59" stroke-width="1.2" fill="none" />
  <path d="M70 20 C74 28 76 38 76 50" stroke="#4c4f59" stroke-width="1.2" fill="none" />

  <!-- face guard / lower jaw -->
  <path
    d="M22 54 L20 68 C20 80 32 90 50 90 C68 90 80 80 80 68 L78 54 Z"
    fill="#26262d"
    stroke="#63666f"
    stroke-width="1.5"
  />

  <!-- visor (down) -->
  <rect x="26" y="52" width="48" height="14" rx="3" fill="#0a0a0c" stroke="#3a3d45" stroke-width="1" />
  <line x1="30" y1="59" x2="70" y2="59" stroke="#3a3d45" stroke-width="1" />
  <!-- eye slits -->
  <rect x="32" y="55" width="14" height="4" rx="1.5" class="visor-slit" />
  <rect x="54" y="55" width="14" height="4" rx="1.5" class="visor-slit" />

  <!-- breathing grille -->
  <g stroke="#3a3d45" stroke-width="1">
    <line x1="34" y1="74" x2="34" y2="84" />
    <line x1="42" y1="72" x2="42" y2="86" />
    <line x1="50" y1="71" x2="50" y2="87" />
    <line x1="58" y1="72" x2="58" y2="86" />
    <line x1="66" y1="74" x2="66" y2="84" />
  </g>
</svg>

<style>
  .visor-slit {
    fill: rgba(255, 136, 0, 0.55);
  }
  .glow-wisp .visor-slit {
    fill: rgba(95, 179, 224, 0.65);
  }
  .knight-helmet.glow-ember {
    filter: drop-shadow(0 0 6px rgba(255, 136, 0, 0.5));
  }
  .knight-helmet.glow-wisp {
    filter: drop-shadow(0 0 6px rgba(95, 179, 224, 0.55));
  }
</style>
