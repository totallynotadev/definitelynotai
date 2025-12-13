import { create } from 'zustand';

// @agent:inject:store-types

interface AppState {
  // @agent:inject:store-state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // @agent:inject:store-initial
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
