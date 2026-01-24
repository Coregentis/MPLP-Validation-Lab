---
entry_surface: validation_lab
doc_type: governance
status: active
authority: validation_lab_governance
mplp_mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-051"
---

# SSOT→Projection Governance Map (VLAB-PROJ-MAP-01)

> **Document ID**: VLAB-PROJ-MAP-01  
> **Status**: RESEARCH OUTPUT  
> **Generated**: 2026-01-23  
> **Scope**: G0 Projection Governance Research

---

## Executive Summary

### Key Findings

1. **Lab has a mature Projection Governance framework**: Registry suite (ROUTES/TRUTH_SOURCES/GATES.yaml) + PTM + PROJECTION_REQUIREMENTS.v0.5.md
2. **Authority Hierarchy is well-defined**: `Repository > Documentation > Website` (VLAB-DGB-01, ADJUDICATION_MATURITY_MODEL)
3. **Gap**: Website/Docs projection rules currently follow an "implicit link-only boundary," lacking explicit gates or a manifest.

### Critical Governance Principle (From VLAB-DGB-01)

> "Docs/Website: Projection layers, cannot define protocol facts"

---

## Table A: SSOT Surface Inventory

| SSOT File | Authority Level | Key Fields | Protecting Gate |
|:---|:---|:---|:---|
| `data/curated-runs/substrate-index.yaml` | **SSOT** | id, current_level, tier, type, runs[] | gate:ssot-consistency |
| `export/curated-runs.json` | **SSOT (Export)** | runs[].run_id, substrate, substrate_claim_level | gate:coverage-claim |
| `governance/runsets.yaml` | **SSOT** | sets{}, includes[], substrates[] | gate:ssot-consistency |
| `adjudication/matrix/coverage*.yaml` | **SSOT** | status, anchors{}, gaps[] | gate:coverage-claim |
| `governance/releases/release-index.yaml` | **SSOT** | releases[], site_version, seal_path | G-REL-01 |
| `governance/LIFECYCLE_GUARANTEES.yaml` | **SSOT (Frozen)** | guarantees[], freeze_tag | G-GUARANTEES-SSOT-01 |
| `governance/registry/TRUTH_SOURCES.yaml` | **SSOT (Registry)** | sources{}, used_by_routes[] | gate:ptm |
| `governance/registry/ROUTES.yaml` | **SSOT (Registry)** | routes[], truth_sources[], gates[] | gate:ptm |
| `governance/page-truth/ptm-0.5.yaml` | **Derived (Projection)** | routes[], assertions[] | gate:09 (SSOT-projection) |
| `lib/rulesets/registry.ts` | **SSOT (Code)** | getRuleset(), getAllRulesets() | gate:registry |

---

## Table B: Projection Inventory (By Entry Point)

### B1: Lab Site (lab.mplp.io) — 18 Routes, 100% Coverage

| Page Path | SSOT Source | Projection Mode | Gate(s) | Status |
|:---|:---|:---|:---|:---|
| `/` | ts.identity, ts.dgb | Policy | gate:04, gate:05 | ✅ PTM covered |
| `/runs` | ts.runsets, ts.curated_json | Index | gate:09, gate:curated-runs | ✅ PTM covered |
| `/runs/[run_id]` | ts.run_bundles | Detail | gate:shadow-parity, gate:10 | ✅ PTM covered |
| `/coverage` | ts.runsets, ts.test_vectors_allowlist | Index | gate:test-vectors-coverage | ✅ PTM covered |
| `/rulesets` | ts.registry, ts.ruleset_manifests | Index | gate:registry | ✅ PTM covered |
| `/guarantees` | ts.terminology | Policy | gate:terminology | ✅ PTM covered |
| `/examples/evidence-producers/[substrate]` | ts.producer_manifests | Index | gate:cross-substrate | ✅ PTM covered |
| `/policies/contract` | ts.contracts | Policy | Exempted | ✅ PTM covered |
| `/adjudication` | ts.registry, ts.runsets | Index | Exempted | ✅ PTM covered |

**Lab Projection Governance Summary:**
- Registry Suite + PTM provide 100% route coverage.
- PROJECTION_REQUIREMENTS.v0.5.md defines three projection modes: Index, Detail, and Policy.
- `gate:09` (SSOT-projection) verifies consistency between UI and SSOT.
- PROJECTION-SEAL.v0.5.md sealed 18/18 routes.

### B2: Official Website (mplp.io) — IMPLICIT RULES ONLY

| Page Path | Allowed Content | SSOT Source | Current State |
|:---|:---|:---|:---|
| `/` (Home) | Pointer to Lab coverage | None (link-only) | ⚠️ No explicit gate |
| `/validation-lab` or similar | Link + boundary statement | None | ⚠️ Not formalized |
| Any coverage/substrate listing | **PROHIBITED** | N/A | ⚠️ Implicit constraint |

**Website Governance Findings:**
- VLAB-DGB-01 L55: "Docs/Website: Projection layers, cannot define protocol facts"
- ADJUDICATION_MATURITY_MODEL: "Repository > Documentation > Website (non-negotiable)"
- **Gap**: Lacks an explicit "Website pointer-only" gate or manifest.

### B3: Documentation (docs.mplp.io) — IMPLICIT RULES ONLY

| Page Path | Allowed Content | SSOT Source | Current State |
|:---|:---|:---|:---|
| Validation Lab reference | Non-normative pointer | None | ⚠️ No explicit gate |
| Coverage/substrate explanation | **Link-only, no data** | N/A | ⚠️ Implicit constraint |
| Ruleset reference | Pointer to Lab ruleset pages | None | ⚠️ Not formalized |

**Docs Governance Findings:**
- Authority hierarchy implies Docs cannot define Lab facts.
- **Gap**: Lacks an explicit "Docs non-normative reference" gate or manifest.

---

## Table C: Mapping Rules (Extracted Governance Clauses)

### C1: Red Lines (From VLAB-DGB-01, ADJUDICATION_MATURITY_MODEL, README)

| Rule ID | Rule Text | Source Document | Enforcement |
|:---|:---|:---|:---|
| **R-AUTH-01** | Repository > Documentation > Website | ADJUDICATION_MATURITY_MODEL L28 | Authority hierarchy |
| **R-PROJ-01** | Docs/Website cannot define protocol facts | VLAB-DGB-01 L55 | Implicit |
| **R-CERT-01** | No certification / No ranking / No execution hosting | README.md L33-41 | gate:04, gate:05 |
| **R-SSOT-01** | app/**/*.tsx → Projections; load from SSOT at build time | REL-LAB-0.5-SSOT-ANTI-DRIFT | PTM enforcement |
| **R-SSOT-02** | governance/*.md → Narrative only; MUST NOT embed live tables | REL-LAB-0.5-SSOT-ANTI-DRIFT | Implicit |

### C2: Export Contract Boundary (From EXPORT_CONTRACT_CHANGELOG)

| Rule ID | Rule Text | Enforcement |
|:---|:---|:---|
| **EXP-01** | export/ is public-facing contract surface | Gate-14, Gate-15 |
| **EXP-02** | Breaking changes require MAJOR version bump | Contract policy |
| **EXP-03** | Lab does NOT guarantee execution reproducibility | Disclaimer only |

### C3: Existing Gates (Projection-Related)

| Gate ID | Purpose | Entrypoint | Status |
|:---|:---|:---|:---|
| gate:09 | UI projection matches SSOT | lib/gates/gate-09-ssot-projection.ts | ✅ Active |
| gate:ptm | PTM truth sources exist and loadable | scripts/gates/page-truth-map.mjs | ✅ Active |
| gate:terminology | LG terminology (not GF) on UI | Various | ✅ Active |
| G-SSOT-SUBSTRATE-01 | METHOD doc ↔ substrate-index.yaml | scripts/ci/substrate-ssot-gate.mjs | ✅ Active |
| **gate:projection-sanity** | Future: full projection verification | N/A | ⚠️ NOT IMPLEMENTED |

---

## Gap Analysis

### Confirmed Gaps (v0.6 Must Address)

| Gap ID | Description | Impact | Priority |
|:---|:---|:---|:---|
| **GAP-PROJ-01** | Website lacks explicit "pointer-only" gate | Risk of data mirroring/desynchronization | P0 |
| **GAP-PROJ-02** | Docs lacks explicit "non-normative reference" gate | Risk of repetitive/inconsistent claims | P0 |
| **GAP-PROJ-03** | `gate:projection-sanity` not implemented | No automated verification for PTM assertions | P1 |
| **GAP-PROJ-04** | Lacks Projection Manifest (source hashes) | Unable to prove "page derived from SSOT" | P1 |
| **GAP-PROJ-05** | P0 new SSOT (coverage-claim, ssot-consistency) not in PTM | Mapping cycle not closed | P0 |

### Already Covered (v0.5 Implemented)

- ✅ Lab site 18 routes have PTM coverage.
- ✅ Registry suite established as SSOT.
- ✅ `gate:09` verifies SSOT-projection.
- ✅ Authority hierarchy documented.

---

## Recommendations

### M0: Projection Manifest (Proposed)

Create `export/projection-manifest.json`:
- `manifest_version`
- `generated_at`
- `sources[]`: SSOT file paths + SHA256
- `projections[]`: Page projection points listed by entry point.

### L0: Lab Site Mapping Refinement

1. Include new P0 gates (`ssot-consistency`, `coverage-claim`) in PTM.
2. Add SSOT source hash display to the `/coverage` page.
3. Implement `gate:projection-sanity` for automated Index count verification.

### W0: Website Mapping (Strict Boundary)

1. Create `governance/WEBSITE_PROJECTION_POLICY.md` to define pointer-only rules.
2. Website Lab entry points allowed only: Links + Boundary statements.
3. Prohibited: Enumerating substrates/runs/coverage numbers.

### D0: Docs Mapping (Reference Boundary)

1. Add "Validation Lab (Non-Normative)" section.
2. Link-only pointers + Boundary declarations.
3. Prohibited: Reciting coverage conclusions, mirroring matrices.

---

## Appendix: Source Files Referenced

| File | Last Modified | Lines |
|:---|:---|:---|
| governance/projection/PROJECTION_REQUIREMENTS.v0.5.md | 2026-01-19 | 197 |
| governance/projection/PROJECTION-SEAL.v0.5.md | 2026-01-19 | ~100 |
| governance/registry/TRUTH_SOURCES.yaml | 2026-01-19 | 223 |
| governance/page-truth/ptm-0.5.yaml | 2026-01-19 | 387 |
| governance/VLAB-DGB-01.md | 2026-01-09 | 222 |
| governance/releases/REL-LAB-0.5-SSOT-ANTI-DRIFT.md | 2026-01-20 | 118 |
| governance/EXPORT_CONTRACT_CHANGELOG.md | 2026-01-14 | 123 |
