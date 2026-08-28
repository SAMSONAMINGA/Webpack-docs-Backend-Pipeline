<script lang="ts">
  import { knightPose } from "$lib/stores/knight";

  // Off-center placement, alternating sides per pose for visual rhythm.
  const sideByPose: Record<string, "left" | "right"> = {
    standing: "right",
    kneeling: "left",
    strike: "right",
    shield: "left",
  };

  $: side = sideByPose[$knightPose] ?? "right";

  const embers = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 53) % 100}%`,
    delay: `${(i * 0.37) % 4.5}s`,
    duration: `${3.5 + (i % 5) * 0.6}s`,
    size: 2 + (i % 4),
  }));
</script>

<div class="knight-bg" aria-hidden="true">
  <!-- ambient vignette -->
  <div class="vignette"></div>

  <!-- knight silhouette, pose-swapped -->
  <div class="knight-figure" class:side-left={side === "left"} class:side-right={side === "right"}>
    {#if $knightPose === "standing"}
      <svg viewBox="0 0 220 420" class="knight-svg">
        <ellipse cx="110" cy="405" rx="70" ry="10" class="ground-shadow" />
        <path d="M110 40 C90 40 80 60 80 80 L80 120 C60 130 50 160 50 200 L50 340 L70 400 L150 400 L170 340 L170 200 C170 160 160 130 140 120 L140 80 C140 60 130 40 110 40 Z" class="armor" />
        <circle cx="110" cy="55" r="30" class="helmet" />
        <path d="M60 160 L20 260 L35 270 L80 190 Z" class="cape" />
        <rect x="105" y="100" width="8" height="260" class="sword-blade" />
        <rect x="90" y="350" width="38" height="10" class="sword-guard" />
      </svg>
    {:else if $knightPose === "kneeling"}
      <svg viewBox="0 0 220 420" class="knight-svg">
        <ellipse cx="110" cy="405" rx="75" ry="10" class="ground-shadow" />
        <path d="M110 70 C92 70 82 88 82 106 L82 150 C64 170 55 210 60 260 L50 340 L170 340 L165 260 C168 210 158 170 140 150 L140 106 C140 88 128 70 110 70 Z" class="armor" />
        <circle cx="110" cy="85" r="28" class="helmet bowed" />
        <path d="M65 190 L30 280 L45 288 L90 210 Z" class="cape" />
        <rect x="106" y="120" width="7" height="220" class="sword-blade vertical" />
      </svg>
    {:else if $knightPose === "strike"}
      <svg viewBox="0 0 220 420" class="knight-svg">
        <ellipse cx="110" cy="405" rx="70" ry="10" class="ground-shadow" />
        <path d="M110 40 C90 40 80 60 80 80 L80 120 C58 132 48 165 50 200 L55 340 L165 340 L170 200 C172 165 162 132 140 120 L140 80 C140 60 130 40 110 40 Z" class="armor" />
        <circle cx="110" cy="55" r="30" class="helmet" />
        <path d="M55 155 L10 220 L25 232 L75 180 Z" class="cape" />
        <!-- sword raised overhead -->
        <g transform="rotate(-35 150 90)">
          <rect x="146" y="-10" width="9" height="200" class="sword-blade" />
          <rect x="130" y="180" width="40" height="10" class="sword-guard" />
        </g>
      </svg>
    {:else}
      <svg viewBox="0 0 220 420" class="knight-svg">
        <ellipse cx="110" cy="405" rx="70" ry="10" class="ground-shadow" />
        <path d="M110 40 C90 40 80 60 80 80 L80 120 C60 130 50 160 50 200 L50 340 L70 400 L150 400 L170 340 L170 200 C170 160 160 130 140 120 L140 80 C140 60 130 40 110 40 Z" class="armor" />
        <circle cx="110" cy="55" r="30" class="helmet" />
        <path d="M150 160 L200 190 L200 280 L150 300 C140 260 140 200 150 160 Z" class="shield" />
      </svg>
    {/if}
  </div>

  <!-- floating embers -->
  <div class="ember-layer">
    {#each embers as e}
      <span
        class="ember-particle"
        style="left:{e.left}; animation-delay:{e.delay}; animation-duration:{e.duration}; width:{e.size}px; height:{e.size}px;"
      ></span>
    {/each}
  </div>

  <!-- mist / fog at the bottom -->
  <div class="fog-layer">
    <div class="fog fog-a"></div>
    <div class="fog fog-b"></div>
  </div>
</div>

<style>
  .knight-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    background: radial-gradient(ellipse at 50% 0%, #1b1b20 0%, #0a0a0c 70%);
  }
  .vignette {
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 220px 60px rgba(0, 0, 0, 0.85);
  }
  .knight-figure {
    position: absolute;
    top: 8%;
    height: 84%;
    width: min(38vw, 420px);
    opacity: 0.5;
    filter: drop-shadow(0 0 40px rgba(0, 0, 0, 0.8));
    transition: left 1.2s cubic-bezier(0.65, 0, 0.35, 1), right 1.2s cubic-bezier(0.65, 0, 0.35, 1);
  }
  .side-right {
    right: -2%;
  }
  .side-left {
    left: -2%;
  }
  .knight-svg {
    width: 100%;
    height: 100%;
  }
  .armor {
    fill: #26262d;
    stroke: #4c4f59;
    stroke-width: 1.5;
  }
  .helmet {
    fill: #1b1b20;
    stroke: #63666f;
    stroke-width: 1.5;
  }
  .helmet.bowed {
    transform: translateY(14px);
  }
  .cape {
    fill: #0a0a0c;
    opacity: 0.85;
  }
  .sword-blade {
    fill: #9ea3ab;
  }
  .sword-guard {
    fill: #63666f;
  }
  .shield {
    fill: #3a3d45;
    stroke: #63666f;
    stroke-width: 1.5;
  }
  .ground-shadow {
    fill: rgba(0, 0, 0, 0.5);
  }

  .ember-layer,
  .fog-layer {
    position: absolute;
    inset: 0;
  }
  .ember-particle {
    position: absolute;
    bottom: 4%;
    border-radius: 50%;
    background: radial-gradient(circle, #ffab4d 0%, #ff8800 60%, transparent 100%);
    animation-name: emberFloat;
    animation-timing-function: ease-in;
    animation-iteration-count: infinite;
  }
  @keyframes emberFloat {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    12% {
      opacity: 0.9;
    }
    100% {
      transform: translateY(-70vh) translateX(20px);
      opacity: 0;
    }
  }

  .fog-layer {
    top: auto;
    bottom: 0;
    height: 22vh;
  }
  .fog {
    position: absolute;
    bottom: -10%;
    width: 140%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(180, 180, 190, 0.08) 0%, transparent 70%);
    animation: fogDrift 20s ease-in-out infinite;
  }
  .fog-a {
    left: -20%;
  }
  .fog-b {
    left: -40%;
    animation-duration: 26s;
    animation-delay: -6s;
    opacity: 0.6;
  }
  @keyframes fogDrift {
    0% {
      transform: translateX(-4%);
    }
    50% {
      transform: translateX(4%);
    }
    100% {
      transform: translateX(-4%);
    }
  }

  @media (max-width: 768px) {
    .knight-figure {
      opacity: 0.3;
      width: 60vw;
    }
  }
</style>
