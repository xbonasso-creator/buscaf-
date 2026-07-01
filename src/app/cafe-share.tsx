import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import { useState } from "react";

const BASE_URL = "https://buscafe-mvp.netlify.app";

export default function CafeShare() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const cafeName = name ?? "Cafetería";
  const cafeUrl = `${BASE_URL}/cafe/${id}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (Platform.OS === "web" && typeof navigator !== "undefined") {
      await navigator.clipboard.writeText(cafeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`¡Mirá esta cafetería en Buscafé! ${cafeName} — ${cafeUrl}`);
    if (Platform.OS === "web") {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  const handleInstagram = () => {
    if (Platform.OS === "web") {
      window.open("https://www.instagram.com/", "_blank");
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Compartir</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <View style={styles.previewIcon}>
            <Text style={{ fontSize: 28 }}>☕</Text>
          </View>
          <View>
            <Text style={styles.previewName}>{cafeName}</Text>
            <Text style={styles.previewUrl}>{cafeUrl}</Text>
          </View>
        </View>

        {/* Opciones */}
        <View style={styles.options}>
          {/* Copiar enlace */}
          <TouchableOpacity style={styles.optionRow} onPress={handleCopy}>
            <View style={[styles.optionIcon, { backgroundColor: "#F0F0F0" }]}>
              <Ionicons name={copied ? "checkmark" : "link-outline"} size={22} color={copied ? Colors.success : Colors.text} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>{copied ? "¡Copiado!" : "Copiar enlace"}</Text>
              <Text style={styles.optionSub}>Compartí el link donde quieras</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* WhatsApp */}
          <TouchableOpacity style={styles.optionRow} onPress={handleWhatsApp}>
            <View style={[styles.optionIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>WhatsApp</Text>
              <Text style={styles.optionSub}>Mandá la cafetería por mensaje</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Instagram */}
          <TouchableOpacity style={styles.optionRow} onPress={handleInstagram}>
            <View style={[styles.optionIcon, { backgroundColor: "#FDE8F0" }]}>
              <Ionicons name="logo-instagram" size={22} color="#E1306C" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>Instagram</Text>
              <Text style={styles.optionSub}>Compartí en tus stories o feed</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 24, color: Colors.text, marginTop: -2 },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  preview: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  previewIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  previewName: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  previewUrl: { fontSize: 14, color: Colors.textLight, marginTop: 3 },
  options: {
    backgroundColor: Colors.white,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    overflow: "hidden",
  },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 16, padding: 18 },
  optionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: "600", color: Colors.text },
  optionSub: { fontSize: 14, color: Colors.textLight, marginTop: 2 },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },
  cancelBtn: { marginTop: 20, alignItems: "center", paddingVertical: 16 },
  cancelText: { fontSize: 16, color: Colors.textLight },
});
