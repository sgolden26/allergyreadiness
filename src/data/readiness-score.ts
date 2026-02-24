import { anaphylaxisPrevalence, type AnaphylaxisData } from "./anaphylaxis-prevalence";
import { managementFailure, getAverageFailure } from "./management-failure";
import { getNormalizedCost } from "./healthcare-cost";

export interface RegionScore {
  region: string;
  score: number;
  riskLevel: "low" | "moderate" | "high";
}

const failureLookup: Record<string, number> = {};
for (const data of managementFailure) {
  failureLookup[data.region] = getAverageFailure(data);
}

// Anaphylaxis risk:
//   severeAnaphylaxisPct × (1 - adrenalineUsersPct/100) + threeOrMoreAdrenalinePct × weight
//
// Management failure penalty:
//   Average of the 5 failure categories (0-100, higher = worse)
//
// Healthcare cost penalty (optional):
//   Normalized total cost (0-100, higher = more expensive)
//
// Without cost: anaphylaxis 60% + management 40%
// With cost:    anaphylaxis 50% + management 30% + cost 20%
const THREE_PLUS_WEIGHT = 2;
const MAX_ANAPHYLAXIS_RISK = 70;

function calculateScore(data: AnaphylaxisData, factorCost: boolean): number {
  const anaphylaxisRisk =
    data.severeAnaphylaxisPct * (1 - data.adrenalineUsersPct / 100) +
    data.threeOrMoreAdrenalinePct * THREE_PLUS_WEIGHT;

  const anaphylaxisScore = 100 - (anaphylaxisRisk / MAX_ANAPHYLAXIS_RISK) * 100;
  const avgFailure = failureLookup[data.region] ?? 20;
  const managementScore = 100 - avgFailure;

  if (!factorCost) {
    const combined = anaphylaxisScore * 0.6 + managementScore * 0.4;
    return Math.max(0, Math.min(100, combined));
  }

  const normalizedCost = getNormalizedCost(data.region) ?? 50;
  const costScore = 100 - normalizedCost;

  const combined =
    anaphylaxisScore * 0.5 +
    managementScore * 0.3 +
    costScore * 0.2;

  return Math.max(0, Math.min(100, combined));
}

function getRiskLevel(score: number): "low" | "moderate" | "high" {
  if (score >= 70) return "low";
  if (score >= 40) return "moderate";
  return "high";
}

export function getRegionScores(factorCost = false): RegionScore[] {
  return anaphylaxisPrevalence.map((data) => {
    const score = calculateScore(data, factorCost);
    return {
      region: data.region,
      score: Math.round(score * 10) / 10,
      riskLevel: getRiskLevel(score),
    };
  });
}

export function getScoreForRegion(
  region: string,
  factorCost = false
): RegionScore | undefined {
  return getRegionScores(factorCost).find(
    (r) => r.region.toLowerCase() === region.toLowerCase()
  );
}
