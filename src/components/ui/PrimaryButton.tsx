import { Pressable, StyleSheet, Text } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4A2C2A",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 108,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
