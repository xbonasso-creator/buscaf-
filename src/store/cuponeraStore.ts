import { create } from "zustand";

type CafeStamps = {
  stamps: number;
  max: number; // configurable por café al afiliarse
};

type CuponeraStore = {
  cuponeras: Record<string, CafeStamps>;
  addStamp: (cafeId: string, max?: number) => void;
  redeem: (cafeId: string) => void;
  getStamps: (cafeId: string) => CafeStamps;
  isReady: (cafeId: string) => boolean;
};

const DEFAULT_MAX = 10;

export const useCuponeraStore = create<CuponeraStore>((set, get) => ({
  cuponeras: {},

  addStamp: (cafeId, max = DEFAULT_MAX) => {
    const current = get().cuponeras[cafeId] ?? { stamps: 0, max };
    // No sumar si ya está lista para canjear
    if (current.stamps >= current.max) return;
    set(state => ({
      cuponeras: {
        ...state.cuponeras,
        [cafeId]: { stamps: current.stamps + 1, max: current.max },
      },
    }));
  },

  redeem: (cafeId) => {
    const current = get().cuponeras[cafeId];
    if (!current || current.stamps < current.max) return;
    set(state => ({
      cuponeras: {
        ...state.cuponeras,
        [cafeId]: { stamps: 0, max: current.max },
      },
    }));
  },

  getStamps: (cafeId) =>
    get().cuponeras[cafeId] ?? { stamps: 0, max: DEFAULT_MAX },

  isReady: (cafeId) => {
    const c = get().cuponeras[cafeId];
    return !!c && c.stamps >= c.max;
  },
}));
