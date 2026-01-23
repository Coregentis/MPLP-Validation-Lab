---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-037"
---

# ERC — Lifecycle State Evidence Adjudication (D2)

**ERC ID**: VLAB-ERC-D2-01  
**Domain**: D2 — Lifecycle State Evidence Adjudication  
**Status**: Draft (Target: Active in v0.3)  
**Authority**: MPGC / Validation Lab Governance  
**Applies To**: ruleset-1.1 (v0.3)  
**Related**: [ADJUDICATION_MATURITY_MODEL.md](../ADJUDICATION_MATURITY_MODEL.md), [SUBSTRATE_SCOPE_POLICY.md](../SUBSTRATE_SCOPE_POLICY.md)  
**Evidence Contract**: Evidence Pack Contract + ABMC 1.0.0

---

## 0. Purpose

Make lifecycle state adjudicable via evidence:
the Lab can deterministically rule whether a run recorded a **terminal lifecycle state** with a stable completion marker.

---

## 1. Scope & Non-Goals

### 1.1 In-Scope
- Evidence of a terminal lifecycle state for the scenario (SUCCESS/FAILURE/CANCELLED or equivalent).

### 1.2 Out-of-Scope
- Correctness of business outcome
- Quality of planning
- Optimization/performance
- Any endorsement semantics

---

## 2. Normative Requirements (Evidence Obligations)

### RQ-D2-01 — Terminal State MUST be recorded

**Statement**:  
A curated run MUST provide evidence that the run reached a **terminal lifecycle state** with a deterministic marker.

**Minimum Evidence** (≥1 pointer):

| Artifact | Locator | Expected Fields |
|:---|:---|:---|
| `trace/events.ndjson` | `event_id:<...>` OR `line:<N>` | `event_type=run_state_transition` (or equivalent), `from_state`, `to_state`, `timestamp` |
| `snapshots/<...>.json` (optional) | `jsonptr:/state` | `state.status`, `state.is_terminal=true` |

**Pass Condition**:
- There exists a state transition event where `to_state` is terminal (SUCCESS/FAILURE/CANCELLED), OR snapshot indicates terminal state.

**Fail Condition**:
- No terminal state evidence can be located, OR only non-terminal states appear.

**Not-Evaluated Condition**:
- Allowed only if the run is explicitly declared as "partial execution" by ruleset clause.
- Default in v0.3: missing evidence => FAIL.

**Reason Codes**:

| Verdict | Code |
|:---|:---|
| PASS | (none) |
| FAIL | `REQ-FAIL-RQ-D2-01` |

---

## 3. Required Evidence Pointers

`evidence_pointers.json` MUST include:

```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D2-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:<terminal-state-event-id>",
      "status": "PRESENT"
    }
  ]
}
```

Missing pointer entry => FAIL with `BUNDLE-POINTER-MISSING-RQ-D2-01`.

---

## 4. Admission Gate Dependencies

| Gate | Condition | Result |
|:---|:---|:---|
| `ADM-GATE-PIN` | Pins missing | `NOT_ADMISSIBLE` + `ADM-GATE-PIN-FAIL` |
| `ADM-GATE-CONTRACT` | Pack contract invalid | `NOT_ADMISSIBLE` + `ADM-GATE-CONTRACT-FAIL` |

---

## 5. Minimal Test Vectors (v0.3)

### 5.1 PASS Pack

| Property | Value |
|:---|:---|
| run_id | `arb-d2-lifecycle-state-pass-fixture-v0.3` |
| Demonstrates | Terminal state event/snapshot present |
| Requirements covered | `RQ-D2-01` with PRESENT pointer |

### 5.2 FAIL Pack

| Property | Value |
|:---|:---|
| run_id | `arb-d2-lifecycle-state-fail-fixture-v0.3` |
| Failure mode | Omits terminal evidence |
| Expected reason_code | `REQ-FAIL-RQ-D2-01` |

---

## 6. Mapping to Ruleset Clauses

| Clause ID | Requirement ID | Type |
|:---|:---|:---|
| `CL-D2-01` | `RQ-D2-01` | invariant |

---

## 7. Determinism & No-Endorsement Statement

- Deterministic ruling under declared ruleset only.
- Evidence strength labels refer to evidence quality, not substrate quality.
- No badges, rankings, or certification semantics.

---

## 8. Change Log

| Version | Date | Change |
|:---|:---|:---|
| 0.1 | 2026-01-17 | Initial draft with RQ-D2-01 |

---

**Document Status**: Draft  
**Version**: 0.1.0  
**Governed By**: MPGC / Validation Lab
