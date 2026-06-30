import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import type { Cafe } from "../../data/cafes";

type Props = { cafes: Cafe[]; height?: number };

// Native placeholder — mapa solo disponible en la versión web por ahora
export default function MapboxMap({ height = 500 }: Props) {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.text}>Mapa disponible en la versión web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8E4DC",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 15, color: Colors.textLight },
});
