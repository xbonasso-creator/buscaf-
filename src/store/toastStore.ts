import { create } from "zustand";

type ToastStore = {
  message: string | null;
  show: (message: string, duration?: number) => void;
  hide: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  message: null,
  show: (message, duration = 2200) => {
    set({ message });
    setTimeout(() => set({ message: null }), duration);
  },
  hide: () => set({ message: null }),
}));
