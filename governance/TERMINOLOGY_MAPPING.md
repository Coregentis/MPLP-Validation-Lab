---
entry_surface: validation_lab
doc_type: governance
status: frozen
authority: validation_lab_governance
mplp_mplp_mplp_protocol_version: "1.0.0"
doc_id: "VLAB-TERM-01"
---

# Validation Lab Terminology Mapping

**Status**: GOVERNANCE-FROZEN

## Purpose

This document defines Lab-side terminology for public Lab surfaces and bounded
Lab governance.

It does not redefine protocol semantics.

## Core Terms

| Term | Definition | Role in Lab |
|:---|:---|:---|
| Scenario | Test/evidence scenario label | input classification |
| Flow | Protocol-side scenario label family | related protocol/test terminology, not a Lab guarantee by itself |
| Lifecycle Guarantee (LG) | legacy V1 Lab adjudication target | legacy V1 guarantee line |
| V2 Clause | V2 bundle clause identifier | V2 adjudication line |
| Internal Legacy ID | internal `gf-xx` identifier for legacy LG line | internal reference only |
| Evidence Pack | evidence bundle for adjudication | adjudication input |
| Ruleset | versioned adjudication logic set | adjudication basis |
| Verdict | adjudication result | adjudication output |
| Admission Status | admissibility state before/full adjudication | intake/admission result |
| Conformance | evidence satisfies a versioned ruleset's requirements | Lab-side evaluation conclusion only, non-certification |

## Key Distinctions

### Protocol Invariants ≠ Lab Guarantees

- **Protocol invariants** belong to repository-backed protocol sources.
- **Lab guarantees** belong to the Lab adjudication model.

These must not be collapsed into one term family.

### Flow ≠ Lifecycle Guarantee

- `flow-*` names protocol/test scenario labels
- `LG-*` names the legacy V1 Lab guarantee line
- `gf-*` remains an internal legacy identifier for that V1 LG line

This document does not declare a universal one-to-one scenario-to-guarantee
coverage map.

### Legacy V1 LG Line ≠ V2 Clause Bundle Line

The current public Lab model has two coexisting lines:

| Line | Source | Public Display |
|:---|:---|:---|
| Legacy V1 guarantee line | `governance/LIFECYCLE_GUARANTEES.yaml` | `LG-01` to `LG-05` |
| V2 clause bundle line | `public/_data/v2/rulesets/ruleset-v2.0.0.json` and later V2 bundles | clause IDs such as `PROV-V2-01` |

These must not be collapsed into one single Lab doctrine.

### Ruleset Identity ≠ Protocol Version

- `validation_ruleset_version` names adjudication logic
- `protocol_version` names the protocol baseline referenced by the Lab

## Legacy V1 Guarantee Labels

The legacy V1 LG line remains:

| Public ID | Internal ID | Name |
|:---|:---|:---|
| `LG-01` | `gf-01` | Single Agent Lifecycle |
| `LG-02` | `gf-02` | Multi-Agent Collaboration |
| `LG-03` | `gf-03` | Human-in-the-Loop Gating |
| `LG-04` | `gf-04` | Drift Detection & Recovery |
| `LG-05` | `gf-05` | External Tool Integration |

## Display Rules

| Context | Use |
|:---|:---|
| External display for legacy V1 line | `LG-*` |
| External display for V2 line | clause IDs from the active V2 bundle |
| Internal legacy references | `gf-*` only where continuity requires it |

## Prohibited Terms

The following remain prohibited in public Lab language:

- certified
- certification
- compliant
- compliance
- endorsement
- ranking
- badge

Preferred language:

- evidence-based verdict
- adjudicated
- evaluated under ruleset X
- non-normative reference

---

**Final Boundary**: this terminology file governs Lab-side wording only. It
does not redefine protocol semantics.
