---
entry_surface: validation_lab
doc_type: governance
status: active
authority: validation_lab_governance
mplp_mplp_mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-COVERAGE-ADD-01"
---

# COVERAGE_GOVERNANCE_ADDENDUM (v0.6)

**Document ID**: VLAB-GOV-COVERAGE-ADD-01  
**Status**: Normative for Lab Gates (Non-Normative to MPLP Spec)  
**Scope**: Claim Gate + SSOT Consistency  
**Effective Date**: 2026-01-23  
**Governed By**: VLAB-DGB-01

---

## 1. No Claim Without Artifact

A "claim" includes any statement of:
- `covered` / `supported`
- `substrate_claim_level` (declared / reproduced)
- `evidence_strength` (E-A / E-B / E-S)

### 1.1 Required Artifact Pointers

Each claim MUST include at least one of the following artifacts:

| Claim Level | Required Pointer(s) |
|:---|:---|
| `declared` | `run_id` OR `run_ids[]` |
| `reproduced` | `run_id` + `repro_ref` (reproduction script pointer) |
| `E-S` | `signed_proof_ref` **(MUST - PR-04 verified)** |

### 1.2 Claim Surface Coverage

This rule applies to all **claim surfaces**:

| Surface | Location |
|:---|:---|
| Coverage Matrix | `adjudication/matrix/coverage.*.yaml` |
| Substrate Index | `data/curated-runs/substrate-index.yaml` |
| Export Contract | `export/curated-runs.json` |

### 1.3 Failure Codes

| Code | Trigger |
|:---|:---|
| `CLAIM-MISSING-ARTIFACT-REF` | Claim lacks any artifact pointer |
| `CLAIM-ES-MISSING-SIGNED-PROOF` | E-S claim lacks `signed_proof_ref` **(enforced)** |

---

## 2. No Claim Surface Drift

Claim surfaces MUST remain consistent. Drift between surfaces is a CI-blocking failure.

### 2.1 Consistency Requirements

| Source A | Source B | MUST Match |
|:---|:---|:---|
| `substrate-index.yaml` | `export/curated-runs.json` | `substrate_id`, `claim_level` |
| `substrate-index.yaml` | `runsets.yaml` | `run_id` references |
| `runsets.yaml` | `data/runs/` | Directory existence |

### 2.2 Failure Codes

| Code | Trigger |
|:---|:---|
| `SSOT-SUBSTRATE-ID-MISMATCH` | Substrate ID missing in export |
| `SSOT-CLAIM-LEVEL-MISMATCH` | Claim level differs between surfaces |
| `SSOT-RUN-REF-MISSING` | Run ID referenced but not found |
| `SSOT-RUN-DIR-MISSING` | Run directory does not exist |

---

## 3. Gate Enforcement

| Gate | Enforces | Entry Point |
|:---|:---|:---|
| `gate:coverage-claim` | Section 1 | `scripts/gates/coverage-claim.mjs` |
| `gate:ssot-consistency` | Section 2 | `scripts/gates/ssot-consistency.mjs` |

---

## 4. Non-Goals

- ❌ This addendum does NOT verify evidence content correctness
- ❌ This addendum does NOT verify execution outcomes
- ❌ This addendum does NOT provide certification or endorsement

---

## 5. Authority Boundary

> [!IMPORTANT]
> **This document is a gate specification, NOT a new SSOT.**
> - It defines rules that gates enforce
> - It does not define data structures or protocol semantics
> - The authoritative implementation is in the referenced gate scripts

---

**Document Status**: Draft  
**Version**: 0.1.0  
**Governed By**: MPGC / Validation Lab
