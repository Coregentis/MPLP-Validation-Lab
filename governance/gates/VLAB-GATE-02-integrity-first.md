---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-005"
---

# VLAB-GATE-02: Integrity-First Enforcement

**Gate ID**: VLAB-GATE-02  
**Status**: ACTIVE  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## Purpose

Ensures that integrity checks are always performed before any GF evaluation, and that integrity failures are properly reported.

---

## Trigger

This gate MUST run on:
- Every PR that modifies `lib/engine/**`
- Every release build

---

## Checks

### Check 1: Verify Pipeline Order

The evaluation pipeline MUST follow this order:

```
1. Security checks (path traversal, file types, size)
2. Manifest existence
3. Manifest schema validation
4. Integrity hash verification
5. Version compatibility
6. GF evaluation (only if all above pass)
```

Any violation of this order = 🔴 FAIL

### Check 2: NOT_ADMISSIBLE Output

When integrity fails, the engine MUST:

| Requirement | Pass | Fail |
|:---|:---|:---|
| Return `NOT_ADMISSIBLE` status | ✅ PASS | 🔴 FAIL |
| Include taxonomy code | ✅ PASS | 🔴 FAIL |
| NOT output any GF verdict | ✅ PASS | 🔴 FAIL |

### Check 3: Test Coverage

Unit tests MUST cover:
- Hash mismatch → NOT_ADMISSIBLE
- Missing manifest → NOT_ADMISSIBLE
- Invalid manifest → NOT_ADMISSIBLE
- Version incompatible → NOT_ADMISSIBLE
- Security rejection → NOT_ADMISSIBLE

---

## Failure Response

If this gate fails:
1. PR cannot be merged
2. Developer must fix pipeline order or output format
3. Add missing test coverage

---

## Audit Evidence

Gate produces:
- `GATE-02-RESULT.json` with pass/fail and test coverage
- Stored in CI artifacts

---

**Document Status**: Gate Definition  
**Version**: 1.0.0
