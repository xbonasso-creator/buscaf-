import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCuponerasStore } from "../../store/cuponerasStore";
import { Colors } from "../../constants/colors";
import QRScanner from "../../components/ui/QRScanner";

// QR válido: "buscafe:cafe:{id}"  ó  solo el id del café
function parseCafeId(data: string, expectedId?: string): string | null {
  const match = data.match(/^buscafe:cafe:(.+)$/);
  if (match) return match[1];
  if (expectedId && data.trim() === expectedId) return data.trim();
  return null;
}

type ScanState = "scanning" | "success" | "error";

export default function Scanner() {
  const { id, cafeName, faltan } = useLocalSearchParams<{
    id?: string;
    cafeName?: string;
    faltan?: string;
  }>();

  const { addSello } = useCuponerasStore();
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [scanActive, setScanActive] = useState(true);
  const [scaleAnim] = useState(new Animated.Value(0));

  const faltanNum = Number(faltan ?? 0);

  const handleScan = (data: string) => {
    if (scanState !== "scanning") return;
    setScanActive(false);

    const cafeId = parseCafeId(data, id);

    if (cafeId && id && cafeId === id) {
      addSello(id);
      setScanState("success");
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 6,
      }).start();
      setTimeout(() => router.back(), 2500);
    } else {
      setScanState("error");
      setTimeout(() => {
        setScanState("scanning");
        setScanActive(true);
      }, 2000);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Cámara — ocupa todo el fondo */}
      <View style={styles.cameraContainer}>
        <QRScanner onScan={handleScan} active={scanActive} />
      </View>

      {/* UI superpuesta */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          {faltanNum > 0 && (
            <View style={styles.faltanBadge}>
              <Ionicons name="gift-outline" size={14} color="#fff" />
              <Text style={styles.faltanText}>
                {faltanNum === 1 ? "¡Falta 1 sello!" : `Faltan ${faltanNum}`}
              </Text>
            </View>
          )}
        </View>

        {cafeName && (
          <Text style={styles.cafeName}>{cafeName}</Text>
        )}

        <Text style={styles.hint}>Apuntá la cámara al QR del café</Text>
      </View>

      {/* Éxito */}
      {scanState === "success" && (
        <View style={styles.resultOverlay}>
          <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.resultTitle}>¡Sello agregado!</Text>
            <Text style={styles.resultSub}>
              {faltanNum - 1 <= 0
                ? "🎉 ¡Completaste tu cuponera!"
                : faltanNum - 1 === 1
                  ? "¡Te falta 1 sello para tu café gratis!"
                  : `Te faltan ${faltanNum - 1} sellos para tu café gratis.`}
            </Text>
          </Animated.View>
        </View>
      )}

      {/* Error */}
      {scanState === "error" && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert" size={36} color="#fff" />
            </View>
            <Text style={styles.resultTitle}>QR no válido</Text>
            <Text style={styles.resultSub}>
              Este código no corresponde a {cafeName ?? "este café"}.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#000" },
  cameraContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  overlay: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 56 : 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  faltanBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  faltanText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  cafeName: {
    fontSize: 22, fontWeight: "700", color: "#fff",
    textAlign: "center", marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hint: {
    fontSize: 14, color: "rgba(255,255,255,0.75)",
    textAlign: "center", marginTop: 8,
  },
  resultOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 40,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 24, padding: 32,
    alignItems: "center", gap: 12,
    width: "100%", maxWidth: 320,
  },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.success,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  errorIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.error,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  resultTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  resultSub: {
    fontSize: 14, color: Colors.textLight,
    textAlign: "center", lineHeight: 20,
  },
});
