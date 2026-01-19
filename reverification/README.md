---
doc_type: specification
authority: Validation Lab
normativity: non-normative
status: active
version: "1.0"
---

# Reverification Bundle Specification

**Authority**: Validation Lab (Non-Normative)  
**Version**: 1.0

---

## Purpose

This directory contains reverification bundles for historical releases. Each bundle proves that a release has been verified by the current canonical Validation Lab verifier.

## Immutability Principle

> [!IMPORTANT]
> Once a reverification bundle is generated, it MUST NOT be modified.
> If re-reverification is needed, create a new bundle with a version suffix.

### Bundle Versioning

Same release may have multiple reverification bundles:

| Bundle Name | Description |
|:---|:---|
| `reverification/v0.7.2/` | Original reverification |
| `reverification/v0.7.2+rev2/` | Revision 2 (e.g., after gate scope fix) |
| `reverification/v0.7.2+rev3/` | Revision 3 |

**Canonical Selection**: Gate-11 selects the **highest +revN** bundle for each release.
If no +revN exists, the base bundle is used.

---

## Bundle Structure

Each `reverification/<release>/` directory MUST contain:

| File | Description | Required |
|:---|:---|:---|
| `input.pointer.json` | Pointer to the release being verified | ✅ |
| `verifier.identity.json` | Snapshot of VERIFIER_IDENTITY at verification time | ✅ |
| `verifier.fingerprint.json` | Hashes of engine, gates, ruleset | ✅ |
| `gate.report.json` | Structured gate results | ✅ |
| `verdict.json` | Final reverification verdict | ✅ |
| `sha256sums.txt` | Hashes of all bundle files | ✅ |

---

## Field Definitions

### `verifier.fingerprint.json`

```json
{
  "engine_hash": "<sha256 of lib/engine/verify.ts>",
  "ingest_hash": "<sha256 of lib/engine/ingest.ts>",
  "evaluate_hash": "<sha256 of lib/evaluate/evaluate.ts>",
  "gates_hash": "<aggregated sha256 of lib/gates/>",
  "ruleset_hash": "<aggregated sha256 of data/rulesets/ruleset-1.0/>",
  "computed_at": "<ISO 8601 timestamp>"
}
```

### `verdict.json`

```json
{
  "reverification_version": "1.0",
  "release": "<release version>",
  "release_path": "releases/<version>/",
  "verified_at": "<ISO 8601 timestamp>",
  "verifier": {
    "id": "validation-lab-verifier",
    "version": "1.0.0",
    "fingerprint": { ... }
  },
  "ruleset_version": "1.0",
  "gate_results": {
    "total": 7,
    "passed": 7,
    "failed": 0,
    "status": "ALL_PASS"
  },
  "overall_status": "REVERIFIED",
  "note": "Historical release reverified by canonical Validation Lab verifier."
}
```

---

## Verification Command

```bash
npm run vlab:reverify <release_version>
# Example: npm run vlab:reverify v0.7.2
```

---

## Related Documents

- [VERIFIER_IDENTITY.json](../verifier/VERIFIER_IDENTITY.json) - Canonical verifier identity
- [PROVENANCE_MODEL.md](../governance/PROVENANCE_MODEL.md) - Authority model

---

**Last Updated**: 2026-01-14
