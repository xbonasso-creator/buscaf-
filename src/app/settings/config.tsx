import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, ScrollView } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";

const TERMS_AND_CONDITIONS = `Términos y Condiciones de Buscafé

Última actualización: julio de 2026

1. Aceptación
Al usar Buscafé aceptás estos Términos. Si no estás de acuerdo, por favor no uses la aplicación.

2. Descripción del servicio
Buscafé es una plataforma para descubrir cafeterías de especialidad en Montevideo. Mostramos información provista por los propios establecimientos y por nuestra comunidad de usuarios.

3. Tu cuenta
Sos responsable de mantener la confidencialidad de tu cuenta y contraseña. Notificanos de inmediato si detectás uso no autorizado de tu cuenta.

4. Contenido del usuario
Al publicar reseñas o fotos, nos otorgás una licencia no exclusiva para usar ese contenido dentro de Buscafé. Sos responsable de que el contenido que publicás sea verdadero y no viole derechos de terceros.

5. Conducta aceptable
Está prohibido usar Buscafé para publicar contenido falso o engañoso, acosar a otros usuarios, o intentar acceder de forma no autorizada a nuestros sistemas.

6. Exactitud de la información
La información sobre cafeterías (horarios, servicios, precios) puede no estar siempre actualizada. Recomendamos confirmar con el establecimiento antes de visitar.

7. Limitación de responsabilidad
Buscafé no se hace responsable de inexactitudes en la información de cafeterías ni de experiencias durante tus visitas.

8. Modificaciones
Podemos actualizar estos Términos en cualquier momento. Te notificaremos sobre cambios significativos a través de la app.

9. Contacto
Para consultas sobre estos Términos: info@buscafe.app`;

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
  const insets = useSafeAreaInsets();
  const [showTerms, setShowTerms] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Configuración</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Row label="Idioma" value="Español" />
            <View style={styles.sep} />
            <Row label="Zona horaria" value="GMT-3" />
            <View style={styles.sep} />
            <Row label="Términos de servicio" icon="chevron-forward" onPress={() => setShowTerms(true)} />
          </View>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Buscafé {APP_VERSION}</Text>
          <Text style={styles.versionSub}>Hecho con ☕ — todos los derechos reservados</Text>
        </View>
      </View>

      {/* T&C Modal */}
      <Modal visible={showTerms} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalWrapper, { paddingTop: insets.top + 8 }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowTerms(false)}>
              <Ionicons name="close" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Términos de servicio</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalText}>{TERMS_AND_CONDITIONS}</Text>
          </ScrollView>
        </View>
      </Modal>
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
  modalWrapper: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalContent: { paddingVertical: 24, paddingBottom: 48 },
  modalText: { fontSize: 15, color: Colors.text, lineHeight: 24 },
});
