import { useEffect, useRef } from "react";
import { router } from "expo-router";
import type { Cafe } from "../../data/cafes";

const MAPBOX_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ??
  "pk.eyJ1IjoieGVuaWFtYXJpYWEiLCJhIjoiY21yMHBrcTFxMGZvODJxcHJsY2FjNGVkbCJ9.gH7btC2-yCF6QVVbtmzEvw";

type Props = { cafes: Cafe[]; height?: number };

export default function MapboxMap({ cafes, height = 500 }: Props) {
  const containerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    // Register global nav handler (used by popup buttons)
    (window as any).__buscafe_navigate = (id: string) => {
      router.push(`/cafe/${id}` as any);
    };

    async function initMap() {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !containerRef.current) return;

      (mapboxgl as any).accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-56.1645, -34.9011],
        zoom: 13.5,
        attributionControl: false,
      });

      mapRef.current = map;

      cafes
        .filter((c) => c.lat && c.lng)
        .forEach((cafe) => {
          // Pin SVG — color según estado abierto/cerrado
          const color = cafe.open ? "#4A7C59" : "#4A2C2A";
          const el = document.createElement("div");
          el.style.cssText = "cursor: pointer; width: 32px; height: 38px;";
          el.innerHTML = `
            <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 26 12 26S28 21 28 12C28 5.373 22.627 0 16 0Z" fill="${color}"/>
              <circle cx="16" cy="12" r="5" fill="white"/>
            </svg>
          `;

          const popup = new mapboxgl.Popup({
            offset: [0, -38],
            closeButton: false,
            maxWidth: "230px",
            className: "buscafe-popup",
          }).setHTML(`
            <div style="font-family: 'DM Sans', -apple-system, sans-serif; padding: 2px 0;">
              <div style="font-weight: 700; font-size: 14px; color: #4A2C2A; margin-bottom: 3px;">${cafe.name}</div>
              <div style="font-size: 12px; color: #8A8A8A; margin-bottom: 8px;">${cafe.direccion}</div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                <span style="font-size: 12px; color: #8A8A8A;">★ ${cafe.rating}</span>
                <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px;
                  background: ${cafe.open ? "#4A7C59" : "#E8E0D5"};
                  color: ${cafe.open ? "#fff" : "#8A8A8A"};">
                  ${cafe.open ? "Abierto" : "Cerrado"}
                </span>
              </div>
              <button
                onclick="window.__buscafe_navigate('${cafe.id}')"
                style="background:none; border:none; padding:0; cursor:pointer;
                  font-family:'DM Sans',-apple-system,sans-serif;
                  font-size:13px; font-weight:600; color:#4A2C2A;
                  text-decoration:underline; text-underline-offset:3px;">
                Ir al detalle →
              </button>
            </div>
          `);

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([cafe.lng, cafe.lat])
            .setPopup(popup)
            .addTo(map);

          el.addEventListener("click", () => {
            if (popup.isOpen()) {
              popup.remove();
            } else {
              marker.togglePopup();
            }
          });
        });
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height }}
    />
  );
}
