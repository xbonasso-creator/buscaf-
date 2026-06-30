import { create } from "zustand";
import { supabase, type User, type Session } from "../lib/supabase";
import { useFavoritesStore } from "./favoritesStore";
import { useCuponerasStore } from "./cuponerasStore";
import { useProfileStore } from "./profileStore";

type AuthStore = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false, // Se vuelve true después de resolver la sesión inicial

  initialize: async () => {
    // 1. Cargar sesión guardada antes de que AuthGuard tome decisiones
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    set({ session, user: session?.user ?? null, initialized: true });

    if (userId) {
      useFavoritesStore.getState().load(userId);
      useCuponerasStore.getState().load(userId);
      useProfileStore.getState().load(userId);
    }

    // 2. Escuchar cambios futuros (login, logout, refresh de token)
    supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id;
      set({ session, user: session?.user ?? null });

      if (userId) {
        useFavoritesStore.getState().load(userId);
        useCuponerasStore.getState().load(userId);
        useProfileStore.getState().load(userId);
      } else {
        useFavoritesStore.getState().clear();
        useCuponerasStore.getState().clear();
        useProfileStore.getState().clear();
      }
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // Setear la sesión inmediatamente para que AuthGuard no redirija al navegar
    if (!error && data.session) {
      set({ session: data.session, user: data.session.user });
    }
    set({ loading: false });
    return error?.message ?? null;
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    set({ loading: false });
    return error?.message ?? null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
