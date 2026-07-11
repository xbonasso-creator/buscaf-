/**
 * CardS — card pequeña horizontal (tamaño S)
 * Usada en resultados de búsqueda, filtros y listados.
 *
 *  ┌─────────────────────────────────────────────┐
 *  │ [logo] Vera Café                    ★ 4.6 ♡ │
 *  │        Francisco Ros 2738, Punta Carretas    │
 *  └─────────────────────────────────────────────┘
 */
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../../store/favoritesStore";
import { Colors } from "../../constants/colors";
import { type Cafe } from "../../data/cafes";

type Props = { item: Cafe };

export default function CardS({ item }: Props) {
  const { toggle: toggleFav, isFavorite } = useFavoritesStore();
  const fav = isFavorite(item.id);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/cafe/${item.id}`)}
      activeOpacity={0.75}
    >
      {/* Logo */}
      <View style={styles.logoWrap}>
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.logoImg} resizeMode="cover" />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoInitial}>{item.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.direccion}</Text>
      </View>

      {/* Rating + Fav — misma fila, centrados verticalmente */}
      <View style={styles.right}>
        <Ionicons name="star" size={13} color="#E8B84B" />
        <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e) => { e.stopPropagation?.(); toggleFav(item); }}
        >
          <Ionicons
            name={fav ? "heart" : "heart-outline"}
            size={18}
            color={fav ? Colors.error : Colors.primary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceCream,
    flexShrink: 0,
  },
  logoImg: { width: 44, height: 44 },
  logoFallback: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInitial: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700", color: Colors.text },
  address: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 },
  ratingText: { fontSize: 13, fontWeight: "600", color: Colors.text },
});
