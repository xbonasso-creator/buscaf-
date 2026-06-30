import { create } from "zustand";

type FiltersStore = {
  active: string[];
  price: string | null;
  toggle: (filter: string) => void;
  setPrice: (price: string | null) => void;
  setFilters: (active: string[], price: string | null) => void; // commit atómico desde draft
  clear: () => void;
  hasFilters: () => boolean;
  count: () => number;
};

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  active: [],
  price: null,
  toggle: (filter) => {
    const current = get().active;
    set({
      active: current.includes(filter)
        ? current.filter(f => f !== filter)
        : [...current, filter],
    });
  },
  setPrice: (price) => set({ price }),
  setFilters: (active, price) => set({ active, price }),
  clear: () => set({ active: [], price: null }),
  hasFilters: () => get().active.length > 0 || !!get().price,
  count: () => get().active.length + (get().price ? 1 : 0),
}));
