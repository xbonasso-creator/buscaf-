/**
 * src/data/cafes.ts
 * ─────────────────────────────────────────────────────────────
 * Fuente única de datos de cafeterías para el MVP.
 *
 * ARQUITECTURA:
 *   - En MVP: array estático cargado manualmente por el admin.
 *   - Cuando haya backend: reemplazar `CAFES_DB` por un fetch/query
 *     (ej: supabase.from('cafes').select('*') | REST API GET /cafes)
 *   - `getCafe(id)` ya devuelve Promise<Cafe | null> para facilitar esa migración.
 *
 * CAMPOS OPCIONALES (solo aparecen en el detalle si tienen datos):
 *   - tieneCuponera  → sección de cuponera
 *   - menu[]         → sección menú destacado
 *   - promociones[]  → sección de promos
 *   - eventos[]      → sección de eventos
 */

export type MenuItem    = { id: string; name: string; price: string; image: string };
export type Promo       = { id: string; titulo: string; descripcion: string; vigencia: string; icono: string };
export type Evento      = { id: string; titulo: string; fecha: string; descripcion: string; imagen: string };
export type Resena      = { id: string; name: string; rating: number; text: string; date: string };

export type Cafe = {
  // ── Datos base ──
  id: string;
  name: string;
  rating: number;
  open: boolean;
  description: string;
  image: string;
  horarios: string[];
  direccion: string;
  distancia: string;
  zona: string;        // barrio — para filtro de ubicación
  servicios: string[];
  fotos: string[];

  // ── Mapa ──
  lat: number;
  lng: number;

  // ── Reseñas (se construyen desde la app) ──
  resenas: Resena[];

  // ── Secciones opcionales ([] o false = sección oculta) ──
  tieneCuponera?: boolean;
  cuponeraMax?: number;
  menu?: MenuItem[];
  promociones?: Promo[];
  eventos?: Evento[];
};

// ─────────────────────────────────────────────────────────────
// BASE DE DATOS LOCAL (admin carga aquí hasta tener backend)
// ─────────────────────────────────────────────────────────────
const CAFES_DB: Cafe[] = [
  {
    id: "1",
    name: "Totem Coffee",
    rating: 4.8,
    open: true,
    description: "Tostadero de especialidad en el corazón de Pocitos. Granos de origen único, métodos alternativos y un espacio para quedarse horas.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
    horarios: [
      "Lunes a Viernes · De 08:00 a 19:00",
      "Sábados · De 09:00 a 20:00",
      "Domingos · De 10:00 a 17:00",
    ],
    direccion: "José Ellauri 434, Pocitos",
    distancia: "A 1.2 km de tu ubicación.",
    zona: "pocitos",
    servicios: ["Espacio de cowork", "Tostaduría propia", "Espresso", "Pet Friendly", "Arte latte", "V60 / Filtrado"],
    fotos: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300",
    ],
    lat: -34.9063,
    lng: -56.1490,
    resenas: [],
    tieneCuponera: true,
    cuponeraMax: 10,
    menu: [
      { id: "1", name: "Tostón de palta",   price: "$290", image: "https://images.unsplash.com/photo-1603046891744-1f057468acaa?w=300" },
      { id: "2", name: "Croissant manteca", price: "$180", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300" },
      { id: "3", name: "Flat white",        price: "$220", image: "https://images.unsplash.com/photo-1621510456681-2330135e5871?w=300" },
    ],
    promociones: [
      { id: "1", titulo: "2x1 en filtrados", descripcion: "Todos los lunes de 14 a 17 hs.", vigencia: "Hasta el 31/08", icono: "cafe-outline" },
    ],
    eventos: [
      { id: "1", titulo: "Cata de origen: Etiopía", fecha: "Sáb 12 Jul · 11:00", descripcion: "Exploramos tres varietales de Yirgacheffe con el tostador.", imagen: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300" },
    ],
  },

  {
    id: "2",
    name: "Jacinto",
    rating: 4.7,
    open: true,
    description: "Café y bistró de Ciudad Vieja con foco en producto local y estacional. Desde el desayuno hasta el vino de la tarde.",
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600",
    horarios: [
      "Lunes a Viernes · De 09:00 a 18:00",
      "Sábados · De 10:00 a 18:00",
    ],
    direccion: "Sarandí 349, Ciudad Vieja",
    distancia: "A 2.8 km de tu ubicación.",
    zona: "ciudad-vieja",
    servicios: ["Menú de temporada", "Vinos naturales", "Espresso", "Sin gluten", "Terraza"],
    fotos: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300",
    ],
    lat: -34.9052,
    lng: -56.1968,
    resenas: [],
    menu: [
      { id: "1", name: "Bowl de estación",  price: "$320", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300" },
      { id: "2", name: "Cortado",           price: "$150", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=300" },
    ],
  },

  {
    id: "3",
    name: "Café Brasilero",
    rating: 4.5,
    open: true,
    description: "El café más antiguo de Montevideo. Desde 1877 en la misma esquina de Ciudad Vieja, con historia y espresso cargado.",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600",
    horarios: [
      "Lunes a Sábado · De 07:00 a 21:00",
      "Domingos · De 09:00 a 18:00",
    ],
    direccion: "Ituzaingó 1447, Ciudad Vieja",
    distancia: "A 2.9 km de tu ubicación.",
    zona: "ciudad-vieja",
    servicios: ["Espresso tradicional", "Medialunas", "Wi-Fi", "Histórico"],
    fotos: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300",
    ],
    lat: -34.9059,
    lng: -56.1983,
    resenas: [],
  },

  {
    id: "4",
    name: "Belmondo Café",
    rating: 4.4,
    open: true,
    description: "Espacio cultural y café en el Centro. Ideal para trabajar, leer o perderse en buena música y buen café de filtro.",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600",
    horarios: [
      "Lunes a Viernes · De 08:30 a 20:00",
      "Sábados · De 10:00 a 20:00",
    ],
    direccion: "Convención 1403, Centro",
    distancia: "A 1.8 km de tu ubicación.",
    zona: "centro",
    servicios: ["Wi-Fi", "Cowork", "Música en vivo", "Libros", "Filtrado", "Galería de arte"],
    fotos: [
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300",
    ],
    lat: -34.9013,
    lng: -56.1793,
    resenas: [],
    tieneCuponera: true,
    cuponeraMax: 10,
    promociones: [
      { id: "1", titulo: "Brunch de fin de semana", descripcion: "Tostón + bebida + postre por $490.", vigencia: "Sáb y Dom", icono: "sunny-outline" },
    ],
    eventos: [
      { id: "1", titulo: "Taller de latte art", fecha: "Dom 20 Jul · 10:00", descripcion: "Aprendé a hacer tulipas y rosetas con baristas del café.", imagen: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300" },
    ],
  },

  {
    id: "5",
    name: "Quínoa",
    rating: 4.6,
    open: false,
    description: "Café saludable y plant-based en Palermo. Desayunos elaborados, granola casera y el mejor matcha de la ciudad.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
    horarios: [
      "Lunes a Viernes · De 08:00 a 18:00",
      "Sábados · De 09:00 a 16:00",
    ],
    direccion: "Colonia 2178, Palermo",
    distancia: "A 0.9 km de tu ubicación.",
    zona: "palermo",
    servicios: ["Vegano", "Sin gluten", "Matcha", "Bowl de açaí", "Pet Friendly"],
    fotos: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300",
    ],
    lat: -34.9001,
    lng: -56.1702,
    resenas: [],
    menu: [
      { id: "1", name: "Bowl açaí",    price: "$350", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300" },
      { id: "2", name: "Matcha latte", price: "$260", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=300" },
    ],
  },

  {
    id: "6",
    name: "El Club del Pan",
    rating: 4.5,
    open: true,
    description: "Panadería de fermentación natural y café de especialidad. El olor a pan recién horneado te recibe desde la esquina.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
    horarios: [
      "Lunes a Sábado · De 08:00 a 20:00",
      "Domingos · De 09:00 a 15:00",
    ],
    direccion: "Maldonado 1392, Barrio Sur",
    distancia: "A 1.5 km de tu ubicación.",
    zona: "barrio-sur",
    servicios: ["Panadería artesanal", "Masa madre", "Espresso", "Sin gluten disponible"],
    fotos: [
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300",
    ],
    lat: -34.9040,
    lng: -56.1860,
    resenas: [],
  },

  {
    id: "7",
    name: "Café Misterio",
    rating: 4.3,
    open: false,
    description: "Café íntimo y reservado en Pocitos. Canales de filtrado, blends de autor y una selección de tés de especialidad.",
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600",
    horarios: [
      "Martes a Viernes · De 10:00 a 19:00",
      "Sábados y Domingos · De 10:00 a 20:00",
    ],
    direccion: "Costa Rica 1700, Pocitos",
    distancia: "A 1.8 km de tu ubicación.",
    zona: "pocitos",
    servicios: ["Filtrado", "Aeropress", "Tés de especialidad", "Sin Wi-Fi (para desconectarse)"],
    fotos: [
      "https://images.unsplash.com/photo-1534778101976-62847782c213?w=300",
    ],
    lat: -34.9078,
    lng: -56.1525,
    resenas: [],
    tieneCuponera: true,
    cuponeraMax: 8,
  },
];

// ─────────────────────────────────────────────────────────────
// API — lee de Supabase, fallback al array local si falla
// ─────────────────────────────────────────────────────────────

function dbRowToCafe(row: any): Cafe {
  return {
    id:            row.id,
    name:          row.name,
    rating:        row.rating,
    open:          row.open,
    description:   row.description,
    image:         row.image,
    horarios:      row.horarios ?? [],
    direccion:     row.direccion,
    distancia:     row.distancia,
    zona:          row.zona,
    servicios:     row.servicios ?? [],
    fotos:         row.fotos ?? [],
    lat:           row.lat,
    lng:           row.lng,
    resenas:       [],
    tieneCuponera: row.tiene_cuponera ?? false,
    cuponeraMax:   row.cuponera_max ?? 10,
    menu:          row.menu ?? [],
    promociones:   row.promociones ?? [],
    eventos:       row.eventos ?? [],
  };
}

/** Devuelve todos los cafés desde Supabase */
export async function getAllCafes(): Promise<Cafe[]> {
  try {
    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase.from("cafes").select("*").order("rating", { ascending: false });
    if (!error && data && data.length > 0) return data.map(dbRowToCafe);
  } catch {}
  return CAFES_DB; // fallback local
}

/** Devuelve un café por id desde Supabase */
export async function getCafe(id: string): Promise<Cafe | null> {
  try {
    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase.from("cafes").select("*").eq("id", id).single();
    if (!error && data) return dbRowToCafe(data);
  } catch {}
  return CAFES_DB.find(c => c.id === id) ?? null; // fallback local
}

/** Versión síncrona para uso en render (MVP only — remover con backend real) */
export function getCafeSync(id: string): Cafe | null {
  return CAFES_DB.find(c => c.id === id) ?? null;
}

/** Exporta el array directamente para uso en listas y mapa */
export { CAFES_DB as CAFES };
