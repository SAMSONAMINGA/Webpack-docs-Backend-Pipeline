import { writable, derived } from "svelte/store";

export const KNIGHT_POSES = ["standing", "kneeling", "strike", "shield"] as const;
export type KnightPose = (typeof KNIGHT_POSES)[number];

export const GLOW_COLORS = ["ember", "wisp"] as const;
export type GlowColor = (typeof GLOW_COLORS)[number];

/** Increments on every page navigation; the background/header react to it. */
export const pageIndex = writable(0);

export const knightPose = derived(pageIndex, ($i) => KNIGHT_POSES[$i % KNIGHT_POSES.length]);
export const headerGlow = derived(pageIndex, ($i) => GLOW_COLORS[$i % GLOW_COLORS.length]);

/** True for ~1.6s after a navigation — drives the spectral-wisp burst + glow pulse. */
export const isTransitioning = writable(false);

let transitionTimer: ReturnType<typeof setTimeout> | undefined;

export function triggerPageTransition() {
  pageIndex.update((n) => n + 1);
  isTransitioning.set(true);
  clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => isTransitioning.set(false), 1600);
}
