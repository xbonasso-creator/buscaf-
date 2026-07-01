import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { useAuthStore } from "../store/authStore";

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

  useEffect(() => {
    initialize();
  }, []);

  return (
    <SafeAreaProvider>
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
      </Stack>
    </SafeAreaProvider>
  );
}
