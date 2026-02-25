"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getScoreForRegion,
  getScoreBreakdown,
  type ScoreBreakdown,
} from "@/data/readiness-score";
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

function subScoreBar(score: number, weight: number, color: string) {
  const weighted = Math.round(score * weight * 10) / 10;
  const pct = Math.max(0, Math.min(100, score));
  return `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
        <span style="color:#6b7280;">${Math.round(weight * 100)}% weight</span>
        <span style="font-weight:600;">${score.toFixed(1)}/100 <span style="color:#9ca3af;">(+${weighted.toFixed(1)} pts)</span></span>
      </div>
      <div style="height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;"></div>
      </div>
    </div>
  `;
}

function buildDetailsHtml(bd: ScoreBreakdown, country: string): string {
  const color = scoreToColor(bd.overall.riskLevel);
  const label = riskLabel(bd.overall.riskLevel);

  let html = `
    <div style="font-family:system-ui,sans-serif;padding:4px 0;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div>
          <div style="font-weight:700;font-size:18px;">${country}</div>
          <div style="font-size:13px;color:#6b7280;">${bd.region}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:28px;font-weight:800;color:${color};">${bd.overall.score.toFixed(1)}</div>
          <div style="font-size:11px;color:#9ca3af;">out of 100</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;padding:8px 12px;border-radius:8px;background:${color}15;">
        <div style="width:12px;height:12px;border-radius:50%;background:${color};flex-shrink:0;"></div>
        <span style="font-weight:600;font-size:14px;color:${color};">${label}</span>
      </div>

      <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Anaphylaxis Severity</div>
      ${subScoreBar(bd.anaphylaxis.score, bd.anaphylaxis.weight, "#6366f1")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:12px;margin-bottom:20px;">
        <div style="color:#6b7280;">Severe anaphylaxis</div><div style="font-weight:500;">${bd.anaphylaxis.severeAnaphylaxisPct}%</div>
        <div style="color:#6b7280;">Adrenaline users</div><div style="font-weight:500;">${bd.anaphylaxis.adrenalineUsersPct}%</div>
        <div style="color:#6b7280;">3+ adrenaline doses</div><div style="font-weight:500;">${bd.anaphylaxis.threeOrMoreAdrenalinePct}%</div>
      </div>

      <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Management Quality</div>
      ${subScoreBar(bd.management.score, bd.management.weight, "#f59e0b")}
      <div style="font-size:12px;margin-bottom:6px;color:#6b7280;">Average failure rate: <span style="font-weight:500;color:#374151;">${bd.management.averageFailure}%</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:12px;margin-bottom:20px;">
        <div style="color:#6b7280;">Avoid trigger</div><div style="font-weight:500;">${bd.management.avoidTriggerPct}% fail</div>
        <div style="color:#6b7280;">Define allergen</div><div style="font-weight:500;">${bd.management.defineTriggerPct}% fail</div>
        <div style="color:#6b7280;">Educate patient</div><div style="font-weight:500;">${bd.management.educatePatientPct}% fail</div>
        <div style="color:#6b7280;">Prepared to manage</div><div style="font-weight:500;">${bd.management.preparedToManagePct}% fail</div>
        <div style="color:#6b7280;">Properly treat</div><div style="font-weight:500;">${bd.management.properlyTreatPct}% fail</div>
      </div>
  `;

  if (bd.cost) {
    html += `
      <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Healthcare Cost</div>
      ${subScoreBar(bd.cost.score, bd.cost.weight, "#ef4444")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:12px;margin-bottom:20px;">
        <div style="color:#6b7280;">Total service cost</div><div style="font-weight:500;">$${bd.cost.totalCost.toLocaleString()}</div>
        <div style="color:#6b7280;">Relative cost</div><div style="font-weight:500;">${bd.cost.normalizedCost}% of max</div>
      </div>
    `;
  }

  if (bd.codex) {
    const memberColor = bd.codex.isMember ? "#22c55e" : "#ef4444";
    const memberLabel = bd.codex.isMember ? "Yes" : "No";
    const bonusColor = bd.codex.bonus >= 0 ? "#22c55e" : "#ef4444";
    const bonusSign = bd.codex.bonus >= 0 ? "+" : "";
    const bonusText = bd.codex.bonus !== 0
      ? `<div style="font-size:12px;font-weight:600;color:${bonusColor};margin-top:4px;">${bonusSign}${bd.codex.bonus} pts</div>`
      : `<div style="font-size:12px;color:#9ca3af;margin-top:4px;">No adjustment applied</div>`;

    html += `
      <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Food Labeling</div>
      <div style="padding:10px 12px;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:6px;">Codex Alimentarius</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:12px;color:#6b7280;">Member country</div>
          <div style="font-weight:600;font-size:13px;color:${memberColor};">${memberLabel}</div>
        </div>
        ${bd.codex.isMember
          ? `<div style="font-size:11px;color:#6b7280;margin-top:6px;">This country follows international food labeling standards.</div>`
          : `<div style="font-size:11px;color:#6b7280;margin-top:6px;">This country is not a Codex member. Packaged food may not reliably list allergen ingredients.</div>`
        }
    `;

    if (bd.labeling) {
      const rateColor = bd.labeling.effectiveRate >= 95 ? "#22c55e"
        : bd.labeling.effectiveRate >= 70 ? "#fbbf24" : "#ef4444";

      html += `
        <div style="border-top:1px solid #e5e7eb;margin-top:10px;padding-top:10px;">
          <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:8px;">Labeling Compliance Data</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <div style="font-size:12px;color:#6b7280;">Effective labeling rate</div>
            <div style="font-weight:700;font-size:16px;color:${rateColor};">${bd.labeling.effectiveRate}%</div>
          </div>
          <div style="height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;margin-bottom:4px;">
            <div style="height:100%;width:${bd.labeling.effectiveRate}%;background:${rateColor};border-radius:4px;"></div>
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-bottom:8px;">Threshold: 95%. Below = penalty.</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 16px;font-size:12px;">
            <div style="color:#6b7280;">Has allergen label</div><div style="font-weight:500;">${bd.labeling.foodAllergenLabelingPct}%</div>
            <div style="color:#6b7280;">Of those, compliant</div><div style="font-weight:500;">${bd.labeling.compliancePct}%</div>
            <div style="color:#6b7280;">Non-compliant</div><div style="font-weight:500;">${bd.labeling.nonCompliancePct}%</div>
            <div style="color:#6b7280;">No allergen label</div><div style="font-weight:500;color:#ef4444;">${bd.labeling.noLabelingPct}%</div>
          </div>
        </div>
      `;
    }

    if (!bd.labeling) {
      html += `
        <div style="border-top:1px solid #e5e7eb;margin-top:10px;padding-top:8px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:12px;color:#6b7280;">Food labeling compliance</div>
            <div style="font-weight:600;font-size:13px;color:#9ca3af;">N/A</div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

interface DetailsState {
  html: string;
  side: "left" | "right";
}

declare global {
  interface Window {
    __showScoreDetails?: () => void;
  }
}

function MapContent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const { factorCost } = useCost();
  const factorCostRef = useRef(factorCost);
  const [details, setDetails] = useState<DetailsState | null>(null);
  const pendingDetailsRef = useRef<{ region: string; country: string; clickX: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    factorCostRef.current = factorCost;
  }, [factorCost]);

  const showDetails = useCallback(() => {
    const pending = pendingDetailsRef.current;
    if (!pending) return;
    const bd = getScoreBreakdown(pending.region, factorCostRef.current, pending.country);
    if (!bd) return;
    const html = buildDetailsHtml(bd, pending.country);
    const side = pending.clickX < window.innerWidth / 2 ? "right" : "left";
    setDetails({ html, side });
  }, []);

  useEffect(() => {
    window.__showScoreDetails = showDetails;
    return () => { window.__showScoreDetails = undefined; };
  }, [showDetails]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetails(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

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
        const clickX = (e.originalEvent as MouseEvent).clientX;

        setDetails(null);

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
              ? getScoreForRegion(region, factorCostRef.current, country)
              : undefined;

            pendingDetailsRef.current = region
              ? { region, country, clickX }
              : null;

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
                  <a href="#" onclick="window.__showScoreDetails?.(); return false;"
                     style="display:inline-block;margin-top:10px;font-size:12px;color:#3b82f6;text-decoration:none;font-weight:500;">
                    View details &rarr;
                  </a>
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
    <div className="flex-1 flex justify-center items-center p-6 relative">
      <div
        ref={mapRef}
        id="heat-map-container"
        className="w-full max-w-[1000px] min-h-[500px] rounded-lg"
      />

      {details && (
        <>
          <div
            className="fixed inset-0 z-[1100]"
            onClick={() => setDetails(null)}
          />
          <div
            ref={panelRef}
            className={`fixed top-0 z-[1200] h-full w-[380px] bg-white shadow-2xl border-gray-200 overflow-y-auto transition-all ${
              details.side === "right"
                ? "right-0 border-l"
                : "left-0 border-r"
            }`}
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <span className="font-semibold text-gray-900 text-sm">Score Breakdown</span>
              <button
                onClick={() => setDetails(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <div
              className="px-5 py-4"
              dangerouslySetInnerHTML={{ __html: details.html }}
            />
          </div>
        </>
      )}
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
