---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-036"
---

# ERC — Budget Evidence Adjudication (D1)

**ERC ID**: VLAB-ERC-D1-01  
**Domain**: D1 — Budget Evidence Adjudication  
**Status**: Draft (Target: Active in v0.3)  
**Authority**: MPGC / Validation Lab Governance  
**Applies To**: ruleset-1.1 (v0.3)  
**Related**: [ADJUDICATION_MATURITY_MODEL.md](../ADJUDICATION_MATURITY_MODEL.md), [SUBSTRATE_SCOPE_POLICY.md](../SUBSTRATE_SCOPE_POLICY.md)  
**Evidence Contract**: Evidence Pack Contract + ABMC 1.0.0

---

## 0. Purpose

Make "budget / resource governance" adjudicable via evidence:
the Lab can deterministically rule whether a run provided an explicit **budget decision record**.

---

## 1. Scope & Non-Goals

### 1.1 In-Scope
- Evidence that a run declares and records a budget governance decision relevant to the scenario execution.

### 1.2 Out-of-Scope
- How budgets are calculated
- Token accounting accuracy
- Scheduling algorithm quality
- Any endorsement semantics

---

## 2. Normative Requirements (Evidence Obligations)

### RQ-D1-01 — Budget Decision Record MUST exist

**Statement**:  
A curated run MUST provide at least one **budget decision record** in the evidence pack,
capturing (a) decision identity, (b) decision timestamp/order, (c) decision outcome, and (d) the governed target (agent/task/run).

**Minimum Evidence** (≥1 pointer):

| Artifact | Locator | Expected Fields |
|:---|:---|:---|
| `trace/events.ndjson` (or equivalent) | `event_id:<...>` OR `line:<N>` | `event_type`, `timestamp`, `decision_id`, `decision_kind=budget`, `decision_outcome` |

**Pass Condition**:
- At least one event exists such that:
  - `decision_kind` indicates budget/resource governance (budget/quota/rate_limit/suspend/resume), AND
  - `decision_outcome` exists (ALLOW/DENY/THROTTLE/SUSPEND/RESUME or equivalent).

**Fail Condition**:
- No admissible budget decision record can be pointed to (missing or unlocatable).

**Not-Evaluated Condition**:
- Not allowed for this RQ in v0.3. Missing evidence => FAIL.

**Reason Codes**:

| Verdict | Code |
|:---|:---|
| PASS | (none) |
| FAIL | `REQ-FAIL-RQ-D1-01` |

---

## 3. Required Evidence Pointers

`evidence_pointers.json` MUST include:

```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D1-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:<budget-decision-event-id>",
      "status": "PRESENT"
    }
  ]
}
```

Missing pointer entry => FAIL with `BUNDLE-POINTER-MISSING-RQ-D1-01`.

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
| run_id | `arb-d1-budget-pass-fixture-v0.3` |
| Demonstrates | At least one explicit budget decision record |
| Requirements covered | `RQ-D1-01` with PRESENT pointer |

### 5.2 FAIL Pack

| Property | Value |
|:---|:---|
| run_id | `arb-d1-budget-fail-fixture-v0.3` |
| Failure mode | Absence of budget decision record |
| Expected reason_code | `REQ-FAIL-RQ-D1-01` |

---

## 6. Mapping to Ruleset Clauses

| Clause ID | Requirement ID | Type |
|:---|:---|:---|
| `CL-D1-01` | `RQ-D1-01` | invariant |

---

## 7. Determinism & No-Endorsement Statement

- Deterministic ruling under declared ruleset only.
- Evidence strength labels refer to evidence quality, not substrate quality.
- No badges, rankings, or certification semantics.

---

## 8. Change Log

| Version | Date | Change |
|:---|:---|:---|
| 0.1 | 2026-01-17 | Initial draft with RQ-D1-01 |

---

**Document Status**: Draft  
**Version**: 0.1.0  
**Governed By**: MPGC / Validation Lab
