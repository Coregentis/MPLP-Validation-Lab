# Phase P1 Evidence Producer — Seal Gate Record

**Date**: 2026-01-16  
**Gate Name**: `phase-p1-evidence-producer-seal`  
**Result**: ✅ **SEALED**  
**Scope**: P1 Complete (real pack event+diff replay)

---

## Run Selection

| Property | Value |
|:---|:---|
| **run_id** | `gf-01-a2a-pass` |
| **Pack Source** | `data/runs/gf-01-a2a-pass/` |
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
| Page loads without errors | ✅ PASS | `/runs/gf-01-a2a-pass/replay` |
| VerdictPanel shows LG-01 (no gf-xx) | ✅ PASS | External display only |
| Event pointer jump works | ✅ PASS | `event:test-ctx-001` → Timeline highlight |
| Diff pointer jump works | ✅ PASS | `diff:snapshots/diffs/diff-001-002.json` → StateDiffPanel |
| StateDiffPanel renders JSON Patch ops | ✅ PASS | 4 ops (REPLACE context_id/plan_id/trace_id/status) |
| Integrity updated | ✅ PASS | `sha256sums.txt` includes verdict.json + snapshots + diffs |
| TypeCheck passes | ✅ PASS | `npm run typecheck` |
| No console errors | ✅ PASS | Browser verification clean |

---

## Evidence Artifacts

### Pointer Locator Mechanism
- `event:<id>` resolves to a timeline event identifier in `timeline/events.ndjson`
- `diff:<path>` loads a JSON Patch artifact from the pack and renders ops deterministically

### verdict.json Structure
- **Pointers**: 2 total
  - `event:test-ctx-001` (Context creation event)
  - `diff:snapshots/diffs/diff-001-002.json` (State transition diff)
- **Requirement coverage**: 3 evaluated / 3 pass (ruleset-scoped, not a certification score)
- **Status**: PASS

### File Manifest
- `timeline/events.ndjson`
- `verdict.json`
- `snapshots/snapshot-001.json`
- `snapshots/snapshot-002.json`
- `snapshots/diffs/diff-001-002.json`
- `integrity/sha256sums.txt`

### Snapshots & Diffs
- `snapshots/snapshot-001.json`: Initial state (initialized)
- `snapshots/snapshot-002.json`: Final state (completed)
- `snapshots/diffs/diff-001-002.json`: JSON Patch RFC6902 with 4 operations

### Integrity Hashes
All files verified in `integrity/sha256sums.txt`:
- verdict.json: `9e3f137c7ff250fe50272671bf0a45d6cb2de5cf54bd4abf1d66ed5f86af94c5`
- diff-001-002.json: `8e4ec852ad465292c84d2681bb4960e6675e0059f0f8f1f8cac076ea4da7cde9`

---

## SSOT Compliance Clarification

| Identifier | Scope | Usage |
|:---|:---|:---|
| **run_id** | Technical pack identifier | Internal naming, not conformance label |
| **LG-xx** | External display | Lifecycle Guarantee public identifier |
| **gf-xx** | Internal field | Allowed in pack JSON, prohibited in UI display |

**Verification**: UI displays only `LG-01 Single Agent Lifecycle`. No `gf-xx` or `GF-xx` visible to users.

---

## Verification Commands

```bash
# TypeCheck
npm run typecheck

# Build verification
npm run build

# Verify integrity (independent verification)
cd data/runs/gf-01-a2a-pass
shasum -a 256 -c integrity/sha256sums.txt

# Local access
open http://localhost:3000/runs/gf-01-a2a-pass/replay
```

---

## Conclusion

**P1 Complete SEALED**

The Validation Lab now supports **dispute-level replay** for real evidence packs with:
- Event pointer jump (Timeline highlighting)
- Diff pointer jump (StateDiffPanel rendering JSON Patch operations)
- SSOT-compliant external display (LG-xx only)
- Integrity verification (sha256 hashes)

### Non-Certification Statement

> [!IMPORTANT]
> This is **not certification or endorsement**. Labels apply to evidence strength, not to substrate quality. Verdicts are scenario + ruleset scoped. The Lab does not run code; it evaluates evidence packs.

---

## Follow-ups (P1.1+)

- **P1.1**: Extend verdict/diff producer to 1 failure case pack (dispute-level value)
- **P1.2**: Add diff pointers for LG-02~LG-05 minimal examples (same run, multi-flow)
