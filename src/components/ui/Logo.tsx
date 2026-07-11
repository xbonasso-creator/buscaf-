import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import Isotipo from "./Isotipo";

type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export default function Logo({ size = "md" }: LogoProps) {
  const fontSize  = size === "sm" ? 18 : size === "lg" ? 38 : 26;
  const iconSize  = size === "sm" ? 28 : size === "lg" ? 52 : 38;
  return (
    <View style={styles.container}>
      <Isotipo size={iconSize} variant="mark" />
      <Text style={[styles.text, { fontSize }]}>buscafé</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 10 },
  text: { color: Colors.primary, fontWeight: "700", letterSpacing: -0.5 },
});
