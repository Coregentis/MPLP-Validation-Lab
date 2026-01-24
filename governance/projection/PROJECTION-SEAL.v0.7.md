---
entry_surface: validation_lab
doc_type: governance
status: sealed
authority: validation_lab_governance
doc_id: "VLAB-GOV-071"
---

# Projection Seal v0.7

**Seal ID**: `PROJ-SEAL-v0.7`  
**Status**: SEALED (Provable Baseline v0.7)  
**Date**: 2026-01-23  
**Base PTM**: `ptm-0.7.yaml`

---

## Provable Baseline Anchors

This seal confirms the integrity of the projection surface via the following anchors:

### 1. Projection Manifest Anchor
- **Manifest File**: `export/projection-manifest.json`
- **Combined SHA256**: `56b71095e602f0b756b3f8dd7af643c23bc7b15dc61af53ea90c2a87cc3f92c8`

### 2. Repro Anchors (Commit Locking)

| Repository | Commit SHA | Reference Tag (Optional) |
|------------|------------|-------------------------|
| **Lab** | `072feec5ac3ba9f04fd266cdd0a08a3d32c6f617` | `lab-v0.7.0-rc1` |
| **Website** | `6428d8563ef180c8dbe91f017d1a161b7165fbce` | `web-v0.7.0-rc1` |
| **Docs** | `d00cb8d6cc5af76e8feaaa66a69f1905f8913be9` | `docs-v0.7.0-rc1` |

---

## Integration Verification

### Gating Requirements (WP-07A/B)
- [x] `gate:projection-manifest` (WP-07A) **PASS**
- [x] `gate:projection-sanity` (WP-07B) **PASS**
- [x] `gate:ptm` (Map v0.7) **PASS**
- [x] `gate:ssot-consistency` **PASS**

## Authorization

- **Sealed By**: Release Manager (v0.7 Elevation)
- **Verified By**: MPGC Governance Delegate (v0.7 Provability Verified)
