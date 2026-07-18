/**
 * /collection/[id] — pantalla de una colección individual
 */
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useRef } from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useCollectionsStore } from "../../store/collectionsStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useCafesStore } from "../../store/cafesStore";
import { type Cafe } from "../../data/cafes";
import CardS from "../../components/ui/CardS";
import { Colors } from "../../constants/colors";

// ── Fila swipeable ────────────────────────────────────────────────────────────
function SwipeableCard({ item, onRemove }: { item: Cafe; onRemove: () => void }) {
  const swipeRef = useRef<Swipeable>(null);

  const renderRight = () => (
    <TouchableOpacity
      style={s.swipeDelete}
      onPress={() => {
        swipeRef.current?.close();
        onRemove();
      }}
    >
      <Ionicons name="trash-outline" size={22} color={Colors.white} />
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRight} overshootRight={false}>
      <CardS item={item} showHeart={false} />
    </Swipeable>
  );
}

export default function CollectionDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCollection, addCafe, removeCafe } = useCollectionsStore();
  const { favorites } = useFavoritesStore();
  const { getCafe } = useCafesStore();

  const [showAddModal, setShowAddModal] = useState(false);

  const collection = getCollection(id ?? "");

  const cafesInCollection = useMemo(() =>
    (collection?.cafeIds ?? [])
      .map(cid => getCafe(cid))
      .filter(Boolean) as Cafe[],
    [collection?.cafeIds, getCafe]
  );

  const favoritesNotInCollection = useMemo(() =>
    favorites.filter(f => !(collection?.cafeIds ?? []).includes(f.id)),
    [favorites, collection?.cafeIds]
  );

  if (!collection) {
    return (
      <View style={[s.wrapper, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: Colors.textLight }}>Colección no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 8 }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.wrapper}>
      <View style={s.container}>
        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.title} numberOfLines={1}>{collection.name}</Text>
          <TouchableOpacity style={s.headerBtn} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {cafesInCollection.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="albums-outline" size={48} color={Colors.border} />
            <Text style={s.emptyText}>Tocá el + para agregar cafeterías a esta colección.</Text>
          </View>
        ) : (
          <FlatList
            data={cafesInCollection}
            keyExtractor={i => i.id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SwipeableCard
                item={item}
                onRemove={() => removeCafe(collection.id, item.id)}
              />
            )}
          />
        )}
      </View>

      {/* Modal agregar favoritos */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[s.modalWrapper, { paddingTop: insets.top + 8 }]}>
          <View style={s.modalHeader}>
            <TouchableOpacity style={s.headerBtn} onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={s.modalTitle}>Agregar a "{collection.name}"</Text>
            <View style={{ width: 40 }} />
          </View>

          {favoritesNotInCollection.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptySub}>
                {favorites.length === 0
                  ? "Primero agregá cafeterías a tus favoritos con el corazón."
                  : "Todas tus favoritas ya están en esta colección."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={favoritesNotInCollection}
              keyExtractor={i => i.id}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.addRow}
                  onPress={() => {
                    addCafe(collection.id, item.id);
                    setShowAddModal(false);
                  }}
                >
                  <View style={{ flex: 1, pointerEvents: "none" }}>
                    <CardS item={item} showHeart={false} />
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 18, fontWeight: "700", color: Colors.primary, textAlign: "center", marginHorizontal: 8 },

  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 32 },

  // Swipe delete
  swipeDelete: {
    backgroundColor: Colors.error,
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginLeft: 8,
  },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 },
  emptyText: { fontSize: 14, color: Colors.textLight, textAlign: "center", lineHeight: 20 },

  addRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 4 },

  modalWrapper: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: Colors.primary, textAlign: "center", marginHorizontal: 8 },
});
