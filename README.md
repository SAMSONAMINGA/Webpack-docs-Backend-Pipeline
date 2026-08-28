# Webpack-docs-Backend-Pipeline
The Black Guard's Archive

# SHADOWFALL

Full system documentation — an automated, human-in-the-loop Webpack documentation pipeline (backend) and its Medieval Dark Knight–themed SvelteKit reading experience (frontend).

webpack-docs monorepo · v1.0.0 · generated for review, no credentials included

 

## Contents

01. [1. Overview](#overview)
02. [2. Architecture at a glance](#architecture)
03. [3. Backend pipeline](#backend)
04. [3.1 packages/extractor](#backend-extractor)
05. [3.2 packages/typedoc-theme](#backend-theme)
06. [3.3 scripts/](#backend-scripts)
07. [3.4 CI/CD workflows](#backend-ci)
08. [3.5 monitoring/](#backend-monitoring)
09. [4. Frontend](#frontend)
10. [4.1 Design tokens](#frontend-tokens)
11. [4.2 Components &amp; stores](#frontend-components)
12. [4.3 Routes](#frontend-routes)
13. [4.4 Visual walkthrough](#frontend-visual)
14. [5. Running the system](#running)
15. [6. Security &amp; secrets](#security)
16. [7. Appendix: full file tree](#appendix)

 

 

## 1. Overview

**webpack-docs** is a two-part system. The **backend** is an automated documentation pipeline that reads Webpack's own TypeScript definitions (`webpack/types.d.ts`), extracts every documented symbol, and generates categorized Markdown — while keeping a human in control at every stage (preview mode, an optional approval gate, full reports, and drift-based alerting). The **frontend** is a SvelteKit reading experience, themed as a dark medieval fantasy archive ("SHADOWFALL"), that renders the generated Markdown as an interactive documentation viewer.

**Design philosophy:** the pipeline should never become a black box. Every stage — extraction, normalization, markdown generation, deployment, health checks — writes both a machine-readable JSON report and a human-readable Markdown summary, so a person can always answer *"what is the system doing, what changed, and why was this symbol included or excluded?"*

 

## 2. Architecture at a glance

The pipeline runs as a strict, linear lifecycle. Two points (grey/orange) are explicit human control points.

trigger→ env prep→ version detect→ adapter load→ extract→ normalize→ preview mode→ approval gate→ generate markdown→ sync versions→ site build→ deploy→ health check

Every arrow above corresponds to a written artifact under `reports/<version>/`: `intermediate.json`, `extraction-report.{md,json}`, `normalization-report.{md,json}`, `generation-report.{md,json}`, `deployment.json`, `summary-report.{md,json}`, and an `APPROVED` marker file once a human signs off.

 

## 3. Backend pipeline

Implemented as a pnpm workspace monorepo. Two internal packages do the heavy lifting; four CLI scripts orchestrate them; three GitHub Actions workflows automate the whole thing.

 

### 3.1 packages/extractor

Version detection, TypeDoc-based extraction, normalization, and the schema everything else depends on.

| File                                                  | Responsibility                                                                                                                                                                                                                                                                                              |
|-------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `types.ts`                                            | The **Intermediate JSON Schema (IJS)** — a versioned, zod-validated shape (`IJS_SCHEMA_VERSION`) that every downstream stage consumes. Nothing past normalization knows which Webpack version produced the data.                                                                                            |
| `logger.ts`                                           | `StageLogger` — every log line is written both as a pretty console line and a JSONL record on disk, so any stage's activity can be replayed after the fact.                                                                                                                                                 |
| `version-detect.ts`                                   | Reads the installed `webpack/package.json`, resolves its major version, and locates `types.d.ts`.                                                                                                                                                                                                           |
| `adapters/base.ts, v5.ts, v6.ts, latest.ts, index.ts` | Thin, per-major "Version Adapters" that categorize symbols (Configuration / Plugins / Loaders / API) and apply version-specific renames. The registry falls back gracefully (with a loud warning) to a "latest" adapter for any unrecognized major version — new Webpack releases never crash the pipeline. |
| `extract.ts`                                          | Runs TypeDoc against `types.d.ts`, converts reflections into raw symbols, and is **fail-soft**: unknown TypeScript constructs are logged as warnings and marked undocumented rather than crashing the run.                                                                                                  |
| `normalize.ts`                                        | Applies adapter categorization, validates the final document against the zod schema, and diffs the run against the previous successful run (added/removed symbols, category deltas).                                                                                                                        |
| `report.ts`                                           | Writes the Extraction Report and Normalization Report, each as both `.md` (human) and `.json` (machine).                                                                                                                                                                                                    |

 

### 3.2 packages/typedoc-theme

The "custom TypeDoc theme" — consumes the Intermediate JSON and renders it as Markdown.

| File                   | Responsibility                                                                                                                                                                                              |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `render-markdown.ts`   | One Markdown file per symbol (signature tables, property tables, enum members), grouped into category directories, plus a category `index.md` and a version-level `manifest.json` consumed by the frontend. |
| `generation-report.ts` | Diffs newly generated files against what already existed, reporting exactly what was created vs. updated.                                                                                                   |

 

### 3.3 scripts/

| Script             | What it does                                                                                                                                                                                       | Key flags                |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|
| `extract-api.ts`   | Runs version detection → adapter loading → extraction → normalization → writes reports.                                                                                                            | `--webpack-version`      |
| `generate-md.ts`   | Renders Markdown from `intermediate.json`. Supports **Preview Mode** (stops before writing an approval marker) and an **Approval Gate** (site build refuses to run without a human's `--approve`). | `--preview`, `--approve` |
| `sync-versions.ts` | Scans `reports/` for every documented version and writes the top-level `versions.json` the frontend's version switcher reads.                                                                      | —                        |
| `health-check.ts`  | Computes drift vs. the previous run, flags missing categories, writes the Final Summary Report, and exits non-zero on alert-level status (failing CI on purpose).                                  | `--webpack-version`      |

Every script is independently re-runnable — a human can re-run just the extraction stage, or just health-check, without touching the rest of the pipeline.

 

### 3.4 CI/CD workflows (.github/workflows)

| Workflow             | Triggers                                                                            | Purpose                                                                                                                                                                                                          |
|----------------------|-------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docs.yml`           | push to main, weekly cron, release webhook (`repository_dispatch`), manual dispatch | The main end-to-end pipeline: env prep → extract → generate → (preview/approval gate) → sync → build → deploy → health check. Uploads all reports as CI artifacts regardless of outcome.                         |
| `version-matrix.yml` | manual dispatch, weekly cron                                                        | Documents multiple Webpack majors in parallel (`fail-fast: false`, so one version's failure never hides another's report), then syncs and builds the combined site.                                              |
| `monitor.yml`        | hourly cron                                                                         | Independent health-check sweep across every already-documented version, refreshes the coverage dashboard, and fails the job (surfacing a GitHub Actions failure notification) if any version is in alert status. |

 

### 3.5 monitoring/

| File                    | Responsibility                                                                                                                                                                 |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `status-definitions.ts` | The single shared vocabulary — `healthy / warning / alert` — with a plain-English definition for each, so the meaning never drifts between the CLI, CI logs, and the frontend. |
| `dashboard-schema.ts`   | Types + a pure aggregation function combining per-version health records with the version coverage manifest into one dashboard payload.                                        |
| `alerts.ts`             | Pluggable alert channels (console always on; Slack activates only if `SLACK_WEBHOOK_URL` is set in the environment — never hardcoded).                                         |

 

#### Human-in-the-loop control points

| Question a human can always ask             | Where the answer lives                                                                                            |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| What is the system doing right now?         | `StageLogger` console output + `reports/_logs/*.log.jsonl`, mirrored directly into the CI job log.                |
| What changed since the last successful run? | `normalization-report.md` (added/removed symbols, category deltas) and `summary-report.md`'s drift percentage.    |
| Why was this symbol included or excluded?   | Every symbol carries `included` + `exclusionReason`; listed in full, in plain English, in `extraction-report.md`. |

 

## 4. Frontend

SvelteKit (Svelte 5) + Tailwind, built with `@sveltejs/adapter-static` so the whole site prerenders to plain HTML/CSS/JS — no server required at runtime.

 

### 4.1 Design tokens

The entire "Medieval Dark Knight" palette is centralized in `tailwind.config.js`:

charcoal-950

charcoal-800

iron-700

silver-300

ember-500

wisp-400

parchment-100

auth · login

auth · signup

auth · logout

Typography: **UnifrakturMaguntia** (blackletter, wordmark only), **Cinzel** (medieval serif, headings/UI), **EB Garamond** (body text), **JetBrains Mono** (code).

 

### 4.2 Components &amp; stores

| Store       | Drives                                                                                                                                                                         |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `auth.ts`   | Login/signup/logout state — also recolors the companion avatar's outfit (silver ↔ gold).                                                                                       |
| `knight.ts` | Cycles the background knight's pose (standing → kneeling → strike → shield) and header glow color (ember ↔ wisp) on every navigation; drives the \~1.6s "spectral wisp" burst. |
| `ui.ts`     | Sidebar open/closed state and a global cursor-position store the avatar's eyes track.                                                                                          |

| Component                                   | Role                                                                                                                                                                 |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `KnightBackground.svelte`                   | Full-viewport, off-center knight silhouette (4 SVG poses), floating ember particles, drifting fog layer.                                                             |
| `Header.svelte`                             | Sticky header: helmet icon, wordmark, accordion-fold hamburger, auth buttons, ember/wisp glow + spectral wisp burst on page transitions.                             |
| `SidebarMenu.svelte`                        | Slide-in navigation, links generated dynamically from `versions.json` (never hardcoded).                                                                             |
| `AuthButtons.svelte`                        | Login (#00cc66) / Sign Up (#ff8800) / Logout (#ff3333), hover lift + glow pulse.                                                                                     |
| `AvatarCompanion.svelte`                    | Bean-shaped mini-knight, bottom-right, eyes + body subtly track the cursor via a reactive angle/offset calculation.                                                  |
| `DocViewer.svelte`                          | The core reading surface: parchment/stone-textured panel, breadcrumbs, search, version switcher, table of contents.                                                  |
| `TableOfContents.svelte`                    | "On this page" nav with `IntersectionObserver`-based active-section highlighting.                                                                                    |
| `SearchBar.svelte`                          | Filters a build-time search index (title + full content) across the current version's docs.                                                                          |
| `VersionSwitcher.svelte`                    | Dropdown sourced from `versions.json`; flags any version not yet human-approved.                                                                                     |
| `CodeBlock.svelte` / `enhanceCodeBlocks.ts` | Shiki syntax highlighting + copy-to-clipboard, applied to every fenced code block in rendered Markdown via a Svelte action (no per-block component mounting needed). |

 

### 4.3 Routes

| Route                       | Purpose                                                                                                                                                   |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `/`                         | Homepage — hero, and a card per documented Webpack version.                                                                                               |
| `/docs/[version]`           | Redirects to that version's first symbol (no dead-end landing page).                                                                                      |
| `/docs/[version]/[...slug]` | The doc viewer for one symbol; `entries()` derives every prerendered path directly from what the backend actually generated.                              |
| `/status`                   | "The Watchtower" — human-readable rendering of the monitoring dashboard data (health status, drift, unrecognized constructs, approval state) per version. |

 

### 4.4 Visual walkthrough

No headless browser was available in the environment this was built in, so the panels below are **faithful vector mockups** built from the project's real CSS values (not literal screenshots). Running `pnpm site:build && pnpm --filter @webpack-docs/site preview` locally will show the pixel-identical live version.

 

Homepage — /

SHADOWFALL Login Sign Up SHADOWFALL Ancient tomes of build configuration, forged automatically. Enter the Archive (V5) V5 5.94.0 2 symbols documented V6 not yet documented

Hero + version cards, off-center Black Knight silhouette, ember particles.

 

Documentation Viewer — /docs/v5/Configuration/configuration

SHADOWFALL Archive › V5 › Configuration › configuration Search the tomes... V5 ▾ Configuration interface · webpack/types.d.ts:412 The top-level options object passed to webpack(). Every other configuration interface hangs off this one. Signature TYPESCRIPT Copy Configuration(options: ConfigurationOptions): Configuration Properties PropertyTypeDescription mode"development" | "production" ON THIS PAGE Configuration Signature Properties

Parchment-textured panel, highlighted code block with copy button, scroll-spy TOC rail, wisp-colored header (alternates with ember on navigation).

 

The Watchtower — /status

SHADOWFALL The Watchtower A clear view of whether anything needs a human's eye. V5 5.94.0 ✅ Healthy 2 symbols documented · drift 0.0% · approved V6 — no runs yet

Per-version health rows sourced directly from `monitoring/data/health-*.json`.

 

## 5. Running the system

```
pnpm install
 
# Backend: document a specific webpack version end-to-end
pnpm add -D webpack@5.94.0
pnpm extract                                   # detect + adapter + extract + normalize
pnpm exec tsx scripts/generate-md.ts --preview  # generate markdown, stop before approval
pnpm exec tsx scripts/generate-md.ts --approve  # human approves -> unlocks site build
pnpm sync-versions                              # refresh versions.json + dashboard data
pnpm exec tsx scripts/health-check.ts --webpack-version 5.94.0
 
# Frontend
pnpm --filter @webpack-docs/site dev            # local dev server
pnpm site:build                                 # static prerendered build -> packages/site/build
```

 

## 6. Security &amp; secrets

**No credentials, tokens, or secrets are stored anywhere in this repository or this document.** The only sensitive values the system references are environment-variable *names* — never their values — supplied at runtime by CI:

| Variable (name only)             | Used for                        | Where it's read                                                                                                                                                  |
|----------------------------------|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SLACK_WEBHOOK_URL`              | Optional Slack alert channel    | `monitoring/alerts.ts` — the Slack channel silently no-ops if this isn't set                                                                                     |
| Hosting provider deploy token(s) | Deploying the built static site | `.github/workflows/docs.yml`'s deploy step — intentionally left as a placeholder for whichever host is configured (Vercel/Netlify/Cloudflare Pages/GitHub Pages) |

All such values should live exclusively in GitHub Actions repository/environment secrets, never committed to source control or hardcoded in scripts.

 

## 7. Appendix: full file tree

webpack-docs/ ├── packages/ │ ├── extractor/ # version detection, TypeDoc extraction, normalization │ │ └── src/ {types,logger,version-detect,extract,normalize,report,index}.ts │ │ └── adapters/ {base,v5,v6,latest,index}.ts │ ├── typedoc-theme/ # Intermediate JSON -&gt; Markdown │ │ └── src/ {render-markdown,generation-report,index}.ts │ └── site/ # SvelteKit frontend │ ├── src/lib/components/ Header, KnightBackground, SidebarMenu, │ │ AuthButtons, AvatarCompanion, DocViewer, │ │ TableOfContents, SearchBar, VersionSwitcher, │ │ CodeBlock, KnightHelmetIcon, Breadcrumbs │ ├── src/lib/stores/ auth.ts, knight.ts, ui.ts │ ├── src/lib/markdown/ parse.ts, enhanceCodeBlocks.ts │ ├── src/lib/content.ts build-time content index (glob-based) │ ├── src/routes/ /, /docs/\[version]/\[...slug], /status │ └── content/ generated docs + versions.json (pipeline output) ├── scripts/ extract-api.ts, generate-md.ts, │ sync-versions.ts, health-check.ts ├── .github/workflows/ docs.yml, version-matrix.yml, monitor.yml ├── monitoring/ status-definitions.ts, dashboard-schema.ts, alerts.ts ├── reports/ per-version run artifacts (generated, git-ignored) ├── package.json, pnpm-workspace.yaml, tsconfig.json └── README.md

 

 

SHADOWFALL / webpack-docs — system documentation · no secrets included
