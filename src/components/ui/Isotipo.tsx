import { Image, View } from "react-native";
import { Colors } from "../../constants/colors";

type Props = {
  size?: number;
  variant?: "mark" | "light";
};

export default function Isotipo({ size = 40, variant = "mark" }: Props) {
  if (variant === "light") {
    return (
      <Image
        source={require("../../../assets/images/isotipo.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  // variant="mark": círculo oscuro de fondo (para usar sobre fondos claros)
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Image
        source={require("../../../assets/images/isotipo.png")}
        style={{ width: size * 0.78, height: size * 0.78 }}
        resizeMode="contain"
      />
    </View>
  );
}
