---
entry_surface: validation_lab
doc_type: governance
status: sealed
authority: validation_lab_governance
doc_id: "VLAB-GOV-072"
---

# Projection Seal v0.7.1

**Seal ID**: `PROJ-SEAL-v0.7.1`  
**Status**: SEALED (Auditable Baseline v0.7.1)  
**Date**: 2026-01-23  
**Base PTM**: `ptm-0.7.yaml`

---

## Provable Baseline Anchors

This seal confirms the integrity of the projection surface via the following anchors:

### 1. Projection Manifest Anchor
- **Manifest File**: `export/projection-manifest.json`
- **PROJECTION_MANIFEST_SHA256**: `69e1c533371bb212ffaad87d0a7f85c67c01233351f298b29183b5d176c11da6`
  - *Note: This hash locks the hierarchical state of all registered truth sources as enumerated in the manifest.*

### 2. Repro Anchors (Commit Locking)

| Repository | Commit SHA | Reference Tag (Optional) |
|------------|------------|-------------------------|
| **Lab** | `072feec5ac3ba9f04fd266cdd0a08a3d32c6f617` | `lab-v0.7.1-rc1` |
| **Website** | `6428d8563ef180c8dbe91f017d1a161b7165fbce` | `web-v0.7.1-rc1` |
| **Docs** | `d00cb8d6cc5af76e8feaaa66a69f1905f8913be9` | `docs-v0.7.1-rc1` |

---

## Integration Verification

### Gating Requirements (WP-07.1)
- [x] `gate:projection-manifest` (R-MAN Strict + Registry Coverage) **PASS**
- [x] `gate:projection-sanity` (Set Equality / Essential Three) **PASS**
- [x] `gate:ptm` (Map v0.7 / Registry Anchored) **PASS**
- [x] `gate:ssot-consistency` **PASS**

### Cross-Repo Gate Evidence
- **Website**: `gate:website-pointer-only` (PASS) 
  - Evidence: `6428d856` (Commit Anchor) / Structural Alignment Verified.
- **Docs**: `gate:docs-nonnormative-pointer-only` (PASS)
  - Evidence: `d00cb8d6c` (Commit Anchor) / Pointer-only boundary verified.

### 3. English Global Standardization
- **Status**: COMPLETED (v0.7.1-P0)
- **Scope**: Lab Repository (`governance/`, `scripts/`, `verifier/`, `export/`)
- **Exclusions**: `node_modules/`, third-party binary artifacts, and .git/ metadata.
- **Verification**: UTF-8/Scanning Audit confirmed zero Chinese characters in committed governance and script assets.

---

## Authorization

- **Sealed By**: Release Manager (v0.7.1 Remediation)
- **Verified By**: MPGC Governance Delegate (v0.7.1 Computable Audit Verified)
