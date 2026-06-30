import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

export default function Privacy() {
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  const handleDeleteAccount = () => {
    if (Platform.OS === "web") {
      const confirm = window.confirm("¿Estás segura de que querés eliminar tu cuenta? Esta acción no se puede deshacer.");
      if (confirm) router.replace("/onboarding");
    } else {
      Alert.alert(
        "Eliminar cuenta",
        "Esta acción es permanente y no se puede deshacer.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: () => router.replace("/onboarding") },
        ]
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Privacidad</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos y personalización</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Análisis de uso</Text>
                <Text style={styles.rowSub}>Ayudanos a mejorar la app compartiendo datos anónimos</Text>
              </View>
              <Switch value={analytics} onValueChange={setAnalytics} trackColor={{ false: Colors.border, true: Colors.secondary }} thumbColor={Colors.white} />
            </View>
            <View style={styles.sep} />
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Personalización</Text>
                <Text style={styles.rowSub}>Recomendaciones basadas en tus preferencias</Text>
              </View>
              <Switch value={personalization} onValueChange={setPersonalization} trackColor={{ false: Colors.border, true: Colors.secondary }} thumbColor={Colors.white} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.rowLabel}>Política de privacidad</Text>
              <Ionicons name="open-outline" size={18} color={Colors.textLight} />
            </TouchableOpacity>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.rowLabel}>Términos y condiciones</Text>
              <Ionicons name="open-outline" size={18} color={Colors.textLight} />
            </TouchableOpacity>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.rowLabel}>Gestión de cookies</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={handleDeleteAccount}>
              <Text style={[styles.rowLabel, { color: Colors.error }]}>Eliminar mi cuenta</Text>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>La eliminación de tu cuenta es permanente e irreversible. Todos tus datos serán borrados.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background, paddingHorizontal: 20, gap: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 24, color: Colors.text, marginTop: -2 },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.textLight },
  card: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, gap: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 18 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "600", color: Colors.text },
  rowSub: { fontSize: 14, color: Colors.textLight, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },
  hint: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
});
