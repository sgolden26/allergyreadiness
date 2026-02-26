import { anaphylaxisPrevalence, type AnaphylaxisData } from "./anaphylaxis-prevalence";
import { managementFailure, getAverageFailure, type ManagementFailureData } from "./management-failure";
import { getNormalizedCost, getCostBonusPoints, getUSACost, healthcareCost } from "./healthcare-cost";
import { isCodexMember } from "./codex-alimentarius";
import { getLabelingCompliance, type LabelingComplianceData } from "./labeling-compliance-latam";
import { getAllergenCoverage } from "./allergen-regulations";

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
    weight: number;
    foodAllergenLabelingPct: number;
    compliancePct: number;
    nonCompliancePct: number;
    noLabelingPct: number;
  };
  allergenRegulation?: {
    covered: string[];
    notCovered: string[];
    coverageRatio: number;
    bonus: number;
    score: number;
    weight: number;
    hasSelections: boolean;
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

// Weights: management heaviest, then food labeling, then allergen regs, anaphylaxis lightest
const WEIGHT_MANAGEMENT = 0.45;
const WEIGHT_LABELING = 0.30;
const WEIGHT_ALLERGEN = 0.15;
const WEIGHT_ANAPHYLAXIS = 0.10;

const ALLERGEN_UNREGULATED_PENALTY_PER = 20; // per unregulated allergen, subtracted from 0–100 allergen score

function getLabelingScore(country: string | undefined): number {
  if (!country) return 70;
  const labeling = getLabelingCompliance(country);
  if (labeling) {
    return Math.round((labeling.foodAllergenLabelingPct * labeling.compliancePct) / 100 * 10) / 10;
  }
  return 70;
}

function getAllergenScore(country: string | undefined, selectedAllergens: string[]): number {
  if (!country || selectedAllergens.length === 0) return 100;
  const { coverageRatio, notCovered } = getAllergenCoverage(country, selectedAllergens);
  const score = 100 * coverageRatio - notCovered.length * ALLERGEN_UNREGULATED_PENALTY_PER;
  return Math.max(0, Math.round(score * 10) / 10);
}

function computeLabelingBonus(country: string): {
  bonus: number;
  labeling: LabelingComplianceData | undefined;
  effectiveRate: number;
} {
  const effectiveRate = getLabelingScore(country);
  const labeling = getLabelingCompliance(country) ?? undefined;
  const LABELING_THRESHOLD = 95;
  const CODEX_BONUS = 15;
  const LABELING_PENALTY_MULTIPLIER = 0.5;

  if (effectiveRate >= LABELING_THRESHOLD) {
    return { bonus: CODEX_BONUS, labeling: labeling ?? undefined, effectiveRate };
  }
  const deficit = LABELING_THRESHOLD - effectiveRate;
  const penalty = -(deficit * LABELING_PENALTY_MULTIPLIER);
  return { bonus: Math.round(penalty * 10) / 10, labeling: labeling ?? undefined, effectiveRate };
}

function computeComponents(
  data: AnaphylaxisData,
  factorCost: boolean,
  country?: string,
  selectedAllergens: string[] = []
) {
  const anaphylaxisRisk =
    data.severeAnaphylaxisPct * (1 - data.adrenalineUsersPct / 100) +
    data.threeOrMoreAdrenalinePct * THREE_PLUS_WEIGHT;

  const anaphylaxisScore = 100 - (anaphylaxisRisk / MAX_ANAPHYLAXIS_RISK) * 100;
  const avgFailure = failureLookup[data.region] ?? 20;
  const managementScore = 100 - avgFailure;
  const labelingScore = getLabelingScore(country);
  const allergenScore = getAllergenScore(country, selectedAllergens);

  let combined =
    managementScore * WEIGHT_MANAGEMENT +
    labelingScore * WEIGHT_LABELING +
    allergenScore * WEIGHT_ALLERGEN +
    anaphylaxisScore * WEIGHT_ANAPHYLAXIS;

  let costScore: number | undefined;
  let costWeight: number | undefined;
  let normalizedCost: number | undefined;

  if (factorCost) {
    const costBonus = getCostBonusPoints(data.region);
    combined = Math.max(0, Math.min(100, combined + costBonus));
    const costEntry = healthcareCost.find((d) => d.region.toLowerCase() === data.region.toLowerCase());
    costScore = costBonus;
    costWeight = 1;
    normalizedCost = costEntry ? Math.round((costEntry.totalCost / getUSACost()) * 1000) / 10 : undefined;
  }

  return {
    anaphylaxisScore,
    managementScore,
    anaphylaxisWeight: WEIGHT_ANAPHYLAXIS,
    managementWeight: WEIGHT_MANAGEMENT,
    labelingScore,
    labelingWeight: WEIGHT_LABELING,
    allergenScore,
    allergenWeight: WEIGHT_ALLERGEN,
    avgFailure,
    costScore,
    costWeight,
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
    const { combined } = computeComponents(data, factorCost, undefined, []);
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
  country?: string,
  selectedAllergens: string[] = []
): RegionScore | undefined {
  const anaData = anaphylaxisPrevalence.find(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
  if (!anaData) return undefined;
  const comp = computeComponents(anaData, factorCost, country, selectedAllergens);
  const score = Math.round(comp.combined * 10) / 10;
  return {
    region: anaData.region,
    score,
    riskLevel: getRiskLevel(score),
  };
}

export function getScoreBreakdown(
  region: string,
  factorCost = false,
  country?: string,
  selectedAllergens: string[] = []
): ScoreBreakdown | undefined {
  const anaData = anaphylaxisPrevalence.find(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
  if (!anaData) return undefined;

  const comp = computeComponents(anaData, factorCost, country, selectedAllergens);
  const score = Math.round(comp.combined * 10) / 10;
  const mgmt = failureDataLookup[anaData.region];
  const labelInfo = country ? computeLabelingBonus(country) : null;
  const coverage = country && selectedAllergens.length > 0
    ? getAllergenCoverage(country, selectedAllergens)
    : null;

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

  if (factorCost && comp.costScore !== undefined) {
    const costEntry = healthcareCost.find(
      (d) => d.region.toLowerCase() === region.toLowerCase()
    );
    breakdown.cost = {
      score: Math.round(comp.costScore * 10) / 10,
      weight: comp.costWeight ?? 0,
      totalCost: costEntry?.totalCost ?? 0,
      normalizedCost: comp.normalizedCost ?? 0,
    };
  }

  if (country) {
    breakdown.codex = {
      isMember: isCodexMember(country),
      bonus: labelInfo?.bonus ?? 0,
    };
    breakdown.labeling = {
      hasData: true,
      effectiveRate: comp.labelingScore,
      weight: WEIGHT_LABELING,
      foodAllergenLabelingPct: labelInfo?.labeling?.foodAllergenLabelingPct ?? 0,
      compliancePct: labelInfo?.labeling?.compliancePct ?? 0,
      nonCompliancePct: labelInfo?.labeling?.nonCompliancePct ?? 0,
      noLabelingPct: labelInfo?.labeling?.noLabelingPct ?? 0,
    };
    breakdown.allergenRegulation = {
      covered: coverage?.covered ?? [],
      notCovered: coverage?.notCovered ?? [],
      coverageRatio: coverage?.coverageRatio ?? 0,
      bonus: Math.round((comp.allergenScore - 100) * WEIGHT_ALLERGEN * 10) / 10,
      score: comp.allergenScore,
      weight: WEIGHT_ALLERGEN,
      hasSelections: selectedAllergens.length > 0,
    };
  }

  return breakdown;
}
