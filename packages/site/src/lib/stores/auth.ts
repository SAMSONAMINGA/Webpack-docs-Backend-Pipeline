import { writable } from "svelte/store";

export type AuthState = {
  isLoggedIn: boolean;
  username: string | null;
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({ isLoggedIn: false, username: null });

  return {
    subscribe,
    login: (username: string) => set({ isLoggedIn: true, username }),
    signup: (username: string) => set({ isLoggedIn: true, username }),
    logout: () => set({ isLoggedIn: false, username: null }),
    update,
  };
}

export const auth = createAuthStore();
