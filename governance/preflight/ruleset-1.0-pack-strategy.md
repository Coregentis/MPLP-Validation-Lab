---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-046"
---

# Ruleset-1.0 Pack Strategy Decision (PF-4)

**Document Version**: 1.0  
**Generated**: 2026-01-10  
**Sprint**: Cross-Vendor Evidence Spine v0.1  
**Purpose**: Freeze pack content strategy based on empirical GF behavior

---

## Executive Summary

**Selected Strategy**: **B (Minimal-Complete)** with caveat

**Rationale**: Empirical testing revealed ruleset-1.0 evaluates ALL GF-01~05 as PASS when only GF-01 artifacts are present. This indicates ruleset-1.0 requirements are presence-level ONLY and not artifact-specific per GF.

**Critical Discovery**: The test pack `test-gf01-only` (containing ONLY GF-01 artifacts: context.json, plan.json, trace.json) achieved:
- ✅ GF-01: PASS (3/3 requirements)
- ✅ GF-02: PASS (1/1 requirements)  
- ✅ GF-03: PASS (1/1 requirements)
- ✅ GF-04: PASS (1/1 requirements)
- ✅ GF-05: PASS (1/1 requirements)

**Implication**: Ruleset-1.0 does NOT require GF-specific artifacts; it requires presence of ANY valid context/plan/trace.

---

## Test Configuration

| Parameter | Value |
|:---|:---|
| Test Pack | `data/runs/test-gf01-only` |
| Ruleset Version | ruleset-1.0 |
| Pack Content | GF-01 artifacts only (context + plan + trace) |
| GATE-02 Result | ADMISSIBLE (18/18 checks PASS) |
| Evaluation Date | 2026-01-10 |

---

## Test Pack Structure

```
data/runs/test-gf01-only/
├── manifest.json (with scenario_id - see constraint note below)
├── integrity/
│   ├── sha256sums.txt (5 files, sorted by path)
│   └── pack.sha256 (pack_root_hash)
├── timeline/
│   └── events.ndjson (3 events)
└── artifacts/
    ├── context.json (GF-01 required)
    ├── plan.json (GF-01 required)
    └── trace.json (GF-01 required)
```

**Total files**: 7 (manifest + integrity×2 + timeline×1 + artifacts×3)

---

## GF Evaluation Results (Full Detail)

### Test Pack: test-gf01-only

| GF ID | Status | Requirements Met | Observation |
|:---|:---:|:---:|:---|
| GF-01 | ✅ PASS | 3/3 | Expected (has all GF-01 artifacts) |
| GF-02 | ✅ PASS | 1/1 | **Unexpected** |
| GF-03 | ✅ PASS | 1/1 | **Unexpected** |
| GF-04 | ✅ PASS | 1/1 | **Unexpected** |
| GF-05 | ✅ PASS | 1/1 | **Unexpected** |

**Verdict Hash**: `4eb4017e25add485...` (deterministic, GATE-03 PASS)  
**Pack Root Hash**: `c379ef7d84d88dfa...`

---

## Analysis: Why GF-02~05 PASS

**Hypothesis**: Ruleset-1.0 requirements are **presence-level generic**, not GF-flow-specific.

**Evidence**:
1. Pack contains only GF-01 artifacts (context.json, plan.json, trace.json)
2. All 5 GFs evaluate to PASS
3. Each GF-02~05 reports 1/1 requirements met

**Conclusion**: Ruleset-1.0 likely checks:
- ✅ "context artifact present" (generic)
- ✅ "plan artifact present" (generic)
- ✅ "trace artifact present" (generic)

Rather than:
- ❌ "GF-02-specific context with multi-agent fields"
- ❌ "GF-03-specific plan with conditional branches"

This is **consistent with ruleset-1.0 strength: presence-level** (file existence, not content semantics).

---

## Strategy Decision: B (Minimal-Complete) with Constraint

### Selected Strategy

**B: Minimal-Complete Packs**

Pack content requirements for v0.1 cross-substrate packs:
```
manifest.json
integrity/sha256sums.txt
integrity/pack.sha256
timeline/events.ndjson
artifacts/context.json
artifacts/plan.json
artifacts/trace.json
```

**Rationale**:
- This structure achieves 5/5 GF PASS (full ruleset-1.0 coverage)
- Minimal file count (7 files)
- No additional GF-specific artifacts needed
- Aligns with ruleset-1.0 presence-level strength

### NOT Strategy A (GF-01-Only)

**Why A is unnecessary**:
- "GF-01-only" scope is **already achieved** by minimal-complete packs
- Ruleset-1.0 does not distinguish GF-specific artifacts
- No benefit to artificially restricting scope when ruleset naturally evaluates all GFs

---

## UI Requirements: Scenario-Aware Projection (P0.7)

**Status**: **RECOMMENDED but not strictly required**

**Reasoning**:
- All GFs PASS → No "strong failure appearance" risk
- However, P0.7 is still valuable for:
  - Clarifying v0.1 focus is GF-01 spine (semantic intent)
  - Preventing misinterpretation that Lab validates GF-02~05 semantics
  - Future-proofing for stronger rulesets

**Implementation**:
- Display scenario scope verdict (target_gf: gf-01)
- Show full evaluation report (5/5 PASS) transparently
- Note: "GF-02~05 evaluated under presence-level ruleset-1.0, not semantic correctness"

---

## Critical Constraint Discovered: scenario_id in Manifest

### Issue

GATE-02 currently requires `manifest.scenario_id` field (check: "Required Manifest Fields").

**Conflict with Sprint Constraint**:
- **Constraint 1 (Frozen)**: `scenario_id/target_gf/claim_level/repro_ref` → **allowlist ONLY**, NOT in pack
- Purpose: Avoid pack承载裁决语义, maintain contract v1.0 frozen boundary

### Temporary Workaround (for PF-4 test)

Added `scenario_id: "pf4-test-gf01-only"` to test pack manifest.

### Required Fix (BLOCKING Phase 3)

**Action**: Modify `lib/engine/verify.ts` to make `scenario_id` optional (non-blocking).

**Justification**:
- Contract v1.0 does NOT mandate scenario_id (it's container-layer, not裁决-layer)
- Scenario metadata belongs in curated allowlist/registry (per Constraint 1)
- Verify should only validate container integrity, not semantic fields

**Acceptance**:
1. Remove `scenario_id` from test-gf01-only manifest
2. GATE-02 still ADMISSIBLE
3. sample-pass unaffected
4. No FROZEN artifacts modified

**Status**: 🚨 **MUST FIX BEFORE PHASE 3** (否则违背 anti-interrogation 设计)

---

## Pack Content Requirements (Frozen for v0.1)

### Required Files (7)

1. `manifest.json`
   - `pack_id`, `pack_version`, `protocol_version`, `created_at`
   - `generator`, `artifacts_included`, `compatibility`
   - ~~`scenario_id`~~ (to be removed after verify fix)

2. `integrity/sha256sums.txt`
   - Format: `<64hex><TWO_SPACES><path>`
   - Sorted by path (lexicographic ascending)
   - LF only, no trailing newline, no BOM

3. `integrity/pack.sha256`
   - pack_root_hash per contract v1.0 L185-194
   - Computed from normalized sha256sums.txt

4. `timeline/events.ndjson`
   - Minimal lifecycle events (context_created, plan_created, execution_completed)

5-7. `artifacts/context.json`, `artifacts/plan.json`, `artifacts/trace.json`
   - GF-01 required artifacts (also satisfies GF-02~05 per ruleset-1.0)

### Optional Files (v1.1)

- `manifest.substrate` (per contract v1.1 addendum)

---

## v0.1 Cross-Substrate Packs (Phase 3)

Based on this strategy, Phase 3 will generate:

```
data/runs/gf-01-a2a-pass/       (7 files)
data/runs/gf-01-langchain-pass/ (7 files)
data/runs/gf-01-mcp-pass/       (7 files)
```

Each pack:
- ✅ Contains GF-01 artifacts (context/plan/trace)
- ✅ Passes GATE-02 (18/18 checks)
- ✅ Evaluates to 5/5 GF PASS under ruleset-1.0
- ✅ Achieves v0.1 goal: vendor-neutral evidence spine for GF-01
- ⚠️ scenario_id in allowlist ONLY (not in manifest, pending verify fix)

---

## Acceptance Criteria (PF-4 Complete)

- [x] Test pack created (test-gf01-only)
- [x] GATE-02 PASS (18/18 checks ADMISSIBLE)
- [x] Evaluation run (GF-01~05 behavior documented)
- [x] Strategy decision frozen (B: Minimal-Complete)
- [x] Pack file manifest defined (7 required files)
- [x] UI requirements specified (P0.7 recommended)
- [x] Critical constraint documented (scenario_id fix required)
- [x] PF-4 decision file generated

**Status**: ✅ **PHASE 0.5 COMPLETE — PF-4 FROZEN**

**Next Phase**: Phase 1 (Truth Sources) — NOT BLOCKED

**Blocking Item**: scenario_id verify fix (MUST complete before Phase 3)

---

## References

- Test Pack: `data/runs/test-gf01-only/`
- Evaluation Log: `governance/preflight/pf4-final-evaluation.log`
- Debug Output: `governance/preflight/pf4-gate02-debug-output.log`
- Contract v1.0: `governance/contracts/evidence-pack-contract-v1.0.md`
- Ruleset-1.0: `data/rulesets/ruleset-1.0/`

---

**Document Status**: FROZEN for Sprint v0.1  
**Authority**: MPLP Validation Lab Governance  
**Change Policy**: Any deviation requires new PF revision + user approval
