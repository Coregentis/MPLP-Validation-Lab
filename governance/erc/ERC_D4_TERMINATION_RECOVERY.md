---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-040"
---

# ERC — Termination & Recovery Evidence Adjudication (D4)

**ERC ID**: VLAB-ERC-D4-01  
**Domain**: D4 — Termination & Recovery Evidence Adjudication  
**Status**: Draft (Target: Active in v0.3)  
**Authority**: MPGC / Validation Lab Governance  
**Applies To**: ruleset-1.1 (v0.3)  
**Related**: [ADJUDICATION_MATURITY_MODEL.md](../ADJUDICATION_MATURITY_MODEL.md), [SUBSTRATE_SCOPE_POLICY.md](../SUBSTRATE_SCOPE_POLICY.md)  
**Evidence Contract**: Evidence Pack Contract + ABMC 1.0.0

---

## 0. Purpose

Make termination adjudicable via evidence:
the Lab can deterministically rule whether a run recorded an explicit **termination decision** (stop/abort/timeout) and its finalization.

---

## 1. Scope & Non-Goals

### 1.1 In-Scope
- Evidence of termination decision (manual stop, TTL expiry, loop breaker, abort).
- Evidence of terminalization after termination (no further execution events beyond stop marker).

### 1.2 Out-of-Scope
- Loop detection algorithm
- Timeout selection policy
- Recovery strategy correctness
- Any endorsement semantics

---

## 2. Normative Requirements (Evidence Obligations)

### RQ-D4-01 — Termination Decision MUST be recorded when run is terminated

**Statement**:  
If the run ends due to termination (abort/timeout/cancel/loop-break), the run MUST record a termination decision event.

**Minimum Evidence** (≥1 pointer):

| Artifact | Locator | Expected Fields |
|:---|:---|:---|
| `trace/events.ndjson` | `event_id:<...>` OR `line:<N>` | `event_type`, `timestamp`, `decision_kind=terminate`, `terminate_reason` (or equivalent), `decision_outcome=TERMINATED` |

**Pass Condition**:
- Termination decision event exists and is locatable.

**Fail Condition**:
- Run is marked terminated (per verdict/topline or terminal state) but no termination decision evidence exists.

**Not-Evaluated Condition**:
- Allowed only if run is not a termination case.
- If run is a termination case, missing evidence => FAIL.

**Reason Codes**:

| Verdict | Code |
|:---|:---|
| PASS | (none) |
| FAIL | `REQ-FAIL-RQ-D4-01` |

---

## 3. Required Evidence Pointers

`evidence_pointers.json` MUST include:

```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D4-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:<termination-decision-event-id>",
      "status": "PRESENT"
    }
  ]
}
```

Missing pointer entry (for termination cases) => FAIL with `BUNDLE-POINTER-MISSING-RQ-D4-01`.

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
| run_id | `arb-d4-termination-recovery-pass-fixture-v0.3` |
| Demonstrates | Termination decision record present, matches topline terminated |
| Requirements covered | `RQ-D4-01` with PRESENT pointer |

### 5.2 FAIL Pack

| Property | Value |
|:---|:---|
| run_id | `arb-d4-termination-recovery-fail-fixture-v0.3` |
| Failure mode | Missing termination decision record despite termination topline |
| Expected reason_code | `REQ-FAIL-RQ-D4-01` |

---

## 6. Mapping to Ruleset Clauses

| Clause ID | Requirement ID | Type |
|:---|:---|:---|
| `CL-D4-01` | `RQ-D4-01` | invariant |

---

## 7. Determinism & No-Endorsement Statement

- Deterministic ruling under declared ruleset only.
- Evidence strength labels refer to evidence quality, not substrate quality.
- No badges, rankings, or certification semantics.

---

## 8. Change Log

| Version | Date | Change |
|:---|:---|:---|
| 0.1 | 2026-01-17 | Initial draft with RQ-D4-01 |

---

**Document Status**: Draft  
**Version**: 0.1.0  
**Governed By**: MPGC / Validation Lab
