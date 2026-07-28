import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Platform, Linking,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import Screen from "../../components/ui/Screen";
import { Colors } from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

export default function Register() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signInWithGoogle, signInWithApple, loading } = useAuthStore();

  const handleEmailSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Campos requeridos", "Completá email y contraseña.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Contraseña muy corta", "Usá al menos 6 caracteres.");
      return;
    }
    const { error, autoLogin } = await signUp(email.trim().toLowerCase(), password, "");
    if (error) {
      Alert.alert("Error al registrarse", translateError(error));
    } else if (autoLogin) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "¡Cuenta creada!",
        "Revisá tu email para confirmar tu cuenta y después iniciá sesión.",
        [{ text: "Entendido", onPress: () => router.push("/(auth)/login") }]
      );
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
          <Text style={styles.title}>Creá tu cuenta</Text>
          <Text style={styles.subtitle}>Te ayudamos a descubrir experiencias</Text>
        </View>

        {/* Provider buttons */}
        <View style={styles.providers}>
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
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={14}
              style={styles.appleBtn}
              onPress={handleApple}
            />
          )}

          {!showEmailForm && (
            <TouchableOpacity
              style={[styles.providerBtn, styles.emailBtn]}
              onPress={() => setShowEmailForm(true)}
              disabled={loading}
            >
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              <Text style={[styles.providerBtnText, { color: Colors.primary }]}>
                Continuar con correo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Email form — aparece al seleccionar correo */}
        {showEmailForm && (
          <View style={styles.emailForm}>
            <TouchableOpacity style={styles.backToProviders} onPress={() => setShowEmailForm(false)}>
              <Feather name="arrow-left" size={16} color={Colors.textLight} />
              <Text style={styles.backToProvidersText}>Otras opciones</Text>
            </TouchableOpacity>

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
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleEmailSignUp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>Crear cuenta</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginText}>
              ¿Ya tenés cuenta? <Text style={styles.loginLink}>Iniciá sesión</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Al crear tu cuenta aceptás los{" "}
            <Text style={styles.termsLink}>Términos y Condiciones</Text>
            {" "}y la{" "}
            <Text style={styles.termsLink}>Política de privacidad</Text>
            {" "}de Buscafé.
          </Text>

          <TouchableOpacity onPress={() => Linking.openURL("mailto:hola@buscafe.app")}>
            <Text style={styles.supportText}>
              ¿Tenés problemas para registrarte?{"\n"}
              <Text style={styles.supportLink}>Comunicate a hola@buscafe.app</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Screen>
  );
}

function translateError(msg: string): string {
  if (msg.includes("already registered")) return "Este email ya tiene una cuenta registrada.";
  if (msg.includes("invalid email")) return "El email no es válido.";
  if (msg.includes("Password should")) return "La contraseña es muy corta (mínimo 6 caracteres).";
  if (msg.includes("500") || msg.includes("internal server error") || msg.includes("statusText")) {
    return "Ocurrió un error en el servidor. Intentá de nuevo en unos segundos.";
  }
  return "Ocurrió un error inesperado. Revisá tu conexión e intentá de nuevo.";
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 48, gap: 40 },

  header: { gap: 8 },
  title: { fontSize: 28, fontWeight: "700", color: Colors.primary, marginTop: 16 },
  subtitle: { fontSize: 15, color: Colors.textLight },

  providers: { gap: 12 },
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
  emailBtn: {
    borderColor: Colors.primary,
    borderStyle: "dashed",
  },
  providerBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  appleBtn: {
    width: "100%",
    height: 52,
  },

  emailForm: { gap: 16 },
  backToProviders: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backToProvidersText: { fontSize: 13, color: Colors.textLight },
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
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  footer: { gap: 16, alignItems: "center", marginTop: "auto" },
  loginText: { fontSize: 14, color: Colors.textLight },
  loginLink: { color: Colors.primary, fontWeight: "600" },
  terms: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: "500",
  },
  supportText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
  supportLink: {
    color: Colors.primary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
