import { writable } from "svelte/store";

export const sidebarOpen = writable(false);

export const cursor = writable({ x: 0, y: 0 });

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => cursor.set({ x: e.clientX, y: e.clientY }),
    { passive: true },
  );
}
