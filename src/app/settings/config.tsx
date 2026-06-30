import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

const APP_VERSION = "1.0.0 (beta)";

type RowProps = { label: string; value?: string; icon?: React.ComponentProps<typeof Ionicons>["name"]; onPress?: () => void; danger?: boolean };

function Row({ label, value, icon = "chevron-forward", onPress, danger }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={[styles.rowLabel, danger && { color: Colors.error }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Ionicons name={icon} size={18} color={danger ? Colors.error : Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

export default function Config() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Configuración</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.card}>
            <Row label="Idioma" value="Español" />
            <View style={styles.sep} />
            <Row label="Zona horaria" value="GMT-3" />
            <View style={styles.sep} />
            <Row label="Mis preferencias de café" onPress={() => router.push("/(auth)/preferences")} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <View style={styles.card}>
            <Row label="Centro de ayuda" icon="open-outline" />
            <View style={styles.sep} />
            <Row label="Reportar un problema" icon="bug-outline" />
            <View style={styles.sep} />
            <Row label="Sugerencias" icon="chatbubble-outline" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <Row label="Términos de servicio" icon="open-outline" />
            <View style={styles.sep} />
            <Row label="Licencias de terceros" icon="open-outline" />
          </View>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Buscafé {APP_VERSION}</Text>
          <Text style={styles.versionSub}>Hecho con ☕ — todos los derechos reservados</Text>
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
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 18 },
  rowLabel: { fontSize: 16, fontWeight: "500", color: Colors.text },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowValue: { fontSize: 14, color: Colors.textLight },
  sep: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },
  versionContainer: { alignItems: "center", gap: 4, paddingBottom: 32 },
  versionText: { fontSize: 14, fontWeight: "600", color: Colors.textLight },
  versionSub: { fontSize: 14, color: Colors.border },
});
