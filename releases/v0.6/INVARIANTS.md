---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-009"
---

# v0.6 Multi-Agent Invariant Naming Table

> **Authority**: Validation Lab (Non-Normative)  
> **Scope**: Evidence artifacts for adjudication; not part of MPLP Protocol

---

## Inherited from GF-01 Single-Agent

| Invariant ID | Description | Gate |
|--------------|-------------|------|
| INV-GF01-001 | Context must be created before plan | Evaluator |
| INV-GF01-002 | Plan must reference context | Evaluator |
| INV-GF01-003 | Trace must reference plan | Evaluator |
| INV-GF01-004 | All artifacts deterministically hashable | Evaluator |

---

## MA-STRUCT Gate Invariants

| Invariant ID | Description | Fail-Fast |
|--------------|-------------|-----------|
| INV-MA-STRUCT-001 | At least 2 distinct agent_ids in timeline | agent count < 2 |
| INV-MA-STRUCT-002 | Each agent has minimum 2 events | any agent has < 2 events |
| INV-MA-STRUCT-003 | At least 1 handoff/delegate event exists | no handoff event |
| INV-MA-STRUCT-004 | Handoff event references traceable context | handoff missing from/to/context_ref |
| INV-MA-STRUCT-005 | Timeline events canonically orderable | events not sortable |

---

## MA-EQUIV Gate Invariants

| Invariant ID | Description | Fail-Fast |
|--------------|-------------|-----------|
| INV-MA-EQUIV-001 | Evaluator produces PASS verdict | verdict != PASS |
| INV-MA-EQUIV-002 | Pack contains GF-01 required artifact set | missing context/plan/trace |
| INV-MA-EQUIV-003 | pack_root_hash is stable (64-hex) | hash format invalid |
| INV-MA-EQUIV-004 | verdict_hash is stable (64-hex) | hash format invalid |
| INV-MA-EQUIV-005 | Run-twice produces identical verdict_hash | hash differs |

---

## Event Type Registry (Multi-Agent)

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `agent.init` | Agent initialization | agent_id |
| `agent.complete` | Agent completes work | agent_id |
| `handoff` | Work transfer between agents | from_agent, to_agent, context_ref |
| `delegate` | Delegated subtask | from_agent, to_agent, task_ref |
| `artifact.create` | Artifact creation | agent_id, artifact_type, artifact_ref |

---

## Gate Report Structure

```json
{
  "gate_id": "MA-STRUCT",
  "timestamp": "...",
  "checks": [
    { "check": "agent_count", "invariant_id": "INV-MA-STRUCT-001", "passed": true },
    { "check": "handoff_exists", "invariant_id": "INV-MA-STRUCT-003", "passed": true }
  ],
  "failed_checks": [],
  "verdict": "PASS"
}
```
