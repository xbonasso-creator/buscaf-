import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Screen from "../../components/ui/Screen";
import { Colors } from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, loading } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Campos requeridos", "Completá todos los campos.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Contraseña muy corta", "Usá al menos 6 caracteres.");
      return;
    }
    const error = await signUp(email.trim().toLowerCase(), password, name.trim());
    if (error) {
      Alert.alert("Error al registrarse", translateError(error));
    } else {
      Alert.alert(
        "¡Cuenta creada!",
        "Revisá tu email para confirmar tu cuenta y después iniciá sesión.",
        [{ text: "Entendido", onPress: () => router.push("/(auth)/login") }]
      );
    }
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Creá tu cuenta</Text>
          <Text style={styles.subtitle}>Es gratis y lleva menos de un minuto</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

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
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginText}>
              ¿Ya tenés cuenta? <Text style={styles.loginLink}>Iniciá sesión</Text>
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
  return msg;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 48, gap: 40 },
  header: { gap: 8 },
  title: { fontSize: 28, fontWeight: "700", color: Colors.primary, marginTop: 16 },
  subtitle: { fontSize: 15, color: Colors.textLight },
  form: { gap: 16 },
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
  eyeIcon: {},
  footer: { gap: 16, alignItems: "center" },
  primaryBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginText: { fontSize: 14, color: Colors.textLight },
  loginLink: { color: Colors.primary, fontWeight: "600" },
});
