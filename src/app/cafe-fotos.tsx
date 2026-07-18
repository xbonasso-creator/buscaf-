/**
 * Galería de fotos del café
 * — Fotos del admin: cafe.fotos[] (cargadas en Supabase por el admin)
 * — Fotos de usuarios: tabla cafe_fotos en Supabase
 * — Upload: expo-image-picker → Supabase Storage → cafe_fotos
 */
import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  FlatList, Dimensions, Platform, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { useCafesStore } from "../store/cafesStore";
import { Colors } from "../constants/colors";

const COLS     = 3;
const GAP      = 3;
const CELL_SZ  = (Math.min(430, Dimensions.get("window").width) - GAP * (COLS + 1)) / COLS;

export default function CafeFootos() {
  const insets = useSafeAreaInsets();
  const { id, cafeName, openUpload } = useLocalSearchParams<{
    id: string; cafeName: string; openUpload?: string;
  }>();

  const { getCafe } = useCafesStore();
  const cafe     = getCafe(id ?? "");
  const adminUrls: string[] = cafe?.fotos ?? [];

  const [userUrls, setUserUrls]   = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);

  // ── Cargar fotos de usuarios desde Supabase ─────────────
  const loadUserFotos = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("cafe_fotos")
      .select("url")
      .eq("cafe_id", id)
      .order("created_at", { ascending: false });
    if (data) setUserUrls(data.map(r => r.url));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadUserFotos();
  }, [loadUserFotos]);

  // Si llegamos con openUpload=1, abrimos el picker automáticamente
  useEffect(() => {
    if (openUpload === "1" && !loading) handleUpload();
  }, [loading]);

  // ── Upload ───────────────────────────────────────────────
  const handleUpload = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Subir fotos", "El upload de fotos solo está disponible desde la app móvil.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería para subir fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.82,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setUploading(true);

    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Iniciá sesión", "Tenés que estar logueado para subir fotos.");
        return;
      }

      // Leer como blob (compatible con React Native)
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Path en Storage: cafeId/user-userId-timestamp.jpg
      const ext  = (asset.uri.split(".").pop()?.toLowerCase() ?? "jpg").replace(/\?.*$/, "");
      const path = `${id}/user-${user.id}-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("cafe-images")
        .upload(path, blob, { contentType: `image/${ext}`, upsert: false });

      if (uploadErr) throw uploadErr;

      // URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("cafe-images")
        .getPublicUrl(path);

      // Guardar en tabla
      const { error: dbErr } = await supabase
        .from("cafe_fotos")
        .insert({ cafe_id: id, user_id: user.id, url: publicUrl });

      if (dbErr) throw dbErr;

      // Refrescar lista
      setUserUrls(prev => [publicUrl, ...prev]);
    } catch (e: any) {
      Alert.alert("Error al subir", e.message ?? "Intentá de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  // ── Datos combinados: admin primero, luego usuarios ──────
  const allUrls = [...adminUrls, ...userUrls];
  const total   = allUrls.length;

  return (
    <View style={s.wrapper}>
      <View style={s.container}>

        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={s.title}>{cafeName ?? "Fotos"}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Contador */}
        {!loading && (
          <Text style={s.count}>
            {total === 0 ? "Sin fotos aún" : `${total} foto${total !== 1 ? "s" : ""}`}
          </Text>
        )}

        {/* Grid */}
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : total === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="camera-outline" size={52} color={Colors.border} />
            <Text style={s.emptyTitle}>Sin fotos aún</Text>
            <Text style={s.emptySub}>Próximamente podrás ver las fotos de este lugar.</Text>
          </View>
        ) : (
          <FlatList
            data={allUrls}
            keyExtractor={(_, i) => String(i)}
            numColumns={COLS}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.grid}
            columnWrapperStyle={s.row}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={s.photo} />
            )}
          />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper:    { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container:  { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  backBtn:    { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  backIcon:   { fontSize: 24, color: Colors.text, marginTop: -2 },
  title:      { fontSize: 18, fontWeight: "700", color: Colors.primary, flex: 1, textAlign: "center" },
  uploadBtn:  { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  count:      { fontSize: 14, color: Colors.textLight, paddingHorizontal: 20, marginBottom: 8 },
  grid:       { paddingHorizontal: GAP, paddingBottom: 32, gap: GAP },
  row:        { gap: GAP },
  photo:      { width: CELL_SZ, height: CELL_SZ, backgroundColor: Colors.border },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyBox:   { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 12, paddingBottom: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  emptySub:   { fontSize: 14, color: Colors.textLight, textAlign: "center", lineHeight: 22 },
  emptyBtn:   { marginTop: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: Colors.white, fontSize: 15, fontWeight: "600" },
});
