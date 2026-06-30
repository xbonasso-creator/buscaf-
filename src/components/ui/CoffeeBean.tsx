/**
 * CoffeeBean — grano de café con curva S real.
 * En web usa un SVG inline via data URI.
 * En native cae a un óvalo simple (fallback).
 */
import { Image, Platform, View } from "react-native";
import { Colors } from "../../constants/colors";

type Props = {
  /** Ancho en px (alto = ancho × 0.65) */
  size?: number;
  beanColor?: string;
  creaseColor?: string;
};

export default function CoffeeBean({
  size = 22,
  beanColor = Colors.secondary,
  creaseColor = Colors.primary,
}: Props) {
  const w = size;
  const h = Math.round(size * 0.65);

  if (Platform.OS === "web") {
    // Curva S real: la línea interior va de arriba al centro (dobla izquierda)
    // y del centro abajo (dobla derecha), como un grano real.
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 65">`,
      `<ellipse cx="50" cy="32" rx="46" ry="29" fill="${beanColor}"/>`,
      `<path d="M 50 4 C 24 12 24 26 50 32 C 76 38 76 52 50 61"`,
      ` stroke="${creaseColor}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
      `</svg>`,
    ].join("");

    const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    return (
      <Image
        source={{ uri }}
        style={{ width: w, height: h }}
        resizeMode="contain"
      />
    );
  }

  // Native fallback
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: w / 2,
        backgroundColor: beanColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          left: w / 2 - 0.75,
          top: 0,
          width: 1.5,
          height: "100%",
          backgroundColor: creaseColor,
          opacity: 0.45,
        }}
      />
    </View>
  );
}
