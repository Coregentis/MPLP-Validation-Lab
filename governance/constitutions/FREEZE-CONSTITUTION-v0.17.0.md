# FREEZE-CONSTITUTION-v0.17.0: Maintenance Governance

**Status**: ACTIVE (Institutional Freeze)
**Series**: v0.17 Release Freeze / Maintenance
**Authority**: Validation Lab release-line Custodian
**Date**: 2026-01-25

## 1. Goal
The v0.17 milestone marks the formal **Release Freeze** for the Validation Lab v1.0 series. The objective is to stabilize the Proof-of-Work (MUST-1/2/3) and prevent any logic or evidence drift before the final handover.

## 2. Purity Allowlist (Allowed Changes)
During the maintenance phase, ONLY the following modifications are permitted:
- **Security Patches**: Critical fixes for vulnerabilities in dependencies.
- **Documentation Hygiene**: Typo fixes, broken link repairs, and clarification of existing governance text.
- **Infrastructure Stability**: Updates to CI runners or environment variables that do not affect the execution logic.
- **Governance Seals**: Updates to SEAL documents strictly necessitated by allowed changes. Seal updates are permitted only as a consequence of an allowed patch, and MUST be accompanied by a patch-level SEAL (e.g., v0.17.1) + updated reconciliation entry.

## 3. Mandatory Denylist (Forbidden Changes)
The following modifications are strictly prohibited:
- **Ruleset Logic**: Any change to `ruleset-x.y` adjudication code or clause definitions.
- **Curated Runs**: Addition, deletion, or modification of runs in the `public/data/runs` registry.
- **Yardstick Matrix**: Modification of the `yardstick-matrix.json` verdict or triggered clauses beyond reconciliation.
- **IA/IA Structure**: Changes to the navigation tree, directory structure, or deep-link mapping.
- **Terminology Policy**: Any introduction of "certified", "ranking", or "endorsement" language.

## 4. Maintenance Process
1. **Change Request**: Any proposed change must be documented as a "Maintenance Patch".
2. **Gate Re-Validation**: Every patch must re-run the `VLAB-GATE-FREEZE` to ensure zero denylist impact.
3. **Seal Update**: If a patch is approved, a new patch-level SEAL (e.g., v0.17.1) must be issued to re-anchor the triad.

---
**Custodian**: v1.0 Maintenance Guard
**Date**: 2026-01-25
