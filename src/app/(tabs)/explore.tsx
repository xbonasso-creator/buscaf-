import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Platform } from "react-native";
import { useState, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useQuieroIrStore } from "../../store/quieroIrStore";
import { useFiltersStore } from "../../store/filtersStore";
import { ZONAS_MONTEVIDEO } from "../../store/locationStore";
import { Colors } from "../../constants/colors";
import { CAFES, type Cafe } from "../../data/cafes";

const FILTROS = ["Wi-Fi", "Abierto ahora", "Pet friendly", "Cowork", "Vegano", "Brunch"];
const MAX_VISIBLE = 5;

function CafeListItem({ item }: { item: Cafe }) {
  const { toggle: toggleFav, isFavorite } = useFavoritesStore();
  const { toggle: toggleGuardar, isGuardado } = useQuieroIrStore();
  return (
    <TouchableOpacity style={styles.listItem} onPress={() => router.push(`/cafe/${item.id}`)}>
      <View style={styles.listLogo}>
        <Text style={styles.logoInitial}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listAddress}>{item.direccion}</Text>
      </View>
      <View style={styles.listRight}>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#E8B84B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.listActions}>
          <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); toggleFav(item); }}>
            <Ionicons name={isFavorite(item.id) ? "heart" : "heart-outline"} size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); toggleGuardar(item); }}>
            <Ionicons name={isGuardado(item.id) ? "bookmark" : "bookmark-outline"} size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Explore() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [barrio, setBarrio] = useState<string | null>(null);
  const { active, toggle: toggleFilter, count } = useFiltersStore();
  const extraActive = active.filter(f => !FILTROS.includes(f));
  const sortedFiltros = [
    ...extraActive,
    ...FILTROS.filter(f => active.includes(f)),
    ...FILTROS.filter(f => !active.includes(f)),
  ];
  const filterCount = count();
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    let list = CAFES;
    if (barrio) list = list.filter(c => c.zona.toLowerCase() === barrio.toLowerCase());
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.direccion.toLowerCase().includes(q)
      );
    }
    return list;
  }, [barrio, search]);

  const visible = showAll ? filtered : filtered.slice(0, MAX_VISIBLE);
  const hasMore = !showAll && filtered.length > MAX_VISIBLE;

  const handleBarrio = (label: string) => {
    setBarrio(prev => prev === label ? null : label);
    setShowAll(false);
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
              onChangeText={t => { setSearch(t); setShowAll(false); }}
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
            onPress={() => { setBarrio(null); setShowAll(false); }}
          >
            <Text style={[styles.barrioText, barrio === null && styles.barrioTextActive]}>Todos</Text>
          </TouchableOpacity>
          {ZONAS_MONTEVIDEO.map(z => (
            <TouchableOpacity
              key={z.id}
              style={[styles.barrioChip, barrio === z.label && styles.barrioChipActive]}
              onPress={() => handleBarrio(z.label)}
            >
              <Ionicons
                name="location-outline"
                size={12}
                color={barrio === z.label ? Colors.white : Colors.textLight}
              />
              <Text style={[styles.barrioText, barrio === z.label && styles.barrioTextActive]}>{z.label}</Text>
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
              <Text style={styles.emptyTitle}>No hay resultados</Text>
              <Text style={styles.emptySub}>
                {barrio
                  ? "Cambiá de barrio para descubrir cafeterías."
                  : "Probá con otro nombre o ajustá los filtros."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={visible}
              keyExtractor={i => i.id}
              renderItem={({ item }) => <CafeListItem item={item} />}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                hasMore ? (
                  <TouchableOpacity style={styles.moreBtn} onPress={() => setShowAll(true)}>
                    <Text style={styles.moreText}>Más cafeterías ({filtered.length - MAX_VISIBLE} más)</Text>
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
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0E4D7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoInitial: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  listInfo: { flex: 1 },
  listName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  listAddress: { fontSize: 14, color: Colors.textLight, marginTop: 3 },
  listRight: { alignItems: "center", gap: 8 },
  listActions: { flexDirection: "row", gap: 12 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 12, fontWeight: "500", color: Colors.textLight },
  moreBtn: { alignItems: "center", paddingVertical: 16 },
  moreText: { fontSize: 14, color: Colors.primary, fontWeight: "600", textDecorationLine: "underline" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32, paddingBottom: 60 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F5E6E0", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary, textAlign: "center", lineHeight: 28 },
  emptySub: { fontSize: 16, color: Colors.textLight, textAlign: "center", lineHeight: 24 },
  content: { flex: 1 },
});
