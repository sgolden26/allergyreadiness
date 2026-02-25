// International food allergen labeling regulations by country.
// Source: International Regulatory Chart - April 1, 2025
// Maps country names to the set of allergens they require on labels.
// Allergen names match the Dashboard dropdown options.

const ALL_NINE = [
  "Milk", "Eggs", "Fish", "Crustacean Shellfish",
  "Tree Nuts", "Peanuts", "Wheat", "Soybeans", "Sesame",
] as const;

// Codex 8 = standard set without Sesame
const CODEX_EIGHT = [
  "Milk", "Eggs", "Fish", "Crustacean Shellfish",
  "Tree Nuts", "Peanuts", "Wheat", "Soybeans",
] as const;

const regulations: Record<string, readonly string[]> = {};

function register(countries: string[], allergens: readonly string[]) {
  for (const c of countries) {
    regulations[c] = allergens;
  }
}

// --- All 9 allergens ---

register(["United States", "United States of America", "USA"], ALL_NINE);
register(["Canada"], ALL_NINE);
register(["Australia", "New Zealand"], ALL_NINE);
register(["Bangladesh"], ALL_NINE);
register(["Belarus"], ALL_NINE);
register(["Bolivia"], ALL_NINE);
register(["Brazil"], ALL_NINE);
register(["China"], ALL_NINE);
register(["Colombia"], ALL_NINE);
register(["Cuba"], ALL_NINE);
register(["Egypt"], ALL_NINE);
register(["Israel"], ALL_NINE);
register(["Kazakhstan"], ALL_NINE);
register(["Russia", "Russian Federation"], ALL_NINE);
register(["South Africa"], ALL_NINE);
register(["Taiwan"], ALL_NINE);
register(["Thailand"], ALL_NINE);
register(["Turkey", "Türkiye"], ALL_NINE);
register(["Ukraine"], ALL_NINE);
register(["Venezuela"], ALL_NINE);

// EU member states
register([
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
  "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
  "Spain", "Sweden",
], ALL_NINE);

// Non-EU countries adopting EU allergen labeling regulations
register([
  "Iceland", "Liechtenstein", "Norway", "North Macedonia", "Switzerland",
  "United Kingdom",
], ALL_NINE);

// GSO countries
register([
  "Saudi Arabia", "United Arab Emirates", "Kuwait", "Bahrain", "Oman",
  "Qatar", "Yemen",
], ALL_NINE);

// CARICOM member states
register([
  "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Dominica",
  "Grenada", "Guyana", "Haiti", "Jamaica",
], ALL_NINE);

// Central American Technical Regulation countries
register([
  "Costa Rica", "Guatemala", "Honduras", "El Salvador", "Nicaragua",
], ALL_NINE);

// --- Codex 8 (no Sesame) ---

register(["Argentina"], CODEX_EIGHT);
register(["Botswana"], CODEX_EIGHT);
register(["Chile"], CODEX_EIGHT);
register(["Fiji"], CODEX_EIGHT);
register(["Hong Kong"], CODEX_EIGHT);
register(["India"], CODEX_EIGHT);
register(["Indonesia"], CODEX_EIGHT);
register(["Malawi"], CODEX_EIGHT);
register(["Malaysia"], CODEX_EIGHT);
register(["Mexico"], CODEX_EIGHT);
register(["Morocco"], CODEX_EIGHT);
register(["Nigeria"], CODEX_EIGHT);
register(["Philippines"], CODEX_EIGHT);
register(["Singapore"], CODEX_EIGHT);
register(["Tunisia"], CODEX_EIGHT);
register(["Vietnam"], CODEX_EIGHT);

// --- Special cases ---

// Japan: mandatory labeling for specific species only
register(["Japan"], [
  "Milk", "Eggs", "Crustacean Shellfish", "Peanuts", "Tree Nuts", "Wheat",
]);

// South Korea: no sesame, specific species for several categories
register(["South Korea", "Korea", "Republic of Korea"], [
  "Milk", "Eggs", "Fish", "Crustacean Shellfish",
  "Tree Nuts", "Peanuts", "Wheat", "Soybeans",
]);

// Build case-insensitive lookup
const lowerLookup: Record<string, readonly string[]> = {};
for (const [country, allergens] of Object.entries(regulations)) {
  lowerLookup[country.toLowerCase()] = allergens;
}

export function getRegulatedAllergens(country: string): readonly string[] {
  return lowerLookup[country.toLowerCase()] ?? [];
}

export function isAllergenRegulated(country: string, allergen: string): boolean {
  const regulated = getRegulatedAllergens(country);
  return regulated.some((r) => r.toLowerCase() === allergen.toLowerCase());
}

export function getAllergenCoverage(
  country: string,
  selectedAllergens: string[]
): { covered: string[]; notCovered: string[]; coverageRatio: number } {
  const regulated = getRegulatedAllergens(country);
  const regulatedLower = new Set(regulated.map((r) => r.toLowerCase()));

  const covered: string[] = [];
  const notCovered: string[] = [];

  for (const allergen of selectedAllergens) {
    if (regulatedLower.has(allergen.toLowerCase())) {
      covered.push(allergen);
    } else {
      notCovered.push(allergen);
    }
  }

  const coverageRatio = selectedAllergens.length > 0
    ? covered.length / selectedAllergens.length
    : 0;

  return { covered, notCovered, coverageRatio };
}
