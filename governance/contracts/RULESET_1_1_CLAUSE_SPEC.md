# RULESET_1_1_CLAUSE_SPEC — Four-Domain Clause Logic Specification

**Document ID**: VLAB-RS11-CLAUSE-SPEC-01  
**Status**: Draft (Target: Active in v0.3)  
**Authority**: MPGC / Validation Lab Governance  
**Applies To**: ruleset-1.1  
**Related**: ERC_D1~D4, V03_8PACKS_NAMING_AND_LAYOUT.md

---

## 0. Overview

This document specifies the **adjudication logic** for ruleset-1.1's four domain clauses (CL-D1-01 ~ CL-D4-01).

**Key Principles**:
1. **Admission first**: PIN/Contract gates before clause evaluation
2. **Pointer required**: Missing pointer = FAIL
3. **Deterministic**: Only evaluate pointed evidence fields
4. **Extensible**: Same logic works across substrates (fixture → AutoGen → SK → CrewAI)

---

## 1. Type Definitions

```typescript
interface ClauseResult {
  clause_id: string;         // e.g., "CL-D1-01"
  requirement_id: string;    // e.g., "RQ-D1-01"
  status: "PASS" | "FAIL" | "NOT_EVALUATED" | "NOT_ADMISSIBLE";
  reason_code?: string;      // e.g., "REQ-FAIL-RQ-D1-01"
  evidence_refs?: EvidenceRef[];
  notes?: string[];
}

interface EvidenceRef {
  pointer: EvidencePointer;
  resolved: "event" | "snapshot" | "none";
}

interface EvidencePointer {
  requirement_id: string;
  artifact_path: string;
  locator: string;           // event_id:<id> | line:<N> | jsonptr:<path> | snapshot:<id>
  status: "PRESENT" | "ABSENT" | "NOT_EVALUATED";
}
```

---

## 2. Admission Gates (Shared)

All clauses share admission gates. If any gate fails, all clauses return `NOT_ADMISSIBLE`.

```typescript
function adjudicateRuleset11(runBundle: RunBundle): ClauseResult[] {
  // GATE: PIN check
  if (!hasPins(runBundle.bundle_manifest)) {
    return allClausesNotAdmissible("ADM-GATE-PIN-FAIL");
  }
  
  // GATE: Contract check
  if (!isContractValid(runBundle)) {
    return allClausesNotAdmissible("ADM-GATE-CONTRACT-FAIL");
  }

  // Clause evaluation
  return [
    evalCLD101(runBundle),
    evalCLD201(runBundle),
    evalCLD301(runBundle),
    evalCLD401(runBundle),
  ];
}

function allClausesNotAdmissible(code: string): ClauseResult[] {
  return [
    { clause_id: "CL-D1-01", requirement_id: "RQ-D1-01", status: "NOT_ADMISSIBLE", reason_code: code },
    { clause_id: "CL-D2-01", requirement_id: "RQ-D2-01", status: "NOT_ADMISSIBLE", reason_code: code },
    { clause_id: "CL-D3-01", requirement_id: "RQ-D3-01", status: "NOT_ADMISSIBLE", reason_code: code },
    { clause_id: "CL-D4-01", requirement_id: "RQ-D4-01", status: "NOT_ADMISSIBLE", reason_code: code },
  ];
}
```

---

## 3. Pointer Requirement Helper

```typescript
function requirePointer(
  runBundle: RunBundle, 
  requirementId: string
): { ok: true; pointer: EvidencePointer } | { ok: false; fail: Partial<ClauseResult> } {
  const ptr = runBundle.evidence_pointers.pointers.find(p => p.requirement_id === requirementId);
  
  if (!ptr || ptr.status !== "PRESENT") {
    return {
      ok: false,
      fail: {
        status: "FAIL",
        reason_code: `BUNDLE-POINTER-MISSING-${requirementId}`
      }
    };
  }
  
  return { ok: true, pointer: ptr };
}
```

---

## 4. Token Normalization (Synonym Table)

```typescript
const SYNONYM_TABLE = {
  // D1: Budget decision kinds
  budget_kinds: ["budget", "quota", "rate_limit", "suspend", "resume", "resource_budget", "throttle"],
  budget_outcomes: ["allow", "deny", "throttle", "suspend", "resume", "granted", "rejected"],
  
  // D2: Terminal states
  terminal_states: ["success", "failure", "cancelled", "canceled", "terminated", "completed", "failed"],
  
  // D3: Authorization
  authz_kinds: ["authz", "authorization", "permission", "access_control"],
  authz_outcomes: ["allow", "deny", "granted", "rejected", "permitted", "denied"],
  
  // D4: Termination
  terminate_kinds: ["terminate", "termination", "abort", "cancel", "stop", "kill"],
  terminate_outcomes: ["terminated", "stop", "abort", "aborted", "stopped", "killed"],
};

function normalizeToken(value: string | undefined): string {
  if (!value) return "";
  return value.toLowerCase().trim().replace(/[-_\s]+/g, "_");
}

function matchesSynonymGroup(token: string, group: string[]): boolean {
  const normalized = normalizeToken(token);
  return group.some(s => normalizeToken(s) === normalized);
}
```

---

## 5. Clause Implementations

### 5.1 CL-D1-01 — Budget Decision Record

**Source**: ERC_D1_BUDGET.md → RQ-D1-01

```typescript
function evalCLD101(runBundle: RunBundle): ClauseResult {
  const base = { clause_id: "CL-D1-01", requirement_id: "RQ-D1-01" };

  // Require pointer
  const p = requirePointer(runBundle, "RQ-D1-01");
  if (!p.ok) return { ...base, ...p.fail };

  // Resolve event
  const evt = resolveEvent(runBundle, p.pointer);
  if (!evt) {
    return { 
      ...base, 
      status: "FAIL", 
      reason_code: "REQ-FAIL-RQ-D1-01", 
      notes: ["pointer unresolvable"] 
    };
  }

  // Check decision_kind and decision_outcome
  const kindMatch = matchesSynonymGroup(evt.decision_kind, SYNONYM_TABLE.budget_kinds);
  const hasOutcome = evt.decision_outcome && evt.decision_outcome.length > 0;

  if (kindMatch && hasOutcome) {
    return { 
      ...base, 
      status: "PASS", 
      evidence_refs: [{ pointer: p.pointer, resolved: "event" }] 
    };
  }

  return { 
    ...base, 
    status: "FAIL", 
    reason_code: "REQ-FAIL-RQ-D1-01" 
  };
}
```

---

### 5.2 CL-D2-01 — Terminal Lifecycle State

**Source**: ERC_D2_LIFECYCLE_STATE.md → RQ-D2-01

```typescript
function evalCLD201(runBundle: RunBundle): ClauseResult {
  const base = { clause_id: "CL-D2-01", requirement_id: "RQ-D2-01" };

  // Require pointer
  const p = requirePointer(runBundle, "RQ-D2-01");
  if (!p.ok) return { ...base, ...p.fail };

  // Try resolve as event
  const evt = resolveEvent(runBundle, p.pointer);
  if (evt) {
    const toState = normalizeToken(evt.to_state);
    if (matchesSynonymGroup(toState, SYNONYM_TABLE.terminal_states)) {
      return { 
        ...base, 
        status: "PASS", 
        evidence_refs: [{ pointer: p.pointer, resolved: "event" }] 
      };
    }
  }

  // Try resolve as snapshot
  const snap = resolveSnapshot(runBundle, p.pointer);
  if (snap && snap.state?.is_terminal === true) {
    return { 
      ...base, 
      status: "PASS", 
      evidence_refs: [{ pointer: p.pointer, resolved: "snapshot" }] 
    };
  }

  // Partial execution exception (if declared)
  if (runBundle.ruleset_meta?.partial_execution === true) {
    return { 
      ...base, 
      status: "NOT_EVALUATED", 
      notes: ["partial_execution=true"] 
    };
  }

  return { 
    ...base, 
    status: "FAIL", 
    reason_code: "REQ-FAIL-RQ-D2-01", 
    notes: ["no terminal marker located"] 
  };
}
```

---

### 5.3 CL-D3-01 — Authorization Decision Record

**Source**: ERC_D3_AUTHZ_DECISION.md → RQ-D3-01

```typescript
function evalCLD301(runBundle: RunBundle): ClauseResult {
  const base = { clause_id: "CL-D3-01", requirement_id: "RQ-D3-01" };

  // Scenario applicability: privileged action?
  const privilegedMeta = runBundle.scenario_meta?.privileged_action;
  
  // Explicit non-privileged → NOT_EVALUATED
  if (privilegedMeta === false) {
    return { 
      ...base, 
      status: "NOT_EVALUATED", 
      notes: ["scenario marked non-privileged"] 
    };
  }

  // Default: treat as privileged (conservative)
  // Require pointer
  const p = requirePointer(runBundle, "RQ-D3-01");
  if (!p.ok) return { ...base, ...p.fail };

  // Resolve event
  const evt = resolveEvent(runBundle, p.pointer);
  if (!evt) {
    return { 
      ...base, 
      status: "FAIL", 
      reason_code: "REQ-FAIL-RQ-D3-01", 
      notes: ["pointer unresolvable"] 
    };
  }

  // Check authz decision
  const kindMatch = matchesSynonymGroup(evt.decision_kind, SYNONYM_TABLE.authz_kinds);
  const outcomeMatch = matchesSynonymGroup(evt.decision_outcome, SYNONYM_TABLE.authz_outcomes);

  if (kindMatch && outcomeMatch) {
    return { 
      ...base, 
      status: "PASS", 
      evidence_refs: [{ pointer: p.pointer, resolved: "event" }] 
    };
  }

  return { 
    ...base, 
    status: "FAIL", 
    reason_code: "REQ-FAIL-RQ-D3-01" 
  };
}
```

---

### 5.4 CL-D4-01 — Termination Decision Record

**Source**: ERC_D4_TERMINATION_RECOVERY.md → RQ-D4-01

```typescript
function evalCLD401(runBundle: RunBundle): ClauseResult {
  const base = { clause_id: "CL-D4-01", requirement_id: "RQ-D4-01" };

  // Determine if termination case
  const topline = normalizeToken(runBundle.verdict?.topline);
  const isTerminationCase = matchesSynonymGroup(topline, SYNONYM_TABLE.terminate_outcomes) ||
    topline.includes("timeout") || topline.includes("abort") || topline.includes("cancel");

  // Not a termination case → NOT_EVALUATED
  if (!isTerminationCase) {
    return { 
      ...base, 
      status: "NOT_EVALUATED", 
      notes: ["not a termination case"] 
    };
  }

  // Require pointer
  const p = requirePointer(runBundle, "RQ-D4-01");
  if (!p.ok) return { ...base, ...p.fail };

  // Resolve event
  const evt = resolveEvent(runBundle, p.pointer);
  if (!evt) {
    return { 
      ...base, 
      status: "FAIL", 
      reason_code: "REQ-FAIL-RQ-D4-01", 
      notes: ["pointer unresolvable"] 
    };
  }

  // Check termination decision
  const kindMatch = matchesSynonymGroup(evt.decision_kind, SYNONYM_TABLE.terminate_kinds);
  const outcomeMatch = matchesSynonymGroup(evt.decision_outcome, SYNONYM_TABLE.terminate_outcomes);

  if (kindMatch && outcomeMatch) {
    return { 
      ...base, 
      status: "PASS", 
      evidence_refs: [{ pointer: p.pointer, resolved: "event" }] 
    };
  }

  return { 
    ...base, 
    status: "FAIL", 
    reason_code: "REQ-FAIL-RQ-D4-01" 
  };
}
```

---

## 6. Event/Snapshot Resolution Helpers

```typescript
function resolveEvent(runBundle: RunBundle, pointer: EvidencePointer): Event | null {
  // Parse locator
  if (pointer.locator.startsWith("event_id:")) {
    const eventId = pointer.locator.replace("event_id:", "");
    return findEventById(runBundle.pack.trace.events, eventId);
  }
  
  if (pointer.locator.startsWith("line:")) {
    const lineNum = parseInt(pointer.locator.replace("line:", ""), 10);
    return getEventByLine(runBundle.pack.trace.events, lineNum);
  }
  
  return null;
}

function resolveSnapshot(runBundle: RunBundle, pointer: EvidencePointer): Snapshot | null {
  if (pointer.locator.startsWith("snapshot:")) {
    const snapId = pointer.locator.replace("snapshot:", "");
    return findSnapshotById(runBundle.pack.snapshots, snapId);
  }
  
  if (pointer.locator.startsWith("jsonptr:")) {
    // JSONPointer resolution into snapshot
    const jsonPtr = pointer.locator.replace("jsonptr:", "");
    return resolveJsonPointer(runBundle.pack, pointer.artifact_path, jsonPtr);
  }
  
  return null;
}
```

---

## 7. Output Structure (JSON)

Each clause produces a `ClauseResult`. The ruleset evaluation returns an array:

```json
{
  "ruleset_id": "ruleset-1.1",
  "run_id": "arb-d1-budget-pass-fixture-v0.3",
  "evaluated_at": "2026-01-17T12:00:00Z",
  "clauses": [
    {
      "clause_id": "CL-D1-01",
      "requirement_id": "RQ-D1-01",
      "status": "PASS",
      "evidence_refs": [
        {
          "pointer": {
            "requirement_id": "RQ-D1-01",
            "artifact_path": "trace/events.ndjson",
            "locator": "event_id:budget-decision-001",
            "status": "PRESENT"
          },
          "resolved": "event"
        }
      ]
    },
    {
      "clause_id": "CL-D2-01",
      "requirement_id": "RQ-D2-01",
      "status": "NOT_EVALUATED",
      "notes": ["not applicable for this scenario"]
    }
    // ... CL-D3-01, CL-D4-01
  ],
  "topline_verdict": "PASS"
}
```

---

## 8. Topline Verdict Derivation

```typescript
function deriveToplineVerdict(clauses: ClauseResult[]): string {
  // Any NOT_ADMISSIBLE → NOT_ADMISSIBLE
  if (clauses.some(c => c.status === "NOT_ADMISSIBLE")) {
    return "NOT_ADMISSIBLE";
  }
  
  // Any FAIL → FAIL
  if (clauses.some(c => c.status === "FAIL")) {
    return "FAIL";
  }
  
  // All PASS or NOT_EVALUATED → PASS
  return "PASS";
}
```

---

## 9. Implementation Notes

1. **Synonym Table Extensibility**: Add new tokens as substrates are onboarded
2. **Scenario Metadata**: Add `privileged_action` and `termination_case` to allowlist/manifest
3. **Error Handling**: Unresolvable pointers → FAIL, not exception
4. **Determinism**: Same evidence + same ruleset = same result (no randomness)

---

**Document Status**: Draft  
**Version**: 0.1.0  
**Governed By**: MPGC / Validation Lab
