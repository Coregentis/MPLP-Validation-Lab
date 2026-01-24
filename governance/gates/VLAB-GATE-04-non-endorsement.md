---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-002"
---

# VLAB-GATE-04: Non-Endorsement Language

**Gate ID**: VLAB-GATE-04  
**Status**: ACTIVE  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## Purpose

Ensures that Validation Lab does not use language that implies certification, endorsement, or official compliance status.

---

## Trigger

This gate MUST run on:
- Every PR that modifies `app/**`, `components/**`, or `*.md` files
- Every release build

---

## Forbidden Terms

The following terms are **FORBIDDEN** in all user-facing content:

| Term | Reason |
|:---|:---|
| `certified` | Implies official certification |
| `accredited` | Implies accreditation body |
| `badge` | Implies endorsement mark |
| `ranking` | Implies comparative scoring |
| `score` | Implies numeric rating |
| `official compliance` | Implies regulatory approval |
| `MPLP approved` | Implies endorsement |
| `seal` | Implies official mark |
| `stamp` | Implies official mark |
| `certification mark` | Implies official mark |

## Allowed Terms (With Constraints)

| Term | Constraint |
|:---|:---|
| `conformance verdict` | Must include ruleset version |
| `evidence-based evaluation` | Allowed |
| `conforms to ruleset-X for GF-Y` | Must include full context |
| `PASS` / `FAIL` | Must be verdict status, not endorsement |

---

## Implementation

```bash
#!/bin/bash
# scripts/lint-non-endorsement.ts

FORBIDDEN_PATTERNS=(
  "certified"
  "accredited"
  "\\bbadge\\b"
  "ranking"
  "\\bscore\\b"
  "official compliance"
  "MPLP approved"
  "\\bseal\\b"
  "\\bstamp\\b"
  "certification mark"
)

EXIT_CODE=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  matches=$(grep -rn -i "$pattern" app/ components/ --include="*.tsx" --include="*.ts" --include="*.md" 2>/dev/null)
  if [ -n "$matches" ]; then
    echo "❌ GATE-04 FAIL: Found forbidden term '$pattern':"
    echo "$matches"
    EXIT_CODE=1
  fi
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ GATE-04 PASS: No forbidden terms found"
fi

exit $EXIT_CODE
```

---

## Failure Response

If this gate fails:
1. PR cannot be merged
2. Developer must replace forbidden terms with allowed alternatives
3. Re-run gate after changes

---

## Audit Evidence

Gate produces:
- `GATE-04-RESULT.json` with pass/fail and matched terms
- Stored in CI artifacts

---

**Document Status**: Gate Definition  
**Version**: 1.0.0
