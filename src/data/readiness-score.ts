import { anaphylaxisPrevalence, type AnaphylaxisData } from "./anaphylaxis-prevalence";
import { managementFailure, getAverageFailure, type ManagementFailureData } from "./management-failure";
import { getNormalizedCost, healthcareCost } from "./healthcare-cost";
import { isCodexMember } from "./codex-alimentarius";
import { getLabelingCompliance, type LabelingComplianceData } from "./labeling-compliance-latam";

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
  codex?: {
    isMember: boolean;
    bonus: number;
  };
  labeling?: {
    hasData: true;
    effectiveRate: number;
    foodAllergenLabelingPct: number;
    compliancePct: number;
    nonCompliancePct: number;
    noLabelingPct: number;
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
const CODEX_BONUS = 15;

// 95% effective labeling is the threshold. Below it, score is penalized heavily.
// effectiveRate = foodAllergenLabelingPct × compliancePct / 100
const LABELING_THRESHOLD = 95;
const LABELING_PENALTY_MULTIPLIER = 0.5;

function computeLabelingBonus(country: string): {
  bonus: number;
  labeling: LabelingComplianceData | undefined;
  effectiveRate: number;
} {
  const labeling = getLabelingCompliance(country);
  if (labeling) {
    const effectiveRate =
      (labeling.foodAllergenLabelingPct * labeling.compliancePct) / 100;
    const rounded = Math.round(effectiveRate * 10) / 10;

    if (effectiveRate >= LABELING_THRESHOLD) {
      return { bonus: CODEX_BONUS, labeling, effectiveRate: rounded };
    }
    // Below 95%: heavy penalty proportional to the gap
    const deficit = LABELING_THRESHOLD - effectiveRate;
    const penalty = -(deficit * LABELING_PENALTY_MULTIPLIER);
    return { bonus: Math.round(penalty * 10) / 10, labeling, effectiveRate: rounded };
  }
  if (isCodexMember(country)) {
    return { bonus: CODEX_BONUS, labeling: undefined, effectiveRate: 0 };
  }
  return { bonus: 0, labeling: undefined, effectiveRate: 0 };
}

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
  factorCost = false,
  country?: string
): RegionScore | undefined {
  const base = getRegionScores(factorCost).find(
    (r) => r.region.toLowerCase() === region.toLowerCase()
  );
  if (!base) return undefined;
  if (country) {
    const { bonus } = computeLabelingBonus(country);
    if (bonus !== 0) {
      const adjusted = Math.max(0, Math.min(100, base.score + bonus));
      return { ...base, score: Math.round(adjusted * 10) / 10, riskLevel: getRiskLevel(adjusted) };
    }
  }
  return base;
}

export function getScoreBreakdown(
  region: string,
  factorCost = false,
  country?: string
): ScoreBreakdown | undefined {
  const anaData = anaphylaxisPrevalence.find(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
  if (!anaData) return undefined;

  const comp = computeComponents(anaData, factorCost);
  const isMember = country ? isCodexMember(country) : false;
  const labelInfo = country ? computeLabelingBonus(country) : { bonus: 0, labeling: undefined, effectiveRate: 0 };
  const bonus = labelInfo.bonus;
  const finalScore = Math.max(0, Math.min(100, comp.combined + bonus));
  const score = Math.round(finalScore * 10) / 10;
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

  if (country) {
    breakdown.codex = { isMember, bonus };
    if (labelInfo.labeling) {
      breakdown.labeling = {
        hasData: true,
        effectiveRate: labelInfo.effectiveRate,
        foodAllergenLabelingPct: labelInfo.labeling.foodAllergenLabelingPct,
        compliancePct: labelInfo.labeling.compliancePct,
        nonCompliancePct: labelInfo.labeling.nonCompliancePct,
        noLabelingPct: labelInfo.labeling.noLabelingPct,
      };
    }
  }

  return breakdown;
}
