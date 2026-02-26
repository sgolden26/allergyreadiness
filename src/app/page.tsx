"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getScoreForRegion,
  getScoreBreakdown,
  type ScoreBreakdown,
} from "@/data/readiness-score";
import { useCost } from "@/context/CostContext";
import { useAllergies } from "@/context/AllergyContext";

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

  if (bd.labeling) {
    html += `
      <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Food Labeling</div>
      ${subScoreBar(bd.labeling.effectiveRate, bd.labeling.weight, "#10b981")}
    `;
  }

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

  if (bd.allergenRegulation) {
    html += `<div style="font-weight:600;font-size:14px;margin-bottom:8px;">Allergen Regulations</div>`;
    if (bd.allergenRegulation.hasSelections) {
      html += subScoreBar(bd.allergenRegulation.score, bd.allergenRegulation.weight, "#8b5cf6");
    }

    if (!bd.allergenRegulation.hasSelections) {
      html += `
        <div style="padding:10px 12px;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:20px;font-size:12px;color:#9ca3af;">
          Select allergens in the dashboard to see which ones this country requires on food labels.
        </div>
      `;
    } else {
      const { covered, notCovered, bonus } = bd.allergenRegulation;
      const bonusColor = bonus > 0 ? "#22c55e" : "#9ca3af";

      let items = "";
      for (const a of covered) {
        items += `
          <div style="display:flex;align-items:center;gap:6px;padding:4px 0;">
            <span style="color:#22c55e;font-size:14px;">&#10003;</span>
            <span style="font-size:12px;">${a}</span>
          </div>`;
      }
      for (const a of notCovered) {
        items += `
          <div style="display:flex;align-items:center;gap:6px;padding:4px 0;">
            <span style="color:#ef4444;font-size:14px;">&#10007;</span>
            <span style="font-size:12px;color:#9ca3af;">${a}</span>
          </div>`;
      }

      html += `
        <div style="padding:10px 12px;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:20px;">
          ${items}
          <div style="border-top:1px solid #e5e7eb;margin-top:6px;padding-top:6px;display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:12px;color:#6b7280;">${covered.length}/${covered.length + notCovered.length} regulated</div>
            <div style="font-size:12px;font-weight:600;color:${bonusColor};">+${bonus} pts</div>
          </div>
        </div>
      `;
    }
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

  html += `
      <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Anaphylaxis Severity</div>
      ${subScoreBar(bd.anaphylaxis.score, bd.anaphylaxis.weight, "#6366f1")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:12px;margin-bottom:20px;">
        <div style="color:#6b7280;">Severe anaphylaxis</div><div style="font-weight:500;">${bd.anaphylaxis.severeAnaphylaxisPct}%</div>
        <div style="color:#6b7280;">Adrenaline users</div><div style="font-weight:500;">${bd.anaphylaxis.adrenalineUsersPct}%</div>
        <div style="color:#6b7280;">3+ adrenaline doses</div><div style="font-weight:500;">${bd.anaphylaxis.threeOrMoreAdrenalinePct}%</div>
      </div>
  `;

  html += `</div>`;
  return html;
}

const HISTORY_STORAGE_KEY = "allergy-map-history";
const MAX_HISTORY = 20;

interface HistoryEntry {
  id: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  score: number;
  riskLevel: string;
  timestamp: number;
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

function loadHistoryFromStorage(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function MapContent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const { factorCost } = useCost();
  const factorCostRef = useRef(factorCost);
  const { selectedAllergies } = useAllergies();
  const selectedAllergiesRef = useRef(selectedAllergies);
  const [details, setDetails] = useState<DetailsState | null>(null);
  const pendingDetailsRef = useRef<{ region: string; country: string; clickX: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistoryFromStorage);

  useEffect(() => {
    factorCostRef.current = factorCost;
  }, [factorCost]);

  useEffect(() => {
    selectedAllergiesRef.current = selectedAllergies;
  }, [selectedAllergies]);

  const showDetails = useCallback(() => {
    const pending = pendingDetailsRef.current;
    if (!pending) return;
    const allergenNames = Object.keys(selectedAllergiesRef.current);
    const bd = getScoreBreakdown(pending.region, factorCostRef.current, pending.country, allergenNames);
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
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    const L = leafletRef.current;
    if (!L || !mapInstance.current) return;
    setDetails(null);
    mapInstance.current.flyTo([entry.lat, entry.lng], 8);
    pendingDetailsRef.current = {
      region: entry.region,
      country: entry.country,
      clickX: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    };
    const allergenNames = Object.keys(selectedAllergiesRef.current);
    const regionScore = getScoreForRegion(
      entry.region,
      factorCostRef.current,
      entry.country,
      allergenNames
    );
    const color = scoreToColor(regionScore?.riskLevel ?? entry.riskLevel);
    const label = riskLabel(regionScore?.riskLevel ?? entry.riskLevel);
    const score = regionScore?.score ?? entry.score;
    const popupHtml = regionScore
      ? `
        <div style="min-width:180px;font-family:system-ui,sans-serif;">
          <div style="font-weight:600;font-size:14px;margin-bottom:6px;">${entry.country}</div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Region: ${entry.region}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:14px;height:14px;border-radius:50%;background:${color};flex-shrink:0;"></div>
            <span style="font-weight:600;font-size:14px;">${label}</span>
          </div>
          <div style="font-size:24px;font-weight:700;color:${color};">${score.toFixed(1)}<span style="font-size:14px;color:#9ca3af;">/100</span></div>
          <div style="margin-top:6px;font-size:11px;color:#9ca3af;">Allergy Readiness Score</div>
          <a href="#" onclick="window.__showScoreDetails?.(); return false;"
             style="display:inline-block;margin-top:10px;font-size:12px;color:#3b82f6;text-decoration:none;font-weight:500;">
            View details &rarr;
          </a>
        </div>
      `
      : `
        <div style="min-width:140px;font-family:system-ui,sans-serif;">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${entry.country}</div>
          <div style="font-size:12px;color:#9ca3af;">No readiness data available for this region.</div>
        </div>
      `;
    L.popup()
      .setLatLng([entry.lat, entry.lng])
      .setContent(popupHtml)
      .openOn(mapInstance.current);
  }, []);

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
      leafletRef.current = L;

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
            const allergenNames = Object.keys(selectedAllergiesRef.current);
            const regionScore = region
              ? getScoreForRegion(region, factorCostRef.current, country, allergenNames)
              : undefined;

            pendingDetailsRef.current = region
              ? { region, country, clickX }
              : null;

            if (region && regionScore) {
              const newEntry: HistoryEntry = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                country,
                region,
                lat,
                lng,
                score: regionScore.score,
                riskLevel: regionScore.riskLevel,
                timestamp: Date.now(),
              };
              setHistory((prev) =>
                [newEntry, ...prev.filter((e) => e.country !== country)].slice(0, MAX_HISTORY)
              );
            }

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
      leafletRef.current = null;
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

  const allergenNames = useMemo(
    () => Object.keys(selectedAllergies),
    [selectedAllergies]
  );

  const top5 = useMemo(() => {
    const countries = [
      "United States", "Canada", "Mexico", "Brazil", "Argentina", "Chile",
      "Colombia", "Ecuador", "Peru", "Venezuela", "Panama", "Costa Rica",
      "El Salvador", "Guatemala",
      "United Kingdom", "France", "Germany", "Spain", "Italy", "Netherlands",
      "Sweden", "Norway", "Denmark", "Finland", "Iceland", "Ireland",
      "Switzerland", "Belgium", "Poland", "Czech Republic", "Greece",
      "Portugal", "Austria", "Romania", "Hungary", "Croatia", "Serbia",
      "Bulgaria", "Slovakia", "Slovenia", "Ukraine", "Belarus", "Russia",
      "Turkey", "Israel", "Saudi Arabia", "United Arab Emirates", "Qatar",
      "Kuwait", "Jordan", "Egypt", "Morocco", "Tunisia",
      "South Africa", "Nigeria", "Kenya",
      "China", "Japan", "South Korea", "India", "Thailand", "Vietnam",
      "Indonesia", "Philippines", "Malaysia", "Singapore", "Bangladesh",
      "Pakistan", "Sri Lanka", "Taiwan",
      "Australia", "New Zealand", "Fiji",
    ];

    const scored: { country: string; score: number; riskLevel: string; region: string }[] = [];

    for (const country of countries) {
      const region = countryToRegion[country];
      if (!region) continue;
      const result = getScoreForRegion(region, factorCost, country, allergenNames);
      if (result) {
        scored.push({
          country,
          score: result.score,
          riskLevel: result.riskLevel,
          region: result.region,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const topScores = new Set<number>();
    for (const s of scored) {
      topScores.add(s.score);
      if (topScores.size >= 5) break;
    }

    return scored.filter((s) => topScores.has(s.score)).slice(0, 20);
  }, [factorCost, allergenNames]);

  return (
    <div className="flex-1 flex flex-row p-6 gap-4 relative">
      <aside className="w-[220px] flex-shrink-0 flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">History</h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Load without API</p>
        </div>
        <ul className="flex-1 overflow-y-auto p-2 min-h-0">
          {history.length === 0 ? (
            <li className="text-xs text-gray-400 py-4 px-2 text-center">
              Click the map to add locations
            </li>
          ) : (
            history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => loadFromHistory(entry)}
                  className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium text-gray-900 text-sm truncate" title={entry.country}>
                    {entry.country}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-xs text-gray-500 truncate">{entry.region}</span>
                    <span
                      className="text-xs font-semibold flex-shrink-0"
                      style={{
                        color:
                          entry.riskLevel === "low"
                            ? "#22c55e"
                            : entry.riskLevel === "moderate"
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    >
                      {entry.score.toFixed(1)}
                    </span>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      <div className="flex flex-col items-center flex-1 min-w-0">
        <div
          ref={mapRef}
          id="heat-map-container"
          className="w-full max-w-[1000px] min-h-[500px] rounded-lg"
        />

        <div className="w-full max-w-[1000px] mt-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Top 20 Safest Countries
          {allergenNames.length > 0 && (
            <span className="text-gray-400 font-normal ml-1">
              for your allergens
            </span>
          )}
        </h2>
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium">#</th>
                <th className="px-4 py-2.5 font-medium">Country</th>
                <th className="px-4 py-2.5 font-medium">Region</th>
                <th className="px-4 py-2.5 font-medium text-right">Score</th>
                <th className="px-4 py-2.5 font-medium text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {top5.map((entry, i) => (
                <tr
                  key={entry.country}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2.5 text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{entry.country}</td>
                  <td className="px-4 py-2.5 text-gray-500">{entry.region}</td>
                  <td className="px-4 py-2.5 text-right font-semibold" style={{
                    color: entry.riskLevel === "low" ? "#22c55e" : entry.riskLevel === "moderate" ? "#f59e0b" : "#ef4444"
                  }}>
                    {entry.score.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      entry.riskLevel === "low"
                        ? "bg-green-100 text-green-700"
                        : entry.riskLevel === "moderate"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}>
                      {entry.riskLevel === "low" ? "Low" : entry.riskLevel === "moderate" ? "Moderate" : "High"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

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
