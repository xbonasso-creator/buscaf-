import { View, Text } from "react-native";
import Screen from "../../components/ui/Screen";
import { Colors } from "../../constants/colors";

export default function Map() {
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 16, color: Colors.textLight }}>Mapa — próximamente</Text>
      </View>
    </Screen>
  );
}
