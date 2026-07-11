import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image, Platform, Linking, Share, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useQuieroIrStore } from "../../store/quieroIrStore";
import { useCuponerasStore } from "../../store/cuponerasStore";
import { type Cafe, isOpenNow } from "../../data/cafes";
import { useCafesStore } from "../../store/cafesStore";
import { useResenasStore } from "../../store/resenasStore";
import { Colors } from "../../constants/colors";
import { useState } from "react";

function Stars({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= count ? "star" : "star-outline"} size={14} color="#E8B84B" style={{ opacity: i <= count ? 1 : 0.4 }} />
      ))}
    </View>
  );
}

const BASE_URL = "https://buscafe-mvp.netlify.app";

export default function CafeDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggle: toggleFav, isFavorite } = useFavoritesStore();
  const { toggle: toggleGuardar, isGuardado } = useQuieroIrStore();
  const { cuponeras, addCuponera } = useCuponerasStore();
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const { getCafe, loaded } = useCafesStore();
  // ?? [] fuera del selector para no crear una referencia nueva en cada render (evita loop infinito)
  const resenas = useResenasStore(state => state.byId[id ?? ""]) ?? [];

  // Esperar a que Supabase cargue antes de buscar el café por ID
  const CAFE: Cafe | null = loaded ? (getCafe(id ?? "") ?? null) : null;

  const cafeData = CAFE
    ? { id: CAFE.id, name: CAFE.name, direccion: CAFE.direccion, rating: CAFE.rating, image: CAFE.image }
    : { id: "", name: "", direccion: "", rating: 0, image: "" };
  const fav = isFavorite(cafeData.id);
  const guardado = isGuardado(cafeData.id);
  const hasResenas = resenas.length > 0;

  // Pantalla de carga mientras Supabase responde
  if (!loaded) {
    return (
      <View style={[styles.wrapper, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Café no encontrado en Supabase
  if (!CAFE) {
    return (
      <View style={[styles.wrapper, { justifyContent: "center", alignItems: "center", gap: 16 }]}>
        <Ionicons name="cafe-outline" size={48} color={Colors.border} />
        <Text style={{ fontSize: 16, color: Colors.textLight }}>Cafetería no encontrada</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
          <Text style={{ color: Colors.primary, fontWeight: "600" }}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cafeUrl = `${BASE_URL}/cafe/${CAFE.id}`;

  const handleCompartir = async () => {
    if (Platform.OS !== "web") {
      // Nativo: share sheet del sistema (incluye copiar, WhatsApp, Instagram, etc.)
      await Share.share({ message: `${CAFE.name} — ${cafeUrl}`, title: CAFE.name });
    } else {
      setShowShareSheet(true);
    }
  };

  const handleCopyLink = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(cafeUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowShareSheet(false); }, 1500);
    }
  };

  // Secciones opcionales
  const hasMenu        = (CAFE.menu?.length ?? 0) > 0;
  const hasPromociones = (CAFE.promociones?.length ?? 0) > 0;
  const hasEventos     = (CAFE.eventos?.length ?? 0) > 0;
  const miCuponera     = cuponeras.find(c => c.id === cafeData.id);
  const cuponeraActiva = !!miCuponera;


  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.heroContainer}>
            <ImageBackground source={{ uri: CAFE.image }} style={styles.hero}>
              <View style={[styles.heroNav, { paddingTop: insets.top + 4 }]}>
                <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
                  <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <View style={styles.heroActions}>
                  <TouchableOpacity style={styles.heroBtn} onPress={() => toggleFav(cafeData)}>
                    <Ionicons name={fav ? "heart" : "heart-outline"} size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.heroBtn} onPress={() => toggleGuardar(cafeData)}>
                    <Ionicons name={guardado ? "bookmark" : "bookmark-outline"} size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>

            {/* Info card overlapping hero */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.cafeName}>{CAFE.name}</Text>
                <View style={[styles.badge, { backgroundColor: isOpenNow(CAFE.horarios) ? Colors.success : "rgba(0,0,0,0.82)" }]}>
                  <Text style={styles.badgeText}>{isOpenNow(CAFE.horarios) ? "Abierto" : "Cerrado"}</Text>
                </View>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#E8B84B" />
                <Text style={styles.ratingText}>{CAFE.rating}</Text>
              </View>
              <Text style={styles.description}>{CAFE.description}</Text>
            </View>
          </View>

          <View style={styles.content}>
            {/* Horarios */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Horarios</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>🕐</Text>
                <View style={{ gap: 4 }}>
                  {CAFE.horarios.map((h, i) => (
                    <Text key={i} style={styles.infoText}>{h}</Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Dirección */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dirección</Text>
              <TouchableOpacity
                style={styles.infoBox}
                onPress={() => {
                  const q = encodeURIComponent(`${CAFE.direccion}, Montevideo, Uruguay`);
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
                }}
              >
                <Ionicons name="location" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoText}>{CAFE.direccion}</Text>
                  <Text style={[styles.infoSubText, { marginTop: 4, textDecorationLine: "underline" }]}>Abrir en Google Maps →</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── PROMOCIONES (opcional) ── */}
            {hasPromociones && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Promociones</Text>
                <View style={{ gap: 10 }}>
                  {(CAFE.promociones ?? []).map(p => (
                    <View key={p.id} style={styles.promoCard}>
                      <View style={styles.promoIconBox}>
                        <Ionicons name={p.icono as any} size={20} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.promoTitulo}>{p.titulo}</Text>
                        <Text style={styles.promoDesc}>{p.descripcion}</Text>
                        <View style={styles.promoVigencia}>
                          <Ionicons name="time-outline" size={11} color={Colors.textLight} />
                          <Text style={styles.promoVigenciaText}>{p.vigencia}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Servicios */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Servicios</Text>
              <View style={styles.serviciosGrid}>
                <View style={{ flex: 1, gap: 6 }}>
                  {CAFE.servicios.slice(0, Math.ceil(CAFE.servicios.length / 2)).map((s, i) => (
                    <Text key={i} style={styles.servicioItem}>· {s}</Text>
                  ))}
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  {CAFE.servicios.slice(Math.ceil(CAFE.servicios.length / 2)).map((s, i) => (
                    <Text key={i} style={styles.servicioItem}>· {s}</Text>
                  ))}
                </View>
              </View>
            </View>

            {/* ── CUPONERA (opcional) ── */}
            {CAFE.tieneCuponera && (
              <View style={styles.optSection}>
                <View style={styles.optSectionHeader}>
                  <View style={styles.optSectionIcon}>
                    <Ionicons name="cafe" size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optSectionTitle}>Cuponera</Text>
                    <Text style={styles.optSectionSub}>
                      {cuponeraActiva
                        ? `${miCuponera!.sellos}/${miCuponera!.total} sellos`
                        : `0/${CAFE.cuponeraMax ?? 10} sellos`}
                    </Text>
                  </View>
                  {cuponeraActiva
                    ? <TouchableOpacity style={styles.optBtnSmall} onPress={() => router.push("/mis-cuponeras")}>
                        <Text style={styles.optBtnSmallText}>Ir a cuponera</Text>
                      </TouchableOpacity>
                    : <TouchableOpacity style={styles.optBtnPrimary} onPress={() => {
                        addCuponera(cafeData.id, CAFE.name);
                        router.push("/mis-cuponeras");
                      }}>
                        <Text style={styles.optBtnPrimaryText}>Activar cuponera</Text>
                      </TouchableOpacity>
                  }
                </View>
              </View>
            )}

            {/* V1: Menú destacado — oculto en MVP (feature premium)
            {hasMenu && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Menú destacado</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {(CAFE.menu ?? []).map(item => (
                    <View key={item.id} style={styles.menuCard}>
                      <ImageBackground source={{ uri: item.image }} style={styles.menuImage} imageStyle={{ borderRadius: 10 }}>
                        <View style={styles.menuOverlay}>
                          <Text style={styles.menuName} numberOfLines={2}>{item.name}</Text>
                          <Text style={styles.menuPrice}>{item.price}</Text>
                        </View>
                      </ImageBackground>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            */}

            {/* ── FOTOS ── */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Fotos</Text>
                {/* V1: upload de fotos por usuarios
                <TouchableOpacity
                  style={styles.uploadFotoBtn}
                  onPress={() => router.push({ pathname: "/cafe-fotos", params: { id, cafeName: CAFE.name, openUpload: "1" } })}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Ionicons name="camera" size={20} color={Colors.primary} />
                </TouchableOpacity>
                */}
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: "/cafe-fotos", params: { id, cafeName: CAFE.name } })}
              >
                {CAFE.fotos.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} scrollEnabled={false}>
                    {CAFE.fotos.slice(0, 4).map((uri, i) => (
                      <Image key={i} source={{ uri }} style={styles.fotoThumb} />
                    ))}
                    {CAFE.fotos.length > 4 && (
                      <View style={[styles.fotoThumb, styles.fotoMas]}>
                        <Text style={styles.fotoMasText}>+{CAFE.fotos.length - 4}</Text>
                      </View>
                    )}
                  </ScrollView>
                ) : (
                  <View style={styles.fotosEmpty}>
                    <Ionicons name="camera-outline" size={28} color={Colors.border} />
                    <Text style={styles.fotosEmptyText}>Sé el primero en subir una foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* ── CONTACTO — INSTAGRAM (opcional) ── */}
            {!!CAFE.instagram && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contacto</Text>
                <TouchableOpacity
                  style={styles.infoBox}
                  onPress={() => Linking.openURL(
                    CAFE.instagram!.startsWith("http")
                      ? CAFE.instagram!
                      : `https://instagram.com/${CAFE.instagram!.replace("@", "")}`
                  )}
                >
                  <Ionicons name="logo-instagram" size={20} color="#E1306C" style={{ marginTop: 1 }} />
                  <Text style={[styles.infoSubText, { textDecorationLine: "underline" }]}>Ir al Instagram →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── EVENTOS (opcional) ── */}
            {hasEventos && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eventos</Text>
                <View style={{ gap: 12 }}>
                  {(CAFE.eventos ?? []).map(e => (
                    <TouchableOpacity
                      key={e.id}
                      style={styles.eventoCard}
                      onPress={() => router.push({ pathname: "/evento/[id]" as any, params: { id: e.id, cafeId: CAFE.id, cafeName: CAFE.name, instagram: CAFE.instagram ?? "" } })}
                    >
                      <ImageBackground source={{ uri: e.imagen }} style={styles.eventoImg}>
                        <View style={styles.eventoOverlay} />
                        <View style={styles.eventoFechaBadge}>
                          <Ionicons name="calendar-outline" size={11} color="#fff" />
                          <Text style={styles.eventoFechaText}>{e.fecha}</Text>
                        </View>
                      </ImageBackground>
                      <View style={styles.eventoContent}>
                        <Text style={styles.eventoTitulo}>{e.titulo}</Text>
                        <Text style={styles.eventoDesc}>{e.descripcion}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* V1: sección Reseñas — oculta en MVP, activar para v1
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Reseñas</Text>
                {hasResenas ? (
                  <TouchableOpacity
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    onPress={() => router.push({ pathname: "/cafe-resenas", params: { id, cafeName: CAFE.name } })}
                  >
                    <Text style={styles.linkText}>Leer más</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadFotoBtn}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    onPress={() => router.push({ pathname: "/cafe-resenas", params: { id, cafeName: CAFE.name, openForm: "1" } })}
                  >
                    <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
              {hasResenas ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {resenas.slice(0, 5).map(r => (
                    <TouchableOpacity
                      key={r.id}
                      style={styles.resenaCard}
                      activeOpacity={0.85}
                      onPress={() => router.push({ pathname: "/cafe-resenas", params: { id, cafeName: CAFE.name } })}
                    >
                      <View style={styles.resenaCardHeader}>
                        <View style={styles.resenaAvatar}>
                          <Text style={styles.resenaAvatarLetter}>{r.name[0].toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.resenaName}>{r.name}</Text>
                          <Stars count={r.rating} />
                        </View>
                      </View>
                      <Text style={styles.resenaText} numberOfLines={3}>"{r.text}"</Text>
                      <Text style={styles.resenaDate}>{r.date}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.resenaEmpty}>
                  <Text style={styles.resenaEmptyText}>Sé el primero en compartir tu experiencia.</Text>
                </View>
              )}
            </View>
            */}

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleCompartir}>
                <Text style={styles.shareBtnText}>Compartir cafetería</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>Volver al Inicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom sheet para compartir (solo web) */}
      <Modal visible={showShareSheet} animationType="slide" transparent>
        <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setShowShareSheet(false)} />
        <View style={styles.shareSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetPreview}>
            <View style={styles.sheetIcon}>
              <Ionicons name="cafe" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.sheetCafeName}>{CAFE.name}</Text>
          </View>
          <TouchableOpacity style={styles.sheetCopyBtn} onPress={handleCopyLink}>
            <Ionicons name={copied ? "checkmark" : "link-outline"} size={18} color={Colors.white} />
            <Text style={styles.sheetCopyText}>{copied ? "¡Copiado!" : "Copiar enlace"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowShareSheet(false)}>
            <Text style={styles.sheetCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  heroContainer: { position: "relative", marginBottom: 20 },
  hero: { height: 280, justifyContent: "flex-start", padding: 16 },
  heroNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroActions: { flexDirection: "row", gap: 8 },
  heroBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
  },
  backIcon: { fontSize: 24, color: Colors.text, marginTop: -2 },
  infoCard: {
    marginHorizontal: 16,
    marginTop: -36,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  infoCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cafeName: { fontSize: 22, fontWeight: "700", color: Colors.primary },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: Colors.white, fontSize: 14, fontWeight: "600" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 14, fontWeight: "600", color: Colors.text },
  description: { fontSize: 14, color: Colors.textLight, lineHeight: 22, marginTop: 4 },
  content: { paddingHorizontal: 20, gap: 28, paddingBottom: 40 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { fontSize: 14, color: Colors.textLight, textDecorationLine: "underline" },
  infoBox: {
    flexDirection: "row", gap: 14, alignItems: "flex-start",
    backgroundColor: Colors.background,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  infoIcon: { fontSize: 20, marginTop: 1 },
  infoText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  infoSubText: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
  serviciosGrid: { flexDirection: "row", gap: 10 },
  servicioItem: { fontSize: 14, color: Colors.text, lineHeight: 24 },
  menuCard: { width: 160 },
  menuImage: { width: 160, height: 148, justifyContent: "flex-end" },
  menuOverlay: {
    backgroundColor: "rgba(0,0,0,0.62)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 62,         // espacio para 2 líneas siempre
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  menuName: { color: Colors.white, fontSize: 13, fontWeight: "600", flex: 1, lineHeight: 18 },
  menuPrice: { color: Colors.white, fontSize: 14, fontWeight: "700", flexShrink: 0 },
  fotosGrid: { flexDirection: "row", gap: 8 },
  fotoThumb: { width: 110, height: 110, borderRadius: 12, backgroundColor: Colors.border },
  fotoMas: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  fotoMasText: { fontSize: 16, fontWeight: "700", color: Colors.textLight },
  fotosEmpty: { height: 90, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 6, flexDirection: "row" },
  fotosEmptyText: { fontSize: 14, color: Colors.textLight },
  uploadFotoBtn: { padding: 4 },
  resenaCard: {
    width: 240, backgroundColor: Colors.white,
    borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  resenaCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  resenaAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  resenaAvatarLetter: { fontSize: 16, fontWeight: "700", color: Colors.white },
  resenaName: { fontSize: 14, fontWeight: "700", color: Colors.text },
  resenaText: { fontSize: 13, color: Colors.textLight, lineHeight: 20 },
  resenaDate: { fontSize: 12, color: Colors.textLight },
  // Cuponera
  cuponeraCard: {
    backgroundColor: Colors.white,
    borderRadius: 20, padding: 20, gap: 16,
    borderWidth: 1.5, borderColor: Colors.primary + "30",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cuponeraHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cuponeraTitle: { fontSize: 17, fontWeight: "700", color: Colors.primary },
  cuponeraSub: { fontSize: 13, color: Colors.textLight, marginTop: 3 },
  cuponeraBadge: {
    backgroundColor: Colors.success, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  cuponeraBadgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  granosGrid: { gap: 10 },
  granosRow: { flexDirection: "row", justifyContent: "space-between" },
  canjearBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.success, borderRadius: 14, paddingVertical: 14,
  },
  canjearBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  scanBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 14,
    paddingVertical: 12, backgroundColor: Colors.background,
  },
  scanBtnText: { color: Colors.primary, fontSize: 14, fontWeight: "600" },

  resenaEmpty: { gap: 2, paddingVertical: 4 },
  resenaEmptyIcon: {},
  resenaEmptyTitle: { fontSize: 14, fontWeight: "600", color: Colors.text },
  resenaEmptyText: { fontSize: 13, color: Colors.textLight, lineHeight: 20 },
  resenaEmptyLink: { fontSize: 13, color: Colors.primary, fontWeight: "500", marginTop: 4 },
  resenaEmptyBtn: {},
  resenaEmptyBtnText: {},
  footer: { alignItems: "center", gap: 16, paddingTop: 8 },
  // ── Share bottom sheet (web) ──
  sheetBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  shareSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    alignItems: "center", gap: 16,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 4 },
  sheetPreview: { flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "stretch", backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  sheetIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceCream, alignItems: "center", justifyContent: "center" },
  sheetCafeName: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  sheetCopyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15, alignSelf: "stretch" },
  sheetCopyText: { fontSize: 15, fontWeight: "700", color: Colors.white },
  sheetCancelBtn: { paddingVertical: 8 },
  sheetCancelText: { fontSize: 15, color: Colors.primary, fontWeight: "600", textDecorationLine: "underline" },
  shareBtn: {
    width: "100%", backgroundColor: Colors.secondary,
    borderRadius: 14, paddingVertical: 16, alignItems: "center",
  },
  shareBtnText: { color: Colors.white, fontSize: 16, fontWeight: "600" },

  // ── Sección opcional: cuponera entry point ──
  optSection: {
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: Colors.primary + "40",
  },
  optSectionHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  optSectionIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surfaceCream,
    alignItems: "center", justifyContent: "center",
  },
  optSectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  optSectionSub: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  optBtnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  optBtnPrimaryText: { color: Colors.white, fontSize: 13, fontWeight: "700" },
  optBtnSmall: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  optBtnSmallText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },

  // ── Sección opcional: promociones ──
  promoCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 14,
    backgroundColor: "#FFF8F3",
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#F0D9C8",
  },
  promoIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.surfaceCream,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  promoTitulo: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  promoDesc: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  promoVigencia: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  promoVigenciaText: { fontSize: 12, color: Colors.textLight },

  // ── Sección opcional: eventos ──
  eventoCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventoImg: { width: "100%", height: 180, justifyContent: "flex-end" },
  eventoOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  eventoContent: { padding: 12, gap: 3 },
  eventoFechaBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    margin: 10, alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  eventoFechaText: { fontSize: 11, color: "#fff", fontWeight: "600" },
  eventoTitulo: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  eventoDesc: { fontSize: 13, color: Colors.textLight, lineHeight: 19 },
});
