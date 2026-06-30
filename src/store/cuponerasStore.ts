import { create } from "zustand";
import { supabase } from "../lib/supabase";
const getAuthUser = () => {
  try { return require("./authStore").useAuthStore.getState().user; }
  catch { return null; }
};

type Cuponera = {
  id: string;       // cafe_id
  cafeName: string;
  sellos: number;
  total: number;
};

type CuponerasStore = {
  cuponeras: Cuponera[];
  loading: boolean;

  load: (userId: string) => Promise<void>;
  addCuponera: (cafeId: string, cafeName: string) => Promise<void>;
  addSello: (cafeId: string) => Promise<void>;
  clear: () => void;
};

export const useCuponerasStore = create<CuponerasStore>((set, get) => ({
  cuponeras: [],
  loading: false,

  load: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("cuponeras")
      .select("cafe_id, sellos, max_sellos, cafes(name)")
      .eq("user_id", userId);

    if (!error && data) {
      const cuponeras: Cuponera[] = data.map(row => ({
        id: row.cafe_id,
        cafeName: (row.cafes as any)?.name ?? row.cafe_id,
        sellos: row.sellos,
        total: row.max_sellos,
      }));
      set({ cuponeras });
    }
    set({ loading: false });
  },

  addCuponera: async (cafeId, cafeName) => {
    if (get().cuponeras.find(c => c.id === cafeId)) return;
    const userId = getAuthUser()?.id;

    set({ cuponeras: [...get().cuponeras, { id: cafeId, cafeName, sellos: 0, total: 10 }] });

    if (!userId) return;
    await supabase.from("cuponeras").upsert({
      user_id: userId, cafe_id: cafeId, sellos: 0, max_sellos: 10,
    }, { onConflict: "user_id,cafe_id" });
  },

  addSello: async (cafeId) => {
    const current = get().cuponeras.find(c => c.id === cafeId);
    if (!current || current.sellos >= current.total) return;
    const userId = getAuthUser()?.id;

    const newSellos = current.sellos + 1;
    set({ cuponeras: get().cuponeras.map(c => c.id === cafeId ? { ...c, sellos: newSellos } : c) });

    if (!userId) return;
    await supabase
      .from("cuponeras")
      .update({ sellos: newSellos, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("cafe_id", cafeId);
  },

  clear: () => set({ cuponeras: [] }),
}));
