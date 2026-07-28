import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../../constants/colors";
import { getSucursalesByCadena } from "../../data/cafes";
import type { Cafe } from "../../data/cafes";

interface Props {
  cadenaId: string;
  currentId: string;
  currentName: string;
}

export default function SucursalesDropdown({ cadenaId, currentId, currentName }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [sucursales, setSucursales] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSucursalesByCadena(cadenaId, currentId).then(result => {
      setSucursales(result);
      setLoading(false);
    });
  }, [cadenaId, currentId]);

  if (loading || sucursales.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sucursales</Text>

      {/* Sucursal actual */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text style={styles.rowName} numberOfLines={1}>{currentName}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Aquí</Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.textLight}
        />
      </TouchableOpacity>

      {/* Otras sucursales */}
      {expanded && (
        <View style={styles.list}>
          {sucursales.map((s, i) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.row, i < sucursales.length - 1 && styles.rowBorder]}
              onPress={() => router.push(`/cafe/${s.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="location-outline" size={16} color={Colors.textLight} />
                <Text style={styles.rowNameOther} numberOfLines={1}>{s.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  rowName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    flex: 1,
  },
  rowNameOther: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
