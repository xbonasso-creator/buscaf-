import { create } from "zustand";
import { supabase } from "../lib/supabase";

const getAuthUser = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("./authStore").useAuthStore.getState().user;
  } catch { return null; }
};

type CafeRef = {
  id: string;
  name: string;
  direccion?: string;
  rating?: number;
  image?: string;
};

type QuieroIrStore = {
  items: CafeRef[];
  loading: boolean;
  load: (userId: string) => Promise<void>;
  toggle: (cafe: CafeRef) => Promise<void>;
  isGuardado: (id: string) => boolean;
  clear: () => void;
};

export const useQuieroIrStore = create<QuieroIrStore>((set, get) => ({
  items: [],
  loading: false,

  load: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("quiero_ir")
      .select("cafe_id, cafes(id, name, direccion, rating, image)")
      .eq("user_id", userId);

    if (!error && data) {
      const items: CafeRef[] = data
        .filter(row => row.cafes)
        .map(row => {
          const c = row.cafes as any;
          return { id: c.id, name: c.name, direccion: c.direccion, rating: c.rating, image: c.image };
        });
      set({ items });
    }
    set({ loading: false });
  },

  toggle: async (cafe) => {
    const userId = getAuthUser()?.id;
    const exists = get().isGuardado(cafe.id);

    // Optimistic update — UI responde instantáneo
    set({
      items: exists
        ? get().items.filter(i => i.id !== cafe.id)
        : [...get().items, cafe],
    });

    if (!userId) return; // sin sesión: solo local

    try {
      if (exists) {
        await supabase
          .from("quiero_ir")
          .delete()
          .eq("user_id", userId)
          .eq("cafe_id", cafe.id);
      } else {
        await supabase
          .from("quiero_ir")
          .insert({ user_id: userId, cafe_id: cafe.id });
      }
    } catch {
      // Error silencioso — el estado local ya refleja la acción del usuario
    }
  },

  isGuardado: (id) => !!get().items.find(i => i.id === id),
  clear: () => set({ items: [] }),
}));
