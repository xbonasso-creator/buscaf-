/**
 * Splash screen — "Buscafé" se escribe letra a letra.
 * 1. Copa + pin aparecen primero (fade-in + spring scale).
 * 2. Cada letra de "Buscafé" emerge con opacity + translateY escalonados.
 * 3. Tagline y steam se suman al terminar.
 * 4. Espera 4 segundos totales antes de navegar a /onboarding.
 */
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image, Platform } from "react-native";
import { router } from "expo-router";

const P = "#4A2C2A"; // primary
const S = "#C8A882"; // secondary
const C = "#FAF7F2"; // cream

// Pin de ubicación como SVG unificado (teardrop sin separación)
function PinSVG() {
  // Forma de teardrop como un solo path SVG — sin partes separadas
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 46">`,
    `<path d="M16 2 C6 2 2 10 2 16 C2 30 16 44 16 44 C16 44 30 30 30 16 C30 10 26 2 16 2 Z"`,
    ` fill="${S}"/>`,
    `<circle cx="16" cy="16" r="6.5" fill="${P}"/>`,
    `</svg>`,
  ].join("");
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  if (Platform.OS === "web") {
    return <Image source={{ uri }} style={pinStyle} resizeMode="contain" />;
  }
  // Native fallback: pin en dos partes
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: S, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: P }} />
      </View>
      <View style={{ width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderColor: "transparent", borderTopColor: S, marginTop: -1 }} />
    </View>
  );
}
const pinStyle = { width: 26, height: 37 } as const;

// "Busca" en cream, "fé" en secondary
const LETTERS_CREAM = ["B", "u", "s", "c", "a"];
const LETTERS_SALMON = ["f", "é"];
const ALL_LETTERS = [...LETTERS_CREAM, ...LETTERS_SALMON]; // 7 letras

export default function SplashScreen() {
  const groupO      = useRef(new Animated.Value(0)).current;
  const groupScale  = useRef(new Animated.Value(0.88)).current;
  const screenO     = useRef(new Animated.Value(1)).current;
  const tagO        = useRef(new Animated.Value(0)).current;

  // Por letra: opacity + slide vertical
  const letterOs = useRef(ALL_LETTERS.map(() => new Animated.Value(0))).current;
  const letterYs = useRef(ALL_LETTERS.map(() => new Animated.Value(12))).current;

  // Steam wisps: 3 × (opacity, translateY)
  const sOs = useRef([0, 0, 0].map(() => new Animated.Value(0))).current;
  const sYs = useRef([0, 0, 0].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let mounted = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const loops: Animated.CompositeAnimation[] = [];

    // ── 1. Copa entra (0ms) ──────────────────────────────────────
    Animated.parallel([
      Animated.timing(groupO, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(groupScale, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();

    // ── 2. Letras se escriben (inicio: 550ms) ────────────────────
    timers.push(setTimeout(() => {
      if (!mounted) return;
      Animated.stagger(
        110,
        ALL_LETTERS.map((_, i) =>
          Animated.parallel([
            Animated.timing(letterOs[i], { toValue: 1, duration: 280, useNativeDriver: true }),
            Animated.spring(letterYs[i], { toValue: 0, friction: 9, tension: 90, useNativeDriver: true }),
          ])
        )
      ).start();
    }, 550));

    // ── 3. Tagline aparece cuando terminan las letras (≈1600ms) ──
    timers.push(setTimeout(() => {
      if (!mounted) return;
      Animated.timing(tagO, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 1620));

    // ── 4. Steam empieza (1900ms) ─────────────────────────────────
    const makeSteam = (o: Animated.Value, y: Animated.Value) =>
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(o, { toValue: 0.8, duration: 500, useNativeDriver: true }),
            Animated.timing(o, { toValue: 0, duration: 1000, useNativeDriver: true }),
            Animated.delay(300),
          ]),
          Animated.sequence([
            Animated.timing(y, { toValue: -26, duration: 1500, useNativeDriver: true }),
            Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.delay(300),
          ]),
        ])
      );

    sOs.forEach((o, i) => {
      const loop = makeSteam(o, sYs[i]);
      loops.push(loop);
      timers.push(setTimeout(() => { if (mounted) loop.start(); }, 1900 + i * 520));
    });

    // ── 5. Fade out y navegar a los 4s ───────────────────────────
    timers.push(setTimeout(() => {
      if (!mounted) return;
      Animated.timing(screenO, { toValue: 0, duration: 420, useNativeDriver: true }).start(() => {
        router.replace("/onboarding");
      });
    }, 4000));

    return () => {
      mounted = false;
      timers.forEach(clearTimeout);
      loops.forEach(l => l.stop());
    };
  }, []);

  return (
    <Animated.View style={[s.wrap, { opacity: screenO }]}>
      <Animated.View style={[s.group, { opacity: groupO, transform: [{ scale: groupScale }] }]}>

        {/* Steam wisps (arriba de la copa) */}
        <View style={s.steamRow}>
          {sOs.map((o, i) => (
            <Animated.View
              key={i}
              style={[s.steam, i === 1 && { height: 22 }, { opacity: o, transform: [{ translateY: sYs[i] }] }]}
            />
          ))}
        </View>

        {/* Copa con pin de ubicación unificado */}
        <View style={s.cupWrap}>
          <PinSVG />
          <View style={s.cupBody}>
            <View style={s.coffee} />
            <View style={s.handle} />
          </View>
          <View style={s.saucer} />
        </View>

        {/* Wordmark — letra a letra */}
        <View style={s.wordmarkRow}>
          {ALL_LETTERS.map((letter, i) => (
            <Animated.Text
              key={i}
              style={[
                s.wm,
                { color: i < LETTERS_CREAM.length ? C : S },
                { opacity: letterOs[i], transform: [{ translateY: letterYs[i] }] },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        {/* Tagline */}
        <Animated.Text style={[s.tagline, { opacity: tagO }]}>
          café de especialidad
        </Animated.Text>

      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: P,
    alignItems: "center",
    justifyContent: "center",
  },
  group: { alignItems: "center" },

  // Steam
  steamRow: {
    flexDirection: "row",
    gap: 13,
    marginBottom: 2,
    height: 32,
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  steam: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: S,
  },

  // Copa
  cupWrap: { alignItems: "center", marginBottom: 32 },
  cupBody: {
    width: 80, height: 58,
    borderWidth: 2.5, borderColor: C,
    borderRadius: 6, borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  coffee: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: "46%", backgroundColor: S, opacity: 0.55,
  },
  handle: {
    position: "absolute", right: -16, top: 10,
    width: 16, height: 27, borderRadius: 20,
    borderWidth: 2.5, borderColor: C, borderLeftWidth: 0,
  },
  saucer: {
    width: 100, height: 7, borderRadius: 7,
    backgroundColor: C, opacity: 0.42, marginTop: 4,
  },

  // Wordmark
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
    gap: 0,
  },
  wm: {
    fontSize: 50,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 60,
  },

  tagline: {
    fontSize: 12,
    color: S,
    opacity: 0.55,
    letterSpacing: 3.5,
    textTransform: "uppercase",
  },
});
