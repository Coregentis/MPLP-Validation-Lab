---
entry_surface: validation_lab
doc_type: governance
status: frozen
authority: validation_lab_governance
mplp_mplp_mplp_protocol_version: "1.0.0"
doc_id: "VLAB-TERM-01"
---

# Validation Lab — Terminology Mapping (Frozen)

**Document ID**: VLAB-TERM-01  
**Status**: GOVERNANCE-FROZEN  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## Purpose

This document defines the **frozen terminology** for Validation Lab v1.0.
All implementations, documentation, and UI MUST use these terms consistently.

---

## Core Terms

| Term | Definition | Role in Lab |
|:---|:---|:---|
| **Scenario** | Test/Scenario Pack (e.g., `flow-01-single-agent-plan`) | Input template for Evidence Pack |
| **Flow** | Alias for Scenario (from `tests/golden/flows/`) | Scenario fixture |
| **Profile** | Type identifier for Scenario (Core / MAP / SA) | Scenario categorization |
| **Golden Flow (GF)** | Lifecycle Invariant | **Adjudication Objective** |
| **Requirement** | Specific checkpoint of a GF (from ruleset) | Unit of evaluation for Verdict |
| **Evidence Pack** | Evidence bundle (manifest + artifacts + timeline + snapshots) | Adjudication input |
| **Verdict** | Adjudication result (PASS/FAIL/NOT_EVALUATED/NOT_ADMISSIBLE) | Adjudication output |
| **Ruleset** | Versioned rule set (deterministic) | Adjudication basis |
| **Conformance** | Evidence meets requirements of a versioned ruleset | Evaluation conclusion (Non-certification) |

---

## Conformance vs Compliance/Certification

> [!IMPORTANT]
> **Conformance ≠ Certification ≠ Compliance**
>
> - **Conformance**: Evidence meets requirements of a versioned ruleset (what Lab outputs)
> - **Certification**: Official endorsement by an accreditation body (NOT what Lab does)
> - **Compliance**: Legal/regulatory conformity (NOT what Lab determines)

---

## Key Distinctions

### Scenario/Flow ≠ Golden Flow (GF)

> [!IMPORTANT]
> **`flow-01` is NOT `GF-01`**
>
> - `flow-01-single-agent-plan` is a **Scenario** (test fixture)
> - `GF-01` is a **Golden Flow** (lifecycle invariant to be judged)
> - A Scenario may cover one or more GFs
> - GF verdicts are produced by ruleset requirements + evidence pack

### Mapping Rules

1. **Scenario → GF**: One Scenario can cover multiple GFs
2. **GF → Verdict**: GF verdict is produced by evaluating requirements against evidence
3. **Flow files** in `tests/golden/flows/` are **scenario fixtures**, not GF definitions

---

## Lifecycle Guarantees (LG-01 ~ LG-05)

> [!IMPORTANT]
> **External Display: LG | Internal ID: gf**
>
> - External display uses **LG-xx** (Lifecycle Guarantees)
> - Internal ID remains **gf-xx** (frozen, do not change)
> - Registry SSOT: `lib/registry/lifecycle-guarantees.ts`

| LG ID | Internal ID | Name | Validates |
|:---|:---|:---|:---|
| LG-01 | gf-01 | Single Agent Lifecycle | Context → Plan → Confirm → Trace chain (L1/L2) |
| LG-02 | gf-02 | Multi-Agent Collaboration | Agent collaboration patterns (L2) |
| LG-03 | gf-03 | Human-in-the-Loop Gating | Confirm gate with human approval (L2) |
| LG-04 | gf-04 | Drift Detection & Recovery | Snapshot diff and recovery (L3) |
| LG-05 | gf-05 | External Tool Integration | Tool invocation and result handling (L3/L4) |

---

## Scenario → GF Coverage Matrix

| Scenario | Profile | GF-01 | GF-02 | GF-03 | GF-04 | GF-05 |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| flow-01-single-agent-plan | Core | ✅ | - | - | - | - |
| flow-02-single-agent-large-plan | Core | ✅ | - | - | - | - |
| flow-03-single-agent-with-tools | Core | ✅ | - | - | - | ✅ |
| flow-04-single-agent-llm-enrichment | Core | ✅ | - | - | - | - |
| flow-05-single-agent-confirm-required | Core | ✅ | - | ✅ | - | - |
| map-flow-01-turn-taking | MAP | - | ✅ | - | - | - |
| map-flow-02-broadcast-fanout | MAP | - | ✅ | - | - | - |
| sa-flow-01-basic | SA | ✅ | - | - | - | - |
| sa-flow-02-step-evaluation | SA | ✅ | - | - | ✅ | - |

---

## Prohibited Terminology

The following terms are **FORBIDDEN** in Validation Lab:

| Forbidden | Reason | Alternative |
|:---|:---|:---|
| certified | Implies official certification | `conforms to ruleset-X` |
| accredited | Implies accreditation body | (none) |
| badge | Implies endorsement mark | `verdict chip` |
| ranking | Implies comparative scoring | (none) |
| score | Implies numeric rating | (none) |
| official compliance | Implies regulatory approval | `evidence-based verdict` |
| approved | Implies endorsement | `PASS (evidence-based)` |
| **Golden Flow** (external) | Causes terminology collision with main repo FLOW | **Lifecycle Guarantee (LG)** |
| **GF-xx** (external display) | Reserved for internal ID only | **LG-xx** |

---

## Amendment Process

Changes to this document require:
1. VLAB-DGB-01 governance review
2. Impact assessment on existing verdicts
3. Version bump and changelog entry

---

**Document Status**: Governance Frozen  
**Version**: 1.0.0
