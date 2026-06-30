import { create } from "zustand";
import { supabase } from "../lib/supabase";

const getAuthUser = () => {
  try { return require("./authStore").useAuthStore.getState().user; }
  catch { return null; }
};

type ProfileStore = {
  avatarUrl: string | null;
  uploading: boolean;
  load: (userId: string) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string | null>;
  clear: () => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  avatarUrl: null,
  uploading: false,

  load: async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();
    set({ avatarUrl: data?.avatar_url ?? null });
  },

  uploadAvatar: async (uri) => {
    const user = getAuthUser();
    if (!user) return null;

    set({ uploading: true });
    try {
      // Convertir URI a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
      const path = `${user.id}/avatar.${ext}`;

      // Subir a Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`; // cache-bust

      // Guardar en profiles
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      set({ avatarUrl: publicUrl });
      return publicUrl;
    } catch (e) {
      console.error("uploadAvatar error:", e);
      return null;
    } finally {
      set({ uploading: false });
    }
  },

  clear: () => set({ avatarUrl: null }),
}));
