import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Screen from "../../components/ui/Screen";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { Colors } from "../../constants/colors";

export default function Location() {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📍</Text>
          </View>
          <Text style={styles.title}>Descubrí qué hay{"\n"}cerca tuyo</Text>
          <Text style={styles.subtitle}>
            Accediendo a tu ubicación,{"\n"}te recomendaremos cafeterías cercanas.
          </Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            title="Compartir ubicación"
            onPress={() => router.replace("/(tabs)/")}
            fullWidth
          />
          <TouchableOpacity onPress={() => router.replace("/(tabs)/")}>
            <Text style={styles.skip}>Seleccionar manualmente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", paddingVertical: 64 },
  hero: { alignItems: "center", gap: 20 },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: "700", color: Colors.primary, textAlign: "center", lineHeight: 34 },
  subtitle: { fontSize: 15, color: Colors.textLight, textAlign: "center", lineHeight: 22 },
  footer: { gap: 16, alignItems: "center" },
  skip: { fontSize: 14, color: Colors.textLight, textDecorationLine: "underline" },
});
