# VLAB-GATE-01: Schema Alignment

**Gate ID**: VLAB-GATE-01  
**Status**: ACTIVE  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## Purpose

Ensures that all fields displayed in UI and all ruleset requirements have traceable sources in upstream schemas or invariants.

---

## Trigger

This gate MUST run on:
- Every PR that modifies `app/**`, `components/**`
- Every PR that modifies `data/rulesets/**`
- Every release build

---

## Checks

### Check 1: UI Field Alignment

For every field displayed in verdict/run UI:

| Condition | Pass | Fail |
|:---|:---|:---|
| Field has source comment with JSON pointer | ✅ PASS | 🔴 FAIL |
| JSON pointer resolves to schema | ✅ PASS | 🔴 FAIL |

### Check 2: Ruleset Requirement Sources

For every requirement in `data/rulesets/**/requirements/*.yaml`:

| Condition | Pass | Fail |
|:---|:---|:---|
| Has `sources:` field | ✅ PASS | 🔴 FAIL |
| At least one `schema_ref` or `invariant_ref` | ✅ PASS | 🔴 FAIL |
| Referenced files exist in synced paths | ✅ PASS | 🔴 FAIL |

---

## Source Format

### Schema Reference
```yaml
sources:
  - schema_ref: "mplp-context.schema.json#/properties/context_id"
```

### Invariant Reference
```yaml
sources:
  - invariant_ref: "tests/golden/invariants/context.yaml#context_id_must_be_uuid"
```

---

## Failure Response

If this gate fails:
1. PR cannot be merged
2. Developer must add source references
3. Re-run gate after changes

---

## Audit Evidence

Gate produces:
- `GATE-01-RESULT.json` with pass/fail and source map
- Stored in CI artifacts

---

**Document Status**: Gate Definition  
**Version**: 1.0.0
