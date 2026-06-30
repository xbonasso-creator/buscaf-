import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useQuieroIrStore } from "../../store/quieroIrStore";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { Colors } from "../../constants/colors";

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="heart-outline" size={48} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Todavía no tenés cafeterías{"\n"}favoritas</Text>
      <Text style={styles.emptySubtitle}>Agregá los lugares que más te gusten y{"\n"}encontralos más rápido aquí.</Text>
      <PrimaryButton title="Buscar cafeterías" onPress={() => router.push("/(tabs)/explore")} />
    </View>
  );
}

export default function Favorites() {
  const { favorites, toggle } = useFavoritesStore();
  const { toggle: toggleGuardar, isGuardado } = useQuieroIrStore();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={[styles.header, canGoBack && styles.headerWithBack]}>
          {canGoBack && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, canGoBack && styles.titleCentered]}>Favoritos</Text>
        </View>

        {favorites.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/cafe/${item.id}`)}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoInitial}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.address}>{item.address}</Text>
                </View>
                <View style={styles.right}>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={12} color="#E8B84B" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); toggle(item); }}>
                      <Ionicons name="heart" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); toggleGuardar(item); }}>
                      <Ionicons name={isGuardado(item.id) ? "bookmark" : "bookmark-outline"} size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  headerWithBack: { flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 8, padding: 4 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.primary },
  titleCentered: { flex: 1, textAlign: "center", marginRight: 30 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#F5E6E0",
    alignItems: "center", justifyContent: "center",
  },
  emptyHeart: { fontSize: 44, lineHeight: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary, textAlign: "center", lineHeight: 26 },
  emptySubtitle: { fontSize: 14, color: Colors.textLight, textAlign: "center", lineHeight: 20 },
  list: { paddingHorizontal: 16, gap: 10, paddingTop: 8, paddingBottom: 24 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#F0E4D7",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  logoInitial: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700", color: Colors.text },
  address: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  right: { alignItems: "center", gap: 6 },
  actions: { flexDirection: "row", gap: 10 },
  rating: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 11, fontWeight: "500", color: Colors.textLight },
  heartFilled: { fontSize: 20 },
});
