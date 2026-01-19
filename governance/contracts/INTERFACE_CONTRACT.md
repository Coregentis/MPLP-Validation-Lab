# Interface Contract: RunBundle Loader, V02-G2 Gate, and Ruleset Evaluator

**Document ID**: VLAB-ENG-INTERFACE-01  
**Status**: Engineering Contract  
**Purpose**: Shared interfaces between gate, UI, and evaluator to avoid duplicate implementation

---

## 0. Overview

Three consumers share the same bundle loading and error structures:

1. **V02-G2 Gate** (CI): Checks ABMC completeness
2. **Ruleset Evaluator** (lib): Runs clause logic
3. **UI** (app): Displays results

This contract defines their shared interfaces.

---

## 1. RunBundle Structure

```typescript
// lib/bundles/types.ts

export interface RunBundle {
  run_id: string;
  
  // ABMC Four-piece set (B1-B4)
  verdict: Verdict | null;
  bundle_manifest: BundleManifest | null;
  evidence_pointers: EvidencePointers | null;
  integrity: IntegrityInfo | null;
  
  // Pack contents
  pack: Pack | null;
  
  // Loading metadata
  load_status: LoadStatus;
  load_errors: LoadError[];
}

export interface LoadStatus {
  b1_verdict: "ok" | "missing" | "invalid";
  b2_manifest: "ok" | "missing" | "invalid";
  b3_integrity: "ok" | "missing" | "invalid";
  b4_pointers: "ok" | "missing" | "invalid";
  pack: "ok" | "missing" | "partial";
}

export interface LoadError {
  artifact: "B1" | "B2" | "B3" | "B4" | "pack";
  code: string;           // e.g., "BUNDLE-MISSING-B1"
  message: string;
  path?: string;
}
```

---

## 2. Verdict Structure (B1)

```typescript
// lib/bundles/types.ts

export interface Verdict {
  run_id: string;
  scenario_id: string;
  admission: "ADMISSIBLE" | "NOT_ADMISSIBLE";
  
  // GF verdicts (ruleset-1.0 compatibility)
  gf_verdicts: GFVerdict[];
  
  // Domain verdicts (ruleset-1.1)
  domain_verdicts?: DomainVerdict[];
  
  topline: string;  // PASS | FAIL | terminated | etc
  
  versions: {
    protocol: string;
    schema: string;
    ruleset: string;
  };
  
  evaluated_at: string;
}

export interface DomainVerdict {
  domain: "D1" | "D2" | "D3" | "D4";
  clause_id: string;
  status: "PASS" | "FAIL" | "NOT_EVALUATED" | "NOT_ADMISSIBLE";
  reason_code?: string;
}
```

---

## 3. BundleManifest Structure (B2)

```typescript
// lib/bundles/types.ts

export interface BundleManifest {
  run_id: string;
  pack_root: string;
  ruleset_ref: string;
  
  // Pins
  protocol_pin: string;
  schema_bundle_sha256: string;
  
  // Hash scope
  hash_scope: string[];
  
  // Reason code (for non-PASS)
  reason_code: string | null;
  
  // Scenario metadata
  scenario_meta?: ScenarioMeta;
}

export interface ScenarioMeta {
  privileged_action?: boolean;
  termination_case?: boolean;
}
```

---

## 4. EvidencePointers Structure (B4)

```typescript
// lib/bundles/types.ts

export interface EvidencePointers {
  pointers: EvidencePointer[];
}

export interface EvidencePointer {
  requirement_id: string;
  artifact_path: string;
  locator: string;
  status: "PRESENT" | "ABSENT" | "NOT_EVALUATED";
}
```

---

## 5. Pack Structure

```typescript
// lib/bundles/types.ts

export interface Pack {
  root: string;
  trace?: TraceData;
  snapshots?: SnapshotData[];
}

export interface TraceData {
  events: Event[];
  raw_path: string;
}

export interface Event {
  event_id: string;
  event_type: string;
  timestamp: string;
  [key: string]: unknown;  // Domain-specific fields
}

export interface SnapshotData {
  snapshot_id: string;
  path: string;
  data: Record<string, unknown>;
}
```

---

## 6. Loader Function Signature

```typescript
// lib/bundles/load_run_bundle.ts

export async function loadRunBundle(runPath: string): Promise<RunBundle>;

// Returns RunBundle with:
// - All fields populated if available
// - load_status showing which artifacts succeeded/failed
// - load_errors array for detailed error info
```

---

## 7. V02-G2 Gate Interface

```typescript
// lib/gates/v02_g2_bundle_closure.ts

export interface V02G2Result {
  gate_id: "V02-G2";
  status: "PASS" | "FAIL";
  run_id: string;
  
  // Per-artifact status
  artifacts: {
    b1: ArtifactCheck;
    b2: ArtifactCheck;
    b3: ArtifactCheck;
    b4: ArtifactCheck;
  };
  
  // Reason code check (for non-PASS verdicts)
  reason_code_required: boolean;
  reason_code_present: boolean;
  
  errors: string[];
}

export interface ArtifactCheck {
  status: "ok" | "missing" | "invalid";
  path: string;
  error?: string;
}

export async function checkV02G2(runBundle: RunBundle): Promise<V02G2Result>;
```

---

## 8. Ruleset Evaluator Interface

```typescript
// lib/rulesets/ruleset-1.1/adjudicate.ts

export interface RulesetEvalResult {
  ruleset_id: string;
  run_id: string;
  evaluated_at: string;
  
  clauses: ClauseResult[];
  topline_verdict: string;
}

export interface ClauseResult {
  clause_id: string;
  requirement_id: string;
  status: "PASS" | "FAIL" | "NOT_EVALUATED" | "NOT_ADMISSIBLE";
  reason_code?: string;
  evidence_refs?: EvidenceRef[];
  notes?: string[];
}

export interface EvidenceRef {
  pointer: EvidencePointer;
  resolved: "event" | "snapshot" | "none";
}

export async function adjudicateRuleset11(runBundle: RunBundle): Promise<RulesetEvalResult>;
```

---

## 9. UI Data Contract

```typescript
// For app/runs/[run_id]/page.tsx

export interface RunPageData {
  run_id: string;
  scenario_id: string;
  
  // Bundle status (for V02-G2 display)
  bundle_status: LoadStatus;
  bundle_errors: LoadError[];
  
  // Verdict (from B1)
  verdict: Verdict | null;
  
  // Ruleset evaluation (from evaluator)
  evaluation?: RulesetEvalResult;
  
  // Evidence browser data
  pack_available: boolean;
  trace_events_count: number;
}
```

---

## 10. Error Code Mapping

All components use the same reason code vocabulary:

```typescript
// lib/adjudication/errors/reason_codes.ts

export const REASON_CODES = {
  // Admission
  ADM_GATE_PIN_FAIL: "ADM-GATE-PIN-FAIL",
  ADM_GATE_CONTRACT_FAIL: "ADM-GATE-CONTRACT-FAIL",
  
  // Bundle structure
  BUNDLE_MISSING_B1: "BUNDLE-MISSING-B1",
  BUNDLE_MISSING_B2: "BUNDLE-MISSING-B2",
  BUNDLE_MISSING_B3: "BUNDLE-MISSING-B3",
  BUNDLE_MISSING_B4: "BUNDLE-MISSING-B4",
  BUNDLE_INVALID_B1: "BUNDLE-INVALID-B1",
  BUNDLE_INVALID_B2: "BUNDLE-INVALID-B2",
  
  // Pointer
  bundlePointerMissing: (rqId: string) => `BUNDLE-POINTER-MISSING-${rqId}`,
  
  // Requirement failures
  reqFail: (rqId: string) => `REQ-FAIL-${rqId}`,
  
  // Not evaluated
  evalNotSupported: (rqId: string) => `EVAL-NOT-SUPPORTED-${rqId}`,
} as const;
```

---

## 11. Usage Flow

```
┌─────────────────┐
│  loadRunBundle  │ ← shared loader
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐  ┌─────────────┐
│V02-G2 │  │ Ruleset 1.1 │
│ Gate  │  │  Evaluator  │
└───┬───┘  └──────┬──────┘
    │             │
    │  (both use same RunBundle)
    │             │
    └──────┬──────┘
           ▼
    ┌─────────────┐
    │     UI      │
    │ RunPageData │
    └─────────────┘
```

---

## 12. Implementation Order

1. `lib/bundles/types.ts` — Define all interfaces
2. `lib/bundles/load_run_bundle.ts` — Implement loader
3. `lib/gates/v02_g2_bundle_closure.ts` — Gate uses loader
4. `lib/rulesets/ruleset-1.1/adjudicate.ts` — Evaluator uses loader
5. `app/runs/[run_id]/page.tsx` — UI uses both

---

**Document Status**: Engineering Contract  
**Version**: 1.0.0
