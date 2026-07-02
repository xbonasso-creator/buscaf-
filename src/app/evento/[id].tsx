import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Platform, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CAFES } from "../../data/cafes";
import { Colors } from "../../constants/colors";

export default function EventoDetail() {
  const insets = useSafeAreaInsets();
  const { id, cafeId, cafeName } = useLocalSearchParams<{ id: string; cafeId: string; cafeName: string }>();

  const cafe = CAFES.find(c => c.id === cafeId);
  const evento = cafe?.eventos?.find(e => e.id === id);

  if (!evento || !cafe) {
    return (
      <View style={[s.wrapper, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: Colors.textLight }}>Evento no encontrado</Text>
      </View>
    );
  }

  const handleInstagram = () => {
    const url = `https://www.instagram.com/`;
    Linking.openURL(url);
  };

  const handleCalendar = () => {
    const title = encodeURIComponent(evento.titulo);
    const detail = encodeURIComponent(`${evento.descripcion} — ${cafe.name}`);
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${title}&details=${detail}`;
    Linking.openURL(url);
  };

  return (
    <View style={s.wrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <ImageBackground source={{ uri: evento.imagen }} style={[s.hero, { paddingTop: insets.top + 4 }]}>
          <View style={s.heroOverlay} />
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        </ImageBackground>

        {/* Card principal */}
        <View style={s.card}>
          {/* Fecha */}
          <View style={s.fechaRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={s.fecha}>{evento.fecha}</Text>
          </View>

          <Text style={s.titulo}>{evento.titulo}</Text>
          <Text style={s.cafeName}>{cafe.name}</Text>

          <View style={s.divider} />

          <Text style={s.desc}>{evento.descripcion}</Text>

          {/* Lugar */}
          <View style={s.infoRow}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={s.infoText}>{cafe.direccion}</Text>
          </View>

          {/* Precio — placeholder */}
          <View style={s.infoRow}>
            <Ionicons name="pricetag-outline" size={16} color={Colors.primary} />
            <Text style={s.infoText}>Gratis — cupos limitados</Text>
          </View>

          <View style={s.divider} />

          {/* Acciones */}
          <TouchableOpacity style={s.actionBtn} onPress={handleCalendar}>
            <Ionicons name="calendar" size={18} color={Colors.white} />
            <Text style={s.actionText}>Agregar a mi calendario</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.actionBtn, s.actionBtnOutline]} onPress={handleInstagram}>
            <Ionicons name="logo-instagram" size={18} color={Colors.primary} />
            <Text style={[s.actionText, s.actionTextOutline]}>Ir a Instagram</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.background },
  hero: { height: 260, justifyContent: "flex-start", padding: 16 },
  heroOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)" },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    marginTop: -20, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40,
    gap: 12,
  },
  fechaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  fecha: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  titulo: { fontSize: 22, fontWeight: "800", color: Colors.primary, lineHeight: 28 },
  cafeName: { fontSize: 14, color: Colors.textLight },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  desc: { fontSize: 15, color: Colors.text, lineHeight: 24 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14, color: Colors.text },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
  },
  actionBtnOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  actionText: { fontSize: 15, fontWeight: "700", color: Colors.white },
  actionTextOutline: { color: Colors.primary },
});
