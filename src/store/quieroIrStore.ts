import { create } from "zustand";

type Cafe = {
  id: string;
  name: string;
  address?: string;
  rating?: number;
  image?: string;
};

type QuieroIrStore = {
  items: Cafe[];
  toggle: (cafe: Cafe) => void;
  isGuardado: (id: string) => boolean;
};

export const useQuieroIrStore = create<QuieroIrStore>((set, get) => ({
  items: [],
  toggle: (cafe) => {
    const exists = get().items.some((c) => c.id === cafe.id);
    set({
      items: exists
        ? get().items.filter((c) => c.id !== cafe.id)
        : [...get().items, cafe],
    });
  },
  isGuardado: (id) => get().items.some((c) => c.id === id),
}));
