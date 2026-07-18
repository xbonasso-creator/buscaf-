import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Modal, ScrollView } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";

const PRIVACY_POLICY = `Política de Privacidad de Buscafé

Última actualización: julio de 2026

1. Información que recopilamos
Buscafé recopila la información que vos nos proporcionás al crear una cuenta (nombre y correo electrónico), tu ubicación aproximada para mostrarte cafeterías cercanas (solo cuando la app está en uso), y tus interacciones dentro de la app como cafeterías favoritas y reseñas.

2. Cómo usamos tu información
Usamos tu información para brindarte el servicio de Buscafé, personalizar tu experiencia mostrándote cafeterías relevantes según tu barrio, y mejorar la aplicación en base a datos de uso anónimos y agregados.

3. Compartir información
No vendemos ni compartimos tu información personal con terceros con fines comerciales. Podemos compartir datos con proveedores de servicios que nos ayudan a operar la plataforma (como Supabase para almacenamiento), bajo estrictos acuerdos de confidencialidad.

4. Seguridad
Implementamos medidas técnicas y organizativas para proteger tu información. Tu contraseña se almacena de forma encriptada y nunca tenemos acceso a ella.

5. Tus derechos
Tenés derecho a acceder, corregir o eliminar tu información personal en cualquier momento desde la sección de configuración de la app. También podés solicitar la eliminación completa de tu cuenta y todos tus datos.

6. Retención de datos
Conservamos tu información mientras tu cuenta esté activa. Al eliminar tu cuenta, borramos tus datos personales en un plazo de 30 días, salvo obligación legal de conservarlos.

7. Contacto
Si tenés preguntas sobre esta política de privacidad, podés contactarnos en: info@buscafe.app`;

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


export default function Privacy() {
  const insets = useSafeAreaInsets();
  const [modal, setModal] = useState<"privacy" | "terms" | null>(null);

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

  const modalText = modal === "privacy" ? PRIVACY_POLICY : TERMS_AND_CONDITIONS;
  const modalTitle = modal === "privacy" ? "Política de privacidad" : "Términos y condiciones";

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Privacidad</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={() => setModal("privacy")}>
              <Text style={styles.rowLabel}>Política de privacidad</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.linkRow} onPress={() => setModal("terms")}>
              <Text style={styles.rowLabel}>Términos y condiciones</Text>
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

      {/* Modal legal text */}
      <Modal visible={!!modal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalWrapper, { paddingTop: insets.top + 8 }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setModal(null)}>
              <Ionicons name="close" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{modalTitle}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalText}>{modalText}</Text>
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
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, gap: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 18 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "600", color: Colors.text },
  rowSub: { fontSize: 14, color: Colors.textLight, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },
  hint: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
  modalWrapper: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalContent: { paddingVertical: 24, paddingBottom: 48 },
  modalText: { fontSize: 15, color: Colors.text, lineHeight: 24 },
});
