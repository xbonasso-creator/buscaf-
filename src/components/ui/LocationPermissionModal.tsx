import { useState } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore, nearestZone } from "../../store/locationStore";
import { Colors } from "../../constants/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function LocationPermissionModal({ visible, onClose }: Props) {
  const { setZone, markPermissionAsked } = useLocationStore();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    markPermissionAsked();

    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const zona = nearestZone(pos.coords.latitude, pos.coords.longitude);
            setZone(zona);
            setLoading(false);
            onClose();
          },
          () => {
            // Si el usuario deniega el permiso del browser, cerramos sin zona
            setLoading(false);
            onClose();
          },
          { timeout: 8000 }
        );
      } else {
        // Native: placeholder hasta integrar expo-location
        setLoading(false);
        onClose();
      }
    } catch {
      setLoading(false);
      onClose();
    }
  };

  const handleSkip = () => {
    markPermissionAsked();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icono */}
          <View style={styles.iconWrap}>
            <View style={styles.iconOuter}>
              <Ionicons name="location" size={36} color={Colors.primary} />
            </View>
          </View>

          {/* Texto */}
          <Text style={styles.title}>Encontrá cafés cerca tuyo</Text>
          <Text style={styles.subtitle}>
            Te mostramos los cafecitos que estén más cerca.
          </Text>

          {/* CTAs */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleAccept}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Aceptar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={handleSkip}>
            <Text style={styles.btnSecondaryText}>Ahora no</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 36,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 0,
  },
  iconWrap: {
    marginBottom: 20,
  },
  iconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5E6E0",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  btnPrimary: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  btnSecondary: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textLight,
  },
});
