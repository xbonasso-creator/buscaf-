import { create } from "zustand";
import { supabase } from "../lib/supabase";
// Importación lazy para evitar circular dependency
const getAuthUser = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("./authStore").useAuthStore.getState().user;
  } catch { return null; }
};

type CafeRef = {
  id: string;
  name: string;
  address?: string;
  direccion?: string;
  rating: number;
  image: string;
};

type FavoritesStore = {
  favorites: CafeRef[];
  loading: boolean;

  // Carga los favoritos del usuario desde Supabase
  load: (userId: string) => Promise<void>;

  // Alterna favorito: actualiza local + Supabase
  toggle: (cafe: CafeRef) => Promise<void>;

  isFavorite: (id: string) => boolean;

  // Limpia al cerrar sesión
  clear: () => void;
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  loading: false,

  load: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("favorites")
      .select("cafe_id, cafes(id, name, direccion, rating, image)")
      .eq("user_id", userId);

    if (!error && data) {
      const favorites: CafeRef[] = data
        .filter(row => row.cafes)
        .map(row => {
          const c = row.cafes as any;
          return { id: c.id, name: c.name, direccion: c.direccion, rating: c.rating, image: c.image };
        });
      set({ favorites });
    }
    set({ loading: false });
  },

  toggle: async (cafe) => {
    const userId = getAuthUser()?.id;
    const exists = get().isFavorite(cafe.id);

    // Optimistic update — la UI responde instantáneo
    set({
      favorites: exists
        ? get().favorites.filter(f => f.id !== cafe.id)
        : [...get().favorites, cafe],
    });

    if (!userId) return; // sin sesión: solo local

    try {
      if (exists) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("cafe_id", cafe.id);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: userId, cafe_id: cafe.id });
      }
    } catch {
      // Error silencioso — el estado local ya refleja la acción del usuario
    }
  },

  isFavorite: (id) => !!get().favorites.find(f => f.id === id),

  clear: () => set({ favorites: [] }),
}));
