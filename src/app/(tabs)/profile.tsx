import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useCuponerasStore } from "../../store/cuponerasStore";
import { useQuieroIrStore } from "../../store/quieroIrStore";
import { useAuthStore } from "../../store/authStore";
import { useProfileStore } from "../../store/profileStore";
import { Colors } from "../../constants/colors";

type SettingRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
};

function SettingRow({ icon, label, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { favorites } = useFavoritesStore();
  const { cuponeras } = useCuponerasStore();
  const { items: quieroIr } = useQuieroIrStore();
  const { user, signOut } = useAuthStore();
  const { avatarUrl, uploading, uploadAvatar } = useProfileStore();

  const displayName = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "Usuario";
  const displayEmail = user?.email ?? "";

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos para cambiar el avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const error = await uploadAvatar(result.assets[0].uri);
      if (!error) Alert.alert("¡Listo!", "Tu foto de perfil fue actualizada.");
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Avatar + datos */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar} disabled={uploading}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={48} color={Colors.border} />
              )}
              {uploading && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color={Colors.white} />
                </View>
              )}
            </View>
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statChip} onPress={() => router.push("/(tabs)/favorites")}>
            <Text style={styles.statLabel}>Favoritos</Text>
            <Text style={styles.statValue}>{favorites.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statChip} onPress={() => router.push("/mis-cuponeras")}>
            <Text style={styles.statLabel}>Mis cuponeras</Text>
            <Text style={styles.statValue}>{cuponeras.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statChip} onPress={() => router.push("/quiero-ir")}>
            <Text style={styles.statLabel}>Quiero ir</Text>
            <Text style={styles.statValue}>{quieroIr.length}</Text>
          </TouchableOpacity>
        </View>

        {/* Ajustes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes</Text>
          <View style={styles.settingsCard}>
            <SettingRow icon="notifications-outline" label="Notificaciones" onPress={() => router.push("/settings/notifications")} />
            <View style={styles.separator} />
            <SettingRow icon="lock-closed-outline" label="Privacidad" onPress={() => router.push("/settings/privacy")} />
            <View style={styles.separator} />
            <SettingRow icon="settings-outline" label="Otras configuraciones" onPress={() => router.push("/settings/config")} />
          </View>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await signOut();
            router.replace("/");
          }}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
          <Ionicons name="log-out-outline" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? "#E8E0D5" : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background, paddingHorizontal: 20, gap: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 24, color: Colors.text, marginTop: -2 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  profileSection: { flexDirection: "row", alignItems: "center", gap: 20 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.background,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 44, backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: Colors.white,
  },
  userInfo: { gap: 6 },
  userName: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  userEmail: { fontSize: 14, color: Colors.textLight },
  statsRow: { flexDirection: "row", gap: 10 },
  statChip: {
    flex: 1, backgroundColor: "#F5E6E0",
    borderRadius: 14, paddingVertical: 14, alignItems: "center", gap: 6,
  },
  statLabel: { fontSize: 14, color: Colors.primary, textAlign: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  settingsCard: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 18 },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  settingLabel: { fontSize: 16, color: Colors.text },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 18 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.secondary, borderRadius: 14, paddingVertical: 16,
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: Colors.white },
});
