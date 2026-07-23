import { create } from "zustand";
import { supabase } from "../lib/supabase";

const getAuthUser = () => {
  try { return require("./authStore").useAuthStore.getState().user; }
  catch { return null; }
};

// Extrae el path relativo de una URL pública legacy o devuelve el path tal cual
function extractPath(urlOrPath: string): string {
  const marker = "/object/public/avatars/";
  const idx = urlOrPath.indexOf(marker);
  if (idx !== -1) {
    return urlOrPath.slice(idx + marker.length).split("?")[0];
  }
  return urlOrPath.split("?")[0];
}

async function getSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 31536000); // 1 año
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

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

    const stored = data?.avatar_url;
    if (!stored) { set({ avatarUrl: null }); return; }

    const path = extractPath(stored);
    const signedUrl = await getSignedUrl(path);
    set({ avatarUrl: signedUrl });
  },

  uploadAvatar: async (uri) => {
    const user = getAuthUser();
    if (!user) return null;

    set({ uploading: true });
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
      const path = `${user.id}/avatar.${ext}`;

      // Subir a Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

      if (uploadError) throw uploadError;

      // Guardar el path (no la URL pública) en profiles
      await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: path }, { onConflict: "id" });

      // Generar signed URL para mostrar en la app
      const signedUrl = await getSignedUrl(path);
      set({ avatarUrl: signedUrl, uploading: false });
      return null;
    } catch (e) {
      console.error("uploadAvatar error:", e);
      return null;
    } finally {
      set({ uploading: false });
    }
  },

  clear: () => set({ avatarUrl: null }),
}));
