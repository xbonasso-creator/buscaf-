import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";

type ToggleRowProps = { label: string; sub: string; value: boolean; onToggle: () => void };

function ToggleRow({ label, sub, value, onToggle }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.secondary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [digest, setDigest] = useState(true);
  const [promos, setPromos] = useState(true);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notificaciones</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas</Text>
          <View style={styles.card}>
            <ToggleRow
              label="Notificaciones push"
              sub="Recibí alertas en tu dispositivo"
              value={push}
              onToggle={() => setPush(v => !v)}
            />
            <View style={styles.sep} />
            <ToggleRow
              label="Notificaciones por email"
              sub="Novedades y actualizaciones importantes"
              value={email}
              onToggle={() => setEmail(v => !v)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contenido</Text>
          <View style={styles.card}>
            <ToggleRow
              label="Resumen semanal"
              sub="Nuevas cafeterías en tu zona cada semana"
              value={digest}
              onToggle={() => setDigest(v => !v)}
            />
            <View style={styles.sep} />
            <ToggleRow
              label="Descuentos y promociones"
              sub="Ofertas especiales de cafeterías afiliadas"
              value={promos}
              onToggle={() => setPromos(v => !v)}
            />
          </View>
        </View>

        <Text style={styles.hint}>
          Podés cambiar los permisos de notificaciones en cualquier momento desde la configuración de tu dispositivo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background, paddingHorizontal: 20, gap: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 24, color: Colors.text, marginTop: -2 },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.textLight },
  card: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, gap: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "600", color: Colors.text },
  rowSub: { fontSize: 14, color: Colors.textLight, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },
  hint: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
});
