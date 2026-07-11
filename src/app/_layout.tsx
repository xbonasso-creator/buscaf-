import { useEffect, Component, type ReactNode } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { useAuthStore } from "../store/authStore";
import { useCafesStore } from "../store/cafesStore";

// Error Boundary — captura crashes de render y muestra el error en pantalla
// en vez de cerrar la app completamente.
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <View style={eb.container}>
          <Text style={eb.title}>⚠️ Error</Text>
          <Text style={eb.msg}>{err.message}</Text>
          <Text style={eb.stack} numberOfLines={10}>{err.stack}</Text>
          <TouchableOpacity style={eb.btn} onPress={() => this.setState({ error: null })}>
            <Text style={eb.btnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
const eb = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#c00" },
  msg: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  stack: { fontSize: 11, color: "#666", fontFamily: "monospace", marginBottom: 24 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});

// Rutas que no requieren sesión
const PUBLIC_ROUTES = new Set(["index", "(auth)", "onboarding"]);

function AuthGuard() {
  const { session, initialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const seg0 = segments[0] as string | undefined;
    const isPublic = !seg0 || PUBLIC_ROUTES.has(seg0);

    if (!session && !isPublic) {
      router.replace("/");
    }
  }, [session, initialized, segments]);

  return null;
}

export default function RootLayout() {
  const { initialize } = useAuthStore();
  const { load: loadCafes } = useCafesStore();

  useEffect(() => {
    initialize();
    loadCafes();   // carga de Supabase en background; fallback al mock si falla
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
      <AuthGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="filters" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="cafe/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="cuponeras/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="cuponeras/scanner" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="quiero-ir" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="cafe-share" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="cafe-fotos" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="cafe-resenas" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="mis-cuponeras" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="scanner" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="settings/notifications" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="settings/privacy" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="settings/config" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="evento/[id]" options={{ animation: "slide_from_right" }} />
      </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
