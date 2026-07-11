import { create } from "zustand";

type FiltersStore = {
  active: string[];
  price: string | null;
  barrio: string | null;       // id del barrio, ej: "ciudad-vieja"
  toggle: (filter: string) => void;
  setPrice: (price: string | null) => void;
  setBarrio: (barrio: string | null) => void;
  setFilters: (active: string[], price: string | null, barrio: string | null) => void;
  clear: () => void;
  hasFilters: () => boolean;
  count: () => number;
};

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  active: [],
  price: null,
  barrio: null,
  toggle: (filter) => {
    const current = get().active;
    set({
      active: current.includes(filter)
        ? current.filter(f => f !== filter)
        : [...current, filter],
    });
  },
  setPrice:  (price)  => set({ price }),
  setBarrio: (barrio) => set({ barrio }),
  setFilters: (active, price, barrio) => set({ active, price, barrio }),
  clear: () => set({ active: [], price: null, barrio: null }),
  hasFilters: () => get().active.length > 0 || !!get().price,
  count: () => get().active.length + (get().price ? 1 : 0),
}));
