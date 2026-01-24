---
entry_surface: validation_lab
doc_type: governance
status: active
authority: validation_lab_governance
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-052"
---

# Projection Requirements - v0.6

> **Document ID**: VLAB-PROJ-01  
> **Status**: ACTIVE  
> **Effective Date**: 2026-01-23  
> **Governed By**: VLAB-DGB-01

---

## Purpose

This document defines **what each route must display** and **from which SSOT the data must come**.
v0.6 adds strict projection requirements for Coverage Claims and SSOT Consistency.

---

## Projection Modes

| Mode | Description | Verification |
|------|-------------|--------------|
| **Index** | List/count of assets | Count matches SSOT |
| **Detail** | Asset-specific fields | Fields traceable to manifest/pack |
| **Policy** | Static governance text | Language gate compliance |

---

## v0.6 Added Requirements

### 1. Coverage Claim Integrity (GAP-PROJ-05)

- **Rule**: No claim status (PASS/FAIL/Implemented) may be displayed without a resolvable artifact pointer.
- **Enforcement**: `gate:coverage-claim` MUST be satisfied for all routes displaying status.
- **Affected Routes**: `/coverage`, `/runs/[run_id]`, `/export`.

### 2. SSOT Consistency (P0-6)

- **Rule**: Substrate and Run lists MUST be consistent across `substrate-index`, `curated-runs`, and `runsets`.
- **Enforcement**: `gate:ssot-consistency` MUST be satisfied.
- **Affected Routes**: `/runs`, `/runs/[run_id]`.

### 3. E-S Claim Enforcement (P0-1)

- **Rule**: Claims with `strength: E-S` MUST NOT render unless a `signed_proof_ref` is present and valid.
- **Enforcement**: `REQUIRE_SIGNED_PROOF_FOR_ES_CLAIM=1` enabled in `gate:coverage-claim`.

---

## Route × Projection Requirements (Summary)

| Category | Routes | Key SSOT | Gate(s) |
|----------|--------|----------|---------|
| **Coverage** | `/coverage` | ts.runsets, ts.coverage_addendum | gate:coverage-claim |
| **Runs** | `/runs`, `/runs/[run_id]` | ts.runsets, ts.curated_json | gate:ssot-consistency |
| **Rulesets** | `/rulesets` | ts.registry | gate:registry |
| **Adjudication**| `/adjudication` | ts.dispute_benchmark | gate:14 |

---

## Verification Plan

### gate:ptm
- Verifies that `ptm-0.6.yaml` coverage is 18/18.
- Validates all truth sources exist.

### gate:projection-sanity (P1/v0.7)
- Planned for v0.7 to automate Index/Count matching.

---

**Document Version**: 1.1 (v0.6 sync)  
**Last Updated**: 2026-01-23
