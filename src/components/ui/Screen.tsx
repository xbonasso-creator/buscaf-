import { SafeAreaView, ScrollView, StyleSheet, View, ViewStyle, Platform } from "react-native";
import { Colors } from "../../constants/colors";

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export default function Screen({ children, scroll = false, style }: ScreenProps) {
  const inner = scroll ? (
    <ScrollView contentContainerStyle={[styles.scroll, style]} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.inner, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.frame}>{inner}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
  frame: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: 24 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
});
