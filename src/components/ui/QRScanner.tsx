import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

type Props = {
  onScan: (data: string) => void;
  active: boolean;
};

// Native: placeholder — usar expo-camera en build nativo
export default function QRScanner({ onScan: _onScan, active: _active }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="camera-outline" size={48} color={Colors.textLight} />
      <Text style={styles.text}>Escáner disponible en la app nativa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#111",
    alignItems: "center", justifyContent: "center", gap: 16,
  },
  text: { color: "#666", fontSize: 14 },
});
