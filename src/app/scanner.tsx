/**
 * Pantalla de Scanner QR para cuponeras.
 *
 * El QR del café debe tener este formato JSON:
 *   { "cafeId": "1", "cafeName": "Totem Coffee", "type": "stamp", "max": 9 }
 *   { "cafeId": "1", "cafeName": "Totem Coffee", "type": "redeem" }
 *
 * - type "stamp"  → suma 1 grano a la cuponera del café
 * - type "redeem" → canjea el café gratis (resetea la cuponera)
 */

import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Vibration } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import { useCuponeraStore } from "../store/cuponeraStore";

// ─── Web fallback ─────────────────────────────────────────────────────────────
function WebFallback() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.fallback}>
        <View style={styles.fallbackIcon}>
          <Ionicons name="qr-code-outline" size={52} color={Colors.secondary} />
        </View>
        <Text style={styles.fallbackTitle}>Escáner solo en mobile</Text>
        <Text style={styles.fallbackText}>
          Para escanear el QR del café necesitás abrir Buscafé desde tu celular.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Resultado del escaneo ────────────────────────────────────────────────────
type ScanResult =
  | { status: "stamp"; cafeName: string; stamps: number; max: number }
  | { status: "redeemed"; cafeName: string }
  | { status: "already_full"; cafeName: string; max: number }
  | { status: "not_ready"; cafeName: string; stamps: number; max: number }
  | { status: "invalid" };

function ResultScreen({ result, onReset }: { result: ScanResult; onReset: () => void }) {
  const icon =
    result.status === "stamp"        ? "cafe"               :
    result.status === "redeemed"     ? "checkmark-circle"   :
    result.status === "already_full" ? "alert-circle"       :
    result.status === "not_ready"    ? "close-circle"       :
                                       "help-circle";

  const iconColor =
    result.status === "stamp"        ? Colors.primary  :
    result.status === "redeemed"     ? Colors.success  :
    result.status === "invalid" || result.status === "not_ready" ? Colors.error :
                                       Colors.secondary;

  const title =
    result.status === "stamp"        ? "¡Grano sumado!" :
    result.status === "redeemed"     ? "¡Café canjeado!" :
    result.status === "already_full" ? "Cuponera llena" :
    result.status === "not_ready"    ? "Cuponera incompleta" :
                                       "QR no válido";

  const subtitle =
    result.status === "stamp"
      ? `${result.stamps} de ${result.max} granos en ${"cafeName" in result ? result.cafeName : ""}`
    : result.status === "redeemed"
      ? `Tu café en ${"cafeName" in result ? result.cafeName : ""} fue canjeado. ¡Disfrutalo!`
    : result.status === "already_full"
      ? `Ya tenés los ${result.max} granos. ¡Usá el botón de canjear!`
    : result.status === "not_ready"
      ? `Necesitás ${result.max - result.stamps} granos más para canjear.`
      : "El código escaneado no corresponde a una cuponera de Buscafé.";

  return (
    <View style={styles.resultScreen}>
      <View style={[styles.resultIcon, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon as any} size={56} color={iconColor} />
      </View>
      <Text style={styles.resultTitle}>{title}</Text>
      <Text style={styles.resultSub}>{subtitle}</Text>

      {result.status === "stamp" && (
        <View style={styles.stampsGrid}>
          {[0, 1].map(row => (
            <View key={row} style={styles.stampsRow}>
              {Array.from({ length: 5 }).map((_, col) => {
                const i = row * 5 + col;
                return (
                  <Ionicons
                    key={i}
                    name={i < result.stamps ? "cafe" : "cafe-outline"}
                    size={24}
                    color={i < result.stamps ? Colors.primary : Colors.border}
                  />
                );
              })}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.resultBtn} onPress={onReset}>
        <Text style={styles.resultBtnText}>
          {result.status === "redeemed" ? "Volver al café" : "Escanear otro"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.resultBack} onPress={() => router.back()}>
        <Text style={styles.resultBackText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Scanner() {
  if (Platform.OS === "web") return <WebFallback />;

  // Importación dinámica solo en native
  const { CameraView, useCameraPermissions } = require("expo-camera");

  const { cafeId } = useLocalSearchParams<{ cafeId?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const { addStamp, redeem, getStamps, isReady } = useCuponeraStore();

  const handleBarcode = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(80);

    try {
      const qr = JSON.parse(data) as {
        cafeId: string;
        cafeName: string;
        type: "stamp" | "redeem";
        max?: number;
      };

      if (!qr.cafeId || !qr.type) throw new Error("invalid");

      const { stamps, max } = getStamps(qr.cafeId);

      if (qr.type === "stamp") {
        if (stamps >= max) {
          setResult({ status: "already_full", cafeName: qr.cafeName, max });
        } else {
          addStamp(qr.cafeId, qr.max);
          const newStamps = stamps + 1;
          setResult({ status: "stamp", cafeName: qr.cafeName, stamps: newStamps, max: qr.max ?? max });
        }
      } else if (qr.type === "redeem") {
        if (!isReady(qr.cafeId)) {
          setResult({ status: "not_ready", cafeName: qr.cafeName, stamps, max });
        } else {
          redeem(qr.cafeId);
          setResult({ status: "redeemed", cafeName: qr.cafeName });
        }
      } else {
        setResult({ status: "invalid" });
      }
    } catch {
      setResult({ status: "invalid" });
    }
  };

  if (!permission) return <View style={styles.wrapper} />;

  if (!permission.granted) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.fallback}>
          <View style={styles.fallbackIcon}>
            <Ionicons name="camera-outline" size={52} color={Colors.secondary} />
          </View>
          <Text style={styles.fallbackTitle}>Permiso de cámara</Text>
          <Text style={styles.fallbackText}>
            Buscafé necesita acceso a tu cámara para escanear el QR del café.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Permitir acceso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resultBack} onPress={() => router.back()}>
            <Text style={styles.resultBackText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.wrapper}>
        <ResultScreen result={result} onReset={() => { setResult(null); setScanned(false); }} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarcode}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.scanHeader}>
          <TouchableOpacity style={styles.scanBackBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.scanTitle}>Escaneá el QR del café</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Visor */}
        <View style={styles.viewfinderWrapper}>
          <View style={styles.viewfinder}>
            {/* Esquinas del visor */}
            {[
              { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
              { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
              { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
              { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
            ].map((corner, i) => (
              <View key={i} style={[styles.corner, corner as any]} />
            ))}
          </View>
        </View>

        <Text style={styles.scanHint}>
          Apuntá la cámara al código QR{"\n"}que te muestra el café
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#000" },

  // Overlay del scanner
  overlay: { flex: 1, justifyContent: "space-between", paddingBottom: 60 },
  scanHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
  },
  scanBackBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  scanTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // Visor
  viewfinderWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  viewfinder: { width: 240, height: 240, position: "relative" },
  corner: {
    position: "absolute", width: 28, height: 28,
    borderColor: "#fff", borderRadius: 3,
  },
  scanHint: {
    color: "rgba(255,255,255,0.75)", fontSize: 14,
    textAlign: "center", lineHeight: 22,
    paddingHorizontal: 40,
  },

  // Resultado
  resultScreen: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 36, gap: 16,
  },
  resultIcon: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: "center", justifyContent: "center",
  },
  resultTitle: { fontSize: 24, fontWeight: "700", color: Colors.primary, textAlign: "center" },
  resultSub: { fontSize: 15, color: Colors.textLight, textAlign: "center", lineHeight: 23 },
  stampsGrid: { gap: 8, marginTop: 4 },
  stampsRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  resultBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8,
  },
  resultBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  resultBack: { paddingVertical: 12 },
  resultBackText: { fontSize: 14, color: Colors.textLight, textDecorationLine: "underline" },

  // Fallback / permisos
  fallback: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 40, gap: 16,
  },
  fallbackIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#F5E6E0",
    alignItems: "center", justifyContent: "center",
  },
  fallbackTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  fallbackText: { fontSize: 15, color: Colors.textLight, textAlign: "center", lineHeight: 23 },
  permBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8,
  },
  permBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  backBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8,
  },
  backBtnText: { color: Colors.primary, fontSize: 15, fontWeight: "600" },
});
