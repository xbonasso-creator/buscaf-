import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import Screen from "../../components/ui/Screen";
import { Colors } from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, signInWithApple, resetPassword, loading } = useAuthStore();
  const [resetLoading, setResetLoading] = useState(false);

  const handleForgotPassword = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert("Ingresá tu email", "Escribí tu email en el campo de arriba y después tocá '¿Olvidaste tu contraseña?'.");
      return;
    }
    setResetLoading(true);
    const error = await resetPassword(trimmed);
    setResetLoading(false);
    if (error) {
      Alert.alert("Error", "No pudimos enviar el email. Verificá que el email sea correcto.");
    } else {
      Alert.alert(
        "Email enviado ✓",
        `Te mandamos un link para restablecer tu contraseña a ${trimmed}. Revisá tu bandeja de entrada.`
      );
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Campos requeridos", "Completá email y contraseña.");
      return;
    }
    const error = await signIn(email.trim().toLowerCase(), password);
    if (error) {
      Alert.alert("Error al iniciar sesión", translateError(error));
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleGoogle = async () => {
    const error = await signInWithGoogle();
    if (error) Alert.alert("Error", error);
    else router.replace("/(tabs)");
  };

  const handleApple = async () => {
    const error = await signInWithApple();
    if (error) Alert.alert("Error", error);
    else router.replace("/(tabs)");
  };

  return (
    <Screen scroll>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Iniciá sesión para continuar</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Tu contraseña"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleForgotPassword} disabled={resetLoading}>
            <Text style={styles.forgot}>
              {resetLoading ? "Enviando..." : "¿Olvidaste tu contraseña?"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CTA principal */}
        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
          }
        </TouchableOpacity>

        {/* Divisor */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Opciones sociales */}
        <View style={styles.social}>
          <TouchableOpacity
            style={styles.providerBtn}
            onPress={handleGoogle}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.providerBtnText}>Continuar con Google</Text>
          </TouchableOpacity>

          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={14}
              style={styles.appleBtn}
              onPress={handleApple}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerText}>
              ¿No tenés cuenta? <Text style={styles.registerLink}>Registrate</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Screen>
  );
}

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos.";
  if (msg.includes("Email not confirmed")) return "Confirmá tu email antes de iniciar sesión.";
  if (msg.includes("too many requests")) return "Demasiados intentos. Esperá unos minutos.";
  return "Ocurrió un error inesperado. Revisá tu conexión e intentá de nuevo.";
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 48, gap: 24 },

  header: { gap: 4 },
  title: { fontSize: 26, fontWeight: "700", color: Colors.primary, marginTop: 16 },

  form: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.text },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    fontSize: 15,
    color: Colors.text,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 10 },
  forgot: { fontSize: 13, color: Colors.primary, textAlign: "right" },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.textLight },

  social: { gap: 12 },
  providerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 15,
    backgroundColor: Colors.white,
  },
  providerBtnText: { fontSize: 15, fontWeight: "600", color: Colors.text },
  appleBtn: { width: "100%", height: 52 },

  footer: { alignItems: "center", marginTop: 8 },
  registerText: { fontSize: 14, color: Colors.textLight },
  registerLink: { color: Colors.primary, fontWeight: "600" },
});
