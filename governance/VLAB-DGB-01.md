---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-042"
---

# Validation Lab Development Governance Baseline (VLAB-DGB-01)

**Baseline ID**: VLAB-DGB-01  
**Version**: 1.0.0  
**Status**: GOVERNANCE-ACTIVE  
**Effective Date**: 2026-01-09

---

## 1. Purpose

This document defines the **development governance baseline** for MPLP Validation Lab v1.0.x.
It establishes the authority chain, truth sources, derivation rules, change processes, gates, and audit requirements.

---

## 2. Authority Chain (Immutable)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MPLP-Protocol Repository                      │
│                      (Ultimate Truth Source)                     │
│                                                                  │
│   schemas/v2/**  │  tests/golden/**  │  packages/**              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (UPSTREAM_BASELINE pin)
┌─────────────────────────────────────────────────────────────────┐
│                     Validation Lab                               │
│                   (Fourth Surface - Projection)                  │
│                                                                  │
│   lib/schemas/  │  lib/invariants/  │  data/rulesets/            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Deterministic evaluation)
┌─────────────────────────────────────────────────────────────────┐
│                    Evidence-based Verdicts                       │
│                  (PASS/FAIL/NE/NOT_ADMISSIBLE)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Protocol Truth Source**: MPLP-Protocol Repository (schemas + tests + implementations)
2. **Lab Role**: Fourth Surface (evidence adjudication), NOT truth definer
3. **Docs/Website**: Projection layers, cannot define protocol facts
4. **Validation Lab**: Does NOT define truth, only evaluates evidence against versioned rulesets

---

## 3. Truth Source Hierarchy

| Priority | Source | Authority |
|:---:|:---|:---|
| 1 | `schemas/v2/**` (JSON Schema) | Field and constraint definition |
| 2 | `packages/**` / `sources/**` | Implementation and parsing logic |
| 3 | `tests/**` | Evaluability and regression boundaries |
| 4 | Documentation | Explanatory only, NOT normative |

### Prohibited Actions

- ❌ Inventing fields not in schema
- ❌ Deriving rules from page copy
- ❌ Using framework conventions as evidence structure
- ❌ Letting "customer wants" drive protocol fields

---

## 4. Schema-first Patch Rule

Any new/modified fixture, test, patch, or UI field MUST:

1. **Find evidence in `schemas/v2`** or derivable from schema
2. **Produce Schema Alignment Table** (schema file + JSON pointer + constraint)
3. **Pass schema validation** before invariant checks
4. **Be auditable and replayable** (evidence pointers resolvable)

> Violation = PR rejected at VLAB-GATE-01

---

## 5. Derivation Graph

### Lab Objects and Their Sources

| Lab Object | Derived From |
|:---|:---|
| Evidence Pack Contract | `schemas/v2` (manifest/artifacts/timeline/snapshots) |
| Ruleset Contract | Repo ruleset definitions (versioned) |
| GF Verdict Model | tests/invariants + admission criteria |
| Evidence Pointer Contract | Artifact structure from schema |
| Failure Taxonomy | Ruleset requirements + admission checks |

### Prohibited Derivations

- ❌ Page copy → field invention
- ❌ Framework habits → evidence structure
- ❌ "Enterprise needs" → protocol fields

---

## 6. Gate System

| Gate ID | Purpose | Blocking |
|:---|:---|:---:|
| VLAB-GATE-00 | Upstream pin verification | ✅ |
| VLAB-GATE-01 | Schema alignment (UI + ruleset sources) | ✅ |
| VLAB-GATE-02 | Integrity-first enforcement | ✅ |
| VLAB-GATE-03 | Deterministic verdict | ✅ |
| VLAB-GATE-04 | Non-endorsement language | ✅ |
| VLAB-GATE-05 | NoIndex policy (curated allowlist) | ✅ |

---

## 7. Four Hard Boundaries

These boundaries MUST be structurally enforced across all pages:

| Boundary | Enforcement |
|:---|:---|
| **Non-certification / Non-endorsement** | Global banner + GATE-04 |
| **Non-normative** | README + About page |
| **No execution hosting** | No upload-and-run features |
| **Deterministic ruleset** | GATE-03 verification |

---

## 8. Version Control

### Ruleset Versioning

- Independent version (e.g., `ruleset-1.0`)
- Breaking vs non-breaking changes declared
- Compatibility range for evidence packs

### Evidence Pack Contract Versioning

- Follows EVC (Evolution Compatibility Verification)
- New versions cannot silently break old packs

### Baseline Versioning

- This document: MINOR (clarification) / MAJOR (rule change)

---

## 9. Repo Authority & Mirror Policy

### Authority Repository

The **authoritative development repository** for MPLP Validation Lab is:

```
https://github.com/Coregentis/MPLP-Validation-Lab
```

All feature branches, PRs, and releases originate from this repository.

### Mirror Directory

The main MPLP-Protocol repository contains a **mirror directory**:

```
mplp_prerelease/Validation_Lab/
```

This mirror:
- ✅ Provides visibility for integration verification
- ✅ Contains frozen snapshots aligned with Lab releases
- ❌ Is NOT the development authority
- ❌ PRs should NOT originate here

### Sync Policy

1. Lab development occurs on `MPLP-Validation-Lab` branches
2. After Lab release/merge, a **sync PR** is created for the mirror
3. Mirror PR must reference the Lab commit hash
4. Hash/Gate alignment is verified before mirror merge

### Branch Naming

| Repo | Branch | Purpose |
|:---|:---|:---|
| MPLP-Validation-Lab | `main` | Stable release |
| MPLP-Validation-Lab | `phase-*/*` | Feature development |
| mplp_prerelease | `dev` | Contains mirror, not authority |
| mplp_prerelease | `sync/vlab-*` | Mirror sync PRs |

---

## 10. Amendment Process

Changes to this baseline require:
1. Governance review
2. Impact assessment
3. Version bump and changelog

---

## 10. Related Documents

- [TERMINOLOGY_MAPPING.md](./TERMINOLOGY_MAPPING.md)
- [admission-criteria-v1.0.md](./contracts/admission-criteria-v1.0.md)
- [VLAB-GATE-00-upstream-pin.md](./gates/VLAB-GATE-00-upstream-pin.md)
- [SUBSTRATE_SCOPE_POLICY.md](./SUBSTRATE_SCOPE_POLICY.md) — Tier-0/1/2 substrate scope & inclusion policy
- [ADJUDICATION_MATURITY_MODEL.md](./ADJUDICATION_MATURITY_MODEL.md) — v0.2→v0.5 strength ladder & stop criteria

---

**Document Status**: Development Governance Baseline  
**Version**: 1.0.0  
**Governed By**: MPGC
