import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuieroIrStore } from "../store/quieroIrStore";
import { Colors } from "../constants/colors";

export default function QuieroIr() {
  const insets = useSafeAreaInsets();
  const { items, toggle } = useQuieroIrStore();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Quiero ir</Text>
          <View style={{ width: 40 }} />
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={52} color={Colors.primary} />
            <Text style={styles.emptyTitle}>Todavía no guardaste ningún café</Text>
            <Text style={styles.emptySub}>
              Usá el ícono{" "}
              <Ionicons name="bookmark-outline" size={13} color={Colors.textLight} />
              {" "}en la pantalla de cada cafetería para guardarla acá.
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.replace("/(tabs)/explore" as any)}>
              <Text style={styles.exploreBtnText}>Explorar cafeterías</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/cafe/${item.id}`)}
              >
                <View style={styles.logoCircle}>
                  {item.logo ? (
                    <Image source={{ uri: item.logo }} style={styles.logoImg} resizeMode="cover" />
                  ) : (
                    <Text style={styles.logoInitial}>{item.name.charAt(0)}</Text>
                  )}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {item.direccion && (
                    <Text style={styles.cardAddress}>{item.direccion}</Text>
                  )}
                  {item.rating && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={11} color="#E8B84B" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => toggle(item)}>
                  <Ionicons name="bookmark" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: Colors.primary, textAlign: "center" },
  emptySub: { fontSize: 13, color: Colors.textLight, textAlign: "center", lineHeight: 20 },
  exploreBtn: { marginTop: 8, paddingVertical: 10 },
  exploreBtnText: { fontSize: 14, color: Colors.primary, fontWeight: "600", textDecorationLine: "underline" },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 32 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  logoCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceCream,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
    overflow: "hidden",
    flexShrink: 0,
  },
  logoImg: { width: 48, height: 48 },
  logoInitial: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  cardAddress: { fontSize: 12, color: Colors.textLight },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  ratingText: { fontSize: 11, fontWeight: "500", color: Colors.textLight },
  removeBtn: { padding: 4 },
});
