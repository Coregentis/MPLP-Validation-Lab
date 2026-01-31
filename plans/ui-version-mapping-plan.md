# Implementation Plan: V1/V2 UI Mapping & SSOT Projection (VLAB-UI-MAP-01)

## Goal
Establish a **verifiable 1:1 mapping** between the Repository Assets (Runsets, Rulesets, Releases) and the UI Projection, enforcing visibility through Gates.

## 1. Unified Runset Definition
We define the "Unified Runset" as the aggregation of:
1. **V1 Curated**: `public/_data/curated-runs.json`
2. **V2 Index**: `public/_data/v2/runs/index.json`

**UI Strategy**:
- Continue using `loadAllRuns()` but enhance the **Version Strip** to show the specific versions of *both* sources.

## 2. Ruleset Unified View Strategy
Currently `lib/rulesets/loadRuleset.ts` only loads V1.
**Changes**:
1. Modify `loadRuleset.ts` to also read `public/_data/v2/rulesets/index.json`.
2. Map V2 structure (JSON projection) to `RulesetManifest` interface.
3. Update `/rulesets` page to render V2 rulesets alongside V1.
4. Add `source: 'v1' | 'v2'` badge to `RulesetManifest`.

## 3. Version Strip Specification (C1)
**Component**: `components/VersionStrip.tsx` (New)
**Usage**: Insert into `app/layout.tsx` (or specific page layouts).
**Fields**:
- `Build`: `rc-{timestamp}` (from `package.json` version or seal artifact)
- `Run Inventory`: `{Count} (V1:{v1_ver} / V2:{v2_ver})`
- `Ruleset`: `Default: {current_version}`
- `Data Snapshot`: `{generated_at}`

## 4. Governance & Navigation Updates (C2)
1. **Updates to `/governance`**:
    - Add **Runsets** section: Links to `/runs?source=v1` and `/runs?source=v2`.
    - Add **Rulesets** section: Explicit count of Active V1 + Active V2 rulesets.
2. **Updates to `/releases`**:
    - Ensure it parses `releases/unified` and displays the Seal status.

## 5. Gate Specification (New D1-D4)
We will add `scripts/gates/unified/gate-ui-projection-01.ts` incorporating:

### D1. GATE-UNIFIED-UI-VERSION-STRIP-01
- **Check**: Fetch `/runs` and `/rulesets` (via cheerio/fetch local).
- **Assert**: Presence of `data-testid="version-strip"`.

### D2. GATE-UNIFIED-RUNSET-PROJECTION-SSOT-01
- **Check**: Load `curated-runs.json` and `v2/runs/index.json`.
- **Assert**: UI List count >= Inventory count.

### D3. GATE-UNIFIED-RULESET-PROJECTION-SSOT-01
- **Check**: Load V1 files + V2 index.
- **Assert**: `/rulesets` page HTML contains specific IDs (e.g. `ruleset-v2.0.0`).

### D4. GATE-UNIFIED-GOVERNANCE-NAV-CLOSURE-01
- **Check**: `/governance` has links to `/runs` and `/rulesets`.
- **Assert**: No links contain `/v2/` prefix.

## Execution Steps
1. **Create Gates** (Fail first).
2. **Implement Version Strip**.
3. **Refactor Ruleset Loader** (Support V2).
4. **Update Governance Page**.
5. **Update Releases Page**.
6. **Verify Gates Pass**.
