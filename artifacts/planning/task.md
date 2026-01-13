# Phase 4: UI Updates - Master Task Checklist

**Sprint**: Cross-Vendor Evidence Spine v0.1  
**Phase**: 4 — UI Updates (Scenario-aware Projection + Evidence Drilldown)  
**Date**: 2026-01-11  
**Status**: PREFLIGHT READY

---

## Phase 4 Overview

**Objective**: Transform Phase 3 evidence chain into user-verifiable UI projection while maintaining SSOT single source principle (allowlist.yaml only).

**Core Principles**:
1. SSOT = `data/curated-runs/allowlist.yaml` (ONLY editable source)
2. UI = build-time projection (`curated-runs.json`)
3. P0.7 mandatory (GF-01 focus + presence-level warnings)
4. GATE-09 prevents hash hardcoding
5. All Phase 3 gates continue to PASS

---

## Preflight Status

> **Reference**: `phase-4-preflight-seal.md`

### P4-0: Preflight Fixes

- [ ] **P4-0.1** Applied (Fixes #1-6) - Commit A
  - EvidencePackBrowser URL encoding
  - ProvenanceFooter props injection
  - CuratedRunRecord type alignment
  - Generator structure validation
  - GATE-08 restoration
  - GATE-09 initial implementation

- [ ] **P4-0.1.1** Applied (Fixes #7-10) - Commit B
  - ruleset_version type widening
  - GATE-09 final version (repo-relative paths)
  - js-yaml to dependencies
  - GATE-10 precision drift detection
  - Engineering hygiene (error handling, unused function removal)

### Preflight Seal Criteria

- [ ] Both commits applied with unique SHAs
- [ ] `npm run gates` PASS (04, 05, 06, 07, 08, 09, 10)
- [ ] `npm ci --omit=dev && npm run generate:curated` PASS
- [ ] `npx tsc --noEmit` PASS
- [ ] Frozen boundaries clean
- [ ] Seal outputs captured (commits, gates, production, tsc)

**Preflight Status**: ⏳ READY FOR EXECUTION

---

## Phase 4 Main Tasks

### P4-1: Build Artifact Generator ✅ (Covered in Preflight)

**Status**: Included in P4-0.1 Fix #4

### P4-2: Typed Loader + Model

**Files to Create**:
- `lib/curated/types.ts` ✅ (Covered in Preflight)
- `lib/curated/load-curated-runs.ts`
- `lib/curated/ssot.ts`

**Acceptance**:
- [ ] TypeScript compiles
- [ ] `getCuratedRuns()` returns 3 runs
- [ ] Runs sorted by run_id

### P4-3: Runs Index Page

**Files**:
- `app/runs/page.tsx`
- `app/runs/_components/CuratedRunsTable.tsx`
- `app/runs/_components/ScenarioAwareBanner.tsx`
- `app/runs/_components/HashCell.tsx`

**Acceptance**:
- [ ] `/runs` accessible
- [ ] Displays 3 runs
- [ ] ScenarioAwareBanner shows GF-01 + presence-level
- [ ] No forbidden terms (GATE-04/05 PASS)

### P4-4: Run Detail Page

**Files**:
- `app/runs/[run_id]/page.tsx`
- `app/runs/[run_id]/_components/RunSummaryCard.tsx`
- `app/runs/[run_id]/_components/VerificationPanel.tsx`
- `app/runs/[run_id]/_components/EvidencePackBrowser.tsx` ✅ (Modified in Preflight)
- `app/runs/[run_id]/_components/GovernancePanel.tsx`

**Acceptance**:
- [ ] All 3 detail pages accessible
- [ ] Langchain shows "Reproduced ✓"
- [ ] Verification panel shows correct hashes
- [ ] 7 files listed in evidence pack
- [ ] P0.7 text visible

### P4-5: Evidence Drilldown Alignment

**Action**: Verify existing APIs or create minimal file server

**Acceptance**:
- [ ] All 7 files accessible via View/Download
- [ ] No 404 errors

### P4-6: SSOT Provenance Footer

**Files**:
- `components/ProvenanceFooter.tsx` ✅ (Modified in Preflight)

**Acceptance**:
- [ ] Footer on all /runs pages
- [ ] Shows SSOT metadata

### P4-7: Test Harness (GATE-10)

**Files**:
- `lib/gates/gate-10-curated-invariants.ts` ✅ (Created in Preflight)

**Status**: Included in P4-0.1.1 Fix #10

### P4-8: GATE-09 Implementation

**Files**:
- `lib/gates/gate-09-ssot-projection.ts` ✅ (Created in Preflight)

**Status**: Included in P4-0.1 Fix #6 + P4-0.1.1 Fix #8

---

## Continuous Verification (Each Task)

After each task completion:

```bash
# TypeScript
npx tsc --noEmit

# Gates (must ALL PASS)
npm run gates

# Frozen boundaries
git diff --name-only | grep -E "data/rulesets/ruleset-1.0|app/policies/contract|app/policies/strength" || echo "✅ Clean"
```

---

## Phase 4 Final Verification

### All Gates PASS

```bash
npm run gates
```

Expected: 04, 05, 06, 07, 08, 09, 10 ALL PASS

### UI Functional Check

- [ ] `/runs` displays 3 curated runs
- [ ] `/runs/gf-01-langchain-pass` shows reproduced status
- [ ] Verification panel shows correct recompute command
- [ ] Evidence pack browser lists 7 files  
- [ ] P0.7 text visible on all pages
- [ ] Provenance footer shows SSOT metadata

### Production Stability

```bash
npm ci --omit=dev
npm run generate:curated
npm run build
```

Expected: All succeed

---

## Phase 4 Seal

### Final Commit

```bash
git add -A
git commit -m "feat(phase-4): Complete UI updates with SSOT projection

Phase 4 deliverables:
- Build-time curated-runs.json generator from allowlist.yaml
- Typed loader (read-only JSON, never YAML)
- /runs index page with ScenarioAwareBanner (P0.7)
- /runs/[run_id] detail pages with verification panel
- EvidencePackBrowser (7 files)
- GovernancePanel (GF-01 focus + presence-level)
- ProvenanceFooter (SSOT metadata)
- GATE-09: prevents hash hardcoding (repo-relative paths)
- GATE-10: precision drift detection (UI layer)

All gates PASS (04, 05, 06, 07, 08, 09, 10)
Frozen boundaries intact
No SSOT drift
Production build verified

Phase 4: COMPLETE"
```

### Seal Criteria

- [ ] All P4-2 through P4-6 complete (P4-1, P4-7, P4-8 in Preflight)
- [ ] All gates PASS
- [ ] Frozen boundaries clean
- [ ] Production build works
- [ ] Phase 4 seal report created

---

## Next Steps

**After Phase 4 Seal**:
1. Create `phase-4-seal-report.md`
2. Update `task.md` - mark Phase 4 complete
3. → **Phase 6**: Final Acceptance + Release Note

---

**Phase 3**: ✅ SEALED  
**Phase 4**: ⏳ PREFLIGHT READY  
**Phase 6**: ⏳ WAITING

---

## Quick Reference

**Preflight Seal**: `phase-4-preflight-seal.md`  
**Preflight Fixes**: `phase-4-preflight-fixes.md`, `phase-4-preflight-fixes-p4-0-1-1.md`  
**Main Checklist**: `phase-4-checklist.md` (detailed task breakdown)  
**Phase 3 Seal**: `phase-3-seal.md` (SSOT reference)
