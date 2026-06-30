/**
 * ProgressDots — transición progresiva entre steps.
 *
 * Al montar, el dot del step ANTERIOR arranca en 24px (activo)
 * y anima hacia 8px (inactivo), mientras el dot ACTUAL parte de 8px
 * y crece hasta 24px. Ambos animan en paralelo con spring, dando la
 * sensación de que el "peso" se transfiere suavemente de un dot al otro.
 */
import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Colors } from "../../constants/colors";

type ProgressDotsProps = {
  total: number;
  current: number;
};

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  // El dot anterior arranca ancho (simula que venía de ser activo)
  const prev = current > 0 ? current - 1 : -1;

  const dotWidths = useRef(
    Array.from({ length: total }).map((_, i) => {
      if (i === prev) return new Animated.Value(24); // venía activo
      return new Animated.Value(8);                  // todos los demás empiezan chicos
    })
  ).current;

  useEffect(() => {
    // Todos los dots animan simultáneamente hacia su estado final
    const anims = dotWidths.map((w, i) =>
      Animated.spring(w, {
        toValue: i === current ? 24 : 8,
        friction: 5,
        tension: 70,
        useNativeDriver: false, // width no soporta native driver
      })
    );
    Animated.parallel(anims).start();
  }, []); // corre solo al montar; cada screen es un nuevo mount

  return (
    <View style={styles.row}>
      {dotWidths.map((widthAnim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            { width: widthAnim },
            i === current ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: { height: 8, borderRadius: 4 },
  active: { backgroundColor: Colors.primary },
  inactive: { backgroundColor: Colors.border },
});
