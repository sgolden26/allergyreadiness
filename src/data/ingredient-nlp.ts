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
    "milk",
    "butter",
    "cream",
    "cheese",
    "yogurt",
    "ghee",
    "mozzarella",
    "parmesan",
    "奶",
  ],
  "Eggs": [
    // TODO: add keywords
    // e.g., "egg", ...
    "egg",
    "egg_yolk",
    "egg_white",
    "omelette",
    "scrambled_egg",
    "tamago",
  ],
  "Fish": [
    // TODO: add keywords for fish ingredients
    // Hint: look at the CSV for specific fish names
    "fish",
    "salmon",
    "tuna",
    "cod",
    "mackerel",
    "anchovy",
    "sardine",
    "trout",
  ],
  "Crustacean Shellfish": [
    // TODO: add keywords
    // e.g., "shrimp", "crab", "lobster", ...
    "shrimp",
    "prawn",
    "crab",
    "lobster",
    "crayfish",
    "scampi",
  ],
  "Tree Nuts": [
    // TODO: add keywords
    // e.g., "almond", "walnut", "cashew", "pistachio", ...
    "almond",
    "walnut",
    "cashew",
    "pistachio",
    "hazelnut",
    "pecan",
    "macadamia",
    "brazil_nut",
    "pine_nut",
    "nut",
  ],
  "Peanuts": [
    // TODO: add keywords
    // e.g., "peanut", ...
    "peanut",
    "peanut_butter",
    "groundnut",
    "satay_peanut_sauce",
  ],
  "Wheat": [
    // TODO: add keywords
    // e.g., "wheat", "bread", "flour", ...
    "wheat",
    "bread",
    "flour",
    "noodle",
    "pasta",
    "udon",
    "ramen",
    "semolina",
  ],
  "Soybeans": [
    // TODO: add keywords
    // e.g., "soy_sauce", "soybean", "tofu", "miso", ...
    "soy",
    "soybean",
    "soy_sauce",
    "tofu",
    "miso",
    "edamame",
    "tempeh",
  ],
  "Sesame": [
    // TODO: add keywords
    // e.g., "sesame", "tahini", ...
    "sesame",
    "sesame_seed",
    "sesame_oil",
    "tahini",
    "gomashio",
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
  const recipes: Recipe[] = [];

  const lines = csvText.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const parts = line.split(",");
    if (parts.length < 2) continue;

    const region = parts[0].trim();
    const ingredients = parts
      .slice(1)
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => v.toLowerCase());

    if (!region || ingredients.length === 0) continue;

    recipes.push({ region, ingredients });
  }

  return recipes;
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
  const keywords = allergenKeywords[allergen] ?? [];
  if (!keywords.length) return false;

  const lower = ingredient.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
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
  const byRegion = new Map<string, Recipe[]>();

  for (const recipe of recipes) {
    if (!byRegion.has(recipe.region)) {
      byRegion.set(recipe.region, []);
    }
    byRegion.get(recipe.region)!.push(recipe);
  }

  const result: AllergenFrequency[] = [];

  for (const [region, regionRecipes] of byRegion.entries()) {
    const totalRecipes = regionRecipes.length;
    const allergenStats: Record<string, { count: number; pct: number }> = {};

    for (const allergen of Object.keys(allergenKeywords)) {
      let count = 0;
      for (const recipe of regionRecipes) {
        const hasAllergen = recipe.ingredients.some((ing) =>
          ingredientMatchesAllergen(ing, allergen)
        );
        if (hasAllergen) count += 1;
      }
      const pct = totalRecipes > 0 ? (count / totalRecipes) * 100 : 0;
      allergenStats[allergen] = { count, pct };
    }

    result.push({
      region,
      totalRecipes,
      allergens: allergenStats,
    });
  }

  return result;
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
  const freq = frequencies.find((f) => f.region === region);
  if (!freq) return undefined;

  const risks: {
    allergen: string;
    recipesContaining: number;
    prevalencePct: number;
  }[] = [];

  for (const allergen of selectedAllergens) {
    const stats = freq.allergens[allergen];
    if (!stats) continue;
    risks.push({
      allergen,
      recipesContaining: stats.count,
      prevalencePct: stats.pct,
    });
  }

  if (!risks.length) {
    return {
      region,
      totalRecipes: freq.totalRecipes,
      risks: [],
      overallPrevalencePct: 0,
    };
  }

  // Approximate overall prevalence by the maximum single-allergen prevalence.
  const overallPrevalencePct = risks.reduce(
    (max, r) => (r.prevalencePct > max ? r.prevalencePct : max),
    0
  );

  return {
    region,
    totalRecipes: freq.totalRecipes,
    risks,
    overallPrevalencePct,
  };
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
  const response = await fetch("/data/region-ingredients.csv");
  const csvText = await response.text();
  const recipes = parseCSV(csvText);
  cachedFrequencies = computeFrequencies(recipes);
  return cachedFrequencies;
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
