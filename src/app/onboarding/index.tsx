/**
 * Onboarding — ilustración, texto, dots y CTA en un bloque unificado.
 * Todo anima junto como una unidad (fade + scale).
 */
import { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

const P = Colors.primary;
const S = Colors.secondary;
const C = Colors.background;

const { height: SH } = Dimensions.get("window");
const CIRCLE = Math.min(Math.round(SH * 0.22), 172); // tamaño del círculo ilustración

const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN  = Easing.in(Easing.ease);

// Mancha orgánica de fondo — renderizada como SVG data URI
const BLOB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 230">
  <path d="M170,28 C202,12 242,20 264,48 C286,76 284,112 274,140 C264,168 244,188 218,200 C192,212 160,216 130,208 C100,200 72,184 54,162 C36,140 30,110 36,84 C42,58 62,36 88,26 C114,16 138,44 170,28Z" fill="#C8A882" opacity="0.26"/>
  <path d="M66,172 C50,188 34,198 30,184 C26,170 42,154 60,148 C74,144 82,158 66,172Z" fill="#C8A882" opacity="0.18"/>
  <circle cx="42" cy="66" r="9" fill="#C8A882" opacity="0.20"/>
  <circle cx="278" cy="76" r="12" fill="#C8A882" opacity="0.16"/>
  <circle cx="64" cy="208" r="5" fill="#C8A882" opacity="0.18"/>
  <circle cx="260" cy="188" r="8.5" fill="#C8A882" opacity="0.14"/>
  <circle cx="24" cy="132" r="4.5" fill="#C8A882" opacity="0.16"/>
  <circle cx="308" cy="130" r="6" fill="#C8A882" opacity="0.12"/>
</svg>`;

const BLOB_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(BLOB_SVG)}`;

// ── Ilustraciones ──────────────────────────────────────────────────────

function IllStep1() {
  return (
    <View style={[ill.circle, { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2 }]}>
      <Ionicons name="cafe" size={CIRCLE * 0.42} color={C} />
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
            Animated.timing(rs, { toValue: 3.0, duration: 2000, useNativeDriver: true }),
            Animated.timing(rs, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.delay(200),
          ]),
          Animated.sequence([
            Animated.timing(ro, { toValue: 0.28, duration: 120, useNativeDriver: true }),
            Animated.timing(ro, { toValue: 0, duration: 1880, useNativeDriver: true }),
            Animated.delay(200),
          ]),
        ])
      );
    const loops = rippleS.map((rs, i) => makeLoop(rs, rippleO[i]));
    const timers = loops.map((l, i) => setTimeout(() => l.start(), i * 660));
    return () => { loops.forEach(l => l.stop()); timers.forEach(clearTimeout); };
  }, []);

  return (
    <View style={[ill.circle, { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2 }]}>
      {rippleS.map((rs, i) => (
        <Animated.View
          key={i}
          style={[ill.ripple, { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2, transform: [{ scale: rs }], opacity: rippleO[i] }]}
        />
      ))}
      <Ionicons name="location-sharp" size={CIRCLE * 0.52} color={C} />
    </View>
  );
}

function IllStep3() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 650, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 650, useNativeDriver: true }),
        Animated.delay(300),
      ])
    );
    setTimeout(() => pulse.start(), 300);
    return () => pulse.stop();
  }, []);
  return (
    <View style={[ill.circle, { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2 }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name="heart" size={CIRCLE * 0.46} color={C} />
      </Animated.View>
    </View>
  );
}

const ILL_COMPS = [IllStep1, IllStep2, IllStep3];

const STEPS = [
  {
    title: "Descubrí café\nde especialidad",
    subtitle: "Encontrá el lugar perfecto para disfrutar de un buen café.",
    cta: "Empezar",
  },
  {
    title: "Cafeterías\ncerca de vos",
    subtitle: "Usamos tu ubicación para mostrarte las mejores opciones a tu alrededor.",
    cta: "Continuar",
  },
  {
    title: "Tu tour cafetero\nte espera",
    subtitle: "Guardá en favoritos, dejá reseñas y ganá descuentos.",
    cta: "Registrarme",
  },
];

// ── Dots ───────────────────────────────────────────────────────────────

function Dots({ stepAnim }: { stepAnim: Animated.Value }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      {[0, 1, 2].map(i => {
        const width = stepAnim.interpolate({
          inputRange: [i - 1, i - 0.4, i, i + 0.4, i + 1],
          outputRange: [8, 8, 24, 8, 8],
          extrapolate: "clamp",
        });
        const opacity = stepAnim.interpolate({
          inputRange: [i - 0.5, i, i + 0.5],
          outputRange: [0.25, 1, 0.25],
          extrapolate: "clamp",
        });
        return (
          <Animated.View key={i} style={{ height: 8, borderRadius: 4, backgroundColor: P, width, opacity }} />
        );
      })}
    </View>
  );
}

// ── Pantalla ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const stepAnim = useRef(new Animated.Value(0)).current;

  // Todo el bloque anima junto
  const unitO     = useRef(new Animated.Value(0)).current;
  const unitScale = useRef(new Animated.Value(0.94)).current;
  const unitY     = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(unitO,     { toValue: 1, duration: 460, easing: EASE_OUT, useNativeDriver: true }),
      Animated.timing(unitY,     { toValue: 0, duration: 460, easing: EASE_OUT, useNativeDriver: true }),
      Animated.spring(unitScale, { toValue: 1, friction: 10, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const markDone = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("buscafe:onboardingDone", "true");
    }
  };

  const goTo = (next: number) => {
    if (next > 2) { markDone(); router.replace("/(auth)/login"); return; }

    Animated.spring(stepAnim, { toValue: next, friction: 9, tension: 55, useNativeDriver: false }).start();

    Animated.parallel([
      Animated.timing(unitO,     { toValue: 0.2, duration: 180, easing: EASE_IN, useNativeDriver: true }),
      Animated.timing(unitScale, { toValue: 0.97, duration: 180, easing: EASE_IN, useNativeDriver: true }),
      Animated.timing(unitY,     { toValue: 6, duration: 180, easing: EASE_IN, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      unitY.setValue(-6);
      Animated.parallel([
        Animated.timing(unitO,     { toValue: 1, duration: 300, easing: EASE_OUT, useNativeDriver: true }),
        Animated.timing(unitY,     { toValue: 0, duration: 300, easing: EASE_OUT, useNativeDriver: true }),
        Animated.spring(unitScale, { toValue: 1, friction: 10, tension: 70, useNativeDriver: true }),
      ]).start();
    });
  };

  const IllComp = ILL_COMPS[step];

  return (
    <View style={[s.wrap, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={s.container}>

        {/* Nav */}
        <View style={s.nav}>
          {step > 0 ? (
            <TouchableOpacity onPress={() => goTo(step - 1)} style={s.navBtn}>
              <Ionicons name="arrow-back" size={20} color={P} />
            </TouchableOpacity>
          ) : <View style={s.navBtn} />}
          {step < 2 ? (
            <TouchableOpacity onPress={() => { markDone(); router.replace("/(auth)/login"); }} style={s.navBtn}>
              <Text style={s.skipText}>Saltar</Text>
            </TouchableOpacity>
          ) : <View style={s.navBtn} />}
        </View>

        {/* Bloque unificado — todo anima junto */}
        <Animated.View
          style={[s.unit, { opacity: unitO, transform: [{ scale: unitScale }, { translateY: unitY }] }]}
        >
          {/* Ilustración con mancha orgánica de fondo */}
          <View style={s.illWrap}>
            <Image
              source={{ uri: BLOB_URI }}
              style={[s.illBlob, { width: CIRCLE * 2.4, height: CIRCLE * 1.7 }]}
              resizeMode="contain"
            />
            <IllComp />
          </View>

          {/* Texto */}
          <View style={s.textBlock}>
            <Text style={s.title}>{STEPS[step].title}</Text>
            <Text style={s.subtitle}>{STEPS[step].subtitle}</Text>
          </View>

          {/* Dots */}
          <View style={s.dotsWrap}>
            <Dots stepAnim={stepAnim} />
          </View>
        </Animated.View>

        {/* CTA — fuera de la animación para no parpadear */}
        <TouchableOpacity
          style={[s.cta, step === 2 && s.ctaStart]}
          onPress={() => goTo(step + 1)}
        >
          <Text style={[s.ctaText, step === 2 && s.ctaStartText]}>
            {STEPS[step].cta}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

// ── Estilos ilustración ─────────────────────────────────────────────────

const ill = StyleSheet.create({
  circle: {
    backgroundColor: P,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: P,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  ripple: {
    position: "absolute",
    borderWidth: 2,
    borderColor: P,
  },
});

// ── Estilos pantalla ───────────────────────────────────────────────────

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
    paddingHorizontal: 28,
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 8,
  },
  navBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 14, color: Colors.textLight },

  // Bloque animado unificado
  unit: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },

  illWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  illBlob: {
    position: "absolute",
  },

  textBlock: {
    width: "100%",
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: P,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 25,
  },

  dotsWrap: {
    alignSelf: "flex-start",
  },

  // CTA
  cta: {
    width: "100%",
    backgroundColor: P,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 12,
  },
  ctaText: { fontSize: 16, fontWeight: "700", color: Colors.white },
  ctaStart: { backgroundColor: S },
  ctaStartText: { color: P },
});
