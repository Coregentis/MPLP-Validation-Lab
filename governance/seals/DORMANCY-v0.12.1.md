# Dormancy Notice [v0.12.1]

**Status**: Institutional Baseline (Locked)
**Effective Date**: 2026-01-25
**Scope**: v0.12.x Sustainability Series

## 1. Institutional Purpose
The Validation Lab v0.12.1 represents the **Sustainability Stopline**. It is preserved as a stable, auditable, and reproducible reference for Multi-Agent Lifecycle Protocol (MPLP) evidence.

## 2. Institutional Reference & Audit
- **Canonical Anchor**: [SEAL-v0.12.1](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/governance/seals/SEAL-v0.12.1.md)
- **Immutable Tag**: `vlab-v0.12.1-institution`
- **Audit Routine**: `npm run heartbeat` (Verifies gates + records logic consistency)
- **Status**: **LOCKED/STATIONARY**. Behavioral expansion is strictly versioned in `v0.13.0+`.

## 3. Dormancy Rules

---
**Custodian**: v0.12 Institutional Guard
**Audit Log**: [history.json](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/governance/heartbeat/history.json)
**Upgrade Path**: Functional expansion triggers the v0.13 Extension Line.

### Heartbeat Audit Schema
Audit records in `history.json` must follow the institutional schema:
```json
{
  "timestamp": "ISO-8601",
  "baseline_tag": "vlab-v0.12.1-institution",
  "commit_sha": "git-sha",
  "seal_sha256": "sha256(SEAL-v0.12.1.md)",
  "gate_results": { "gate-id": "PASS|FAIL" },
  "drift": 0 | 1,
  "node_version": "vX.Y.Z"
}
```
