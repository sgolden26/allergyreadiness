// Table 7: Unit cost of different healthcare services resulting from food allergy
// across regions in respondent centers (total of all service categories)
//
// Services included: Adrenaline, ICU, ED visit, Emergency call, ED admission,
// Dietician, OFCI, SPT x7, Mol x12, RAST x7, Paediatrician, GP, Psych, Allergist

export interface HealthcareCostData {
  region: string;
  totalCost: number;
}

export const healthcareCost: HealthcareCostData[] = [
  { region: "North America",      totalCost: 12304.55 },
  { region: "Central America",    totalCost: 2804.99 },
  { region: "South America",      totalCost: 4115.48 },
  { region: "Northern Europe",    totalCost: 2152.04 },
  { region: "Eastern Europe",     totalCost: 5266.83 },
  { region: "Southern Europe",    totalCost: 2155.55 },
  { region: "Western Europe",     totalCost: 882.50 },
  { region: "Western Asia",       totalCost: 3312.39 },
  { region: "Eastern Asia",       totalCost: 2461.84 },
  { region: "Southern Asia",      totalCost: 1010.00 },
  { region: "South-Eastern Asia", totalCost: 1722.30 },
  { region: "Oceania",            totalCost: 2393.18 },
  { region: "North Africa",       totalCost: 628.33 },
  { region: "Sub-Saharan Africa", totalCost: 3165.55 },
];

const maxCost = Math.max(...healthcareCost.map((d) => d.totalCost));

export function getNormalizedCost(region: string): number | undefined {
  const entry = healthcareCost.find(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
  if (!entry) return undefined;
  return (entry.totalCost / maxCost) * 100;
}

const usaCost =
  healthcareCost.find((d) => d.region === "North America")?.totalCost ?? maxCost;
const MAX_COST_BONUS_POINTS = 20;

/** Bonus points when region is cheaper than USA; 0 for USA or costlier. */
export function getCostBonusPoints(region: string): number {
  const entry = healthcareCost.find(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
  if (!entry || entry.totalCost >= usaCost) return 0;
  const ratio = (usaCost - entry.totalCost) / usaCost;
  return Math.round(ratio * MAX_COST_BONUS_POINTS * 10) / 10;
}

export function getUSACost(): number {
  return usaCost;
}
