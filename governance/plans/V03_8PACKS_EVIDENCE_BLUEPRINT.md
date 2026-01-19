# V03 8-Packs Minimal Evidence Blueprint

**Document ID**: VLAB-ENG-8PACKS-EVIDENCE-01  
**Status**: Engineering Blueprint  
**Purpose**: Define exact `events.ndjson` content for 8 packs to enable resolver + clause evaluation

---

## 0. Overview

Each pack needs `trace/events.ndjson` with minimal events that:
- **PASS packs**: Satisfy clause requirements (fields match synonym groups)
- **FAIL packs**: Resolvable but semantically fail (fields don't match)

---

## 1. Event Schema (Minimal Required Fields)

```typescript
interface Event {
  event_id: string;           // Required: unique within pack
  event_type: string;         // Required: event classification
  timestamp: string;          // Required: ISO-8601
  
  // Domain-specific (at least one set per domain)
  decision_id?: string;       // D1/D3/D4: decision identifier
  decision_kind?: string;     // D1/D3/D4: budget|authz|terminate
  decision_outcome?: string;  // D1/D3/D4: allow|deny|terminated etc
  
  // D2: Lifecycle state
  from_state?: string;        // D2: previous state
  to_state?: string;          // D2: current state (terminal for PASS)
  
  // D3: Authorization specific
  action_id?: string;         // D3: governed action identifier
  
  // D4: Termination specific  
  terminate_reason?: string;  // D4: why terminated
}
```

---

## 2. D1 Budget Packs

### 2.1 arb-d1-budget-pass-fixture-v0.3

**events.ndjson** (single line, NDJSON format):
```json
{"event_id":"budget-001","event_type":"decision","timestamp":"2026-01-17T10:00:00Z","decision_id":"bdgt-001","decision_kind":"budget","decision_outcome":"allow","target":"agent-001","note":"Budget check passed"}
```

**evidence_pointers.json**:
```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D1-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:budget-001",
      "status": "PRESENT"
    }
  ]
}
```

**verdict.json** topline: `"PASS"`  
**bundle.manifest.json** reason_code: (none)

---

### 2.2 arb-d1-budget-fail-fixture-v0.3

**events.ndjson** (event exists but wrong decision_kind):
```json
{"event_id":"budget-fail-001","event_type":"decision","timestamp":"2026-01-17T10:00:00Z","decision_id":"bdgt-002","decision_kind":"logging","decision_outcome":"recorded","target":"agent-001","note":"Not a budget decision"}
```

**evidence_pointers.json**:
```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D1-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:budget-fail-001",
      "status": "PRESENT"
    }
  ]
}
```

**verdict.json** topline: `"FAIL"`  
**bundle.manifest.json** reason_code: `"REQ-FAIL-RQ-D1-01"`

---

## 3. D2 Lifecycle State Packs

### 3.1 arb-d2-lifecycle-state-pass-fixture-v0.3

**events.ndjson**:
```json
{"event_id":"state-001","event_type":"state_transition","timestamp":"2026-01-17T10:00:00Z","from_state":"running","to_state":"success"}
```

**evidence_pointers.json**:
```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D2-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:state-001",
      "status": "PRESENT"
    }
  ]
}
```

**verdict.json** topline: `"PASS"`

---

### 3.2 arb-d2-lifecycle-state-fail-fixture-v0.3

**events.ndjson** (non-terminal state):
```json
{"event_id":"state-fail-001","event_type":"state_transition","timestamp":"2026-01-17T10:00:00Z","from_state":"pending","to_state":"running"}
```

**evidence_pointers.json**:
```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D2-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:state-fail-001",
      "status": "PRESENT"
    }
  ]
}
```

**verdict.json** topline: `"FAIL"`  
**bundle.manifest.json** reason_code: `"REQ-FAIL-RQ-D2-01"`

---

## 4. D3 Authorization Decision Packs

### 4.1 arb-d3-authz-decision-pass-fixture-v0.3

**events.ndjson**:
```json
{"event_id":"authz-001","event_type":"decision","timestamp":"2026-01-17T10:00:00Z","decision_id":"auth-001","decision_kind":"authz","decision_outcome":"allow","action_id":"tool-call-001"}
```

**evidence_pointers.json**:
```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D3-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:authz-001",
      "status": "PRESENT"
    }
  ]
}
```

**scenario_meta** (in bundle.manifest.json or allowlist):
```json
{ "privileged_action": true }
```

**verdict.json** topline: `"PASS"`

---

### 4.2 arb-d3-authz-decision-fail-fixture-v0.3

**events.ndjson** (wrong decision_kind):
```json
{"event_id":"authz-fail-001","event_type":"decision","timestamp":"2026-01-17T10:00:00Z","decision_id":"auth-002","decision_kind":"logging","decision_outcome":"recorded","action_id":"tool-call-002"}
```

**evidence_pointers.json**:
```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D3-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:authz-fail-001",
      "status": "PRESENT"
    }
  ]
}
```

**scenario_meta**: `{ "privileged_action": true }`  
**verdict.json** topline: `"FAIL"`  
**bundle.manifest.json** reason_code: `"REQ-FAIL-RQ-D3-01"`

---

## 5. D4 Termination & Recovery Packs

### 5.1 arb-d4-termination-recovery-pass-fixture-v0.3

**events.ndjson**:
```json
{"event_id":"term-001","event_type":"decision","timestamp":"2026-01-17T10:00:00Z","decision_id":"term-001","decision_kind":"terminate","decision_outcome":"terminated","terminate_reason":"loop_detected"}
```

**evidence_pointers.json**:
```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D4-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:term-001",
      "status": "PRESENT"
    }
  ]
}
```

**verdict.json** topline: `"terminated"` (to trigger termination case detection)

---

### 5.2 arb-d4-termination-recovery-fail-fixture-v0.3

**events.ndjson** (wrong decision_kind despite termination topline):
```json
{"event_id":"term-fail-001","event_type":"decision","timestamp":"2026-01-17T10:00:00Z","decision_id":"term-002","decision_kind":"logging","decision_outcome":"recorded","note":"Missing termination decision"}
```

**evidence_pointers.json**:
```json
{
  "pointers": [
    {
      "requirement_id": "RQ-D4-01",
      "artifact_path": "trace/events.ndjson",
      "locator": "event_id:term-fail-001",
      "status": "PRESENT"
    }
  ]
}
```

**verdict.json** topline: `"terminated"`  
**bundle.manifest.json** reason_code: `"REQ-FAIL-RQ-D4-01"`

---

## 6. ABMC Four-Piece Set Template

Each pack directory:

```
data/runs/<run_id>/
├── verdict.json
├── bundle.manifest.json
├── evidence_pointers.json
├── integrity/
│   └── sha256sums.txt
└── pack/
    └── trace/
        └── events.ndjson
```

### 6.1 verdict.json Template

```json
{
  "run_id": "<run_id>",
  "scenario_id": "arb-d<n>-<slug>",
  "admission": "ADMISSIBLE",
  "gf_verdicts": [],
  "domain_verdicts": [
    {
      "domain": "D<n>",
      "clause_id": "CL-D<n>-01",
      "status": "PASS|FAIL"
    }
  ],
  "topline": "PASS|FAIL|terminated",
  "versions": {
    "protocol": "1.0.0",
    "schema": "1.0.0",
    "ruleset": "1.1.0"
  },
  "evaluated_at": "2026-01-17T12:00:00Z"
}
```

### 6.2 bundle.manifest.json Template

```json
{
  "run_id": "<run_id>",
  "pack_root": "pack/",
  "ruleset_ref": "ruleset-1.1",
  "protocol_pin": "1.0.0",
  "schema_bundle_sha256": "99804832ddc3daefb92ec74120afaab1c3278e4a79d670e1f796e67f735463aa",
  "hash_scope": ["pack/trace/events.ndjson"],
  "reason_code": null,
  "scenario_meta": {
    "privileged_action": true
  }
}
```

For FAIL packs, add:
```json
  "reason_code": "REQ-FAIL-RQ-D<n>-01"
```

---

## 7. sha256sums.txt Generation

```bash
cd data/runs/<run_id>
sha256sum pack/trace/events.ndjson > integrity/sha256sums.txt
```

---

## 8. Key PASS/FAIL Differentiation

| Pack | Pass Mechanism | Fail Mechanism |
|:---|:---|:---|
| D1 | `decision_kind=budget` + outcome exists | `decision_kind=logging` (not in synonym group) |
| D2 | `to_state=success` (terminal) | `to_state=running` (non-terminal) |
| D3 | `decision_kind=authz` + outcome=allow/deny | `decision_kind=logging` |
| D4 | `decision_kind=terminate` + outcome=terminated | `decision_kind=logging` |

**Critical**: FAIL packs have valid pointers and resolvable events—they fail on **semantic grounds**, not structural.

---

**Document Status**: Engineering Blueprint  
**Version**: 1.0.0
