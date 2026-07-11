import { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ImageBackground, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useQuieroIrStore } from "../../store/quieroIrStore";
import { useFiltersStore } from "../../store/filtersStore";
import { type Cafe } from "../../data/cafes";
import { useCafesStore } from "../../store/cafesStore";
import { Colors } from "../../constants/colors";
import Isotipo from "../../components/ui/Isotipo";
import CardS from "../../components/ui/CardS";
import { matchesFiltro, PRECIO_MAP } from "../../utils/filters";

const FILTROS = ["Abierto ahora", "Cowork", "Con terraza", "Vegetariano", "Sin TACC"];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.rating}>
      <Ionicons name="star" size={14} color="#E8B84B" />
      <Text style={styles.ratingText}>{rating}</Text>
    </View>
  );
}

function CardActions({ item }: { item: Pick<Cafe, "id" | "name" | "rating" | "image" | "direccion"> }) {
  const { toggle: toggleFav, isFavorite } = useFavoritesStore();
  const { toggle: toggleGuardar, isGuardado } = useQuieroIrStore();
  return (
    <View style={styles.cardActionsRow}>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={(e) => { e.stopPropagation?.(); toggleFav(item); }}
      >
        <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={16} color={Colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={(e) => { e.stopPropagation?.(); toggleGuardar(item); }}
      >
        <Ionicons name={isGuardado(item.id) ? "bookmark" : "bookmark-outline"} size={16} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

// ── Card L — foto full-width, nombre + rating + dirección, acciones siempre top-right ──
function CardDestacado({ item }: { item: Cafe }) {
  return (
    <TouchableOpacity style={styles.cardDestacado} onPress={() => router.push(`/cafe/${item.id}`)}>
      {/* Imagen — acciones absolutas, nunca se mueven */}
      <ImageBackground source={{ uri: item.image }} style={styles.cardImage}>
        <View style={styles.cardActionsAbs}>
          <CardActions item={item} />
        </View>
      </ImageBackground>
      {/* Contenido */}
      <View style={styles.cardInfo}>
        <View style={styles.cardInfoRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <StarRating rating={item.rating} />
        </View>
        <Text style={styles.cardAddress} numberOfLines={1}>{item.direccion}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Card M — solo nombre + stars + imagen con badge estado top-left (solo con filtro Abierto ahora) ──
function CardCalificado({ item }: { item: Cafe }) {
  const { active } = useFiltersStore();
  const showBadge = active.includes("Abierto ahora");
  return (
    <TouchableOpacity style={styles.cardCalificado} onPress={() => router.push(`/cafe/${item.id}`)}>
      {/* Header: solo nombre y stars, sin logo */}
      <View style={styles.cardCalificadoHeader}>
        <Text style={styles.cardMName} numberOfLines={1}>{item.name}</Text>
        <StarRating rating={item.rating} />
      </View>
      {/* Imagen full-width — badge solo cuando filtro Abierto ahora está activo */}
      <ImageBackground source={{ uri: item.image }} style={styles.cardThumb} imageStyle={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
        {showBadge && item.open !== undefined && (
          <View style={styles.cardThumbTags}>
            <View style={[styles.stateBadge, item.open ? styles.stateBadgeOpen : styles.stateBadgeClosed]}>
              <Text style={styles.stateBadgeText}>{item.open ? "Abierto" : "Cerrado"}</Text>
            </View>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
}

// ── Card Descuento — badge promo top-left absoluto, acciones top-right absolutas ──
function CardDescuento({ item }: { item: Cafe }) {
  const promo = item.promociones?.[0];
  return (
    <TouchableOpacity style={styles.cardDestacado} onPress={() => router.push(`/cafe/${item.id}`)}>
      <ImageBackground source={{ uri: item.image }} style={styles.cardImage}>
        {/* Badge de promo top-left — absoluto, independiente de las acciones */}
        <View style={styles.cardBadgeAbs}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{promo?.titulo ?? "Promoción especial"}</Text>
          </View>
        </View>
        {/* Acciones top-right — siempre en la misma posición */}
        <View style={styles.cardActionsAbs}>
          <CardActions item={item} />
        </View>
      </ImageBackground>
      <View style={styles.cardInfo}>
        <View style={styles.cardInfoRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <StarRating rating={item.rating} />
        </View>
        <Text style={styles.cardAddress} numberOfLines={1}>{item.direccion}</Text>
      </View>
    </TouchableOpacity>
  );
}


export default function Home() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const { active, toggle: toggleFilter, count } = useFiltersStore();
  const { cafes: CAFES } = useCafesStore();
  const extraActive = active.filter(f => !FILTROS.includes(f));
  const sortedFiltros = [
    ...extraActive,
    ...FILTROS.filter(f => active.includes(f)),
    ...FILTROS.filter(f => !active.includes(f)),
  ];
  const filterCount = count();

  // ── Cafés filtrados (base para carousels y búsqueda) ────────
  const { price, barrio } = useFiltersStore();
  const normZona = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\s-]+/g, "");

  const filteredCafes = useMemo(() => {
    let result = CAFES.filter(c => {
      const pasaFiltros = active.every(f => matchesFiltro(c, f));
      const precioTarget = price ? PRECIO_MAP[price] : null;
      const pasaPrecio = !precioTarget || c.precio === precioTarget;
      const pasaBarrio = !barrio || normZona(c.zona ?? "") === normZona(barrio);
      return pasaFiltros && pasaPrecio && pasaBarrio;
    });
    if (active.includes("Mejor calificados")) {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [active, price, barrio]);

  // ── Carousels derivados de la fuente filtrada ────────────────
  // "Destacados de la semana" — manual en Supabase (destacado = true), máx 6
  const cafesDestacados = useMemo(() =>
    filteredCafes.filter(c => c.destacado).slice(0, 6), [filteredCafes]);

  // "Los mejor calificados" — automático rating ≥ 4.8, máx 6
  const cafesCalificados = useMemo(() =>
    filteredCafes.filter(c => (c.rating ?? 0) >= 4.8).sort((a, b) => b.rating - a.rating).slice(0, 6), [filteredCafes]);

  // "Agregados recientemente" — manual en Supabase (es_nuevo = true), máx 6
  const cafesRecientes = useMemo(() =>
    filteredCafes.filter(c => c.es_nuevo).slice(0, 6), [filteredCafes]);

  // ── Búsqueda por texto ────────────────────────────────────────
  const isSearching = search.trim().length > 0;
  const isFiltering = filterCount > 0;
  const q = search.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return filteredCafes.filter(c =>
      (c.name ?? "").toLowerCase().includes(q) ||
      (c.direccion ?? "").toLowerCase().includes(q) ||
      (c.zona ?? "").toLowerCase().includes(q)
    );
  }, [q, filteredCafes, isSearching]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerLogo}>
            <Text style={styles.headerTitle}>Buscafé</Text>
            <Isotipo size={36} variant="mark" />
          </View>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, isSearching && styles.searchBarActive]}>
            <Ionicons name="search" size={17} color={isSearching ? Colors.primary : Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cafeterías"
              placeholderTextColor={Colors.textLight}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {isSearching && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll} contentContainerStyle={styles.filtrosContainer}>
          <TouchableOpacity
            style={[styles.filtrarBtn, filterCount > 0 && styles.filtrarBtnActive]}
            onPress={() => router.push("/filters")}
          >
            <Ionicons name="options-outline" size={15} color={filterCount > 0 ? Colors.white : Colors.primary} />
            <Text style={[styles.filtrarText, filterCount > 0 && styles.filtrarTextActive]}>
              {filterCount > 0 ? `Filtros (${filterCount})` : "Filtrar"}
            </Text>
          </TouchableOpacity>
          {sortedFiltros.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroChip, active.includes(f) && styles.filtroChipActive]}
              onPress={() => toggleFilter(f)}
            >
              <Text style={[styles.filtroText, active.includes(f) && styles.filtroTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Resultados de búsqueda */}
        {isSearching && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsLabel}>
              {searchResults.length > 0
                ? `${searchResults.length} cafetería${searchResults.length !== 1 ? "s" : ""} para "${search.trim()}"`
                : "Sin resultados"}
            </Text>
            {searchResults.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={40} color={Colors.border} />
                <Text style={styles.noResultsText}>{`No encontramos cafeterías\ncon "${search.trim()}"`}</Text>
              </View>
            ) : (
              searchResults.map(item => <CardS key={item.id} item={item} />)
            )}
          </View>
        )}

        {/* Resultados de filtros activos */}
        {!isSearching && isFiltering && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsLabel}>
              {filteredCafes.length > 0
                ? `${filteredCafes.length} cafetería${filteredCafes.length !== 1 ? "s" : ""} encontrada${filteredCafes.length !== 1 ? "s" : ""}`
                : "Sin resultados para estos filtros"}
            </Text>
            {filteredCafes.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="options-outline" size={40} color={Colors.border} />
                <Text style={styles.noResultsText}>{"Ninguna cafetería coincide\ncon los filtros activos"}</Text>
              </View>
            ) : (
              filteredCafes.map(item => <CardS key={item.id} item={item} />)
            )}
          </View>
        )}

        {/* Carousels — solo cuando no hay filtros ni búsqueda */}
        {!isSearching && !isFiltering && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Los destacados de la semana</Text>
              <FlatList
                horizontal
                data={cafesDestacados}
                keyExtractor={i => i.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
                renderItem={({ item }) => <CardDestacado item={item} />}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Los mejor calificados</Text>
              <FlatList
                horizontal
                data={cafesCalificados}
                keyExtractor={i => i.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
                renderItem={({ item }) => <CardCalificado item={item} />}
              />
            </View>

            {/* V1: Promociones activas — oculto en MVP
            {cafesConPromo.length > 0 && (
              <View style={styles.descuentosSection}>
                <Text style={styles.sectionTitleLight}>Promociones activas</Text>
                <FlatList
                  horizontal
                  data={cafesConPromo}
                  keyExtractor={i => i.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carousel}
                  renderItem={({ item }) => <CardDescuento item={item} />}
                />
              </View>
            )}
            */}

            <View style={[styles.section, { marginBottom: 24 }]}>
              <Text style={styles.sectionTitle}>Agregados recientemente</Text>
              <FlatList
                horizontal
                data={cafesRecientes}
                keyExtractor={i => i.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
                renderItem={({ item }) => <CardCalificado item={item} />}
              />
            </View>
          </>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  scroll: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  location: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primary,
    backgroundColor: Colors.white, alignSelf: "flex-start",
  },
  locationEmpty: { borderColor: Colors.border, backgroundColor: Colors.background },
  locationText: { fontSize: 13, fontWeight: "600", color: Colors.primary },
  locationTextEmpty: { color: Colors.textLight, fontWeight: "400" },
  searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  filtrosScroll: { marginBottom: 8 },
  filtrosContainer: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  filtrarBtn: {
    height: 36,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  filtrarBtnActive: { backgroundColor: Colors.primary },
  filtrarText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  filtrarTextActive: { color: Colors.white },
  filtroChip: {
    height: 36,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filtroChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filtroText: { fontSize: 13, color: Colors.text },
  filtroTextActive: { color: Colors.white },
  section: { marginTop: 16, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary, paddingHorizontal: 16, marginBottom: 8 },
  descuentosSection: { backgroundColor: Colors.primary, paddingTop: 20, paddingBottom: 24, marginVertical: 20 },
  sectionTitleLight: { fontSize: 15, fontWeight: "600", color: Colors.white, paddingHorizontal: 16, marginBottom: 8 },
  carousel: { paddingHorizontal: 16, gap: 12 },

  // ── Card L ──────────────────────────────────────────────────
  cardDestacado: { width: 260, backgroundColor: Colors.white, borderRadius: 16, overflow: "hidden" },
  cardImage: { width: "100%", height: 164 },
  cardImageTop: { flexDirection: "row", alignItems: "flex-start", padding: 8 },
  cardActionsRow: { flexDirection: "row", gap: 6 },
  // Posicionamiento absoluto — badge izquierda, acciones derecha, nunca se mueven
  cardActionsAbs: { position: "absolute", top: 8, right: 8, flexDirection: "row", gap: 6 },
  cardBadgeAbs: { position: "absolute", top: 8, left: 8 },
  actionBtn: { backgroundColor: Colors.white, borderRadius: 20, padding: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  discountBadge: { backgroundColor: Colors.promo, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  discountText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
  cardInfo: { paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
  cardInfoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { fontSize: 14, fontWeight: "700", color: Colors.primary, flex: 1, marginRight: 8 },
  cardAddress: { fontSize: 12, color: Colors.textLight },
  promoTagRow: { flexDirection: "row", marginTop: 4 },
  promoTag: { backgroundColor: "#FFF0E5", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  promoTagText: { fontSize: 11, color: Colors.promo, fontWeight: "600" },
  rating: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 12, fontWeight: "600", color: Colors.textLight },

  // ── Card M ──────────────────────────────────────────────────
  cardCalificado: { width: 180, backgroundColor: Colors.white, borderRadius: 16, overflow: "hidden" },
  cardCalificadoHeader: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, gap: 3 },
  cardMName: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceCream, alignItems: "center", justifyContent: "center" },
  logoInitial: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  cardThumb: { width: "100%", height: 118, padding: 6 },
  cardThumbTags: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  stateBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  stateBadgeOpen: { backgroundColor: Colors.success },
  stateBadgeClosed: { backgroundColor: "rgba(0,0,0,0.45)" },
  stateBadgeText: { fontSize: 11, fontWeight: "600", color: Colors.white },
  searchBarActive: { borderColor: Colors.primary },
  resultsSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  resultsLabel: { fontSize: 13, color: Colors.textLight, marginBottom: 8 },
  resultItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  resultLogo: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceCream, alignItems: "center", justifyContent: "center",
  },
  resultName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  resultAddress: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  noResults: { alignItems: "center", paddingVertical: 40, gap: 12 },
  noResultsText: { fontSize: 15, color: Colors.textLight, textAlign: "center", lineHeight: 22 },
  openBadge: { backgroundColor: Colors.success, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  openText: { color: Colors.white, fontSize: 11 },
});
