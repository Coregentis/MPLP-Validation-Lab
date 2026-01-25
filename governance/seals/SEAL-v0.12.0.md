# SEAL: v0.12.0 Sustainability Release

**Status**: SEALED
**Series**: v0.12.0
**Baseline Commit**: `4708f2597b83ec5510b65a443a992634f19b2520`
**Date**: 2026-01-25

## 1. Release Scope & Boundaries

This release establishes the **Sustainability Baseline** for the Validation Lab. 
- **Representative Substrate**: Added **MCP** with 4 foundational runs.
- **SOP Solidification**: Formalized sample set expansion and evolution workflows.
- **Controlled Evolution**: Conducted `ruleset-1.1 → ruleset-1.2` minor logic exercise.

### Stopline Clause
Upon issuance of this SEAL, the project enters **Maintenance Mode**. 
- **v0.12.x** is restricted to hotfixes (hash/link/UI).
- **v0.13.0+** is required for new substrates, scenario families, or interpretation logic.

## 2. Evidence Triad (Audit Anchors)

| Artifact | Path | SHA256 Hash |
| :--- | :--- | :--- |
| **Lab Manifest** | `public/_meta/lab-manifest.json` | `48174a27b1439c5cbb4df3962560f8b8b161f23442b6f7ed44e809bb351d10a3` |
| **Sample Set** | `public/_data/curated-runs.json` | `5e2ee08a46f23b3b221214e79b7ae17e8b67464a66ddabe7e21a9f09345b7b1f` |
| **Diff Index** | `public/_meta/ruleset-diff-index.json` | `ff98becf54e2f6ed0bac9d299d0dea86d692c7557a3d098ee88160b799a71792` |
| **DiffPack (1.2)** | `public/.../ruleset-1.1__ruleset-1.2/diffpack.json` | `9713d938ce202b1e81e5d655af202cf90485a7fd738cf9a18a310e5624c2e210` |
| **Shadow Summary** | `public/.../ruleset-1.1__ruleset-1.2/shadow-summary.json` | `1b791132820214f17ed12fea45234b287b0eeb8782e457b0e0666524fba73313` |
| **Shadow Input** | `public/_data/ruleset-diffs/shadow-input.json` | `2df221240973ba5bc0f042f190cf4910918299bcd9c55af7e0c0ae7918a880c8` |

## 3. Governance Gate Status

| Gate ID | Name | Status |
| :--- | :--- | :--- |
| `VLAB-GATE-SOP-V12` | Four-Way Consistency Auditor | **PASS** |
| `audit:nav-depth` | Hierarchy Preservation Audit | **PASS** |
| `gate:evo` | Ruleset Evolution Suite | **PASS** |

## 4. Audit Pack (JSON)

```json
{
  "seal_id": "VLAB-SEAL-012-00",
  "anchors": {
    "baseline_commit_sha": "4708f2597b83ec5510b65a443a992634f19b2520",
    "lab_manifest_sha256": "48174a27b1439c5cbb4df3962560f8b8b161f23442b6f7ed44e809bb351d10a3",
    "sample_set_manifest_sha256": "5e2ee08a46f23b3b221214e79b7ae17e8b67464a66ddabe7e21a9f09345b7b1f",
    "ruleset_diff_index_sha256": "ff98becf54e2f6ed0bac9d299d0dea86d692c7557a3d098ee88160b799a71792",
    "ruleset_1.1_1.2_diffpack_path": "public/_data/ruleset-diffs/ruleset-1.1__ruleset-1.2/diffpack.json",
    "ruleset_1.1_1.2_diffpack_sha256": "9713d938ce202b1e81e5d655af202cf90485a7fd738cf9a18a310e5624c2e210",
    "shadow_summary_sha256": "1b791132820214f17ed12fea45234b287b0eeb8782e457b0e0666524fba73313",
    "shadow_input_sha256": "2df221240973ba5bc0f042f190cf4910918299bcd9c55af7e0c0ae7918a880c8"
  }
}
```

---
**Non-Certification Statement**: This SEAL verifies publication integrity and cryptographic consistency per Validation Lab governance gates. It does not constitute a legal endorsement or safety certification.
