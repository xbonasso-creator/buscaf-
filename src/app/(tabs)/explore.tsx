import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Platform } from "react-native";
import { useState, useMemo, useRef } from "react";
import type { FlatList as FlatListType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFiltersStore } from "../../store/filtersStore";
import CardS from "../../components/ui/CardS";
import { ZONAS_MONTEVIDEO } from "../../store/locationStore";
import { Colors } from "../../constants/colors";
import { type Cafe } from "../../data/cafes";
import { useCafesStore } from "../../store/cafesStore";
import { cafeMatchesAllFilters } from "../../utils/filters";

const FILTROS = ["Wi-Fi", "Abierto ahora", "Pet friendly", "Cowork", "Vegano", "Brunch"];
const PAGE_SIZE = 3;
const INITIAL_VISIBLE = 5;

export default function Explore() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [barrio, setBarrio] = useState<string | null>(null);
  const { active, price, toggle: toggleFilter, count } = useFiltersStore();
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

  // Normaliza zona para comparar sin importar guiones, espacios ni mayúsculas
  const normZona = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\s-]+/g, "");

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
    // Aplicar filtros activos del store (servicios, abierto ahora, precio…)
    list = list.filter(c => cafeMatchesAllFilters(c, active, price));
    return list;
  }, [barrio, search, active, price]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const showingAll = visibleCount >= filtered.length && filtered.length > INITIAL_VISIBLE;

  const handleBarrio = (id: string) => {
    setBarrio(prev => prev === id ? null : id);
    setVisibleCount(INITIAL_VISIBLE);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Search */}
        <View style={[styles.searchContainer, { paddingTop: insets.top + 12 }]}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cafeterías"
              placeholderTextColor={Colors.textLight}
              value={search}
              onChangeText={t => { setSearch(t); setVisibleCount(INITIAL_VISIBLE); }}
            />
            <Ionicons name="search-outline" size={18} color={Colors.textLight} />
          </View>
        </View>

        {/* Filtros de servicios */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.filtrosContainer}>
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

        {/* Filtro por barrio */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.barrioContainer}>
          <TouchableOpacity
            style={[styles.barrioChip, barrio === null && styles.barrioChipActive]}
            onPress={() => { setBarrio(null); setVisibleCount(INITIAL_VISIBLE); }}
          >
            <Text style={[styles.barrioText, barrio === null && styles.barrioTextActive]}>Todos</Text>
          </TouchableOpacity>
          {ZONAS_MONTEVIDEO.map(z => (
            <TouchableOpacity
              key={z.id}
              style={[styles.barrioChip, barrio === z.id && styles.barrioChipActive]}
              onPress={() => handleBarrio(z.id)}
            >
              <Ionicons
                name="location-outline"
                size={12}
                color={barrio === z.id ? Colors.white : Colors.textLight}
              />
              <Text style={[styles.barrioText, barrio === z.id && styles.barrioTextActive]}>{z.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista */}
        <View style={styles.content}>
          {visible.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="cafe-outline" size={44} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {search.trim()
                  ? "No encontramos cafeterías\ncon ese nombre"
                  : "No encontramos cafeterías\nen este barrio"}
              </Text>
              <Text style={styles.emptySub}>
                {search.trim()
                  ? "Probá con otro término o explorá por barrio."
                  : "Explorá otro barrio para descubrir\nnuevas cafeterías."}
              </Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={visible}
              keyExtractor={i => i.id}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
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
  // Barrio chips
  barrioContainer: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  barrioChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    justifyContent: "center",
  },
  barrioChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  barrioText: { fontSize: 12, color: Colors.textLight },
  barrioTextActive: { fontSize: 12, color: Colors.white, fontWeight: "600" },
  // Lista
  listContainer: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  moreBtn: { alignItems: "center", paddingVertical: 16 },
  moreText: { fontSize: 14, color: Colors.primary, fontWeight: "600", textDecorationLine: "underline" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32, paddingBottom: 60 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.surfaceWarm, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary, textAlign: "center", lineHeight: 28 },
  emptySub: { fontSize: 16, color: Colors.textLight, textAlign: "center", lineHeight: 24 },
  content: { flex: 1 },
});
