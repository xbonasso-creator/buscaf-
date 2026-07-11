/**
 * src/utils/filters.ts
 * ─────────────────────────────────────────────────────────────
 * Fuente única de mappings filtro → servicios.
 *
 * Para que un filtro funcione, las cafeterías en Supabase deben tener
 * en su campo `servicios` (array de texto) al menos una de las palabras
 * clave listadas para ese filtro.
 *
 * Ejemplo en Supabase:
 *   servicios: ["espresso", "v60", "enchufes", "buen wifi", "terraza"]
 */

import { type Cafe, isOpenNow } from "../data/cafes";

// ── Mapa filtro → palabras clave en servicios[] ───────────────────────────────
export const FILTRO_KEYS: Record<string, string[]> = {
  // Ordenar / estado — no filtran por servicios
  "Abierto ahora":    [], // → se resuelve con isOpenNow()
  "Mejor calificados": [], // → sort por rating (no filtra)

  // Teletrabajo
  "Silencioso":        ["silencioso", "tranquilo", "silencio"],
  "Enchufes":          ["enchufes", "enchufes disponibles", "tomas de corriente"],
  "Sillas cómodas":   ["sillas cómodas", "sillas comódas", "sillas confortables"],
  "Buen WiFi":         ["buen wifi", "wifi", "wi-fi", "buen wi-fi"],
  "Mesas amplias":     ["mesas amplias", "mesas grandes"],

  // Servicios
  "Pet friendly":      ["pet friendly", "pet-friendly", "mascotas"],
  "Con terraza":       ["terraza", "con terraza"],
  "Sin TACC":          ["sin tacc", "sin gluten", "gluten free", "gluten-free"],
  "Leche vegetal":     ["leche vegetal", "oat milk", "leche de avena", "leche de almendra", "leche de soja"],
  "Veggie":            ["veggie", "vegetariano", "vegano", "plant-based"],
  "Brunch":            ["brunch"],
  "Almuerzos":         ["almuerzo", "almuerzos"],
  "Tostaduria":        ["tostaduria", "tostador", "tostaduría propia", "tostador propio"],
  "Panadería artesanal": ["panadería artesanal", "panaderia artesanal", "masa madre", "panadería"],
  "Librería":          ["librería", "libreria", "libros"],
  "Eventos":           ["eventos", "música en vivo", "musica en vivo"],
  "Tienda":            ["tienda"],
  "100% Gluten Free":  ["100% gluten free", "sin tacc", "sin gluten", "gluten free"],

  // Métodos de café
  "Espresso":          ["espresso"],
  "V60":               ["v60"],
  "Chemex":            ["chemex"],
  "Aeropress":         ["aeropress"],
  "Cold brew":         ["cold brew"],

  // Compat: chips rápidos en Explore
  "Wi-Fi":             ["wifi", "wi-fi", "buen wifi", "buen wi-fi"],
  "Cowork":            ["cowork", "espacio de cowork", "co-work"],
  "Vegano":            ["vegano", "veggie", "plant-based"],

  // Precios (se resuelven con cafe.precio, no con servicios)
  "$ Económico":       [],
  "$$ Moderado":       [],
  "$$$ Premium":       [],
};

// Mapa label precio → valor del campo cafe.precio
export const PRECIO_MAP: Record<string, "$" | "$$" | "$$$"> = {
  "$ Económico":  "$",
  "$$ Moderado":  "$$",
  "$$$ Premium":  "$$$",
};

/** Devuelve true si el café pasa el filtro dado */
export function matchesFiltro(cafe: Cafe, filtro: string): boolean {
  if (filtro === "Abierto ahora")      return isOpenNow(cafe.horarios);
  if (filtro === "Descuentos")         return (cafe.promociones?.length ?? 0) > 0;
  if (filtro === "Mejor calificados")  return true; // solo afecta orden
  if (filtro === "Más cercanos")       return true; // solo afecta orden
  const keys = FILTRO_KEYS[filtro];
  if (!keys || keys.length === 0)      return true; // filtro desconocido → no excluye
  return keys.some(k =>
    cafe.servicios.some(s => s.toLowerCase().includes(k.toLowerCase()))
  );
}

/** Devuelve true si el café pasa TODOS los filtros activos y el filtro de precio */
export function cafeMatchesAllFilters(
  cafe: Cafe,
  activeFilters: string[],
  priceFilter: string | null,
): boolean {
  if (priceFilter) {
    const expected = PRECIO_MAP[priceFilter];
    if (expected && cafe.precio !== expected) return false;
  }
  return activeFilters.every(f => matchesFiltro(cafe, f));
}
