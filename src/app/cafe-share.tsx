import { View, Text, StyleSheet, TouchableOpacity, Platform, Share, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { useState } from "react";

const BASE_URL = "https://buscafe-mvp.netlify.app";

export default function CafeShare() {
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const cafeName = name ?? "Cafetería";
  const cafeUrl = `${BASE_URL}/cafe/${id}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined") {
        await navigator.clipboard.writeText(cafeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      // En nativo: abre el share sheet nativo de iOS/Android
      await Share.share({ message: cafeUrl, title: cafeName });
    }
  };

  const handleWhatsApp = async () => {
    const text = encodeURIComponent(`¡Mirá esta cafetería en Buscafé! ${cafeName} — ${cafeUrl}`);
    if (Platform.OS === "web") {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    } else {
      const waUrl = `whatsapp://send?text=${text}`;
      const supported = await Linking.canOpenURL(waUrl);
      if (supported) {
        Linking.openURL(waUrl);
      } else {
        Linking.openURL(`https://wa.me/?text=${text}`);
      }
    }
  };

  const handleInstagram = async () => {
    if (Platform.OS === "web") {
      window.open("https://www.instagram.com/", "_blank");
    } else {
      const igUrl = "instagram://";
      const supported = await Linking.canOpenURL(igUrl);
      if (supported) {
        Linking.openURL(igUrl);
      } else {
        Linking.openURL("https://www.instagram.com/");
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Compartir</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <View style={styles.previewIcon}>
            <Ionicons name="cafe" size={26} color={Colors.primary} />
          </View>
          <Text style={styles.previewName}>{cafeName}</Text>
        </View>

        {/* Opciones */}
        <View style={styles.options}>
          <TouchableOpacity style={styles.optionRowLink} onPress={handleCopy}>
            <View style={[styles.optionIcon, { backgroundColor: "#F0F0F0" }]}>
              <Ionicons name={copied ? "checkmark" : "link-outline"} size={22} color={copied ? Colors.success : Colors.text} />
            </View>
            <Text style={[styles.optionLabelLink, copied && { color: Colors.success }]}>
              {copied ? "¡Copiado!" : "Copiar enlace"}
            </Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.optionRow} onPress={handleWhatsApp}>
            <View style={[styles.optionIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <Text style={styles.optionLabel}>Enviar por WhatsApp</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.optionRow} onPress={handleInstagram}>
            <View style={[styles.optionIcon, { backgroundColor: "#FDE8F0" }]}>
              <Ionicons name="logo-instagram" size={22} color="#E1306C" />
            </View>
            <Text style={styles.optionLabel}>Compartir en Instagram</Text>
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  preview: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  previewIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#F0E4D7",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  previewName: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  options: {
    backgroundColor: Colors.white,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    overflow: "hidden",
  },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 16, padding: 18 },
  optionRowLink: { flexDirection: "row", alignItems: "center", gap: 16, padding: 18 },
  optionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  optionLabel: { fontSize: 16, fontWeight: "600", color: Colors.text },
  optionLabelLink: { fontSize: 16, fontWeight: "600", color: Colors.primary, textDecorationLine: "underline" },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },
  cancelBtn: { marginTop: 24, alignItems: "center", paddingVertical: 12 },
  cancelText: { fontSize: 15, color: Colors.primary, fontWeight: "600", textDecorationLine: "underline" },
});
