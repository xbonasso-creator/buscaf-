/**
 * Onboarding — pantalla única con transición fluida entre pasos.
 *
 * Layout fijo durante toda la experiencia. Solo animan:
 *   - Ilustración: fade + scale sutil
 *   - Título + descripción: fade + translateX (slide horizontal)
 *   - Dots: interpolación continua via stepAnim (un único Animated.Value)
 *
 * Footer (dots + botón) y nav buttons quedan absolutamente posicionados
 * y nunca se re-renderizan.
 */
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

const P = Colors.primary;
const S = Colors.secondary;
const C = Colors.background;
const ILL_BG = "#F0E4D7";

const { height: SH } = Dimensions.get("window");
const ILL_H = Math.min(Math.round(SH * 0.48), 340);

const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN  = Easing.in(Easing.ease);

// ── Ilustraciones ─────────────────────────────────────────────────

function IllStep1() {
  return (
    <View style={ill.wrap}>
      <View style={ill.circle}>
        <View style={ill.iconRing}>
          <Ionicons name="cafe" size={60} color={C} />
        </View>
      </View>
    </View>
  );
}

function IllStep2() {
  const rippleS = useRef([0, 0, 0].map(() => new Animated.Value(0))).current;
  const rippleO = useRef([0, 0, 0].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const makeLoop = (rs: Animated.Value, ro: Animated.Value) =>
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(rs, { toValue: 3.2, duration: 2000, useNativeDriver: true }),
            Animated.timing(rs, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.delay(200),
          ]),
          Animated.sequence([
            Animated.timing(ro, { toValue: 0.32, duration: 120, useNativeDriver: true }),
            Animated.timing(ro, { toValue: 0, duration: 1880, useNativeDriver: true }),
            Animated.delay(200),
          ]),
        ])
      );

    const loops = rippleS.map((rs, i) => makeLoop(rs, rippleO[i]));
    const timers = loops.map((l, i) => setTimeout(() => l.start(), i * 660));
    return () => {
      loops.forEach(l => l.stop());
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <View style={ill.wrap}>
      {rippleS.map((rs, i) => (
        <Animated.View
          key={i}
          style={[ill.ripple, { transform: [{ scale: rs }], opacity: rippleO[i] }]}
        />
      ))}
      <Ionicons name="location-sharp" size={140} color={P} />
    </View>
  );
}

function IllStep3() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.13, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        Animated.delay(400),
      ])
    );
    setTimeout(() => pulse.start(), 300);
    return () => pulse.stop();
  }, []);

  return (
    <View style={ill.wrap}>
      <View style={ill.circle}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="heart" size={84} color={S} />
        </Animated.View>
      </View>
    </View>
  );
}

const ILL_COMPS = [IllStep1, IllStep2, IllStep3];

const STEPS = [
  {
    title: "Descubrí cafeterías\nque te van a encantar",
    subtitle:
      "Encontrá el lugar perfecto para trabajar, reunirte o simplemente disfrutar un buen café.",
  },
  {
    title: "Cafeterías cerca\nde vos",
    subtitle:
      "Usamos tu ubicación para mostrarte las mejores opciones a tu alrededor.",
  },
  {
    title: "Guardá tus\nfavoritas",
    subtitle:
      "Creá tu lista de cafeterías preferidas y compartila con quien quieras.",
  },
];

// ── Dots con interpolación continua ───────────────────────────────

function Dots({ stepAnim }: { stepAnim: Animated.Value }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      {[0, 1, 2].map(i => {
        // Crece a 24 al llegar al paso i, vuelve a 8 al alejarse
        const width = stepAnim.interpolate({
          inputRange: [i - 1, i - 0.4, i, i + 0.4, i + 1],
          outputRange: [8, 8, 24, 8, 8],
          extrapolate: "clamp",
        });
        // Opacidad: plena cuando activo, sutil cuando inactivo
        const opacity = stepAnim.interpolate({
          inputRange: [i - 0.5, i, i + 0.5],
          outputRange: [0.25, 1, 0.25],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            key={i}
            style={{ height: 8, borderRadius: 4, backgroundColor: P, width, opacity }}
          />
        );
      })}
    </View>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(0);

  // stepAnim: hilo JS (necesario para animar width en Dots)
  const stepAnim = useRef(new Animated.Value(0)).current;

  // Animaciones de contenido (hilo nativo — opacity + transform)
  const contentO   = useRef(new Animated.Value(0)).current; // empieza en 0 → entrada inicial
  const contentX   = useRef(new Animated.Value(20)).current;
  const illScale   = useRef(new Animated.Value(0.96)).current;

  // Entrada inicial
  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentO,  { toValue: 1, duration: 420, easing: EASE_OUT, useNativeDriver: true }),
      Animated.timing(contentX,  { toValue: 0, duration: 420, easing: EASE_OUT, useNativeDriver: true }),
      Animated.timing(illScale,  { toValue: 1, duration: 500, easing: EASE_OUT, useNativeDriver: true }),
    ]).start();
  }, []);

  const goTo = (next: number) => {
    if (next > 2) {
      router.replace("/(auth)/login");
      return;
    }

    const dir = next > step ? 1 : -1; // dirección del slide
    const OUT = 160;
    const IN  = 300;

    // Dots animan en paralelo (spring suave)
    Animated.spring(stepAnim, {
      toValue: next,
      friction: 9,
      tension: 55,
      useNativeDriver: false,
    }).start();

    // Fase 1: contenido sale
    Animated.parallel([
      Animated.timing(contentO,  { toValue: 0, duration: OUT, easing: EASE_IN, useNativeDriver: true }),
      Animated.timing(contentX,  { toValue: dir * -22, duration: OUT, easing: EASE_IN, useNativeDriver: true }),
      Animated.timing(illScale,  { toValue: 0.95, duration: OUT, easing: EASE_IN, useNativeDriver: true }),
    ]).start(() => {
      // Cambia paso (invisible — opacity = 0)
      setStep(next);
      contentX.setValue(dir * 22);

      // Fase 2: nuevo contenido entra
      Animated.parallel([
        Animated.timing(contentO,  { toValue: 1, duration: IN, easing: EASE_OUT, useNativeDriver: true }),
        Animated.timing(contentX,  { toValue: 0, duration: IN, easing: EASE_OUT, useNativeDriver: true }),
        Animated.spring(illScale,  { toValue: 1, friction: 10, tension: 80, useNativeDriver: true }),
      ]).start();
    });
  };

  const IllComp = ILL_COMPS[step];

  return (
    <View style={s.wrap}>
      <View style={s.container}>

        {/* Nav: back (izquierda) + skip (derecha) — posición absoluta, no afectan layout */}
        {step > 0 && (
          <TouchableOpacity style={s.backBtn} onPress={() => goTo(step - 1)}>
            <Ionicons name="arrow-back" size={22} color={P} />
          </TouchableOpacity>
        )}
        {step < 2 && (
          <TouchableOpacity style={s.skipBtn} onPress={() => router.replace("/(auth)/login")}>
            <Text style={s.skipText}>Saltar</Text>
          </TouchableOpacity>
        )}

        {/* Ilustración — anima con fade + scale */}
        <Animated.View
          style={[
            s.illSection,
            { opacity: contentO, transform: [{ scale: illScale }] },
          ]}
        >
          <IllComp />
        </Animated.View>

        {/* Texto — anima con fade + translateX */}
        <Animated.View
          style={[
            s.textSection,
            { opacity: contentO, transform: [{ translateX: contentX }] },
          ]}
        >
          <Text style={s.title}>{STEPS[step].title}</Text>
          <Text style={s.subtitle}>{STEPS[step].subtitle}</Text>
        </Animated.View>

        {/* Footer fijo — dots + botón, nunca se mueve */}
        <View style={s.footer}>
          <Dots stepAnim={stepAnim} />
          <TouchableOpacity
            style={[s.nextBtn, step === 2 && s.startBtn]}
            onPress={() => goTo(step + 1)}
          >
            <Text style={[s.nextText, step === 2 && s.startText]}>
              {step === 2 ? "Empezar" : "Continuar"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ── Estilos ilustración ────────────────────────────────────────────

const ill = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: P,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: P,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(200,168,130,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: P,
    opacity: 0,
  },
});

// ── Estilos pantalla ───────────────────────────────────────────────

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "#E8E0D5" : C,
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    backgroundColor: C,
  },

  // Nav buttons (posición absoluta)
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  skipBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: { fontSize: 14, color: Colors.textLight },

  // Ilustración
  illSection: {
    height: ILL_H,
    backgroundColor: ILL_BG,
    overflow: "hidden",
  },

  // Texto
  textSection: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 12,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: P,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 25,
  },

  // Footer fijo
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    gap: 20,
    alignItems: "center",
  },

  // Botón continuar
  nextBtn: {
    width: "100%",
    backgroundColor: P,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  startBtn: {
    backgroundColor: S,
  },
  startText: {
    color: P,
  },
});
