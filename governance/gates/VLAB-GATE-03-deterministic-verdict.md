---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-003"
---

# VLAB-GATE-03: Deterministic Verdict

**Gate ID**: VLAB-GATE-03  
**Status**: ACTIVE  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## Purpose

Ensures that the same evidence pack + same ruleset always produces the same verdict (deterministic evaluation).

---

## Trigger

This gate MUST run on:
- Every PR that modifies `lib/engine/**`
- Every release build

---

## Determinism Requirements

### Core Principle

```
Same Evidence Pack + Same Ruleset = Same Verdict
```

This means:
- No randomness in evaluation
- No time-dependent logic affecting verdicts
- No external state affecting verdicts

### Verification Method

For each curated evidence pack:

```bash
# Run evaluation twice
VERDICT_1=$(pnpm evaluate --pack $PACK --ruleset $RULESET --output-hash)
VERDICT_2=$(pnpm evaluate --pack $PACK --ruleset $RULESET --output-hash)

# Hashes must match
if [ "$VERDICT_1" != "$VERDICT_2" ]; then
  echo "❌ GATE-03 FAIL: Non-deterministic verdict"
  exit 1
fi
```

---

## Checks

### Check 1: Hash Reproducibility

| Condition | Pass | Fail |
|:---|:---|:---|
| Multiple runs produce identical `determinism_hash` | ✅ PASS | 🔴 FAIL |

### Check 2: No Random Dependencies

| Condition | Pass | Fail |
|:---|:---|:---|
| No `Math.random()` in engine code | ✅ PASS | 🔴 FAIL |
| No `Date.now()` affecting verdict logic | ✅ PASS | 🔴 FAIL |
| No external API calls affecting verdicts | ✅ PASS | 🔴 FAIL |

### Check 3: Pointer Stability

| Condition | Pass | Fail |
|:---|:---|:---|
| Evidence pointers are consistent across runs | ✅ PASS | 🔴 FAIL |

---

## Determinism Hash Calculation

```typescript
function calculateDeterminismHash(verdict: RunVerdict): string {
  const normalized = {
    admission: verdict.admission,
    gf_verdicts: verdict.gf_verdicts?.map(v => ({
      gf_id: v.gf_id,
      status: v.status,
      coverage: v.coverage,
      // Exclude timestamps and run-specific metadata
    })),
    versions: verdict.versions,
  };
  return sha256(JSON.stringify(normalized));
}
```

---

## Failure Response

If this gate fails:
1. PR cannot be merged
2. Developer must identify and remove non-deterministic code
3. Re-run verification

---

## Audit Evidence

Gate produces:
- `GATE-03-RESULT.json` with pass/fail and hash comparison
- Stored in CI artifacts

---

**Document Status**: Gate Definition  
**Version**: 1.0.0
