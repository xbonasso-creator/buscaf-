import { create } from "zustand";
import { type Resena } from "../data/cafes";

type ResenasStore = {
  byId: Record<string, Resena[]>; // cafeId → reviews
  getResenas: (cafeId: string) => Resena[];
  addResena: (cafeId: string, resena: Resena) => void;
};

export const useResenasStore = create<ResenasStore>((set, get) => ({
  byId: {},
  getResenas: (cafeId) => get().byId[cafeId] ?? [],
  addResena: (cafeId, resena) =>
    set((state) => ({
      byId: {
        ...state.byId,
        [cafeId]: [resena, ...(state.byId[cafeId] ?? [])],
      },
    })),
}));
