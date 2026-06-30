import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export default function Logo({ size = "md" }: LogoProps) {
  const fontSize = size === "sm" ? 20 : size === "lg" ? 40 : 28;
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize }]}>buscafé</Text>
      <Text style={[styles.dot, { fontSize }]}>☕</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 6 },
  text: { color: Colors.primary, fontWeight: "700", letterSpacing: -0.5 },
  dot: {},
});
