// Table 1: Compliance and non-compliance with local regulations for the
// characteristics of food allergen labelling in Latin America.
// All values are % (n = sample count)

export interface LabelingComplianceData {
  country: string;
  sampleSize: number;
  foodAllergenLabelingPct: number;
  compliancePct: number;
  nonCompliancePct: number;
  noLabelingPct: number;
  noLabelingButAllergensInIngredientsPct: number;
}

export const labelingComplianceLatAm: LabelingComplianceData[] = [
  {
    country: "Argentina",
    sampleSize: 1260,
    foodAllergenLabelingPct: 71.66,
    compliancePct: 91.69,
    nonCompliancePct: 8.30,
    noLabelingPct: 28.33,
    noLabelingButAllergensInIngredientsPct: 22.12,
  },
  {
    country: "Colombia",
    sampleSize: 1857,
    foodAllergenLabelingPct: 64.35,
    compliancePct: 94.22,
    nonCompliancePct: 5.77,
    noLabelingPct: 35.64,
    noLabelingButAllergensInIngredientsPct: 35.64,
  },
  {
    country: "Ecuador",
    sampleSize: 2114,
    foodAllergenLabelingPct: 64.71,
    compliancePct: 88.52,
    nonCompliancePct: 11.47,
    noLabelingPct: 35.28,
    noLabelingButAllergensInIngredientsPct: 15.81,
  },
  {
    country: "El Salvador",
    sampleSize: 1351,
    foodAllergenLabelingPct: 62.25,
    compliancePct: 78.0,
    nonCompliancePct: 22.0,
    noLabelingPct: 37.74,
    noLabelingButAllergensInIngredientsPct: 32.74,
  },
  {
    country: "Mexico",
    sampleSize: 1923,
    foodAllergenLabelingPct: 65.78,
    compliancePct: 93.75,
    nonCompliancePct: 6.24,
    noLabelingPct: 34.21,
    noLabelingButAllergensInIngredientsPct: 35.10,
  },
  {
    country: "Panama",
    sampleSize: 1749,
    foodAllergenLabelingPct: 52.71,
    compliancePct: 97.83,
    nonCompliancePct: 2.16,
    noLabelingPct: 47.28,
    noLabelingButAllergensInIngredientsPct: 36.15,
  },
];

export const labelingComplianceTotal: LabelingComplianceData = {
  country: "Total",
  sampleSize: 10254,
  foodAllergenLabelingPct: 63.33,
  compliancePct: 90.99,
  nonCompliancePct: 9.01,
  noLabelingPct: 36.66,
  noLabelingButAllergensInIngredientsPct: 30.05,
};

export function getLabelingCompliance(
  country: string
): LabelingComplianceData | undefined {
  return labelingComplianceLatAm.find(
    (d) => d.country.toLowerCase() === country.toLowerCase()
  );
}
