import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore, ZONAS_MONTEVIDEO } from "../../store/locationStore";
import { Colors } from "../../constants/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function LocationPicker({ visible, onClose }: Props) {
  const { zone, setZone, clearZone } = useLocationStore();

  const handleZone = (label: string) => {
    setZone(label);
    onClose();
  };

  const handleGPS = () => {
    // TODO: reemplazar por Expo Location cuando esté disponible
    // import * as Location from "expo-location";
    // const { status } = await Location.requestForegroundPermissionsAsync();
    // if (status === "granted") { const loc = await Location.getCurrentPositionAsync(); ... }
    setZone("Mi ubicación actual");
    onClose();
  };

  const handleClear = () => {
    clearZone();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>¿Desde dónde buscás?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Opción GPS */}
          <TouchableOpacity style={styles.gpsBtn} onPress={handleGPS}>
            <View style={styles.gpsIcon}>
              <Ionicons name="navigate" size={20} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsBtnTitle}>Usar mi ubicación actual</Text>
              <Text style={styles.gpsBtnSub}>Requiere permiso de ubicación</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o elegí una zona</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Zonas fijas */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.zonasList}
          >
            {ZONAS_MONTEVIDEO.map((z) => {
              const selected = zone === z.label;
              return (
                <TouchableOpacity
                  key={z.id}
                  style={[styles.zonaItem, selected && styles.zonaItemActive]}
                  onPress={() => handleZone(z.label)}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={selected ? Colors.white : Colors.textLight}
                  />
                  <Text style={[styles.zonaLabel, selected && styles.zonaLabelActive]}>
                    {z.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} style={{ marginLeft: "auto" }} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Opción sin ubicación */}
            <TouchableOpacity style={styles.skipBtn} onPress={handleClear}>
              <Text style={styles.skipText}>Explorar sin ubicación</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 24, paddingVertical: 16,
  },
  title: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },

  // GPS
  gpsBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  gpsIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  gpsBtnTitle: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  gpsBtnSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },

  // Divider
  divider: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 24, marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textLight },

  // Zonas
  zonasList: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  zonaItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 13, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  zonaItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  zonaLabel: { fontSize: 15, color: Colors.text },
  zonaLabelActive: { color: Colors.white, fontWeight: "600" },

  // Skip
  skipBtn: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
  skipText: { fontSize: 14, color: Colors.textLight, textDecorationLine: "underline" },
});
