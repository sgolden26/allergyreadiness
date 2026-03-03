## Travel Allergy Readiness Index Map

**Travel Allergy Readiness Index Map** is a Next.js application that helps people with food allergies (and related dietary needs) understand how "ready" different countries and regions are for them.

It combines clinical management data, food labeling regulations, Codex Alimentarius membership, and healthcare cost information into a single **readiness score** per country, surfaced through an interactive map and dashboard.

### What the app does today

- **Interactive readiness map**
  - Visualizes countries with colors mapped to overall allergy risk (low / moderate / high).
  - Lets you **search by location** from the header search bar.
  - Uses a region mapping under the hood (e.g. Western Europe, North America, South-Eastern Asia) to power scores.

- **Personalization dashboard (header)**
  - Persistent header (`Dashboard`) with navigation, search, and filters, rendered on every page.
  - **Allergy selector**:
    - Choose from common allergens (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans, sesame).
    - Mark severity for each allergen (Anaphylaxis / Hives / Intolerance / Minor).
    - Add a free-text "Other" allergy and include it in your profile.
  - **Cost factor toggle**:
    - Uses `CostContext` so you can choose whether to factor healthcare cost into the readiness score.
  - Stores allergy selections and cost factor preference in React context so other parts of the app can respond to them.

- **Readiness scoring engine**
  - The main page uses a scoring engine from the `src/data` modules to compute:
    - **Overall readiness score** (0–100) per country/region.
    - **Breakdown by dimension**, such as:
      - Management quality and failure rates.
      - Food labeling effectiveness and compliance.
      - Allergen regulation coverage vs. the user’s selected allergens.
      - Codex Alimentarius membership and its impact on label reliability.
      - Anaphylaxis prevalence and severity patterns.
      - Healthcare costs and normalized burden.
  - Builds a rich HTML breakdown for each country showing:
    - Weighted sub-scores with progress bars.
    - Details on how many selected allergens are regulated.
    - Labeling compliance stats (effective rate, non‑compliance, no labeling, etc.).
    - Anaphylaxis severity indicators (severe cases, adrenaline use, multiple doses).

- **Context providers**
  - `AllergyContext` exposes the user’s selected allergens and severities.
  - `CostContext` exposes whether to include cost in the readiness calculation and related values.
  - Both are wired into the `RootLayout` so they wrap the entire app.

- **Placeholder content pages**
  - `Index` (`/index-page`), `Resources` (`/resources`), `About` (`/about`), and `Contact` (`/contact`) pages are set up and currently render empty shells that share the global layout and dashboard.
  - Top navigation links in the header route between these pages.

### Tech stack

- **Framework**: Next.js 14 (App Router, `src/app` structure).
- **Language**: TypeScript with React 18.
- **Styling**: Tailwind CSS for layout and UI styling.
- **State management**: React Context for cost and allergy selection.
- **Mapping / geo**: Leaflet (and associated type definitions) for interactive map behavior.

### Roadmap / planned additions

These are the next things planned for the project:

- **Enriched public data**
  - Finish moving and expanding region–ingredient and region–allergen datasets into `public/data` so the map and index can pull from real-world ingredient patterns.
  - Add more granular regional breakdowns (e.g., city-level or sub‑national where data exists).

- **Index view (`/index-page`)**
  - Build a sortable, filterable **tabular index** of countries/regions with:
    - Overall readiness score.
    - Key sub-scores (management, labeling, regulations, cost, anaphylaxis).
    - Indicators of which of the user’s selected allergens are regulated.
  - Allow exporting or copying the index for trip planning / clinician discussions.

- **Resources page (`/resources`)**
  - Curate educational resources about:
    - Managing food allergies while traveling.
    - Understanding food labeling and Codex standards.
    - Working with local clinicians and emergency services.
  - Include quick‑links grouped by region and by allergen type.

- **About page (`/about`)**
  - Explain the **methodology** behind the readiness score:
    - Data sources for each dimension (management, labeling, regulations, cost, anaphylaxis).
    - Weighting scheme for combining sub-scores into a single index.
    - Limitations and caveats (e.g., missing data, regional biases).
  - Add a short narrative about the motivation: making travel safer and less anxiety‑provoking for people with severe allergies.

- **Contact page (`/contact`)**
  - Add a simple, accessible contact form for:
    - Feedback on data quality or coverage gaps.
    - Suggestions for new regions, allergens, or features.
    - Potential collaborations with clinicians, researchers, or patient groups.

- **Deeper personalization**
  - Use selected allergens and severities to:
    - Highlight especially risky regions for that individual.
    - Re‑weight sub-scores (e.g., labeling matters even more for anaphylaxis‑level allergens).
  - Add views that show how readiness changes if:
    - Cost is / is not factored in.
    - Labeling or regulation assumptions are toggled.

- **Better UX around the map**
  - Improve map interactions (hover / click tooltips, mobile-friendly behavior, zoom presets).
  - Make the HTML breakdown panel feel more like a native UI card instead of raw HTML markup.

### Getting started

- **Install dependencies**

```bash
npm install
```

- **Run the dev server**

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Contributing / future work notes

This project is still early and evolving. The README is meant to stay in sync with:

- Current **implemented features** (map, scoring, dashboard).
- The **planned roadmap** above.

As you add new capabilities (e.g., fully fleshed out content pages, new score dimensions, more datasets), updating this README will keep the vision and status clear for collaborators and future you.

