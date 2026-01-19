---
doc_type: reference
normativity: non-normative
authority: Validation Lab
status: active
---

# Coverage Summary — Adjudication (S1/S2/S3) × Strength (E-A/E-B/E-S)

This page summarizes what the repository currently supports.

## Adjudication Scope Coverage
- **S1 (Single-Substrate)**: ✅ Implemented (curated runs + rulesets + gates + recompute + UI)
- **S2 (Cross-Substrate Equivalence)**: ✅ Partially Implemented (evidence snapshots exist; equivalence rule basis is implicit)
- **S3 (E2E Equivalence)**: ❌ Not Implemented

## Evidence Strength Coverage
- **E-A (Static Evidence)**: ✅ Implemented (Type-A evidence snapshots)
- **E-B (Generator Reproduction)**: ✅ Implemented (Type-B snapshot + REPRODUCE regime)
- **E-S (Cryptographic Seal)**: ✅ Implemented (v0.5 signed-proof; v0.7.3 SIGN-02)

## Canonical Pointers
- Matrix detail for GF-01: `coverage.gf-01.yaml`
- Frozen snapshots: `releases/`
- Ruleset: `data/rulesets/ruleset-1.0/`
- Curated SSOT: `data/curated-runs/allowlist.yaml`

## Non-Endorsement Boundary
> This matrix describes **adjudication coverage**, not framework capability.
