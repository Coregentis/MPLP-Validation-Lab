# ERC — Authorization Decision Evidence Adjudication (D3)

**ERC ID**: VLAB-ERC-D3-01  
**Domain**: D3 — Authorization Decision Evidence Adjudication  
**Status**: Draft (Target: Active in v0.3)  
**Authority**: MPGC / Validation Lab Governance  
**Applies To**: ruleset-1.1 (v0.3)  
**Related**: [ADJUDICATION_MATURITY_MODEL.md](../ADJUDICATION_MATURITY_MODEL.md), [SUBSTRATE_SCOPE_POLICY.md](../SUBSTRATE_SCOPE_POLICY.md)  
**Evidence Contract**: Evidence Pack Contract + ABMC 1.0.0

---

## 0. Purpose

Make authorization adjudicable via evidence:
the Lab can deterministically rule whether a run recorded at least one **authorization decision** (allow/deny) for a privileged action.

---

## 1. Scope & Non-Goals

### 1.1 In-Scope
- Evidence that a privileged operation was gated by an authorization decision record.

### 1.2 Out-of-Scope
- The correctness of the policy model
- Identity provider integration
- Fine-grained permission semantics beyond allow/deny record
- Any endorsement semantics

---

## 2. Normative Requirements (Evidence Obligations)

### RQ-D3-01 — Authorization Decision Record MUST exist for privileged action

**Statement**:  
If the scenario contains any privileged action (write, external call, tool invocation, state mutation),
the run MUST record at least one **authorization decision** event:
- decision identity
- governed action identity
- outcome (ALLOW or DENY)
- timestamp/order

**Minimum Evidence** (≥1 pointer):

| Artifact | Locator | Expected Fields |
|:---|:---|:---|
| `trace/events.ndjson` | `event_id:<...>` OR `line:<N>` | `event_type`, `timestamp`, `decision_kind=authz`, `action_id` (or equivalent), `decision_outcome` |

**Pass Condition**:
- There exists an authz decision event with outcome present (ALLOW/DENY).

**Fail Condition**:
- Scenario implies privileged action occurred (per scenario definition / run manifest), but no authz decision record can be located.

**Not-Evaluated Condition**:
- Allowed only if scenario is explicitly non-privileged in ruleset metadata.
- Default in v0.3: missing evidence => FAIL.

**Reason Codes**:

| Verdict | Code |
|:---|:---|
| PASS | (none) |
| FAIL | `REQ-FAIL-RQ-D3-01` |

---

## 3. Required Evidence Pointers

`evidence_pointers.json` MUST include:

```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D3-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:<authz-decision-event-id>",
      "status": "PRESENT"
    }
  ]
}
```

Missing pointer entry => FAIL with `BUNDLE-POINTER-MISSING-RQ-D3-01`.

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
| run_id | `arb-d3-authz-decision-pass-fixture-v0.3` |
| Demonstrates | At least one authz decision record present |
| Requirements covered | `RQ-D3-01` with PRESENT pointer |

### 5.2 FAIL Pack

| Property | Value |
|:---|:---|
| run_id | `arb-d3-authz-decision-fail-fixture-v0.3` |
| Failure mode | Lacks authz record |
| Expected reason_code | `REQ-FAIL-RQ-D3-01` |

---

## 6. Mapping to Ruleset Clauses

| Clause ID | Requirement ID | Type |
|:---|:---|:---|
| `CL-D3-01` | `RQ-D3-01` | invariant |

---

## 7. Determinism & No-Endorsement Statement

- Deterministic ruling under declared ruleset only.
- Evidence strength labels refer to evidence quality, not substrate quality.
- No badges, rankings, or certification semantics.

---

## 8. Change Log

| Version | Date | Change |
|:---|:---|:---|
| 0.1 | 2026-01-17 | Initial draft with RQ-D3-01 |

---

**Document Status**: Draft  
**Version**: 0.1.0  
**Governed By**: MPGC / Validation Lab
