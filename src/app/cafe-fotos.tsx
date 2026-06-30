import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "../constants/colors";

// 12 fotos máx — equilibrio entre exploración y carga cognitiva (Ley de Hick)
const FOTOS = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600",
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600",
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600",
  "https://images.unsplash.com/photo-1603046891744-1f057468acaa?w=600",
  "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
  "https://images.unsplash.com/photo-1621510456681-2330135e5871?w=600",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600",
  "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600",
];

const COLS = 3;
const GAP = 3;
const CELL_SIZE = (Math.min(430, Dimensions.get("window").width) - GAP * (COLS + 1)) / COLS;

export default function CafeFootos() {
  const { id, cafeName } = useLocalSearchParams<{ id: string; cafeName: string }>();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{cafeName ?? "Fotos"}</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.count}>{FOTOS.length} fotos</Text>

        <FlatList
          data={FOTOS}
          keyExtractor={(_, i) => String(i)}
          numColumns={COLS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85}>
              <Image source={{ uri: item }} style={styles.photo} />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 24, color: Colors.text, marginTop: -2 },
  title: { fontSize: 18, fontWeight: "700", color: Colors.primary, flex: 1, textAlign: "center" },
  count: { fontSize: 14, color: Colors.textLight, paddingHorizontal: 20, marginBottom: 8 },
  grid: { paddingHorizontal: GAP, paddingBottom: 32, gap: GAP },
  row: { gap: GAP },
  photo: { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: Colors.border },
});
