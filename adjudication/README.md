---
doc_type: reference
normativity: non-normative
authority: Validation Lab
status: active
---

# Adjudication Model (Validation Lab)

**Authority**: Validation Lab (Non-Normative)  
**Scope**: Public adjudication model and evidence-strength regime for MPLP evidence packs.  
**Non-Goals**: Protocol specification, certification, endorsement, ranking, execution hosting.

This directory defines two orthogonal dimensions:

1) **Adjudication Scope** (S1/S2/S3)
- S1: Single-Substrate Evidence Validation
- S2: Cross-Substrate Equivalence Adjudication
- S3: Cross-Substrate End-to-End (E2E) Equivalence Adjudication *(planned)*

2) **Evidence Strength** (E-A/E-B/E-S)
- E-A: Static Evidence (no generator execution)
- E-B: Generator-Based Reproduction (run-twice determinism)
- E-S: Cryptographic Seal (non-repudiation boundary)

## Non-Endorsement Boundary
> **MPLP does not endorse, certify, or rank any agent framework.**
> Validation Lab adjudicates **evidence**, not implementation quality.

## Truth Source
- Frozen evidence snapshots: `releases/` (immutable)
- Executable gate logic: `lib/gates/` and referenced upstream gates (see `matrix/coverage.*`)
- Rulesets: `data/rulesets/`
- Curated runs SSOT: `data/curated-runs/allowlist.yaml`
