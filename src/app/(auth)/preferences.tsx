import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import Screen from "../../components/ui/Screen";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { Colors } from "../../constants/colors";

const OPCIONES = [
  { id: "abierto", label: "Abierto ahora" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "cowork", label: "Espacio cowork" },
  { id: "vegetal", label: "Leche vegetal" },
  { id: "sintacc", label: "Sin tacc" },
  { id: "vegano", label: "Vegano" },
  { id: "almuerzos", label: "Almuerzos" },
  { id: "brunch", label: "Brunch" },
  { id: "petfriendly", label: "Pet friendly" },
  { id: "expresso", label: "Expresso" },
  { id: "filtrado", label: "Filtrado" },
  { id: "aeropress", label: "Aeropress" },
];

export default function Preferences() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>☕</Text>
          </View>
          <Text style={styles.title}>¿Cuáles son tus preferencias?</Text>
        </View>

        <View style={styles.grid}>
          {OPCIONES.map(op => (
            <TouchableOpacity
              key={op.id}
              style={[styles.chip, selected.includes(op.id) && styles.chipSelected]}
              onPress={() => toggle(op.id)}
            >
              <Text style={[styles.chipText, selected.includes(op.id) && styles.chipTextSelected]}>
                {op.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            title="Guardar preferencias"
            onPress={() => router.push("/(auth)/location")}
            fullWidth
          />
          <TouchableOpacity onPress={() => router.push("/(auth)/location")}>
            <Text style={styles.skip}>Configurar más tarde</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 48, gap: 32 },
  header: { alignItems: "center", gap: 16 },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 44 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.primary, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.text },
  chipTextSelected: { color: Colors.white },
  footer: { gap: 16, alignItems: "center" },
  skip: { fontSize: 14, color: Colors.textLight, textDecorationLine: "underline" },
});
