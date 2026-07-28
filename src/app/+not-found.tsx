import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router, usePathname } from "expo-router";
import { Colors } from "../constants/colors";

export default function NotFound() {
  const path = usePathname();

  // Si llega desde un deep link de OAuth (auth/callback), navegar a tabs
  useEffect(() => {
    if (path.includes("auth/callback") || path === "/" || path === "") {
      router.replace("/(tabs)");
    }
  }, [path]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>☕</Text>
      <Text style={styles.title}>Página no encontrada</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.btnText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 18, fontWeight: "600", color: Colors.text, textAlign: "center" },
  btn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
