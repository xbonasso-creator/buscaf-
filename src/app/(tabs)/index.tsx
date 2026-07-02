import { useState, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ImageBackground, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useQuieroIrStore } from "../../store/quieroIrStore";
import { useFiltersStore } from "../../store/filtersStore";
import { useLocationStore } from "../../store/locationStore";
import LocationPicker from "../../components/ui/LocationPicker";
import LocationPermissionModal from "../../components/ui/LocationPermissionModal";
import { CAFES, type Cafe } from "../../data/cafes";
import { Colors } from "../../constants/colors";

const FILTROS = ["Abierto ahora", "Cowork", "Con terraza", "Vegetariano", "Sin TACC"];

// Mapa de chip → palabras clave en servicios
const FILTRO_KEYS: Record<string, string[]> = {
  "Abierto ahora":  [],   // se resuelve con cafe.open
  "Cowork":         ["cowork", "espacio de cowork"],
  "Con terraza":    ["terraza"],
  "Vegetariano":    ["veggie", "vegetariano", "vegano", "plant-based"],
  "Sin TACC":       ["sin tacc", "sin gluten"],
};

function matchesFiltro(cafe: Cafe, filtro: string): boolean {
  if (filtro === "Abierto ahora") return cafe.open;
  const keys = FILTRO_KEYS[filtro] ?? [filtro.toLowerCase()];
  return keys.some(k => cafe.servicios.some(s => s.toLowerCase().includes(k)));
}

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
      {/* Imagen — overflow:hidden del card recorta. Acciones siempre top-right */}
      <ImageBackground source={{ uri: item.image }} style={styles.cardImage}>
        <View style={styles.cardImageTop}>
          <View style={{ flex: 1 }} />
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

// ── Card Descuento — igual que Card L pero con badge de promo en imagen ──
function CardDescuento({ item }: { item: Cafe }) {
  const promo = item.promociones?.[0];
  return (
    <TouchableOpacity style={styles.cardDestacado} onPress={() => router.push(`/cafe/${item.id}`)}>
      <ImageBackground source={{ uri: item.image }} style={styles.cardImage}>
        <View style={styles.cardImageTop}>
          {/* Badge de promo top-left */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{promo?.titulo ?? "Promoción especial"}</Text>
          </View>
          {/* Actions top-right */}
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

function SearchResultItem({ item }: { item: Cafe }) {
  const { toggle: toggleFav, isFavorite } = useFavoritesStore();
  return (
    <TouchableOpacity style={styles.resultItem} onPress={() => router.push(`/cafe/${item.id}`)}>
      <View style={styles.resultLogo}>
        <Text style={styles.logoInitial}>{item.name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultAddress}>{item.direccion}</Text>
        {!item.open && <Text style={[styles.resultAddress, { color: Colors.textLight }]}>Cerrado ahora</Text>}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={styles.rating}>
          <Ionicons name="star" size={12} color="#E8B84B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); toggleFav(item); }}>
          <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { active, toggle: toggleFilter, count } = useFiltersStore();
  const { zone, hasLocation, permissionAsked } = useLocationStore();

  // Mostrar modal de permiso la primera vez que entra a la Home
  useEffect(() => {
    if (!permissionAsked) {
      const t = setTimeout(() => setShowLocationModal(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const extraActive = active.filter(f => !FILTROS.includes(f));
  const sortedFiltros = [
    ...extraActive,
    ...FILTROS.filter(f => active.includes(f)),
    ...FILTROS.filter(f => !active.includes(f)),
  ];
  const filterCount = count();

  // ── Cafés filtrados (base para carousels y búsqueda) ────────
  const filteredCafes = useMemo(() =>
    active.length === 0 ? CAFES : CAFES.filter(c => active.every(f => matchesFiltro(c, f))),
  [active]);

  // ── Carousels derivados de la fuente filtrada ────────────────
  const cafesDestacados = useMemo(() =>
    [...filteredCafes].sort((a, b) => b.rating - a.rating).slice(0, 5), [filteredCafes]);

  const cafesCalificados = useMemo(() =>
    [...filteredCafes].sort((a, b) => b.rating - a.rating), [filteredCafes]);

  const cafesConPromo = useMemo(() =>
    filteredCafes.filter(c => (c.promociones?.length ?? 0) > 0), [filteredCafes]);

  const cafesRecientes = useMemo(() =>
    [...filteredCafes].reverse().slice(0, 5), [filteredCafes]);

  // ── Búsqueda por texto (filtros NO cambian el modo vista) ────
  const isSearching = search.trim().length > 0;
  const q = search.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return filteredCafes.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.direccion.toLowerCase().includes(q) ||
      c.zona.toLowerCase().includes(q)
    );
  }, [q, filteredCafes, isSearching]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={[styles.location, !hasLocation && styles.locationEmpty]}
            onPress={() => setShowLocationPicker(true)}
          >
            <Ionicons
              name={hasLocation ? "location" : "location-outline"}
              size={14}
              color={hasLocation ? Colors.primary : Colors.textLight}
            />
            <Text style={[styles.locationText, !hasLocation && styles.locationTextEmpty]}>
              {zone ?? "¿Dónde estás?"}
            </Text>
            <Ionicons name="chevron-down" size={13} color={hasLocation ? Colors.primary : Colors.textLight} />
          </TouchableOpacity>
          {/* Isotipo / marca */}
          <View style={styles.isotipo}>
            <Ionicons name="cafe" size={22} color={Colors.primary} />
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

        {/* Resultados de búsqueda / filtros */}
        {isSearching && (
          <View style={styles.resultsSection}>
            {/* Label contextual */}
            <Text style={styles.resultsLabel}>
              {searchResults.length > 0
                ? `${searchResults.length} cafetería${searchResults.length !== 1 ? "s" : ""}${q ? ` para "${search.trim()}"` : ""}`
                : "Sin resultados"}
            </Text>

            {searchResults.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={40} color={Colors.border} />
                <Text style={styles.noResultsText}>
                  {q
                    ? `No encontramos cafeterías\ncon "${search.trim()}"`
                    : "Ninguna cafetería coincide\ncon los filtros activos"}
                </Text>
              </View>
            ) : (
              searchResults.map(item => <SearchResultItem key={item.id} item={item} />)
            )}
          </View>
        )}

        {/* Carousels — se ocultan al buscar o filtrar */}
        {!isSearching && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Los destacados del barrio</Text>
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

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
      />

      <LocationPermissionModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
  scroll: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  isotipo: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
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
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0E4D7", alignItems: "center", justifyContent: "center" },
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
    backgroundColor: "#F0E4D7", alignItems: "center", justifyContent: "center",
  },
  resultName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  resultAddress: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  noResults: { alignItems: "center", paddingVertical: 40, gap: 12 },
  noResultsText: { fontSize: 15, color: Colors.textLight, textAlign: "center", lineHeight: 22 },
  openBadge: { backgroundColor: Colors.success, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  openText: { color: Colors.white, fontSize: 11 },
});
