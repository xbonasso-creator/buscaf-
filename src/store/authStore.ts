import { create } from "zustand";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { supabase, type User, type Session } from "../lib/supabase";
import { useFavoritesStore } from "./favoritesStore";
import { useCuponerasStore } from "./cuponerasStore";
import { useProfileStore } from "./profileStore";
import { useQuieroIrStore } from "./quieroIrStore";

const REDIRECT_URI = "buscafeclean://auth/callback";

type AuthStore = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; autoLogin: boolean }>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
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
      useQuieroIrStore.getState().load(userId);
    }

    // 2. Escuchar cambios futuros (login, logout, refresh de token)
    // INITIAL_SESSION ya fue manejado arriba — saltarlo evita double-load y
    // que un load() con data vacía pise el estado optimista de toggle().
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;

      const userId = session?.user?.id;
      set({ session, user: session?.user ?? null });

      if (userId) {
        // Solo recargamos en eventos que implican cambio real de usuario
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          useFavoritesStore.getState().load(userId);
          useCuponerasStore.getState().load(userId);
          useProfileStore.getState().load(userId);
          useQuieroIrStore.getState().load(userId);
        }
      } else {
        useFavoritesStore.getState().clear();
        useCuponerasStore.getState().clear();
        useProfileStore.getState().clear();
        useQuieroIrStore.getState().clear();
      }
    });

    // Guardamos el unsubscribe para evitar listeners acumulados en hot-reload
    (get() as any)._authSubscription?.unsubscribe?.();
    (set as any)({ _authSubscription: subscription });
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    // Si Supabase devuelve sesión inmediatamente (email confirm desactivado), auto-login
    if (!error && data.session) {
      set({ session: data.session, user: data.session.user });
    }
    set({ loading: false });
    return { error: error?.message ?? null, autoLogin: !error && !!data.session };
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: REDIRECT_URI, skipBrowserRedirect: true },
      });
      if (error || !data?.url) {
        set({ loading: false });
        return error?.message ?? "No se pudo iniciar el proceso de autenticación.";
      }
      const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get("code");
        if (code) {
          const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && sessionData.session) {
            set({ session: sessionData.session, user: sessionData.session.user });
          } else if (exchangeError) {
            set({ loading: false });
            return exchangeError.message;
          }
        }
      }
    } catch (e: any) {
      set({ loading: false });
      return e?.message ?? "Error al iniciar sesión con Google.";
    }
    set({ loading: false });
    return null;
  },

  signInWithApple: async () => {
    if (Platform.OS !== "ios") return "Sign in with Apple solo está disponible en iOS.";
    set({ loading: true });
    try {
      const AppleAuth = await import("expo-apple-authentication");
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        set({ loading: false });
        return "No se pudo obtener el token de Apple.";
      }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (!error && data.session) {
        set({ session: data.session, user: data.session.user });
      }
      set({ loading: false });
      return error?.message ?? null;
    } catch (e: any) {
      set({ loading: false });
      // El usuario canceló → no es un error real
      if (e?.code === "ERR_REQUEST_CANCELED") return null;
      return e?.message ?? "Error al iniciar sesión con Apple.";
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "buscafe://reset-password",
    });
    return error?.message ?? null;
  },
}));
