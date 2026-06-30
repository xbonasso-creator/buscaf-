import { create } from "zustand";

const STORAGE_KEY = "buscafe:locationPermissionAsked";

type LocationStore = {
  zone: string | null;
  hasLocation: boolean;
  permissionAsked: boolean;   // true = ya se mostró el modal, no volver a preguntar
  setZone: (zone: string) => void;
  clearZone: () => void;
  markPermissionAsked: () => void;
};

export const useLocationStore = create<LocationStore>((set) => ({
  zone: null,
  hasLocation: false,
  permissionAsked:
    typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEY) === "true"
      : false,

  setZone: (zone) => set({ zone, hasLocation: true }),
  clearZone: () => set({ zone: null, hasLocation: false }),
  markPermissionAsked: () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    set({ permissionAsked: true });
  },
}));

// Zonas con coordenadas aproximadas para mapeo por geolocalización
export const ZONAS_MONTEVIDEO = [
  { id: "pocitos",         label: "Pocitos",       lat: -34.9038, lng: -56.1418 },
  { id: "ciudad-vieja",   label: "Ciudad Vieja",  lat: -34.9065, lng: -56.2051 },
  { id: "palermo",        label: "Palermo",        lat: -34.8979, lng: -56.1650 },
  { id: "punta-carretas", label: "Punta Carretas", lat: -34.9161, lng: -56.1461 },
  { id: "cordon",         label: "Cordón",         lat: -34.9027, lng: -56.1773 },
  { id: "centro",         label: "Centro",         lat: -34.9011, lng: -56.1870 },
  { id: "barrio-sur",     label: "Barrio Sur",     lat: -34.9081, lng: -56.1958 },
  { id: "parque-rodo",    label: "Parque Rodó",    lat: -34.9096, lng: -56.1590 },
  { id: "malvin",         label: "Malvín",         lat: -34.8917, lng: -56.1150 },
  { id: "aguada",         label: "Aguada",         lat: -34.8967, lng: -56.1930 },
  { id: "buceo",          label: "Buceo",          lat: -34.8983, lng: -56.1281 },
  { id: "tres-cruces",    label: "Tres Cruces",    lat: -34.8950, lng: -56.1700 },
];

// Devuelve el barrio más cercano a unas coordenadas
export function nearestZone(lat: number, lng: number): string {
  let closest = ZONAS_MONTEVIDEO[0];
  let minDist = Infinity;
  for (const z of ZONAS_MONTEVIDEO) {
    const d = Math.hypot(lat - z.lat, lng - z.lng);
    if (d < minDist) { minDist = d; closest = z; }
  }
  return closest.label;
}
