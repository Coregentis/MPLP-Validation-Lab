# PR-11 Series Seal — Curated Set Expansion + SSOT Convergence

**Sealed Date**: 2026-01-14
**Status**: ✅ SEALED

---

## Overview

PR-11 series establishes the **negative sample coverage** for the Validation Lab's curated set and **converges all pack hash computation to a single source of truth**.

---

## Deliverables

### PR-11.1: NOT_ADMISSIBLE Samples
- `gf-02-fail` (NOT_ADMISSIBLE)
- `admission-not-admissible-01` (NOT_ADMISSIBLE)

### PR-11.2: ADJUDICATED+FAIL Sample
- `gf-01-adjudicated-fail-01` (ADMISSIBLE + GF-01 FAIL)
- `__INVALID_MARKER__` detection in `evaluateGoldenFlows`

### PR-11.3: Pack Hash SSOT Convergence
- **SSOT File**: `lib/engine/packHash.ts`
- **Frozen Exclusions**: `EXCLUDED_DIRS = ['integrity']`, `EXCLUDED_FILES = ['.DS_Store', 'Thumbs.db', '.gitkeep']`
- **Equivalence Lock Tests**: 16 tests in `tests/engine/packHash.spec.ts`

---

## Final Curated Set (3 Types)

| Status | Sample | Description |
|:---|:---|:---|
| ADJUDICATED+PASS | gf-01-smoke | Baseline positive sample |
| ADJUDICATED+FAIL | gf-01-adjudicated-fail-01 | GF-01 FAIL, admission passed |
| NOT_ADMISSIBLE | gf-02-fail, admission-not-admissible-01 | Admission gate rejection |

---

## Verification

```
Tests:       77/77 PASS (61 original + 16 packHash.spec.ts)
Gate-14:     PASS
Gate-15:     PASS
recheck-hash gf-01-smoke:                 MATCH
recheck-hash gf-01-adjudicated-fail-01:   MATCH
```

---

## Scope Lock

This PR series is **SEALED**. Any changes to:
- Pack hash computation logic
- Exclusion rules
- sha256sums format specification

...require a new PR with explicit justification and updated equivalence tests.
