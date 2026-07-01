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

const OPTION_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  "Abierto ahora":    "time-outline",
  "Mejor calificados":"star-outline",
  "Más cercanos":     "location-outline",
  "Cafetería":        "cafe-outline",
  "Pastelería":       "storefront-outline",
  "Bistró":           "wine-outline",
  "Con terraza":      "sunny-outline",
  "Pet friendly":     "paw-outline",
  "Descuentos":       "pricetag-outline",
  "Wi-Fi":            "wifi-outline",
  "Cowork":           "laptop-outline",
  "Veggie":           "leaf-outline",
  "Sin TACC":         "medical-outline",
  "Leche vegetal":    "cafe-outline",
  "Brunch":           "restaurant-outline",
  "Desayunos":        "sunny-outline",
  "Almuerzos":        "restaurant-outline",
  "Latte art":        "color-palette-outline",
  "Espresso":         "cafe-outline",
  "V60":              "funnel-outline",
  "Chemex":           "flask-outline",
  "Aeropress":        "flask-outline",
  "French press":     "cafe-outline",
  "Moka":             "flame-outline",
  "Cold brew":        "snow-outline",
  "Filtrado":         "funnel-outline",
  "$ Económico":      "cash-outline",
  "$$ Moderado":      "card-outline",
  "$$$ Premium":      "diamond-outline",
};
import PrimaryButton from "../components/ui/PrimaryButton";
import { useFiltersStore } from "../store/filtersStore";
import { Colors } from "../constants/colors";

const SORT_OPTIONS = ["Abierto ahora", "Mejor calificados", "Más cercanos"];

const FILTER_SECTIONS = [
  {
    title: "Tipo de local",
    options: ["Cafetería", "Pastelería", "Bistró", "Con terraza", "Pet friendly", "Descuentos"],
  },
  {
    title: "Servicios",
    options: ["Wi-Fi", "Cowork", "Veggie", "Sin TACC", "Leche vegetal", "Brunch", "Desayunos", "Almuerzos", "Latte art"],
  },
  {
    title: "Métodos",
    options: ["Espresso", "V60", "Chemex", "Aeropress", "French press", "Moka", "Cold brew", "Filtrado"],
  },
  { title: "Precios", options: ["$ Económico", "$$ Moderado", "$$$ Premium"] },
];

export default function Filters() {
  const insets = useSafeAreaInsets();
  const { active, price, setFilters } = useFiltersStore();

  // Draft — copia local del estado al abrir la pantalla
  const [draftActive, setDraftActive] = useState<string[]>(active);
  const [draftPrice, setDraftPrice]   = useState<string | null>(price);

  const toggleDraft = (opt: string) =>
    setDraftActive(prev =>
      prev.includes(opt) ? prev.filter(f => f !== opt) : [...prev, opt]
    );

  const toggleDraftPrice = (opt: string) =>
    setDraftPrice(prev => (prev === opt ? null : opt));

  const clearDraft = () => {
    setDraftActive([]);
    setDraftPrice(null);
  };

  const apply = () => {
    setFilters(draftActive, draftPrice);
    router.back();
  };

  const draftCount = draftActive.length + (draftPrice ? 1 : 0);

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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

          {/* Ordenar por */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ordenar por</Text>
            <View style={s.chipRow}>
              {SORT_OPTIONS.map(opt => {
                const isActive = draftActive.includes(opt);
                const icon = OPTION_ICONS[opt];
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[s.chip, isActive && s.chipActive]}
                    onPress={() => toggleDraft(opt)}
                  >
                    {icon && <Ionicons name={icon} size={14} color={isActive ? "#fff" : Colors.primary} />}
                    <Text style={[s.chipText, isActive && s.chipTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Secciones */}
          {FILTER_SECTIONS.map(section => (
            <View key={section.title} style={s.section}>
              <Text style={s.sectionTitle}>{section.title}</Text>
              <View style={s.chipRow}>
                {section.options.map(opt => {
                  const isPrecios = section.title === "Precios";
                  const isActive  = isPrecios ? draftPrice === opt : draftActive.includes(opt);
                  const icon = OPTION_ICONS[opt];
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[s.chip, isActive && s.chipActive]}
                      onPress={() => isPrecios ? toggleDraftPrice(opt) : toggleDraft(opt)}
                    >
                      {icon && <Ionicons name={icon} size={14} color={isActive ? "#fff" : Colors.primary} />}
                      <Text style={[s.chipText, isActive && s.chipTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={s.footer}>
            <PrimaryButton
              title={draftCount > 0 ? `Aplicar ${draftCount} filtro${draftCount > 1 ? "s" : ""}` : "Aplicar filtros"}
              onPress={apply}
              fullWidth
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background,
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
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 28 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    height: 38, paddingHorizontal: 14, borderRadius: 19,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.text },
  chipTextActive: { color: Colors.white },
  footer: { marginTop: 4 },
});
