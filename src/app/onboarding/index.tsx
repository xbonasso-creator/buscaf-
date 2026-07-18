/**
 * Onboarding — escena continua, sin cortes entre pasos.
 *
 * Capas (back → front):
 *   1. Fondo animado — 3 tonos beige que interpolan suavemente
 *   2. Blobs orgánicos — 3 manchas SVG en cross-fade continuo (nunca desaparecen)
 *   3. Partículas flotantes — pequeños círculos con drift orgánico
 *   4. Ilustración — 3 íconos siempre montados, cross-fade in-place
 *   5. Texto — título y subtítulo con fade parcial + stagger
 *   6. Dots — indicador elástico continuo (spring)
 *   7. Nav + CTA
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

const P  = Colors.primary;
const S  = Colors.secondary;
const C  = Colors.background;

const { width: SW, height: SH } = Dimensions.get("window");
const CW     = Math.min(SW, 430);
const CIRCLE = Math.min(Math.round(SH * 0.22), 172);

const EO  = Easing.out(Easing.cubic);
const EI  = Easing.in(Easing.cubic);
const EIO = Easing.inOut(Easing.cubic);

const BG_COLORS = ["#FAF7F2", "#FAF7F2", "#FAF7F2"];

function makeBlobURI(path: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><path d="${path}" fill="#C8A882" opacity="0.24"/></svg>`
  )}`;
}
const BLOB_URIS = [
  makeBlobURI("M180,45 C230,15 295,35 320,85 C345,135 335,200 295,242 C255,284 195,298 148,282 C101,266 65,228 48,180 C31,132 45,78 85,52 C115,32 132,74 180,45Z"),
  makeBlobURI("M192,50 C244,18 308,50 330,104 C352,158 330,226 287,259 C244,292 180,302 135,273 C90,244 68,190 74,140 C80,90 116,56 168,44 C188,38 168,74 192,50Z"),
  makeBlobURI("M165,52 C218,22 280,46 310,100 C340,154 323,220 278,256 C233,292 167,302 120,273 C73,244 49,189 53,137 C57,85 94,54 148,44 C163,39 152,68 165,52Z"),
];

const PARTICLE_CFG = [
  { x: CW * 0.10, y: SH * 0.30, r: 5   },
  { x: CW * 0.82, y: SH * 0.20, r: 4   },
  { x: CW * 0.74, y: SH * 0.62, r: 6   },
  { x: CW * 0.16, y: SH * 0.68, r: 3.5 },
];

function FloatingParticles() {
  const xs = useRef(PARTICLE_CFG.map(() => new Animated.Value(0))).current;
  const ys = useRef(PARTICLE_CFG.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = PARTICLE_CFG.map((_, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(xs[i], { toValue: 7 + i * 2,    duration: 3000 + i * 600, easing: EIO, useNativeDriver: true }),
            Animated.timing(ys[i], { toValue: -(8 + i * 2), duration: 2600 + i * 500, easing: EIO, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(xs[i], { toValue: 0, duration: 3000 + i * 600, easing: EIO, useNativeDriver: true }),
            Animated.timing(ys[i], { toValue: 0, duration: 2600 + i * 500, easing: EIO, useNativeDriver: true }),
          ]),
        ])
      );
      setTimeout(() => loop.start(), i * 750);
      return loop;
    });
    return () => loops.forEach(l => l.stop());
  }, []);

  return (
    <>
      {PARTICLE_CFG.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: p.x - p.r, top: p.y - p.r,
            width: p.r * 2, height: p.r * 2, borderRadius: p.r,
            backgroundColor: S,
            opacity: 0.22,
            transform: [{ translateX: xs[i] }, { translateY: ys[i] }],
          }}
        />
      ))}
    </>
  );
}

// ── Paso 1: taza con vapor animado ───────────────────────────────────────────
function IllStep1() {
  const steamOffsets = [-CIRCLE * 0.13, 0, CIRCLE * 0.13];
  const steams = useRef(
    steamOffsets.map(() => ({ y: new Animated.Value(0), o: new Animated.Value(0) }))
  ).current;

  useEffect(() => {
    const loops = steams.map(({ y, o }, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(i * 380),
          Animated.parallel([
            Animated.timing(y, { toValue: -CIRCLE * 0.22, duration: 1500, easing: EIO, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(o, { toValue: 0.85, duration: 350, useNativeDriver: true }),
              Animated.timing(o, { toValue: 0,    duration: 1150, useNativeDriver: true }),
            ]),
          ]),
          Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(i * 80),
        ])
      );
      loop.start();
      return loop;
    });
    return () => loops.forEach(l => l.stop());
  }, []);

  return (
    <View style={[ill.circle, { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2 }]}>
      {steams.map(({ y, o }, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 4,
            height: CIRCLE * 0.16,
            borderRadius: 3,
            backgroundColor: C,
            left: CIRCLE / 2 + steamOffsets[i] - 2,
            top: CIRCLE * 0.14,
            opacity: o,
            transform: [{ translateY: y }],
          }}
        />
      ))}
      <Ionicons name="cafe" size={CIRCLE * 0.44} color={C} />
    </View>
  );
}

// ── Paso 2: pin de ubicación con ripple ──────────────────────────────────────
function IllStep2() {
  const rs = useRef([0, 1, 2].map(() => new Animated.Value(1))).current;
  const ro = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const make = (r: Animated.Value, o: Animated.Value) =>
      Animated.loop(Animated.parallel([
        Animated.sequence([
          Animated.timing(r, { toValue: 2.4, duration: 2000, easing: EO, useNativeDriver: true }),
          Animated.timing(r, { toValue: 1,   duration: 0,    useNativeDriver: true }),
          Animated.delay(300),
        ]),
        Animated.sequence([
          Animated.timing(o, { toValue: 0.35, duration: 150,  useNativeDriver: true }),
          Animated.timing(o, { toValue: 0,    duration: 1850, useNativeDriver: true }),
          Animated.delay(300),
        ]),
      ]));
    const loops  = rs.map((r, i) => make(r, ro[i]));
    const timers = loops.map((l, i) => setTimeout(() => l.start(), i * 700));
    return () => { loops.forEach(l => l.stop()); timers.forEach(clearTimeout); };
  }, []);

  const RING = CIRCLE * 0.48;
  return (
    <View style={[ill.circle, { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2 }]}>
      {rs.map((r, i) => (
        <Animated.View key={i} style={{
          position: "absolute",
          width: RING, height: RING, borderRadius: RING / 2,
          borderWidth: 1.5, borderColor: C,
          opacity: ro[i],
          transform: [{ scale: r }],
        }} />
      ))}
      <Ionicons name="location-outline" size={CIRCLE * 0.50} color={C} />
    </View>
  );
}

// ── Paso 3: colección con corazón pulsante ───────────────────────────────────
function IllStep3() {
  const heartSc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(heartSc, { toValue: 1.30, duration: 480, easing: EIO, useNativeDriver: true }),
      Animated.timing(heartSc, { toValue: 1.0,  duration: 480, easing: EIO, useNativeDriver: true }),
      Animated.delay(900),
    ]));
    setTimeout(() => pulse.start(), 400);
    return () => pulse.stop();
  }, []);

  return (
    <View style={[ill.circle, { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2 }]}>
      <Ionicons name="albums" size={CIRCLE * 0.46} color={C} />
      <Animated.View style={{
        position: "absolute",
        bottom: CIRCLE * 0.18,
        right:  CIRCLE * 0.18,
        transform: [{ scale: heartSc }],
      }}>
        <View style={ill.heartBadge}>
          <Ionicons name="heart" size={CIRCLE * 0.18} color={P} />
        </View>
      </Animated.View>
    </View>
  );
}

const ILLS = [IllStep1, IllStep2, IllStep3];

const STEPS = [
  {
    title: "Descubrí tu\npróximo café",
    sub:   "Encontrá cafeterías de especialidad según el barrio, tus intereses y el momento que estés buscando.",
    cta:   "Empezar",
  },
  {
    title: "Elegí con\nconfianza",
    sub:   "Explorá toda la información que necesitás tener para tomar la decisión.",
    cta:   "Continuar",
  },
  {
    title: "Guardá tus\nfavoritas",
    sub:   "Creá colecciones con las cafeterías que más te gusten y encontralas siempre que las necesites.",
    cta:   "Registrarme",
  },
];

function Dots({ anim }: { anim: Animated.Value }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      {[0, 1, 2].map(i => {
        const width = anim.interpolate({
          inputRange:  [i - 1, i - 0.35, i, i + 0.35, i + 1],
          outputRange: [8, 8, 28, 8, 8],
          extrapolate: "clamp",
        });
        const opacity = anim.interpolate({
          inputRange:  [i - 0.6, i, i + 0.6],
          outputRange: [0.22, 1, 0.22],
          extrapolate: "clamp",
        });
        return (
          <Animated.View key={i} style={{ height: 8, borderRadius: 4, backgroundColor: P, width, opacity }} />
        );
      })}
    </View>
  );
}

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const dotAnim   = useRef(new Animated.Value(0)).current;
  const sceneAnim = useRef(new Animated.Value(0)).current;
  const bgAnim    = useRef(new Animated.Value(0)).current;

  const titleO = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(16)).current;
  const subO   = useRef(new Animated.Value(0)).current;
  const subY   = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleO, { toValue: 1, duration: 450, delay: 280, easing: EO, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 450, delay: 280, easing: EO, useNativeDriver: true }),
      Animated.timing(subO,   { toValue: 1, duration: 450, delay: 380, easing: EO, useNativeDriver: true }),
      Animated.timing(subY,   { toValue: 0, duration: 450, delay: 380, easing: EO, useNativeDriver: true }),
    ]).start();
  }, []);

  const markDone = () => {
    if (typeof localStorage !== "undefined")
      localStorage.setItem("buscafe:onboardingDone", "true");
  };

  const goTo = (next: number) => {
    if (next > 2) { markDone(); router.replace("/(auth)/login"); return; }

    Animated.spring(dotAnim,   { toValue: next, friction: 7,  tension: 45, useNativeDriver: false }).start();
    Animated.timing(sceneAnim, { toValue: next, duration: 500, easing: EIO, useNativeDriver: false }).start();
    Animated.timing(bgAnim,    { toValue: next, duration: 660, easing: EIO, useNativeDriver: false }).start();

    Animated.parallel([
      Animated.timing(titleO, { toValue: 0.08, duration: 160,           easing: EI, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: -10,  duration: 160,           easing: EI, useNativeDriver: true }),
      Animated.timing(subO,   { toValue: 0.08, duration: 160, delay: 40, easing: EI, useNativeDriver: true }),
      Animated.timing(subY,   { toValue: -7,   duration: 160, delay: 40, easing: EI, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      titleY.setValue(14);
      subY.setValue(18);
      Animated.parallel([
        Animated.timing(titleO, { toValue: 1, duration: 300,           easing: EO, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 300,           easing: EO, useNativeDriver: true }),
        Animated.timing(subO,   { toValue: 1, duration: 300, delay: 60, easing: EO, useNativeDriver: true }),
        Animated.timing(subY,   { toValue: 0, duration: 300, delay: 60, easing: EO, useNativeDriver: true }),
      ]).start();
    });
  };

  const bgColor = bgAnim.interpolate({
    inputRange:  [0, 1, 2],
    outputRange: BG_COLORS as any,
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={[s.wrap, {
      backgroundColor: bgColor as any,
      paddingTop:    insets.top,
      paddingBottom: insets.bottom + 24,
    }]}>
      <View style={s.container}>

        {/* Blobs */}
        {BLOB_URIS.map((uri, i) => {
          const tx = sceneAnim.interpolate({
            inputRange:  [0, 1, 2],
            outputRange: [i===0?0:i===1?20:-20, i===0?-16:i===1?0:16, i===0?10:i===1?-10:0],
            extrapolate: "clamp",
          });
          const ty = sceneAnim.interpolate({
            inputRange:  [0, 1, 2],
            outputRange: [i===0?0:i===1?-18:20, i===0?16:i===1?0:-14, i===0?-10:i===1?20:0],
            extrapolate: "clamp",
          });
          const opacity = sceneAnim.interpolate({
            inputRange:  [i-0.8, i-0.15, i, i+0.15, i+0.8],
            outputRange: [0.10, 0.85, 1, 0.85, 0.10],
            extrapolate: "clamp",
          });
          const scale = sceneAnim.interpolate({
            inputRange:  [i-0.6, i, i+0.6],
            outputRange: [0.90, 1, 0.90],
            extrapolate: "clamp",
          });
          const BSZ = CW * 0.96;
          return (
            <Animated.Image
              key={i}
              source={{ uri }}
              style={[s.blob, { width: BSZ, height: BSZ, opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }]}
              resizeMode="contain"
            />
          );
        })}

        {/* Partículas */}
        <FloatingParticles />

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

        {/* Ilustraciones */}
        <View style={s.illArea}>
          {ILLS.map((IllComp, i) => {
            const opacity = sceneAnim.interpolate({
              inputRange:  [i-0.55, i-0.05, i, i+0.05, i+0.55],
              outputRange: [0, 0.9, 1, 0.9, 0],
              extrapolate: "clamp",
            });
            const scale = sceneAnim.interpolate({
              inputRange:  [i-0.45, i, i+0.45],
              outputRange: [0.78, 1, 0.78],
              extrapolate: "clamp",
            });
            return (
              <Animated.View key={i} style={[StyleSheet.absoluteFill, s.illCenter, { opacity, transform: [{ scale }] }]}>
                <IllComp />
              </Animated.View>
            );
          })}
        </View>

        {/* Texto */}
        <View style={s.textBlock}>
          <Animated.Text style={[s.title, { opacity: titleO, transform: [{ translateY: titleY }] }]}>
            {STEPS[step].title}
          </Animated.Text>
          <Animated.Text style={[s.sub, { opacity: subO, transform: [{ translateY: subY }] }]}>
            {STEPS[step].sub}
          </Animated.Text>
        </View>

        {/* Dots */}
        <View style={s.dotsWrap}>
          <Dots anim={dotAnim} />
        </View>

        {/* CTA */}
        <TouchableOpacity style={[s.cta, step === 2 && s.ctaFinal]} onPress={() => goTo(step + 1)}>
          <Text style={[s.ctaText, step === 2 && s.ctaFinalText]}>{STEPS[step].cta}</Text>
        </TouchableOpacity>

      </View>
    </Animated.View>
  );
}

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
    borderColor: C,
  },
  heartBadge: {
    backgroundColor: S,
    borderRadius: 99,
    padding: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    paddingHorizontal: 28,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    top: SH * 0.08,
    left: CW * 0.02,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 8,
    zIndex: 10,
  },
  navBtn:   { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 14, color: Colors.textLight },
  illArea: {
    height: CIRCLE + 48,
    width: "100%",
    marginTop: SH * 0.06,
    marginBottom: 32,
  },
  illCenter: { alignItems: "center", justifyContent: "center" },
  textBlock: { width: "100%", gap: 12, flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: P,
    lineHeight: 36,
  },
  sub: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 25,
  },
  dotsWrap: { alignSelf: "flex-start", marginBottom: 16 },
  cta: {
    width: "100%",
    backgroundColor: P,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },
  ctaText:      { fontSize: 16, fontWeight: "700", color: Colors.white },
  ctaFinal:     { backgroundColor: S },
  ctaFinalText: { color: P },
});
