# UI Projection Audit Report
**Generated At**: 2026-01-31

## Executive Summary
The UI has partial unification:
- **Runs**: ✅ Unified. `app/runs` loads both V1 and V2 via `loadAllRuns`.
- **Rulesets**: ❌ V1 Only. `lib/rulesets/loadRuleset.ts` hardcodes `data/rulesets`, ignoring `public/_data/v2/rulesets`.
- **Governance**: ⚠️ Static. Loads `governance/index.json` which lacks dynamic counts or deep links to V2 assets.
- **Releases**: ❌ V1 Only. `app/releases` (deduced) likely doesn't verify the Unified path.

## Detailed Projection Gap Analysis

| Asset Type | Inventory Source | UI Route | Status | Gap |
|------------|------------------|----------|--------|-----|
| Runsets (V1) | `curated-runs.json` | `/runs` | ✅ Projected | None |
| Runsets (V2) | `v2/runs/index.json` | `/runs` | ✅ Projected | None (via `loadAllRuns`) |
| Rulesets (V1) | `data/rulesets/` | `/rulesets` | ✅ Projected | None |
| Rulesets (V2) | `public/_data/v2/rulesets` | `/rulesets` | ❌ MISSING | Loading logic hardcoded to V1 files |
| Releases (Unified) | `releases/unified` | `/releases` | ❓ UNKNOWN | Needs verifying `app/releases/page.tsx` logic. |
| Governance | `governance/index.json` | `/governance` | ⚠️ PARTIAL | Missing dynamic V2 counts, broken/missing links to rulesets v2 |

## Data Source Audit (`app/**/page.tsx`)

| Page | Primary Data Source | Version Visibility |
|------|---------------------|--------------------|
| `app/runs/page.tsx` | `loadAllRuns()` (Unified) | Badges (V1/V2) ✅ |
| `app/rulesets/page.tsx` | `listRulesets()` (V1 Only) | V1 Version Only |
| `app/governance/page.tsx` | `public/_data/governance/index.json` | Index Version Only |

## Critical Findings
1. **Ruleset Blind Spot**: V2 Rulesets (2.0.0, 2.0.1) are undetectable in the UI.
2. **Version Strip Missing**: No page displays the global `unified_inventory_version` or `build_id`. User cannot know if they are looking at "fresh" data.
