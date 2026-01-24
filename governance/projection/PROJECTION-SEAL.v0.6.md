---
entry_surface: validation_lab
doc_type: governance
status: sealed
authority: validation_lab_governance
doc_id: "VLAB-GOV-053"
---

# Projection Seal v0.6

**Seal ID**: `PROJ-SEAL-v0.6`  
**Status**: SEALED (Three-entry Projection Closure v0.6)  
**Date**: 2026-01-23  
**Base PTM**: `ptm-0.6.yaml`

---

## Projection Alignment Summary

| Domain | Routes | Alignment | Status |
|--------|--------|-----------|--------|
| Home & Static | 3 | 100% | ✅ |
| Runs | 4 | 100% | ✅ |
| Guarantees | 1 | 100% | ✅ |
| Rulesets | 2 | 100% | ✅ |
| Adjudication | 2 | 100% | ✅ |
| Policies | 2 | 100% | ✅ |
| Builder & Coverage| 2 | 100% | ✅ |
| Examples | 2 | 100% | ✅ |

**Total Coverage**: 18/18 Routes (100%)

---

## v0.6 Integration Record

This seal confirms that v0.6 capabilities are integrated into the projection layer and enforces the Three-entry Gating requirements.

### Three-entry Gating requirements
- [x] `gate:ptm` (Lab) PASS
- [x] `gate:ssot-consistency` (Lab) PASS
- [x] `gate:coverage-claim` (Lab) PASS
- [x] `gate:website-pointer-only` (Website) PASS
- [x] `gate:docs-nonnormative-pointer-only` (Docs) PASS

---

## Repro Anchors (Commit Tracking)

| Repository | Commit SHA | Reference Tag (Optional) |
|------------|------------|-------------------------|
| **Lab** | `072feec` | `lab-v0.6.0-rc1` |
| **Website** | `d00cb8d6c` | `web-v0.6.0-rc1` |
| **Docs** | `d00cb8d6c` | `docs-v0.6.0-rc1` |

---

### Registry Snapshot (SSOT Anchors)

The following hashes represent the state of the Registry and Projection mapping files at the time of v0.6 sealing:

- **GATES.yaml**: `d9a2557e5dd59fd7d9b9dee4418ef529873bb912f7c6d3902df2344fefd109a9`
- **ROUTES.yaml**: `a819578f55dd7e5efb00a11bb5e47f8800b9ed947af9389c6c572465bbfce08c`
- **TRUTH_SOURCES.yaml**: `7dee054f1e79b78d3777b801affaa2a0ca95eee02bc6c8e0a0450b9119ab76a6`
- **ptm-0.6.yaml**: `307141de7f3064d694c855984b4d9ea3779674a3b03aa823e3b2a828b776223e`

## Authorization

- **Sealed By**: Release Manager (v0.6 Closure)
- **Verified By**: MPGC Governance Delegate (v0.6 Verified)
