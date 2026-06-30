import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useQuieroIrStore } from "../../store/quieroIrStore";
import { useCuponerasStore } from "../../store/cuponerasStore";
import { getCafeSync, CAFES, type Cafe } from "../../data/cafes";
import { Colors } from "../../constants/colors";

// Fallback para cuando un id no existe en la DB aún
const CAFE_FALLBACK = CAFES[0];

function Stars({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= count ? "star" : "star-outline"} size={14} color="#E8B84B" style={{ opacity: i <= count ? 1 : 0.4 }} />
      ))}
    </View>
  );
}

export default function CafeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggle: toggleFav, isFavorite } = useFavoritesStore();
  const { toggle: toggleGuardar, isGuardado } = useQuieroIrStore();
  const { cuponeras, addCuponera } = useCuponerasStore();

  const CAFE: Cafe = getCafeSync(id ?? "1") ?? CAFE_FALLBACK;
  const cafeData = { id: id ?? "1", name: CAFE.name, address: CAFE.direccion, rating: CAFE.rating, image: CAFE.image };
  const fav = isFavorite(cafeData.id);
  const guardado = isGuardado(cafeData.id);
  const hasResenas = CAFE.resenas.length > 0;

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
              <View style={styles.heroNav}>
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
                <View style={[styles.badge, { backgroundColor: CAFE.open ? Colors.success : Colors.error }]}>
                  <Text style={styles.badgeText}>{CAFE.open ? "Abierto" : "Cerrado"}</Text>
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
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>📍</Text>
                <View>
                  <Text style={styles.infoText}>{CAFE.direccion}</Text>
                  <Text style={styles.infoSubText}>{CAFE.distancia}</Text>
                </View>
              </View>
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
                    <Text style={styles.optSectionTitle}>Cuponera de cafecitos</Text>
                    <Text style={styles.optSectionSub}>
                      {cuponeraActiva
                        ? `${miCuponera!.sellos}/${miCuponera!.total} sellos acumulados`
                        : "Juntá 10 sellos y tomá un café gratis."}
                    </Text>
                  </View>
                  {cuponeraActiva
                    ? <TouchableOpacity style={styles.optBtnSmall} onPress={() => router.push("/mis-cuponeras")}>
                        <Text style={styles.optBtnSmallText}>Ver progreso</Text>
                      </TouchableOpacity>
                    : <TouchableOpacity style={styles.optBtnPrimary} onPress={() => {
                        addCuponera(cafeData.id, CAFE.name);
                        router.push("/mis-cuponeras");
                      }}>
                        <Text style={styles.optBtnPrimaryText}>Activar</Text>
                      </TouchableOpacity>
                  }
                </View>
              </View>
            )}

            {/* ── MENÚ DESTACADO (opcional) ── */}
            {hasMenu && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Menú destacado</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {(CAFE.menu ?? []).map(item => (
                    <View key={item.id} style={styles.menuCard}>
                      <ImageBackground source={{ uri: item.image }} style={styles.menuImage} imageStyle={{ borderRadius: 10 }}>
                        <View style={styles.menuOverlay}>
                          <Text style={styles.menuName}>{item.name}</Text>
                          <Text style={styles.menuPrice}>{item.price}</Text>
                        </View>
                      </ImageBackground>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Fotos — oculto temporalmente, descomentar para habilitar */}
            {/* <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Fotos</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: "/cafe-fotos", params: { id, cafeName: CAFE.name } })}>
                  <Text style={styles.linkText}>Más fotos</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fotosGrid}>
                {CAFE.fotos.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.fotoThumb} />
                ))}
              </View>
            </View> */}

            {/* ── EVENTOS (opcional) ── */}
            {hasEventos && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eventos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {(CAFE.eventos ?? []).map(e => (
                    <View key={e.id} style={styles.eventoCard}>
                      <ImageBackground source={{ uri: e.imagen }} style={styles.eventoImg} imageStyle={{ borderRadius: 12 }}>
                        <View style={styles.eventoOverlay} />
                        <View style={styles.eventoFechaBadge}>
                          <Ionicons name="calendar-outline" size={11} color="#fff" />
                          <Text style={styles.eventoFechaText}>{e.fecha}</Text>
                        </View>
                      </ImageBackground>
                      <Text style={styles.eventoTitulo}>{e.titulo}</Text>
                      <Text style={styles.eventoDesc}>{e.descripcion}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Reseñas */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Reseñas</Text>
                {hasResenas && (
                  <TouchableOpacity onPress={() => router.push({ pathname: "/cafe-resenas", params: { id, cafeName: CAFE.name } })}>
                    <Text style={styles.linkText}>Mostrar todas</Text>
                  </TouchableOpacity>
                )}
              </View>

              {hasResenas ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {CAFE.resenas.map(r => (
                    <View key={r.id} style={styles.resenaCard}>
                      <Text style={styles.resenaName}>{r.name}</Text>
                      <Stars count={r.rating} />
                      <Text style={styles.resenaText}>"{r.text}"</Text>
                      <Text style={styles.resenaDate}>{r.date}</Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.resenaEmpty}>
                  <Text style={styles.resenaEmptyText}>Sé el primero en compartir tu experiencia.</Text>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                    onPress={() => router.push({ pathname: "/cafe-resenas", params: { id, cafeName: CAFE.name, openForm: "1" } })}
                  >
                    <Ionicons name="pencil-outline" size={13} color={Colors.primary} />
                    <Text style={styles.resenaEmptyLink}>Escribir reseña</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.shareBtn} onPress={() => router.push({ pathname: "/cafe-share", params: { id } })}>
                <Text style={styles.shareBtnText}>Compartir cafetería</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>Volver al Inicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
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
  menuImage: { width: 160, height: 130, justifyContent: "flex-end" },
  menuOverlay: {
    backgroundColor: "rgba(0,0,0,0.50)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  menuName: { color: Colors.white, fontSize: 14, fontWeight: "600", flex: 1 },
  menuPrice: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  fotosGrid: { flexDirection: "row", gap: 8 },
  fotoThumb: { flex: 1, height: 100, borderRadius: 12 },
  resenaCard: {
    width: 240, backgroundColor: Colors.background,
    borderRadius: 14, padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  resenaName: { fontSize: 16, fontWeight: "700", color: Colors.text },
  resenaText: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
  resenaDate: { fontSize: 14, color: Colors.textLight },
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

  resenaEmpty: { gap: 4, paddingVertical: 8 },
  resenaEmptyIcon: {},
  resenaEmptyTitle: { fontSize: 14, fontWeight: "600", color: Colors.text },
  resenaEmptyText: { fontSize: 13, color: Colors.textLight, lineHeight: 20 },
  resenaEmptyLink: { fontSize: 13, color: Colors.primary, fontWeight: "500", marginTop: 4 },
  resenaEmptyBtn: {},
  resenaEmptyBtnText: {},
  footer: { alignItems: "center", gap: 16, paddingTop: 8 },
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
    backgroundColor: "#F0E4D7",
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
    backgroundColor: "#F0E4D7",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  promoTitulo: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  promoDesc: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  promoVigencia: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  promoVigenciaText: { fontSize: 12, color: Colors.textLight },

  // ── Sección opcional: eventos ──
  eventoCard: { width: 220, gap: 8 },
  eventoImg: { width: 220, height: 140, justifyContent: "flex-end" },
  eventoOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
  },
  eventoFechaBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    margin: 10, alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  eventoFechaText: { fontSize: 11, color: "#fff", fontWeight: "600" },
  eventoTitulo: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  eventoDesc: { fontSize: 13, color: Colors.textLight, lineHeight: 20 },
});
