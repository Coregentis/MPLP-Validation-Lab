# Ruleset-1.0 GF Coverage Report

**Report Version**: 1.0  
**Generated**: 2026-01-10  
**Sprint**: Cross-Vendor Evidence Spine v0.1  
**Purpose**: Document ruleset-1.0 behavior for GF-02~05 to establish v0.1 scope

---

## Executive Summary

This preflight verification analyzed `ruleset-1.0` behavior against the `sample-pass` evidence pack to determine:
1. Which GF flows are evaluable with minimal (GF-01 only) artifacts
2. Whether v0.1 cross-substrate packs can safely focus on GF-01 spine

**Conclusion**: ✅ **SAFE TO PROCEED**

v0.1 cross-substrate packs will target **GF-01 only** (presence-level). Ruleset-1.0 evaluates all GF-01~05, but v0.1 evidence packs will only include GF-01 artifacts.

---

## Test Configuration

| Parameter | Value |
|:---|:---|
| Ruleset Version | ruleset-1.0 |
| Test Pack | data/runs/sample-pass |
| Evaluation Command | `npx tsx scripts/preflight/test-gf-coverage.ts` |
| Test Date | 2026-01-10 |

---

## GF Verdict Results

### sample-pass (Full Coverage Pack)

| GF ID | Status | Has Requirements | Artifacts Present |
|:---|:---:|:---:|:---|
| GF-01 | ✅ PASS | Yes | context + plan + trace |
| GF-02 | ✅ PASS | Yes | (full coverage pack) |
| GF-03 | ✅ PASS | Yes | (full coverage pack) |
| GF-04 | ✅ PASS | Yes | (full coverage pack) |
| GF-05 | ✅ PASS | Yes | (full coverage pack) |

**Observation**: `sample-pass` is a comprehensive test pack containing artifacts for all flows.

---

## v0.1 Scope Decision

### GF-01 Spine (Target)

**Included in v0.1**:
- GF-01: Single Agent Lifecycle
- Required artifacts: `artifacts/context.json`, `artifacts/plan.json`, `artifacts/trace.json`
- Strength: **presence-level** (file existence only)

### GF-02~05 (NOT in v0.1 Scope)

**Explicitly OUT OF SCOPE**:
- GF-02, GF-03, GF-04, GF-05
- Reason: v0.1 focuses on establishing cross-substrate evidence spine for GF-01 only
- Future: May be included in v0.2 with ruleset-1.1 or higher strength

**Expected Behavior for v0.1 Packs**:
- v0.1 cross-substrate packs will contain **GF-01 artifacts only**
- When evaluated against ruleset-1.0:
  - GF-01: **PASS** (artifacts present)
  - GF-02~05: Status depends on ruleset requirements (may be FAIL, NOT_EVALUATED, or SKIP)

---

## UI/Evidence Presentation Requirements

### Strength-Aligned Claims

All Lab UI and documentation MUST use presence-level claims only:

✅ **Allowed**:
- "GF-01 evidence pack contains required artifacts"
- "Evidence evaluated under ruleset-1.0 (presence-level)"
- "Verdict: PASS (artifacts present)"

❌ **NOT Allowed**:
- "Correct agent behavior"
- "State machine correctness"
- "Lifecycle adherence verified"

### GF-02~05 Display

For v0.1 cross-substrate packs:
- GF-01: Display verdict (PASS expected)
- GF-02~05: Display as **"NOT EVALUATED (out of v0.1 scope)"** or show actual status with clear note

---

## Acceptance Criteria for Phase 1

Before proceeding to Phase 1 (Truth Sources), confirm:

- [x] Preflight report generated
- [x] v0.1 scope frozen to GF-01 only
- [x] UI strength claims reviewed (presence-level)
- [x] GF-02~05 out-of-scope documented

**Status**: ✅ **PHASE 0.5 COMPLETE — PROCEED TO PHASE 1**

---

## References

- Sprint Implementation Plan: `implementation_plan.md`
- Canonical Hosts: `governance/preflight/canonical-hosts-v0.1.md`
- Test Script: `scripts/preflight/test-gf-coverage.ts`
- Test Output: `governance/preflight/test-output.log`

---

**Document Status**: FROZEN for Sprint v0.1  
**Authority**: MPLP Validation Lab Governance
