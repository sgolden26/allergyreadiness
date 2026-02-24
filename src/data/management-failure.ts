// Table 6: Percentage of food-allergic patients reported with difficult to manage issues
// across regions in respondent centers
// Higher % = worse management = higher risk for travelers

export interface ManagementFailureData {
  region: string;
  avoidTriggerPct: number;
  defineTriggerPct: number;
  educatePatientPct: number;
  preparedToManagePct: number;
  properlyTreatPct: number;
}

export const managementFailure: ManagementFailureData[] = [
  { region: "North America",     avoidTriggerPct: 15.65, defineTriggerPct: 13.94, educatePatientPct: 12.78, preparedToManagePct: 15.59, properlyTreatPct: 24.47 },
  { region: "Central America",   avoidTriggerPct: 31.25, defineTriggerPct: 24.38, educatePatientPct: 27.00, preparedToManagePct: 30.63, properlyTreatPct: 30.63 },
  { region: "South America",     avoidTriggerPct: 20.22, defineTriggerPct: 24.40, educatePatientPct: 20.50, preparedToManagePct: 30.44, properlyTreatPct: 34.56 },
  { region: "Northern Europe",   avoidTriggerPct: 12.50, defineTriggerPct: 15.00, educatePatientPct: 20.00, preparedToManagePct:  7.20, properlyTreatPct: 11.00 },
  { region: "Eastern Europe",    avoidTriggerPct: 29.43, defineTriggerPct: 20.86, educatePatientPct: 11.57, preparedToManagePct: 18.14, properlyTreatPct: 12.29 },
  { region: "Southern Europe",   avoidTriggerPct: 20.06, defineTriggerPct: 26.32, educatePatientPct: 18.47, preparedToManagePct: 17.82, properlyTreatPct: 21.18 },
  { region: "Western Europe",    avoidTriggerPct: 12.50, defineTriggerPct: 27.50, educatePatientPct: 10.00, preparedToManagePct: 10.00, properlyTreatPct: 17.50 },
  { region: "Western Asia",      avoidTriggerPct: 37.14, defineTriggerPct: 16.67, educatePatientPct: 26.33, preparedToManagePct: 24.43, properlyTreatPct: 23.29 },
  { region: "Eastern Asia",      avoidTriggerPct:  9.00, defineTriggerPct: 10.00, educatePatientPct:  9.00, preparedToManagePct:  2.50, properlyTreatPct:  1.50 },
  { region: "Southern Asia",     avoidTriggerPct: 20.00, defineTriggerPct: 21.25, educatePatientPct: 20.00, preparedToManagePct: 25.00, properlyTreatPct: 26.00 },
  { region: "South-Eastern Asia",avoidTriggerPct: 28.33, defineTriggerPct: 30.00, educatePatientPct: 23.33, preparedToManagePct: 26.67, properlyTreatPct:  6.67 },
  { region: "Oceania",           avoidTriggerPct: 18.67, defineTriggerPct: 13.67, educatePatientPct:  5.00, preparedToManagePct:  7.67, properlyTreatPct: 26.67 },
  { region: "North Africa",      avoidTriggerPct: 18.33, defineTriggerPct: 40.00, educatePatientPct:  5.00, preparedToManagePct: 14.00, properlyTreatPct: 18.33 },
  { region: "Sub-Saharan Africa",avoidTriggerPct: 13.33, defineTriggerPct: 35.00, educatePatientPct: 23.33, preparedToManagePct: 23.33, properlyTreatPct: 28.33 },
];

export function getAverageFailure(data: ManagementFailureData): number {
  return (
    data.avoidTriggerPct +
    data.defineTriggerPct +
    data.educatePatientPct +
    data.preparedToManagePct +
    data.properlyTreatPct
  ) / 5;
}
