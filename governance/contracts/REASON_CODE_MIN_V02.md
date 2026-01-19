# REASON_CODE_MIN_V02 — Minimum Reason Code Vocabulary (v0.2)

**Document ID**: VLAB-CON-RCMV-01  
**Status**: Active  
**Authority**: MPGC / Validation Lab Governance  
**Effective**: 2026-01-17  
**Applies To**: v0.2 bundle.manifest.json reason_code field

---

## 0. Purpose

This vocabulary defines the **minimum set of reason codes** for v0.2.  
All `reason_code` values in `bundle.manifest.json` MUST conform to this vocabulary.

---

## 1. Reason Code Categories

### 1.1 Admission Gate Failures (NOT_ADMISSIBLE)

| Code | Description |
|:---|:---|
| `ADM-GATE-02-FAIL` | Integrity gate failed (pack hash mismatch or missing files) |
| `ADM-GATE-03-FAIL` | Determinism gate failed (verdict not reproducible) |
| `ADM-GATE-04-FAIL` | Non-endorsement language gate failed |
| `ADM-GATE-05-FAIL` | Execution hosting gate failed |
| `ADM-GATE-CONTRACT-FAIL` | Evidence pack contract version incompatible |
| `ADM-GATE-PIN-FAIL` | Protocol/schema/ruleset pin missing or unknown |

### 1.2 Bundle Structural Failures

| Code | Description |
|:---|:---|
| `BUNDLE-MISSING-B1` | verdict.json missing |
| `BUNDLE-MISSING-B2` | bundle.manifest.json missing |
| `BUNDLE-MISSING-B3` | sha256sums.txt missing |
| `BUNDLE-MISSING-B4` | evidence_pointers.json missing |
| `BUNDLE-INVALID-B1` | verdict.json invalid (malformed JSON or missing required fields) |
| `BUNDLE-INVALID-B2` | bundle.manifest.json invalid |
| `BUNDLE-INVALID-B3` | sha256sums.txt invalid (format error) |
| `BUNDLE-INVALID-B4` | evidence_pointers.json invalid |
| `BUNDLE-POINTER-MISSING-<RQ-ID>` | Required evidence pointer missing for requirement |

### 1.3 Evaluation Failures (FAIL)

| Code | Description |
|:---|:---|
| `REQ-FAIL-<requirement_id>` | Requirement failed evaluation (e.g., `REQ-FAIL-gf-01-r01`) |
| `INV-FAIL-<invariant_id>` | Invariant violation detected |

### 1.4 Not Evaluated (NOT_EVALUATED)

| Code | Description |
|:---|:---|
| `EVAL-NOT-SUPPORTED-<requirement_id>` | Requirement not evaluated (ruleset does not yet cover) |
| `EVAL-EVIDENCE-ABSENT-<requirement_id>` | Evidence not present (declared NOT_EVALUATED by design) |

---

## 2. Code Structure Rules

1. Codes MUST be uppercase with hyphens.
2. Codes MUST follow pattern: `<CATEGORY>-<SUBCATEGORY>-<ID>`.
3. Dynamic IDs (e.g., requirement IDs) MUST use the exact ID from ruleset/ERC.

---

## 3. Usage in bundle.manifest.json

```json
{
  "run_id": "gf-01-a2a-fail",
  "reason_code": "REQ-FAIL-gf-01-r01",
  "reason_detail": "loop_detected event triggered execution failure"
}
```

- `reason_code` is REQUIRED for non-PASS verdicts.
- `reason_detail` is OPTIONAL (human-readable detail).

---

## 4. Extension Rule

New codes MAY be added when:
- New admission gates are introduced.
- New requirements/invariants are added to rulesets.
- New bundle artifacts are required.

Changes MUST be version-tracked in this document.

---

**Document Status**: Active  
**Version**: 1.0.0  
**Governed By**: MPGC / Validation Lab
