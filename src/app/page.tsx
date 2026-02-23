"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      if (!mapRef.current) return;

      mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!query || !mapInstance.current) return;

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "User-Agent": "AllergyReadiness/0.1" } }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          mapInstance.current?.flyTo([parseFloat(lat), parseFloat(lon)], 12);
        }
      });
  }, [query]);

  return (
    <div className="flex-1 flex justify-center items-center p-6">
      <div
        ref={mapRef}
        id="heat-map-container"
        className="w-full max-w-[1000px] min-h-[500px] rounded-lg"
      />
    </div>
  );
}
