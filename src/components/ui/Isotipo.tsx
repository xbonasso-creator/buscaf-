/**
 * Isotipo — marca de Buscafé.
 * Copa de café con pin de ubicación encima, sobre círculo espresso oscuro.
 * Coincide con el ícono del splash y la referencia de marca.
 *
 * variant="mark"  → círculo oscuro #4a2c2a + copa y pin #c8a882/#faf7f2
 * variant="light" → círculo transparente + copa en #4a2c2a (para fondos claros)
 */
import { Image, View } from "react-native";
import { Colors } from "../../constants/colors";

type Props = {
  size?: number;
  variant?: "mark" | "light";
};

export default function Isotipo({ size = 40, variant = "mark" }: Props) {
  const bg      = variant === "mark" ? Colors.primary   : "none";
  const stroke  = variant === "mark" ? Colors.background : Colors.primary;
  const fill    = variant === "mark" ? Colors.secondary  : Colors.primary;
  const pinFill = variant === "mark" ? Colors.secondary  : Colors.primary;
  const pinHole = variant === "mark" ? Colors.primary    : Colors.background;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="${bg}"/>

  <!-- Pin de ubicación -->
  <path d="M50 11 C43 11 37 17 37 24 C37 34 50 45 50 45 C50 45 63 34 63 24 C63 17 57 11 50 11 Z" fill="${pinFill}"/>
  <circle cx="50" cy="23" r="5" fill="${pinHole}"/>

  <!-- Taza: rim superior -->
  <rect x="26" y="44" width="48" height="5" rx="2.5" fill="${stroke}" opacity="0.9"/>

  <!-- Taza: cuerpo con fondo redondeado -->
  <path d="M28.5 49 L71.5 49 L68.5 74 Q68.5 77.5 65 77.5 L35 77.5 Q31.5 77.5 31.5 74 Z" fill="none" stroke="${stroke}" stroke-width="2.5"/>

  <!-- Café dentro (fill tan, parte inferior) -->
  <path d="M30 63 L70 63 L67.5 74 Q67.5 76 65 76 L35 76 Q32.5 76 32.5 74 Z" fill="${fill}" opacity="0.75"/>

  <!-- Asa -->
  <path d="M71.5 55 Q82 55 82 63 Q82 71 71.5 71" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Platito -->
  <rect x="22" y="78" width="56" height="4" rx="2" fill="${fill}" opacity="0.5"/>
</svg>`;

  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
      <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}
