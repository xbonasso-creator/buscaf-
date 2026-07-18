/**
 * Pantalla de filtros con draft state.
 * Los cambios se aplican al store SOLO al presionar "Aplicar filtros".
 * Salir con el botón back descarta el draft y preserva el estado anterior.
 */
import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useFiltersStore } from "../store/filtersStore";
import { Colors } from "../constants/colors";

const OPTION_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  "Abierto ahora":        "time-outline",
  "Mejor calificados":    "star-outline",
  "Terraza":              "sunny-outline",
  "Pet friendly":         "paw-outline",
  "Gluten free":          "medical-outline",
  "Leche vegetal":        "cafe-outline",
  "Veggie":               "leaf-outline",
  "Brunch":               "restaurant-outline",
  "Almuerzos":            "restaurant-outline",
  "Take away":            "bag-handle-outline",
  "Pastelería":           "color-palette-outline",
  "Librería":             "book-outline",
  "Eventos":              "calendar-outline",
  "Tienda":               "bag-outline",
  "Buen WiFi":            "wifi-outline",
  "Enchufes":             "flash-outline",
  "Sillas cómodas":       "easel-outline",
  "Mesas amplias":        "grid-outline",
  "Silencioso":           "volume-mute-outline",
  "Espresso":             "cafe-outline",
  "V60":                  "funnel-outline",
  "Chemex":               "flask-outline",
  "Aeropress":            "flask-outline",
  "Cold brew":            "snow-outline",
  "Prensa francesa":      "cafe-outline",
};

const SORT_OPTIONS = ["Abierto ahora", "Mejor calificados"];

const FILTER_SECTIONS = [
  {
    title: "Teletrabajo",
    options: ["Silencioso", "Enchufes", "Sillas cómodas", "Buen WiFi", "Mesas amplias"],
  },
  {
    title: "Servicios",
    options: ["Pet friendly", "Terraza", "Take away", "Gluten free", "Leche vegetal", "Veggie", "Brunch", "Almuerzos", "Pastelería", "Librería", "Eventos", "Tienda"],
  },
  {
    title: "Métodos",
    options: ["Espresso", "V60", "Chemex", "Aeropress", "Cold brew", "Prensa francesa"],
  },
];

export default function Filters() {
  const insets = useSafeAreaInsets();
  const { active, setFilters } = useFiltersStore();

  const [draftActive, setDraftActive] = useState<string[]>(active);

  const toggleDraft = (opt: string) =>
    setDraftActive(prev =>
      prev.includes(opt) ? prev.filter(f => f !== opt) : [...prev, opt]
    );

  const clearDraft = () => {
    setDraftActive([]);
  };

  const apply = () => {
    setFilters(draftActive, null, null);
    router.back();
  };

  const draftCount = draftActive.length;

  return (
    <View style={s.wrapper}>
      <View style={s.container}>

        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Filtros</Text>
          <TouchableOpacity onPress={clearDraft}>
            <Text style={s.clearText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        {/* Scroll — sin CTA adentro */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

          {/* Ordenar por — ancho natural (solo 2 opciones) */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ordenar por</Text>
            <View style={s.chipRowAuto}>
              {SORT_OPTIONS.map(opt => {
                const isActive = draftActive.includes(opt);
                const icon = OPTION_ICONS[opt];
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[s.chipAuto, isActive && s.chipActive]}
                    onPress={() => toggleDraft(opt)}
                  >
                    {icon && <Ionicons name={icon} size={14} color={isActive ? "#fff" : Colors.primary} />}
                    <Text style={[s.chipText, isActive && s.chipTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Secciones — grid 3 columnas */}
          {FILTER_SECTIONS.map(section => (
            <View key={section.title} style={s.section}>
              <Text style={s.sectionTitle}>{section.title}</Text>
              <View style={s.chipGrid}>
                {section.options.map(opt => {
                  const isActive = draftActive.includes(opt);
                  const icon = OPTION_ICONS[opt];
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[s.chipCell, isActive && s.chipActive]}
                      onPress={() => toggleDraft(opt)}
                    >
                      {icon && <Ionicons name={icon} size={14} color={isActive ? "#fff" : Colors.primary} />}
                      <Text style={[s.chipText, isActive && s.chipTextActive]} numberOfLines={1}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

        </ScrollView>

        {/* CTA fijo — siempre visible, no requiere scroll */}
        <View style={[s.ctaBar, { paddingBottom: insets.bottom + 16 }]}>
          <PrimaryButton
            title={draftCount > 0 ? `Aplicar ${draftCount} filtro${draftCount > 1 ? "s" : ""}` : "Aplicar filtros"}
            onPress={apply}
          />
        </View>

      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background,
    alignItems: "center",
  },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.primary },
  clearText: { fontSize: 14, color: Colors.textLight, textDecorationLine: "underline" },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, gap: 28 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.primary },

  // Sort: ancho natural
  chipRowAuto: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chipAuto: {
    height: 38, paddingHorizontal: 14, borderRadius: 19,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
    flexDirection: "row", alignItems: "center", gap: 6,
  },

  // Grid: 3 por fila
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipCell: {
    width: "31%",
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
  },

  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.text, flexShrink: 1 },
  chipTextActive: { color: Colors.white },

  // CTA fijo en el bottom
  ctaBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
