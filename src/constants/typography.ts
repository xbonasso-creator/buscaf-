/**
 * Escala tipográfica — DM Sans (aplicada globalmente vía +html.tsx)
 * Pendiente: BR Segma para headings display cuando se agreguen los archivos de fuente.
 *
 * Escala mínima 14px · incrementos de 2px
 *
 *  display  → 32px 700   Títulos de bienvenida / onboarding hero
 *  h1       → 28px 700   Título de pantalla principal
 *  h2       → 24px 700   Títulos de sección destacada
 *  h3       → 20px 600   Subtítulos, nombre de café
 *  h4       → 18px 600   Section titles en cards
 *  body1    → 16px 400   Cuerpo de texto principal
 *  body2    → 14px 400   Texto secundario / descripción
 *  label    → 14px 600   Labels, chips, botones pequeños
 *  caption  → 14px 400   Metadatos, timestamps (mínimo permitido)
 */

export const Typography = {
  display: { fontSize: 32, fontWeight: "700" as const, lineHeight: 40 },
  h1:      { fontSize: 28, fontWeight: "700" as const, lineHeight: 36 },
  h2:      { fontSize: 24, fontWeight: "700" as const, lineHeight: 32 },
  h3:      { fontSize: 20, fontWeight: "600" as const, lineHeight: 28 },
  h4:      { fontSize: 18, fontWeight: "600" as const, lineHeight: 26 },
  body1:   { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  body2:   { fontSize: 14, fontWeight: "400" as const, lineHeight: 22 },
  label:   { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
  caption: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  button:  { fontSize: 16, fontWeight: "600" as const, lineHeight: 24 },
};
