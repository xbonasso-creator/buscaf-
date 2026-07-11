/**
 * cafesStore — fuente única de cafeterías en runtime.
 *
 * Arranca con los datos mock (CAFES_DB) para que no haya flash vacío,
 * luego reemplaza con los datos reales de Supabase en background.
 * Si Supabase falla, los mock persisten como fallback.
 */
import { create } from "zustand";
import { getAllCafes, CAFES as CAFES_DB, type Cafe } from "../data/cafes";

type CafesStore = {
  cafes: Cafe[];
  loaded: boolean;
  load: () => Promise<void>;
  getCafe: (id: string) => Cafe | null;
};

export const useCafesStore = create<CafesStore>((set, get) => ({
  cafes:  CAFES_DB,   // mock inmediato — sin pantallas en blanco
  loaded: false,

  load: async () => {
    const cafes = await getAllCafes();
    set({ cafes, loaded: true });
  },

  getCafe: (id) => get().cafes.find(c => c.id === id) ?? null,
}));
