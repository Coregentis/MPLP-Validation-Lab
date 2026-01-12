# Phase 4 Seal Report: UI Updates (COMPLETE)

**Date**: 2026-01-11  
**Phase**: 4 — UI Updates (Scenario-aware Projection + Evidence Drilldown)  
**Status**: SEALED

---

## Executive Summary

Phase 4 delivered user-verifiable UI projection of Phase 3 evidence chain while maintaining:
- ✅ SSOT single source (allowlist.yaml)
- ✅ No execution hosting
- ✅ Non-endorsement language
- ✅ Frozen governance boundaries
- ✅ Multi-layer API security

---

## Deliverables

### Preflight (P4-0.1 + P4-0.1.1 FINAL)

**Commits**:
- P4-0.1: 315ea3d (critical fixes)
- P4-0.1.1 FINAL: cd7cd7d (engineering precision)

**Verification**:
- Gates: ALL PASS (04-10)
- Production: VERIFIED (--omit=dev)
- Frozen: CLEAN

### Main (M1-M3)

**Commits**:
- M1: f6c63c0 (Data + UI Foundation)
- M2: 779b392 (Run Detail Pages)
- M3: 7a77783 (API + Security)
- Fix: 7df9dfc (GATE-06 compliance)

---

## Components Delivered

### Data Plane (P4-1, P4-2)
- ✅ Curated runs generator (`scripts/generate-curated-runs.mjs`)
- ✅ Typed loader (`lib/curated/load-curated-runs.ts`)
- ✅ SSOT constants (`lib/curated/ssot.ts`)
- ✅ Type definitions (`lib/curated/types.ts`)

### UI Plane (P4-3, P4-4)

**Index Page** (`/runs`):
- ✅ `ScenarioAwareBanner.tsx` (P0.7 context: GF-01 focus, presence-level warning)
- ✅ `CuratedRunsTable.tsx` (3-run table with claim levels)
- ✅ `HashCell.tsx` (copy-friendly hash display)

**Detail Pages** (`/runs/[run_id]`):
- ✅ `RunSummaryCard.tsx` (ruleset as-is, no double prefix)
- ✅ `VerificationPanel.tsx` (third-party recompute instructions)
- ✅ `EvidencePackBrowser.tsx` (7-file browser, no %2F encoding)
- ✅ `GovernancePanel.tsx` (P0.7 governance context)
- ✅ `ProvenanceFooter.tsx` (SSOT metadata with props injection)

### API Plane (P4-5)

**Security-Hardened Routes**:
- ✅ `/api/runs/[run_id]/files/[...path]` (inline view)
- ✅ `/api/runs/[run_id]/download/[...path]` (attachment download)

**Security Layers**:
1. Whitelist validation (7 files only)
2. Input validation (no `..`, `\`, empty segments)
3. Path containment (`runDir + path.sep` prefix check)
4. Symlink defense (realpath double-check)
5. No path leakage (safe error messages)

**Headers**:
- `Cache-Control: public, max-age=31536000, immutable`
- `X-Content-Type-Options: nosniff`
- `Content-Disposition: attachment` (download route)

### Gates (P4-7)
- ✅ GATE-09: SSOT projection guard (prevents hash hardcoding)
- ✅ GATE-10: Curated invariants (prevents SSOT/UI drift)

---

## Final Verification

### All Gates PASS (04-10)

```
[GATE-04] Non-endorsement Language Lint: PASS
[GATE-05] No Execution Hosting Guard: PASS
[GATE-06] Robots/Noindex Policy: PASS
[GATE-07] PII/Path Leak Lint: PASS
[GATE-08] Curated Immutability: PASS (3 entries)
[GATE-09] SSOT Projection: PASS (0 hardcoded hashes)
[GATE-10] Curated Invariants: PASS (4 checks)
```

**Log**: `phase-4-main-final-gates.log`

### Frozen Boundaries

✅ CLEAN (no changes to ruleset/contract/strength)

### Production Build

✅ SUCCESS (`npm ci --omit=dev`)  
**Logs**: `phase-4-preflight-production.B.*.log`

---

## Generator Commit SHA Explanation

**Observation**: Generator output shows different commit SHA than current HEAD at various stages.

**Explanation**: The `ssot.git_commit` field records `git rev-parse --short HEAD` at generation time. During verification workflows (gates before commit), the generator captures the uncommitted HEAD, which becomes the audit snapshot. This is correct workflow: **verify-then-commit**.

**Semantic**: `ssot.git_commit` represents "snapshot of git state when artifact was generated" for audit traceability, not the "final commit SHA" of the phase.

**Reference**: `phase-4-commit-sha-explanation.md`

---

## P0.7 Compliance

All UI pages include scenario-aware context:

### GF-01 Focus
- ✅ Explicitly stated in `ScenarioAwareBanner`
- ✅ Reinforced in `GovernancePanel`

### Presence-Level Validation
- ✅ Clear warning: "GF-02~05 PASS indicates artifact presence only"
- ✅ Not semantic correctness for those flows
- ✅ Ruleset-1.0 described as "presence-level validation"

### No Execution Hosting
- ✅ Explicitly stated: "Lab does NOT execute agent code"
- ✅ All evidence generation occurs in third-party environments
- ✅ API routes only serve static files (no execution capability)

---

## Security Boundaries

### API Routes
- Whitelist-based file access (7 files only)
- Path traversal prevention (4 layers)
- Symlink escape prevention (realpath validation)
- No filesystem path leakage in errors
- Immutable cache headers

### SSOT Projection
- Single source: `allowlist.yaml`
- Generated artifact: `curated-runs.json`
- UI layer: read-only consumption
- No YAML parsing in UI (GATE-10 enforced)
- No hash hardcoding (GATE-09 enforced)

---

## Commit Summary

### Preflight
1. **315ea3d**: P4-0.1 preflight fixes (6 fixes)
2. **cd7cd7d**: P4-0.1.1 supplemental fixes (4 fixes + hygiene)

### Main
3. **f6c63c0**: M1 - `/runs` index page
4. **779b392**: M2 - `/runs/[run_id]` detail pages
5. **7a77783**: M3 - Secure API routes
6. **7df9dfc**: GATE-06 compliance fix

**Total**: 6 commits, 3 phases (Preflight → UI → API → Fix)

---

## Evidence Files

### Preflight
- `phase-4-preflight-tsc.A.log`
- `phase-4-preflight-gates.A.log`
- `phase-4-preflight-tsc.B.log`
- `phase-4-preflight-gates.B.log`
- `phase-4-preflight-production.B.ci.log`
- `phase-4-preflight-production.B.generate.log`

### Main
- `phase-4-main-tsc.M1.log`
- `phase-4-main-gates.M1.log`
- `phase-4-main-tsc.M2.log`
- `phase-4-main-gates.M2.log`
- `phase-4-main-tsc.M3.log`
- `phase-4-main-gates.M3.log`
- `phase-4-main-final-gates.log`
- `phase-4-main-commits.txt`

---

## Next Steps

**Phase 5**: Website/Docs minimal mention (link-only)  
**Phase 6**: Final acceptance + Release Note seal

---

**Phase 4: SEALED**  
**Date**: 2026-01-11  
**All Gates**: PASS (04-10)  
**Frozen**: CLEAN  
**Production**: VERIFIED
