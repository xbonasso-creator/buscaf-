import { Text, StyleSheet, TextStyle } from "react-native";
import { Colors } from "../../constants/colors";
import { Typography as T } from "../../constants/typography";

type Variant = "h1" | "h2" | "h3" | "h4" | "body" | "bodySmall" | "caption" | "button";

type TypographyProps = {
  variant?: Variant;
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
};

export default function Typography({ variant = "body", color, style, children }: TypographyProps) {
  return (
    <Text style={[T[variant], { color: color ?? Colors.text }, style]}>
      {children}
    </Text>
  );
}
