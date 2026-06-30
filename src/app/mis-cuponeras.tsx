import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCuponerasStore } from "../store/cuponerasStore";
import { Colors } from "../constants/colors";

function CuponeraCard({ item }: { item: { id: string; cafeName: string; sellos: number; total: number } }) {
  const llena = item.sellos >= item.total;
  return (
    <View style={[styles.card, llena && styles.cardLlena]}>
      <View style={styles.cardHeader}>
        <View style={styles.cafeLogoCircle}>
          <Text style={styles.cafeLogoText}>{item.cafeName.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cafeName}>{item.cafeName}</Text>
          <Text style={styles.cafeProgress}>
            {llena ? "¡Lista para canjear!" : `${item.sellos} de ${item.total} tazas`}
          </Text>
        </View>
        {llena && <View style={styles.listaChip}><Text style={styles.listaChipText}>¡Lista!</Text></View>}
      </View>

      <View style={styles.tazasGrid}>
        {[0, 1].map(row => (
          <View key={row} style={styles.tazasRow}>
            {Array.from({ length: 5 }).map((_, col) => {
              const i = row * 5 + col;
              const filled = i < item.sellos;
              return (
                <View key={i} style={[styles.tazaSlot, filled && styles.tazaSlotFilled]}>
                  <Ionicons name={filled ? "cafe" : "cafe-outline"} size={24} color={filled ? Colors.white : Colors.border} />
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {llena ? (
        <TouchableOpacity style={styles.canjearBtn}
          onPress={() => Platform.OS !== "web" ? router.push({ pathname: "/scanner", params: { cafeId: item.id } }) : null}>
          <Ionicons name="gift-outline" size={17} color="#fff" />
          <Text style={styles.canjearBtnText}>Canjear café gratis</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.scanBtn}
          onPress={() => Platform.OS !== "web" ? router.push({ pathname: "/scanner", params: { cafeId: item.id } }) : null}>
          <Ionicons name="qr-code-outline" size={16} color={Colors.primary} />
          <Text style={styles.scanBtnText}>{Platform.OS === "web" ? "Escaneá desde tu celular" : "Escanear QR del café"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MisCuponeras() {
  const { cuponeras } = useCuponerasStore();
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Mis cuponeras</Text>
          <View style={{ width: 40 }} />
        </View>
        {cuponeras.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="cafe-outline" size={48} color={Colors.secondary} /></View>
            <Text style={styles.emptyTitle}>Sin cuponeras activas</Text>
            <Text style={styles.emptyText}>Visitá los cafés afiliados y escaneá su QR para empezar a acumular tazas.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/(tabs)/explore")}>
              <Text style={styles.emptyBtnText}>Explorar cafés</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {cuponeras.map(c => <CuponeraCard key={c.id} item={c} />)}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, gap: 16, borderWidth: 1, borderColor: Colors.border },
  cardLlena: { borderColor: Colors.success, borderWidth: 1.5 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cafeLogoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F0E4D7", alignItems: "center", justifyContent: "center" },
  cafeLogoText: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  cafeName: { fontSize: 15, fontWeight: "700", color: Colors.text },
  cafeProgress: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  listaChip: { backgroundColor: Colors.success, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  listaChipText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  tazasGrid: { gap: 8 },
  tazasRow: { flexDirection: "row", justifyContent: "space-between" },
  tazaSlot: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  tazaSlotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  canjearBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.success, borderRadius: 14, paddingVertical: 14 },
  canjearBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  scanBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 12, backgroundColor: Colors.background },
  scanBtnText: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 16, paddingBottom: 60 },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#F5E6E0", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  emptyText: { fontSize: 15, color: Colors.textLight, textAlign: "center", lineHeight: 24 },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
