# webpack-docs — Backend Pipeline

Automated, human-in-the-loop documentation pipeline for Webpack (v5 / v6 / future majors).

## Lifecycle at a glance

```
trigger → env prep → version detect → adapter load → extract (TypeDoc)
   → normalize (Intermediate JSON, validated) → [preview / approval gate]
   → generate markdown → sync versions → site build → deploy → health check
```

Every arrow above writes a report. Nothing is silent.

## Where things live

| Path | Purpose |
|---|---|
| `packages/extractor` | Version detection, adapters, TypeDoc extraction, normalization, Intermediate JSON Schema, extraction/normalization reports |
| `packages/typedoc-theme` | Custom "theme" — turns Intermediate JSON into categorized Markdown + JSON, generation reports |
| `packages/site` | SvelteKit frontend that consumes the generated Markdown (see `/frontend` docs) |
| `scripts/*.ts` | CLI entrypoints CI (and humans) call directly — each stage is independently re-runnable |
| `.github/workflows/` | `docs.yml` (main pipeline), `version-matrix.yml` (parallel multi-version builds), `monitor.yml` (hourly health checks) |
| `monitoring/` | Shared status vocabulary, dashboard data schema, pluggable alert channels |
| `reports/` | Per-version (`v5/`, `v6/`, ...) run artifacts: `intermediate.json`, `extraction-report.{md,json}`, `normalization-report.{md,json}`, `generation-report.{md,json}`, `summary-report.{md,json}`, `deployment.json`, `APPROVED` marker |

## Running stages locally

```bash
pnpm install

# 1. Extract + normalize (auto-detects installed webpack, or pass --webpack-version)
pnpm extract

# 2. Preview markdown generation without approving deployment
pnpm exec tsx scripts/generate-md.ts --preview

# Inspect reports/v5/generation-report.md and packages/site/content/docs/v5/...
# then either re-run without --preview, or explicitly approve:
pnpm exec tsx scripts/generate-md.ts --approve

# 3. Keep the frontend's version switcher + monitoring dashboard in sync
pnpm sync-versions

# 4. Build the site
pnpm site:build

# 5. Health check (run for any version, any time — independent of the rest)
pnpm exec tsx scripts/health-check.ts --webpack-version 5.94.0
```

## Answering the three human-in-the-loop questions

- **"What is the system doing right now?"** — `StageLogger` writes both a
  pretty console line and a JSONL log file per run under `reports/_logs/`.
  CI surfaces the same lines directly in the Actions log.
- **"What changed since the last successful run?"** — `normalize.ts`'s
  `diffAgainstPrevious` + `normalization-report.md`, and `health-check.ts`'s
  drift percentage in `summary-report.md`.
- **"Why was this symbol included/excluded?"** — every `DocSymbol` carries
  `included` + `exclusionReason`; `extraction-report.md` lists every
  exclusion with its reason in plain English.

## Adding support for a new Webpack major

1. Copy `packages/extractor/src/adapters/v6.ts` → `v7.ts`, adjust
   `supportedMajors` and any renamed/moved symbol patterns in `categorize`.
2. Register it in `packages/extractor/src/adapters/index.ts`'s `REGISTRY`.
3. Until step 1–2 happen, the pipeline **does not break** — it automatically
   falls back to `WebpackLatestAdapter` and loudly warns in the Extraction
   Report that the new major is unverified.
