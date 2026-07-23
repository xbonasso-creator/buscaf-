import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Platform, Image, Modal } from "react-native";
import { useState, useMemo, useRef } from "react";
import type { FlatList as FlatListType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFiltersStore } from "../../store/filtersStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import CardS from "../../components/ui/CardS";
import { ZONAS_MONTEVIDEO } from "../../store/locationStore";
import { Colors } from "../../constants/colors";
import { type Cafe } from "../../data/cafes";
import { useCafesStore } from "../../store/cafesStore";
import { cafeMatchesAllFilters } from "../../utils/filters";
import MapboxGL from "@rnmapbox/maps";

// ── Configuración Mapbox ──────────────────────────────────────────────────────
// Reemplazá con tu Default public token (pk.) de console.mapbox.com
const MAPBOX_TOKEN = "pk.eyJ1IjoieGVuaWFtYXJpYWEiLCJhIjoiY21yMHBrcTFxMGZvODJxcHJsY2FjNGVkbCJ9.gH7btC2-yCF6QVVbtmzEvw";
MapboxGL.setAccessToken(MAPBOX_TOKEN);

const MVD_CENTER: [number, number] = [-56.1645, -34.9011]; // [lng, lat] centro de Montevideo

const FILTROS = ["Abierto ahora", "Buen WiFi", "Pet friendly", "Librería", "Gluten free"];
const PAGE_SIZE = 3;
const INITIAL_VISIBLE = 5;

export default function Explore() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [barrio, setBarrio] = useState<string | null>(null);
  const [barrioPickerOpen, setBarrioPickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const { active, price, toggle: toggleFilter, count, setFilters } = useFiltersStore();
  const extraActive = active.filter(f => !FILTROS.includes(f));
  const sortedFiltros = [
    ...extraActive,
    ...FILTROS.filter(f => active.includes(f)),
    ...FILTROS.filter(f => !active.includes(f)),
  ];
  const filterCount = count();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const listRef = useRef<FlatListType<Cafe>>(null);

  const { cafes: CAFES } = useCafesStore();
  const { favorites } = useFavoritesStore();

  const normZona = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\s-]+/g, "");

  const filtered = useMemo(() => {
    let list = CAFES;
    if (barrio) list = list.filter(c => normZona(c.zona ?? "") === normZona(barrio));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.direccion ?? "").toLowerCase().includes(q)
      );
    }
    list = list.filter(c => cafeMatchesAllFilters(c, active, price));
    return list;
  }, [barrio, search, active, price]);

  // Solo los cafés con coordenadas válidas para el mapa
  const cafesWithCoords = useMemo(
    () => filtered.filter(c => c.lat != null && c.lng != null),
    [filtered]
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const showingAll = visibleCount >= filtered.length && filtered.length > INITIAL_VISIBLE;

  const handleBarrio = (id: string) => {
    setBarrio(prev => prev === id ? null : id);
    setVisibleCount(INITIAL_VISIBLE);
  };

  const handleClearFilters = () => {
    setFilters([], null, null);
    setBarrio(null);
    setVisibleCount(INITIAL_VISIBLE);
  };

  const sortedBarrios = [...ZONAS_MONTEVIDEO].sort((a, b) =>
    a.label.localeCompare(b.label, "es")
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>

        {/* ── Search ── */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={[styles.searchBar, search.trim().length > 0 && styles.searchBarActive]}>
            <Ionicons name="search" size={17} color={search.trim() ? Colors.primary : Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cafetería..."
              placeholderTextColor={Colors.textLight}
              value={search}
              onChangeText={t => { setSearch(t); setVisibleCount(INITIAL_VISIBLE); }}
              returnKeyType="search"
            />
            {search.trim().length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Dropdown de barrio ── */}
        <View style={styles.barrioRow}>
          <TouchableOpacity
            style={[styles.barrioDropdown, !!barrio && styles.barrioDropdownActive]}
            onPress={() => setBarrioPickerOpen(true)}
          >
            <Ionicons name="location-outline" size={14} color={barrio ? Colors.white : Colors.primary} />
            <Text style={[styles.barrioDropdownText, !!barrio && styles.barrioDropdownTextActive]} numberOfLines={1}>
              {barrio ? sortedBarrios.find(z => z.id === barrio)?.label ?? "Barrio" : "Todos los barrios"}
            </Text>
            <Ionicons name={barrioPickerOpen ? "chevron-up" : "chevron-down"} size={14} color={barrio ? Colors.white : Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Modal barrio picker */}
        <Modal visible={barrioPickerOpen} transparent animationType="slide" onRequestClose={() => setBarrioPickerOpen(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setBarrioPickerOpen(false)} />
          <View style={[styles.barrioSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filtrar por barrio</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.barrioOption, !barrio && styles.barrioOptionActive]}
                onPress={() => { setBarrio(null); setVisibleCount(INITIAL_VISIBLE); setBarrioPickerOpen(false); }}
              >
                <Text style={[styles.barrioOptionText, !barrio && styles.barrioOptionTextActive]}>Todos los barrios</Text>
                {!barrio && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
              {sortedBarrios.map(z => (
                <TouchableOpacity
                  key={z.id}
                  style={[styles.barrioOption, barrio === z.id && styles.barrioOptionActive]}
                  onPress={() => { handleBarrio(z.id); setBarrioPickerOpen(false); }}
                >
                  <Text style={[styles.barrioOptionText, barrio === z.id && styles.barrioOptionTextActive]}>{z.label}</Text>
                  {barrio === z.id && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>

        {/* ── Toggle segmentado Lista / Mapa ── */}
        <View style={styles.segmentContainer}>
          <View style={styles.segment}>
            <TouchableOpacity
              style={[styles.segmentBtn, viewMode === "list" && styles.segmentBtnActive]}
              onPress={() => { setViewMode("list"); setSelectedCafe(null); }}
            >
              <Text style={[styles.segmentText, viewMode === "list" && styles.segmentTextActive]}>Lista</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, viewMode === "map" && styles.segmentBtnActive]}
              onPress={() => { setViewMode("map"); setSelectedCafe(null); }}
            >
              <Text style={[styles.segmentText, viewMode === "map" && styles.segmentTextActive]}>Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Filtros de servicios (solo en vista lista) ── */}
        {viewMode === "list" && <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={styles.filtrosContainer}
        >
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
        </ScrollView>}


        {/* ── Lista ── */}
        {viewMode === "list" && (
          <View style={styles.content}>
            {visible.length > 0 && (
              <Text style={styles.resultsCount}>
                {filtered.length} cafetería{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
              </Text>
            )}
            {visible.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="cafe-outline" size={44} color={Colors.primary} />
                </View>
                {search.trim() ? (
                  <>
                    <Text style={styles.emptyTitle}>No encontramos cafeterías{"\n"}con ese nombre</Text>
                    <Text style={styles.emptySub}>Probá con otro término o explorá por barrio.</Text>
                  </>
                ) : barrio ? (
                  <>
                    <Text style={styles.emptyTitle}>No encontramos cafeterías{"\n"}en este barrio</Text>
                    <Text style={styles.emptySub}>Explorá otro barrio para descubrir nuevas cafeterías.</Text>
                    <TouchableOpacity style={styles.clearBtn} onPress={handleClearFilters}>
                      <Text style={styles.clearBtnText}>Limpiar filtros</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.emptyTitle}>No encontramos cafeterías{"\n"}que coincidan</Text>
                    <Text style={styles.emptySub}>Explorá con otros filtros para descubrir nuevas cafeterías.</Text>
                    <TouchableOpacity style={styles.clearBtn} onPress={handleClearFilters}>
                      <Text style={styles.clearBtnText}>Limpiar filtros</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <FlatList
                ref={listRef}
                data={visible}
                keyExtractor={i => i.id}
                extraData={favorites}
                renderItem={({ item }) => <CardS item={item} />}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                  hasMore ? (
                    <TouchableOpacity style={styles.moreBtn} onPress={() => setVisibleCount(v => v + PAGE_SIZE)}>
                      <Text style={styles.moreText}>Más cafeterías</Text>
                    </TouchableOpacity>
                  ) : showingAll ? (
                    <TouchableOpacity style={styles.moreBtn} onPress={() => {
                      setVisibleCount(INITIAL_VISIBLE);
                      listRef.current?.scrollToOffset({ offset: 0, animated: true });
                    }}>
                      <Text style={styles.moreText}>Menos cafeterías</Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
            )}
          </View>
        )}

        {/* ── Mapa ── */}
        {viewMode === "map" && (
          <View style={styles.mapContainer}>
            <MapboxGL.MapView
              style={styles.map}
              styleURL={MapboxGL.StyleURL.Light}
              logoEnabled={false}
              attributionEnabled={false}
              onPress={() => setSelectedCafe(null)}
            >
              <MapboxGL.Camera
                centerCoordinate={MVD_CENTER}
                zoomLevel={12}
                animationMode="none"
              />

              {cafesWithCoords.map(cafe => {
                const isSelected = selectedCafe?.id === cafe.id;
                return (
                  <MapboxGL.MarkerView
                    key={cafe.id}
                    coordinate={[cafe.lng!, cafe.lat!]}
                    anchor={{ x: 0.5, y: 1 }}
                  >
                    <TouchableOpacity
                      onPress={() => setSelectedCafe(isSelected ? null : cafe)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons
                        name="location-sharp"
                        size={isSelected ? 40 : 32}
                        color={isSelected ? Colors.secondary : Colors.primary}
                      />
                    </TouchableOpacity>
                  </MapboxGL.MarkerView>
                );
              })}
            </MapboxGL.MapView>

            {/* Popup flotante en la parte inferior — fuera del MapView para no afectar otros markers */}
            {selectedCafe && (
              <TouchableOpacity
                style={styles.mapPopup}
                onPress={() => router.push(`/cafe/${selectedCafe.id}`)}
                activeOpacity={0.88}
              >
                {selectedCafe.logo ? (
                  <Image source={{ uri: selectedCafe.logo }} style={styles.popupPhoto} />
                ) : (
                  <View style={styles.popupPhotoFallback}>
                    <Text style={styles.popupInitial}>{selectedCafe.name.charAt(0)}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.popupName} numberOfLines={1}>{selectedCafe.name}</Text>
                  {selectedCafe.direccion ? (
                    <Text style={styles.popupAddress} numberOfLines={1}>{selectedCafe.direccion}</Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },

  // Search
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    width: "100%",
    maxWidth: 430,
    backgroundColor: Colors.background,
  },
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
  searchBarActive: { borderColor: Colors.primary },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },

  // Barrio dropdown
  barrioRow: { paddingHorizontal: 16, paddingBottom: 10, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  barrioDropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  barrioDropdownActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  barrioDropdownText: { flex: 1, fontSize: 15, color: Colors.text },
  barrioDropdownTextActive: { color: Colors.white, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  barrioSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "70%",
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: Colors.primary, marginBottom: 12 },
  barrioOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  barrioOptionActive: { backgroundColor: "transparent" },
  barrioOptionText: { fontSize: 15, color: Colors.text },
  barrioOptionTextActive: { color: Colors.primary, fontWeight: "700" },

  // Toggle segmentado
  segmentContainer: { paddingHorizontal: 16, paddingBottom: 10 },
  segment: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceCream,
    borderRadius: 14,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: { fontSize: 14, fontWeight: "600", color: Colors.textLight },
  segmentTextActive: { color: Colors.primary },

  // Filtros
  filtrosContainer: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filtrarBtn: {
    height: 36,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
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
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filtroChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filtroText: { fontSize: 13, color: Colors.text },
  filtroTextActive: { color: Colors.white },

  // Lista
  content: { flex: 1 },
  listContainer: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  moreBtn: { alignItems: "center", paddingVertical: 16 },
  moreText: { fontSize: 14, color: Colors.primary, fontWeight: "600", textDecorationLine: "underline" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32, paddingBottom: 60 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.surfaceWarm, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary, textAlign: "center", lineHeight: 28 },
  emptySub: { fontSize: 16, color: Colors.textLight, textAlign: "center", lineHeight: 24 },
  clearBtn: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  clearBtnText: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  resultsCount: { fontSize: 13, color: Colors.textLight, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4 },

  // Mapa
  mapContainer: { flex: 1 },
  map: { flex: 1 },

  // Marcador + popup card inferior
  mapPopup: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  popupPhoto: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.surfaceCream,
  },
  popupPhotoFallback: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.surfaceCream,
    alignItems: "center",
    justifyContent: "center",
  },
  popupInitial: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  popupName: { fontSize: 14, fontWeight: "700", color: Colors.text },
  popupAddress: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
});
