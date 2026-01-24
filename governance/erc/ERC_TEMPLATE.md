---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-039"
---

# ERC — Evidence Requirement Card (Template)

**ERC ID**: `<VLAB-ERC-Dx-01>`  
**Domain**: D1 / D2 / D3 / D4  
**Status**: Draft (Target: Active in v0.3)  
**Authority**: MPGC / Validation Lab Governance  
**Applies To**: ruleset-`<x.y>`  
**Related**: [ADJUDICATION_MATURITY_MODEL.md](../ADJUDICATION_MATURITY_MODEL.md), [SUBSTRATE_SCOPE_POLICY.md](../SUBSTRATE_SCOPE_POLICY.md)  
**Evidence Contract**: Evidence Pack Contract `<version>` + ABMC 1.0.0

---

## 0. Purpose

Define **minimum evidence obligations** for this domain such that the Lab can deterministically adjudicate:
- PASS / FAIL / NOT_EVALUATED / NOT_ADMISSIBLE

under a versioned ruleset.

> **This ERC defines evidence, not implementation mechanisms.**

---

## 1. Scope & Non-Goals

### 1.1 In-Scope
- `<What decisions/events/state transitions this domain must evidence>`

### 1.2 Out-of-Scope
- Runtime scheduling policies
- Adapter/proxy details
- Performance claims
- Any endorsement semantics

---

## 2. Normative Requirements (Evidence Obligations)

> Each requirement MUST be evidence-addressable via `evidence_pointers.json`.

### RQ-`<Dx>`-01 — `<requirement title>`

**Statement**: `<MUST/SHALL requirement in evidence terms>`

**Minimum Evidence** (at least one pointer per bullet):

| Artifact | Locator | Expected Fields |
|:---|:---|:---|
| `trace/events.ndjson` | `event_id:<id>` | `type`, `timestamp`, `agent_id` |
| `snapshots/snapshot-xxx.json` | `jsonptr:/state` | `state.status` |

**Pass Condition**:
- `<deterministic condition expressed on evidence>`

**Fail Condition**:
- `<deterministic condition expressed on evidence>`

**Not-Evaluated Condition**:
- `<allowed only if ruleset declares it; otherwise FAIL>`

**Reason Codes**:

| Verdict | Code |
|:---|:---|
| PASS | (none) |
| FAIL | `REQ-FAIL-RQ-<Dx>-01` |
| NOT_EVALUATED | `EVAL-NOT-SUPPORTED-RQ-<Dx>-01` |

---

### RQ-`<Dx>`-02 — `<requirement title>`

_(Repeat structure for additional requirements)_

---

## 3. Required Evidence Pointers (Canonical Pointer Set)

`evidence_pointers.json` MUST include entries for each requirement:

```json
{
  "pointers": [
    {
      "requirement_id": "RQ-<Dx>-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:evt-001",
      "status": "PRESENT"
    }
  ]
}
```

**Locator Types**:

| Type | Format | Example |
|:---|:---|:---|
| event_id | `event_id:<id>` | `event_id:ctx-create-001` |
| jsonptr | `jsonptr:<RFC6901>` | `jsonptr:/plan/steps/0` |
| line | `line:<N>` | `line:42` |
| snapshot | `snapshot:<id>` | `snapshot:snap-002` |
| diff | `diff:<id>` | `diff:diff-001-002` |

**Pointer Completeness Rule**:
- If a requirement is in-scope for the ruleset, it MUST have at least one pointer entry.
- Missing pointer entry = FAIL with `BUNDLE-POINTER-MISSING-RQ-<Dx>-xx`.

---

## 4. Admission Gate Dependencies

If this domain depends on admission gates, specify:

| Gate | Dependency |
|:---|:---|
| `ADM-GATE-02` | Pack integrity must pass |
| `ADM-GATE-PIN` | Protocol/schema/ruleset pins must be present |

If gate fails → verdict MUST be `NOT_ADMISSIBLE` with reason_code `ADM-GATE-xx-FAIL`.

---

## 5. Minimal Test Vectors (v0.3 requirement)

v0.3 requires **two packs** for this ERC:

### 5.1 PASS Pack

| Property | Value |
|:---|:---|
| run_id | `<...>` |
| Demonstrates | `<What this pack proves>` |
| Requirements covered | All RQ-`<Dx>`-* with PRESENT pointers |

### 5.2 FAIL Pack

| Property | Value |
|:---|:---|
| run_id | `<...>` |
| Failure mode | `<Which RQ fails and how>` |
| Expected reason_code | `REQ-FAIL-RQ-<Dx>-xx` |

---

## 6. Mapping to Ruleset Clauses

This ERC must be implemented in ruleset as:

| Clause ID | Requirement ID | Type |
|:---|:---|:---|
| `CL-<Dx>-01` | `RQ-<Dx>-01` | invariant |

---

## 7. Determinism & No-Endorsement Statement

- Deterministic ruling under declared ruleset only.
- Evidence strength labels refer to evidence quality, not substrate quality.
- No badges, rankings, or certification semantics.

---

## 8. Change Log

| Version | Date | Change |
|:---|:---|:---|
| 0.1 | `<date>` | Initial draft |

---

**Document Status**: Template  
**Version**: 1.0.0  
**Governed By**: MPGC / Validation Lab
