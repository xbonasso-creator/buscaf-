import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Platform, Modal, TextInput, Alert, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useNavigation, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useCollectionsStore, type Collection } from "../../store/collectionsStore";
import { useToastStore } from "../../store/toastStore";
import { useCafesStore } from "../../store/cafesStore";
import { type Cafe } from "../../data/cafes";
import PrimaryButton from "../../components/ui/PrimaryButton";
import CardS from "../../components/ui/CardS";
import { Colors } from "../../constants/colors";

// ── Fila swipeable en Todos ───────────────────────────────────────────────────
function SwipeableCard({
  item,
  onRemove,
  onCollectionPress,
}: {
  item: Cafe;
  onRemove: () => void;
  onCollectionPress: () => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const renderRight = () => (
    <TouchableOpacity
      style={s.swipeDelete}
      onPress={() => {
        swipeRef.current?.close();
        Alert.alert(
          "Quitar de favoritos",
          `¿Querés quitar "${item.name}" de tus favoritos?`,
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Quitar", style: "destructive", onPress: onRemove },
          ]
        );
      }}
    >
      <Ionicons name="trash-outline" size={22} color={Colors.white} />
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRight} overshootRight={false}>
      <CardS item={item} onCollectionPress={onCollectionPress} />
    </Swipeable>
  );
}

// ── Colección card — grilla 2x2 estilo Instagram ─────────────────────────────
function CollectionCard({ collection, onPress, onDelete }: {
  collection: Collection;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { getCafe } = useCafesStore();
  const logos = collection.cafeIds
    .slice(0, 4)
    .map(id => getCafe(id)?.logo)
    .filter(Boolean) as string[];

  const slots = [0, 1, 2, 3].map(i => logos[i] ?? null);

  return (
    <TouchableOpacity style={s.colCard} onPress={onPress} activeOpacity={0.8}>
      {/* Preview 2×2 */}
      <View style={s.colGrid}>
        <View style={s.colGridRow}>
          {slots.slice(0, 2).map((logo, i) =>
            logo
              ? <Image key={i} source={{ uri: logo }} style={s.colGridCell} resizeMode="cover" />
              : <View key={i} style={[s.colGridCell, s.colGridEmpty]} />
          )}
        </View>
        <View style={s.colGridRow}>
          {slots.slice(2, 4).map((logo, i) =>
            logo
              ? <Image key={i + 2} source={{ uri: logo }} style={s.colGridCell} resizeMode="cover" />
              : <View key={i + 2} style={[s.colGridCell, s.colGridEmpty]} />
          )}
        </View>
        {/* Ícono central cuando no hay fotos */}
        {logos.length === 0 && (
          <View style={s.colGridOverlay}>
            <Ionicons name="heart-outline" size={28} color={Colors.border} />
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={s.colFooter}>
        <View style={s.colInfo}>
          <Text style={s.colName} numberOfLines={1}>{collection.name}</Text>
          <Text style={s.colCount}>
            {collection.cafeIds.length} {collection.cafeIds.length === 1 ? "cafetería" : "cafeterías"}
          </Text>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e) => { e.stopPropagation?.(); onDelete(); }}
        >
          <Ionicons name="trash-outline" size={15} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────
function EmptyTodos() {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name="heart-outline" size={48} color={Colors.primary} />
      </View>
      <Text style={s.emptyTitle}>Todavía no tenés cafeterías{"\n"}favoritas</Text>
      <Text style={s.emptySub}>Tocá el corazón en cualquier cafetería{"\n"}para guardarla acá.</Text>
      <PrimaryButton title="Buscar cafeterías" onPress={() => router.push("/(tabs)/explore")} />
    </View>
  );
}

function EmptyColecciones({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name="albums-outline" size={48} color={Colors.primary} />
      </View>
      <Text style={s.emptyTitle}>Todavía no creaste colecciones</Text>
      <Text style={s.emptySub}>Organizá tus cafeterías favoritas en listas.</Text>
      <PrimaryButton title="Nueva colección" onPress={onCreate} />
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function Favorites() {
  const insets = useSafeAreaInsets();
  const { favorites, toggle } = useFavoritesStore();
  const { getCafe } = useCafesStore();
  const { collections, createCollection, deleteCollection, addCafe, isInCollection } = useCollectionsStore();
  const { show: showToast } = useToastStore();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const { from, tab: tabParam } = useLocalSearchParams<{ from?: string; tab?: string }>();

  const [activeTab, setActiveTab] = useState<"todos" | "colecciones">(
    tabParam === "colecciones" ? "colecciones" : "todos"
  );
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");

  // Collection picker modal (add café to a collection)
  const [pickerCafe, setPickerCafe] = useState<Cafe | null>(null);

  useEffect(() => {
    if (tabParam === "colecciones") setActiveTab("colecciones");
  }, [tabParam]);

  const handleBack = () => {
    if (from === "profile") {
      router.push("/(tabs)/profile");
    } else {
      router.back();
    }
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createCollection(name);
    setNewName("");
    setShowNewModal(false);
    showToast("Colección creada");
  };

  const handleDeleteCollection = (col: Collection) => {
    Alert.alert(
      `Eliminar "${col.name}"`,
      "¿Querés eliminar esta colección? Las cafeterías en tu lista de Todos no se verán afectadas.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteCollection(col.id) },
      ]
    );
  };

  const handleAddToCollection = (collectionId: string) => {
    if (!pickerCafe) return;
    addCafe(collectionId, pickerCafe.id);
    setPickerCafe(null);
    showToast("Cafetería agregada a la colección");
  };

  return (
    <View style={s.wrapper}>
      <View style={s.container}>
        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          {canGoBack ? (
            <TouchableOpacity onPress={handleBack} style={s.backBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.text} />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
          <Text style={s.title}>Favoritos</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          <TouchableOpacity
            style={[s.tab, activeTab === "todos" && s.tabActive]}
            onPress={() => setActiveTab("todos")}
          >
            <Text style={[s.tabText, activeTab === "todos" && s.tabTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === "colecciones" && s.tabActive]}
            onPress={() => setActiveTab("colecciones")}
          >
            <Text style={[s.tabText, activeTab === "colecciones" && s.tabTextActive]}>Colecciones</Text>
          </TouchableOpacity>
        </View>

        {/* Tab: Todos */}
        {activeTab === "todos" && (
          favorites.length === 0 ? <EmptyTodos /> : (
            <FlatList
              data={favorites}
              keyExtractor={i => i.id}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const fullCafe = (getCafe(item.id) ?? item) as Cafe;
                return (
                  <SwipeableCard
                    item={fullCafe}
                    onRemove={() => toggle(item)}
                    onCollectionPress={() => setPickerCafe(fullCafe)}
                  />
                );
              }}
            />
          )
        )}

        {/* Tab: Colecciones */}
        {activeTab === "colecciones" && (
          collections.length === 0 ? (
            <EmptyColecciones onCreate={() => setShowNewModal(true)} />
          ) : (
            <FlatList
              data={collections}
              keyExtractor={c => c.id}
              numColumns={2}
              columnWrapperStyle={s.colRow}
              contentContainerStyle={s.colListContent}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                <TouchableOpacity style={s.newColBtn} onPress={() => setShowNewModal(true)}>
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                  <Text style={s.newColText}>Nueva colección</Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <CollectionCard
                  collection={item}
                  onPress={() => router.push(`/collection/${item.id}`)}
                  onDelete={() => handleDeleteCollection(item)}
                />
              )}
            />
          )
        )}
      </View>

      {/* Modal nueva colección */}
      <Modal visible={showNewModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Nueva colección</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Ej. Para visitar, Trabajo remoto, Punta…"
              placeholderTextColor={Colors.textLight}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => { setShowNewModal(false); setNewName(""); }}>
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalConfirm, !newName.trim() && { opacity: 0.4 }]}
                onPress={handleCreate}
                disabled={!newName.trim()}
              >
                <Text style={s.modalConfirmText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal picker de colección */}
      <Modal visible={!!pickerCafe} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Agregar a colección</Text>
            {collections.length === 0 ? (
              <Text style={s.pickerEmpty}>Primero creá una colección desde la pestaña Colecciones.</Text>
            ) : (
              <FlatList
                data={collections}
                keyExtractor={c => c.id}
                style={{ maxHeight: 280 }}
                ItemSeparatorComponent={() => <View style={s.pickerSep} />}
                renderItem={({ item: col }) => {
                  const already = pickerCafe ? isInCollection(col.id, pickerCafe.id) : false;
                  return (
                    <TouchableOpacity
                      style={s.pickerRow}
                      onPress={() => !already && handleAddToCollection(col.id)}
                      disabled={already}
                    >
                      <Text style={[s.pickerName, already && { color: Colors.textLight }]}>{col.name}</Text>
                      {already && <Ionicons name="checkmark" size={16} color={Colors.secondary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <TouchableOpacity style={s.modalCancel} onPress={() => setPickerCafe(null)}>
              <Text style={s.modalCancelText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ancho fijo para cada card: (contenedor - padding*2 - gap) / 2
const CONTAINER_W = Math.min(Dimensions.get("window").width, 430);
const COL_CARD_W = Math.floor((CONTAINER_W - 32 - 10) / 2);

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primary, textAlign: "center" },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surfaceWarm,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: Colors.white, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  tabText: { fontSize: 14, fontWeight: "500", color: Colors.textLight },
  tabTextActive: { color: Colors.primary, fontWeight: "700" },

  // List (Todos)
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 32 },

  // Collections grid
  colListContent: { paddingHorizontal: 16, paddingBottom: 32 },
  colRow: { gap: 10, marginBottom: 10 },

  // Swipe delete action
  swipeDelete: {
    backgroundColor: Colors.error,
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginLeft: 8,
  },

  // Collection card — 2×2 grid style
  colCard: {
    width: COL_CARD_W,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  colGrid: {
    width: "100%",
    height: 120,
    backgroundColor: Colors.surfaceCream,
  },
  colGridRow: {
    flex: 1,
    flexDirection: "row",
  },
  colGridCell: {
    flex: 1,
  },
  colGridEmpty: {
    backgroundColor: Colors.surfaceCream,
  },
  colGridOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  colFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  colInfo: { flex: 1, gap: 2 },
  colName: { fontSize: 13, fontWeight: "700", color: Colors.text },
  colCount: { fontSize: 11, color: Colors.textLight },

  // "+ Nueva colección" footer
  newColBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 16, justifyContent: "center" },
  newColText: { fontSize: 14, color: Colors.primary, fontWeight: "600" },

  // Empty states
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.surfaceWarm, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary, textAlign: "center", lineHeight: 26 },
  emptySub: { fontSize: 14, color: Colors.textLight, textAlign: "center", lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 32 },
  modalBox: { width: "100%", backgroundColor: Colors.white, borderRadius: 20, padding: 24, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary, textAlign: "center" },
  modalInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.text,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center" },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: Colors.textLight },
  modalConfirm: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center" },
  modalConfirmText: { fontSize: 15, fontWeight: "700", color: Colors.white },

  // Picker colección
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  pickerName: { fontSize: 15, color: Colors.text, fontWeight: "500" },
  pickerSep: { height: 1, backgroundColor: Colors.border },
  pickerEmpty: { fontSize: 14, color: Colors.textLight, textAlign: "center", lineHeight: 20 },
});
