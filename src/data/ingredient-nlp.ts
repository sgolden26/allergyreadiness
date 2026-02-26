// NLP analysis of region-ingredients.csv
// Goal: determine how often allergens appear in each region's cuisine,
// so we can warn travelers about regions where their allergens are common.
//
// The CSV has rows like: Region,ingredient1,ingredient2,...
// Each row is a recipe. Ingredients use underscores (e.g., "soy_sauce").

// ─── STEP 1: Allergen keyword mapping ───────────────────────────────
// Map each user-facing allergen to keywords that match ingredient names
// in the CSV. Add more synonyms as needed.

const allergenKeywords: Record<string, string[]> = {
  "Milk": [
    // TODO: add keywords that indicate milk-based ingredients
    // e.g., "milk", "butter", "cream", "cheese", "yogurt", ...
  ],
  "Eggs": [
    // TODO: add keywords
    // e.g., "egg", ...
  ],
  "Fish": [
    // TODO: add keywords for fish ingredients
    // Hint: look at the CSV for specific fish names
  ],
  "Crustacean Shellfish": [
    // TODO: add keywords
    // e.g., "shrimp", "crab", "lobster", ...
  ],
  "Tree Nuts": [
    // TODO: add keywords
    // e.g., "almond", "walnut", "cashew", "pistachio", ...
  ],
  "Peanuts": [
    // TODO: add keywords
    // e.g., "peanut", ...
  ],
  "Wheat": [
    // TODO: add keywords
    // e.g., "wheat", "bread", "flour", ...
  ],
  "Soybeans": [
    // TODO: add keywords
    // e.g., "soy_sauce", "soybean", "tofu", "miso", ...
  ],
  "Sesame": [
    // TODO: add keywords
    // e.g., "sesame", "tahini", ...
  ],
};

// ─── STEP 2: Parse the CSV ──────────────────────────────────────────
// Reads the CSV text and returns structured recipe data.

interface Recipe {
  region: string;
  ingredients: string[];
}

function parseCSV(csvText: string): Recipe[] {
  // TODO: split csvText by newlines, skip comment lines (#),
  // skip empty lines, then split each line by comma.
  // First element is the region, rest are ingredients.
  //
  // return recipes;
  return [];
}

// ─── STEP 3: Check if an ingredient matches an allergen ─────────────
// Use the keyword map to determine if a given ingredient string
// contains any allergen keyword.

function ingredientMatchesAllergen(
  ingredient: string,
  allergen: string
): boolean {
  // TODO: look up allergenKeywords[allergen], then check if the
  // ingredient string includes any of those keywords.
  // Consider using .includes() for partial matching
  // (e.g., "peanut_butter" should match "peanut").
  //
  // return true/false;
  return false;
}

// ─── STEP 4: Compute allergen frequency per region ──────────────────
// For each region, count how many recipes contain each allergen.

export interface AllergenFrequency {
  region: string;
  totalRecipes: number;
  // allergen name -> { count of recipes containing it, percentage }
  allergens: Record<string, { count: number; pct: number }>;
}

function computeFrequencies(recipes: Recipe[]): AllergenFrequency[] {
  // TODO:
  // 1. Group recipes by region
  // 2. For each region, iterate over its recipes
  // 3. For each recipe, check each allergen (from allergenKeywords)
  //    to see if ANY ingredient in the recipe matches it
  // 4. Count matches and compute percentage
  //
  // return array of AllergenFrequency objects;
  return [];
}

// ─── STEP 5: Risk assessment for a user's selected allergens ────────
// Given a region and the user's allergens, compute a risk metric
// based on how prevalent those allergens are in the local cuisine.

export interface RegionAllergenRisk {
  region: string;
  totalRecipes: number;
  // For each of the user's selected allergens:
  risks: {
    allergen: string;
    recipesContaining: number;
    prevalencePct: number;
  }[];
  // Overall: what % of recipes contain at least one of the user's allergens
  overallPrevalencePct: number;
}

export function getRegionAllergenRisk(
  region: string,
  selectedAllergens: string[],
  frequencies: AllergenFrequency[]
): RegionAllergenRisk | undefined {
  // TODO:
  // 1. Find the frequency data for this region
  // 2. For each selected allergen, pull its count/pct
  // 3. Compute overall prevalence (% of recipes with ANY of the user's allergens)
  //    - Note: for overall, you may need to re-scan recipes to avoid double counting,
  //      or approximate by using the max single-allergen prevalence.
  //
  // return risk object;
  return undefined;
}

// ─── STEP 6: Integration point ──────────────────────────────────────
// Call this once at app startup (or lazily on first use) to load and
// process the CSV data. Then use getRegionAllergenRisk() to look up
// risk info for any region.

let cachedFrequencies: AllergenFrequency[] | null = null;

export async function loadIngredientData(): Promise<AllergenFrequency[]> {
  if (cachedFrequencies) return cachedFrequencies;

  // TODO: fetch or import the CSV file
  // const csvText = await fetch('/data/region-ingredients.csv').then(r => r.text());
  // const recipes = parseCSV(csvText);
  // cachedFrequencies = computeFrequencies(recipes);
  // return cachedFrequencies;

  return [];
}

export function getRegionRiskForUser(
  region: string,
  selectedAllergens: string[]
): RegionAllergenRisk | undefined {
  if (!cachedFrequencies) return undefined;
  return getRegionAllergenRisk(region, selectedAllergens, cachedFrequencies);
}

// ─── STEP 7 (optional): Score integration ───────────────────────────
// Once the above is working, you can feed the prevalence data into
// readiness-score.ts as an additional factor. High allergen prevalence
// in a region's cuisine = lower readiness score.
//
// Suggested approach:
//   - overallPrevalencePct of 80%+ → penalty of -10 to -15 pts
//   - overallPrevalencePct of 50-80% → penalty of -5 to -10 pts
//   - overallPrevalencePct below 30% → small bonus of +3 to +5 pts
//
// You would add this as another adjustment in getScoreForRegion()
// and getScoreBreakdown(), similar to how allergen regulation works.
