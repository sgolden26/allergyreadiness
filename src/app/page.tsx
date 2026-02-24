"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getScoreForRegion } from "@/data/readiness-score";
import { useCost } from "@/context/CostContext";

const countryToRegion: Record<string, string> = {
  "United Arab Emirates": "Western Asia", "Armenia": "Western Asia", "Azerbaijan": "Western Asia",
  "Bahrain": "Western Asia", "Cyprus": "Western Asia", "Georgia": "Western Asia",
  "Iraq": "Western Asia", "Israel": "Western Asia", "Jordan": "Western Asia",
  "Kuwait": "Western Asia", "Lebanon": "Western Asia", "Oman": "Western Asia",
  "Qatar": "Western Asia", "Saudi Arabia": "Western Asia", "Syria": "Western Asia",
  "Turkey": "Western Asia", "Türkiye": "Western Asia", "Yemen": "Western Asia",
  "Palestine": "Western Asia",
  "South Africa": "South Africa",
  "Austria": "Western Europe", "Belgium": "Western Europe", "France": "Western Europe",
  "Germany": "Western Europe", "Luxembourg": "Western Europe", "Netherlands": "Western Europe",
  "Switzerland": "Western Europe", "Liechtenstein": "Western Europe", "Monaco": "Western Europe",
  "Belarus": "Eastern Europe", "Bulgaria": "Eastern Europe", "Czechia": "Eastern Europe",
  "Czech Republic": "Eastern Europe", "Hungary": "Eastern Europe", "Poland": "Eastern Europe",
  "Moldova": "Eastern Europe", "Romania": "Eastern Europe", "Russia": "Eastern Europe",
  "Russian Federation": "Eastern Europe", "Slovakia": "Eastern Europe", "Ukraine": "Eastern Europe",
  "Algeria": "North Africa", "Egypt": "North Africa", "Libya": "North Africa",
  "Morocco": "North Africa", "Sudan": "North Africa", "Tunisia": "North Africa",
  "Canada": "North America", "United States": "North America",
  "United States of America": "North America", "Mexico": "North America",
  "Argentina": "South America", "Bolivia": "South America", "Brazil": "South America",
  "Chile": "South America", "Colombia": "South America", "Ecuador": "South America",
  "Guyana": "South America", "Paraguay": "South America", "Peru": "South America",
  "Suriname": "South America", "Uruguay": "South America", "Venezuela": "South America",
  "Albania": "Southern Europe", "Bosnia and Herzegovina": "Southern Europe",
  "Croatia": "Southern Europe", "Greece": "Southern Europe", "Italy": "Southern Europe",
  "Malta": "Southern Europe", "Montenegro": "Southern Europe", "North Macedonia": "Southern Europe",
  "Portugal": "Southern Europe", "Serbia": "Southern Europe", "Slovenia": "Southern Europe",
  "Spain": "Southern Europe", "Andorra": "Southern Europe",
  "Australia": "Oceania", "Fiji": "Oceania", "New Zealand": "Oceania",
  "Papua New Guinea": "Oceania",
  "Denmark": "Northern Europe", "Estonia": "Northern Europe", "Finland": "Northern Europe",
  "Iceland": "Northern Europe", "Ireland": "Northern Europe", "Latvia": "Northern Europe",
  "Lithuania": "Northern Europe", "Norway": "Northern Europe", "Sweden": "Northern Europe",
  "United Kingdom": "Northern Europe",
  "China": "Eastern Asia", "Japan": "Eastern Asia", "Mongolia": "Eastern Asia",
  "South Korea": "Eastern Asia", "Korea": "Eastern Asia", "North Korea": "Eastern Asia",
  "Taiwan": "Eastern Asia",
  "Afghanistan": "Southern Asia", "Bangladesh": "Southern Asia", "Bhutan": "Southern Asia",
  "India": "Southern Asia", "Iran": "Southern Asia", "Maldives": "Southern Asia",
  "Nepal": "Southern Asia", "Pakistan": "Southern Asia", "Sri Lanka": "Southern Asia",
  "Belize": "Central America", "Costa Rica": "Central America", "El Salvador": "Central America",
  "Guatemala": "Central America", "Honduras": "Central America", "Nicaragua": "Central America",
  "Panama": "Central America",
  "Brunei": "South-Eastern Asia", "Cambodia": "South-Eastern Asia", "Indonesia": "South-Eastern Asia",
  "Laos": "South-Eastern Asia", "Malaysia": "South-Eastern Asia", "Myanmar": "South-Eastern Asia",
  "Philippines": "South-Eastern Asia", "Singapore": "South-Eastern Asia",
  "Thailand": "South-Eastern Asia", "Vietnam": "South-Eastern Asia", "Timor-Leste": "South-Eastern Asia",
};

function scoreToColor(riskLevel: string): string {
  if (riskLevel === "low") return "#22c55e";
  if (riskLevel === "moderate") return "#fbbf24";
  return "#ef4444";
}

function riskLabel(riskLevel: string): string {
  if (riskLevel === "low") return "Low Risk";
  if (riskLevel === "moderate") return "Moderate Risk";
  return "High Risk";
}

function MapContent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const { factorCost } = useCost();
  const factorCostRef = useRef(factorCost);

  useEffect(() => {
    factorCostRef.current = factorCost;
  }, [factorCost]);

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

      mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=3`,
          { headers: { "User-Agent": "AllergyReadiness/0.1" } }
        )
          .then((res) => res.json())
          .then((data) => {
            if (!mapInstance.current) return;

            const country =
              data.address?.country ||
              data.display_name?.split(", ").pop() ||
              "";

            const region = countryToRegion[country];
            const regionScore = region
              ? getScoreForRegion(region, factorCostRef.current)
              : undefined;

            let popupHtml: string;

            if (regionScore) {
              const color = scoreToColor(regionScore.riskLevel);
              const label = riskLabel(regionScore.riskLevel);

              popupHtml = `
                <div style="min-width:180px;font-family:system-ui,sans-serif;">
                  <div style="font-weight:600;font-size:14px;margin-bottom:6px;">${country}</div>
                  <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Region: ${region}</div>
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <div style="width:14px;height:14px;border-radius:50%;background:${color};flex-shrink:0;"></div>
                    <span style="font-weight:600;font-size:14px;">${label}</span>
                  </div>
                  <div style="font-size:24px;font-weight:700;color:${color};">${regionScore.score.toFixed(1)}<span style="font-size:14px;color:#9ca3af;">/100</span></div>
                  <div style="margin-top:6px;font-size:11px;color:#9ca3af;">Allergy Readiness Score</div>
                </div>
              `;
            } else {
              popupHtml = `
                <div style="min-width:140px;font-family:system-ui,sans-serif;">
                  <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${country || "Unknown"}</div>
                  <div style="font-size:12px;color:#9ca3af;">No readiness data available for this region.</div>
                </div>
              `;
            }

            L.popup()
              .setLatLng(e.latlng)
              .setContent(popupHtml)
              .openOn(mapInstance.current!);
          });
      });
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

export default function MapPage() {
  return (
    <Suspense>
      <MapContent />
    </Suspense>
  );
}
