import { anaphylaxisPrevalence, type AnaphylaxisData } from "./anaphylaxis-prevalence";
import { managementFailure, getAverageFailure, type ManagementFailureData } from "./management-failure";
import { getNormalizedCost, healthcareCost } from "./healthcare-cost";

export interface RegionScore {
  region: string;
  score: number;
  riskLevel: "low" | "moderate" | "high";
}

export interface ScoreBreakdown {
  region: string;
  overall: { score: number; riskLevel: "low" | "moderate" | "high" };
  anaphylaxis: {
    score: number;
    weight: number;
    severeAnaphylaxisPct: number;
    adrenalineUsersPct: number;
    threeOrMoreAdrenalinePct: number;
  };
  management: {
    score: number;
    weight: number;
    averageFailure: number;
    avoidTriggerPct: number;
    defineTriggerPct: number;
    educatePatientPct: number;
    preparedToManagePct: number;
    properlyTreatPct: number;
  };
  cost?: {
    score: number;
    weight: number;
    totalCost: number;
    normalizedCost: number;
  };
}

const failureLookup: Record<string, number> = {};
const failureDataLookup: Record<string, ManagementFailureData> = {};
for (const data of managementFailure) {
  failureLookup[data.region] = getAverageFailure(data);
  failureDataLookup[data.region] = data;
}

const THREE_PLUS_WEIGHT = 2;
const MAX_ANAPHYLAXIS_RISK = 70;

function computeComponents(data: AnaphylaxisData, factorCost: boolean) {
  const anaphylaxisRisk =
    data.severeAnaphylaxisPct * (1 - data.adrenalineUsersPct / 100) +
    data.threeOrMoreAdrenalinePct * THREE_PLUS_WEIGHT;

  const anaphylaxisScore = 100 - (anaphylaxisRisk / MAX_ANAPHYLAXIS_RISK) * 100;
  const avgFailure = failureLookup[data.region] ?? 20;
  const managementScore = 100 - avgFailure;

  if (!factorCost) {
    const combined = anaphylaxisScore * 0.6 + managementScore * 0.4;
    return {
      anaphylaxisScore,
      managementScore,
      anaphylaxisWeight: 0.6,
      managementWeight: 0.4,
      avgFailure,
      combined: Math.max(0, Math.min(100, combined)),
    };
  }

  const normalizedCost = getNormalizedCost(data.region) ?? 50;
  const costScore = 100 - normalizedCost;

  const combined =
    anaphylaxisScore * 0.5 +
    managementScore * 0.3 +
    costScore * 0.2;

  return {
    anaphylaxisScore,
    managementScore,
    anaphylaxisWeight: 0.5,
    managementWeight: 0.3,
    avgFailure,
    costScore,
    costWeight: 0.2,
    normalizedCost,
    combined: Math.max(0, Math.min(100, combined)),
  };
}

function getRiskLevel(score: number): "low" | "moderate" | "high" {
  if (score >= 70) return "low";
  if (score >= 40) return "moderate";
  return "high";
}

export function getRegionScores(factorCost = false): RegionScore[] {
  return anaphylaxisPrevalence.map((data) => {
    const { combined } = computeComponents(data, factorCost);
    const score = Math.round(combined * 10) / 10;
    return {
      region: data.region,
      score,
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

export function getScoreBreakdown(
  region: string,
  factorCost = false
): ScoreBreakdown | undefined {
  const anaData = anaphylaxisPrevalence.find(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
  if (!anaData) return undefined;

  const comp = computeComponents(anaData, factorCost);
  const score = Math.round(comp.combined * 10) / 10;
  const mgmt = failureDataLookup[anaData.region];

  const breakdown: ScoreBreakdown = {
    region: anaData.region,
    overall: { score, riskLevel: getRiskLevel(score) },
    anaphylaxis: {
      score: Math.round(comp.anaphylaxisScore * 10) / 10,
      weight: comp.anaphylaxisWeight,
      severeAnaphylaxisPct: anaData.severeAnaphylaxisPct,
      adrenalineUsersPct: anaData.adrenalineUsersPct,
      threeOrMoreAdrenalinePct: anaData.threeOrMoreAdrenalinePct,
    },
    management: {
      score: Math.round(comp.managementScore * 10) / 10,
      weight: comp.managementWeight,
      averageFailure: Math.round(comp.avgFailure * 10) / 10,
      avoidTriggerPct: mgmt?.avoidTriggerPct ?? 0,
      defineTriggerPct: mgmt?.defineTriggerPct ?? 0,
      educatePatientPct: mgmt?.educatePatientPct ?? 0,
      preparedToManagePct: mgmt?.preparedToManagePct ?? 0,
      properlyTreatPct: mgmt?.properlyTreatPct ?? 0,
    },
  };

  if (factorCost && "costScore" in comp) {
    const costEntry = healthcareCost.find(
      (d) => d.region.toLowerCase() === region.toLowerCase()
    );
    breakdown.cost = {
      score: Math.round((comp.costScore as number) * 10) / 10,
      weight: comp.costWeight as number,
      totalCost: costEntry?.totalCost ?? 0,
      normalizedCost: Math.round((comp.normalizedCost as number) * 10) / 10,
    };
  }

  return breakdown;
}
