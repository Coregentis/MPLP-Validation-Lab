# Phase P1.1 Failure Pack Evidence Producer — Seal Gate Record

**Date**: 2026-01-16  
**Gate Name**: `phase-p1.1-failure-pack-seal`  
**Result**: ✅ **SEALED**  
**Scope**: P1.1 Complete (ADMISSIBLE FAIL pack with event+diff replay)

---

## Run Selection

| Property | Value |
|:---|:---|
| **run_id** | `gf-01-a2a-fail` |
| **Pack Source** | `data/runs/gf-01-a2a-fail/` |
| **Admission** | `ADMISSIBLE` |
| **Scenario ID** | `a2a-evidence-producer` |
| **Protocol Version** | `1.0.0` |
| **Schema Version** | `1.0.0` |
| **Ruleset Version** | `1.0.0` |

**Note**: Versions are taken from `manifest.json` and the active ruleset manifest.

---

## Seal Gate Checklist

| Check | Status | Evidence |
|:---|:---|:---|
| Page loads without errors | ✅ PASS | `/runs/gf-01-a2a-fail/replay` |
| VerdictPanel shows LG-01 (no gf-xx) | ✅ PASS | External display only |
| VerdictPanel shows FAIL status | ✅ PASS | Red badge visible |
| Event pointer jump works | ✅ PASS | `event:fail-trace-001` → Timeline highlights loop_detected/execution_failed |
| Diff pointer jump works | ✅ PASS | `diff:snapshots/diffs/diff-001-002.json` → StateDiffPanel |
| StateDiffPanel renders JSON Patch ops | ✅ PASS | 4 ops (REPLACE trace_id/status/loop_count, ADD error) |
| Integrity verified | ✅ PASS | `shasum -a 256 -c integrity/sha256sums.txt` |
| TypeCheck passes | ✅ PASS | `npm run typecheck` |
| No console errors | ✅ PASS | Browser verification clean |

---

## Evidence Artifacts

### Pointer Locator Mechanism
- `event:<id>` resolves to a timeline event identifier in `timeline/events.ndjson`
- `diff:<path>` loads a JSON Patch artifact from the pack and renders ops deterministically

### verdict.json Structure
- **Pointers**: 2 total
  - `event:fail-trace-001` (Failure trigger: loop_detected event)
  - `diff:snapshots/diffs/diff-001-002.json` (Failure state transition diff)
- **Requirement coverage**: 3 evaluated / 2 pass / 1 fail (ruleset-scoped, not a certification score)
- **Status**: FAIL

### File Manifest
- `timeline/events.ndjson`
- `verdict.json`
- `snapshots/snapshot-001.json`
- `snapshots/snapshot-002.json`
- `snapshots/diffs/diff-001-002.json`
- `integrity/sha256sums.txt`

### Timeline Evidence
The failure pack demonstrates a loop detection scenario:
1. `context_created` (fail-ctx-001)
2. `plan_created` (fail-plan-001)
3. `loop_detected` (fail-trace-001) — **failure trigger**
4. `execution_failed` (fail-trace-001) — loop guard triggered

### State Transition (JSON Patch RFC6902)
```json
{
  "ops": [
    { "op": "replace", "path": "/state/trace_id", "value": "fail-trace-001" },
    { "op": "replace", "path": "/state/status", "value": "failed" },
    { "op": "replace", "path": "/state/loop_count", "value": 3 },
    { "op": "add", "path": "/state/error", "value": "Loop guard triggered" }
  ]
}
```

---

## SSOT Compliance Clarification

| Identifier | Scope | Usage |
|:---|:---|:---|
| **run_id** | Technical pack identifier | Internal naming, not conformance label |
| **LG-xx** | External display | Lifecycle Guarantee public identifier |
| **gf-xx** | Internal field | Allowed in pack JSON, prohibited in UI display |

**Verification**: UI displays only `LG-01 Single Agent Lifecycle` with `FAIL` badge. No `gf-xx` or `GF-xx` visible to users in VerdictPanel.

---

## Verification Commands

```bash
# TypeCheck
npm run typecheck

# Build verification
npm run build

# Verify integrity (independent verification)
cd data/runs/gf-01-a2a-fail
shasum -a 256 -c integrity/sha256sums.txt

# Local access
open http://localhost:3000/runs/gf-01-a2a-fail/replay
```

---

## Conclusion

**P1.1 Failure Pack SEALED**

The Validation Lab now supports **dispute-level replay for failure cases** with:
- FAIL verdict display (red badge)
- Event pointer jump to failure trigger (loop_detected)
- Diff pointer jump to failure state transition (4 JSON Patch ops)
- SSOT-compliant external display (LG-xx only)
- Integrity verification (sha256 hashes)

### Non-Certification Statement

> [!IMPORTANT]
> This is **not certification or endorsement**. The FAIL status applies to evidence strength within the specified scenario and ruleset, not to substrate quality. Verdicts are scenario + ruleset scoped. The Lab does not run code; it evaluates evidence packs.

---

## Follow-ups (P1.2+)

- **P1.2**: Add diff pointers for LG-02~LG-05 minimal examples (same run, multi-flow)
- **P2**: URL query parameter persistence for pointer selection across refresh
