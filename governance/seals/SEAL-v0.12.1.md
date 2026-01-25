# SEAL: v0.12.1 Maintenance Release

**Status**: SEALED
**Series**: v0.12.1
**Baseline Commit**: `4708f2597b83ec5510b65a443a992634f19b2520` (v0.12.0 Mainline)
**Date**: 2026-01-25

## 1. Release Scope & Boundaries

This is a **No-op Maintenance Release** performed to solidify the project's **Maintenance Mode** workflow.

### Scope Declaration
- **Behavioral Changes**: NONE.
- **Substrate Changes**: NONE.
- **Narrative focus**: Proof of audit-grade repeatability for the v0.12.x sustainability series.

### Stopline Enforcement
This release reinforces the **v0.12.0 Stopline**. Any deviation (new substrates, scenario families, or L1 routes) requires a major version bump to v0.13.0.

## 2. Evidence Triad (Audit Anchors)

The v0.12.1 triad remains identical to v0.12.0, verifying zero behavioral drift during the maintenance cycle.

| Artifact | Path | SHA256 Hash |
| :--- | :--- | :--- |
| **Lab Manifest** | `public/_meta/lab-manifest.json` | `48174a27b1439c5cbb4df3962560f8b8b161f23442b6f7ed44e809bb351d10a3` |
| **Sample Set** | `public/_data/curated-runs.json` | `5e2ee08a46f23b3b221214e79b7ae17e8b67464a66ddabe7e21a9f09345b7b1f` |
| **Diff Index** | `public/_meta/ruleset-diff-index.json` | `ff98becf54e2f6ed0bac9d299d0dea86d692c7557a3d098ee88160b799a71792` |

## 3. Governance Gate Status (Preflight Snapshot)

All gates verified prior to v0.12.1 issuance:

| Gate ID | Name | Status |
| :--- | :--- | :--- |
| `VLAB-GATE-SOP-V12` | Four-Way Consistency Auditor | **PASS** |
| `audit:nav-depth` | Hierarchy Preservation Audit | **PASS** |
| `gate:all` | Operational Baseline Suite | **PASS** |
| `gate:release:01` | Release Triad Integrity | **PASS** |

## 4. Audit Pack (JSON)

```json
{
  "seal_id": "VLAB-SEAL-012-01",
  "anchors": {
    "baseline_commit_sha": "4708f2597b83ec5510b65a443a992634f19b2520",
    "lab_manifest_sha256": "48174a27b1439c5cbb4df3962560f8b8b161f23442b6f7ed44e809bb351d10a3",
    "sample_set_manifest_sha256": "5e2ee08a46f23b3b221214e79b7ae17e8b67464a66ddabe7e21a9f09345b7b1f",
    "ruleset_diff_index_sha256": "ff98becf54e2f6ed0bac9d299d0dea86d692c7557a3d098ee88160b799a71792"
  },
  "notes": "No behavioral change; audit-only maintenance release drill."
}
```

---
**Non-Certification Statement**: This SEAL verifies technical consistency and cryptographic integrity per MPLP Protocol admission criteria. It does not constitute a legal endorsement or safety certification.
