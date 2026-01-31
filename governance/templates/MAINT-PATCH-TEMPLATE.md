# MAINTENANCE-PATCH-TEMPLATE: v1.0 Series [v0.17.x]

**Patch ID**: `VLAB-MAINT-YYYYMMDD-<shortslug>`
**Target Milestone**: v0.17.[X]
**Date**: 2026-[MM]-[DD]
**Custodian**: [Name/ID]

## 1. Patch Scope Check
Select the authorized maintenance category:
- [ ] **Security Patch**: Critical vulnerability fix in dependencies.
- [ ] **Documentation Hygiene**: Typo fix or non-semantic clarification.
- [ ] **Infra Stability**: Non-executing environment or CI runner adjustment.

> [!IMPORTANT]
> **Maintenance Purity Rules (Freeze-17F)**:
> 1. **External Amendment ONLY**: No changes to SSOT宣称; only non-normative `docs/` projections permitted.
> 2. **Enforced Gate Compliance**: Must pass both `VLAB-GATE-FREEZE` and `EOL Purity`.
> 3. **Prohibition of Formatting**: No "cosmetic" reformatting of frozen assets (line endings, sort order).
> 4. **New Release Protocols**: Any non-patch change requires a new manifest/seal chain (v1.0.x/v1.1.x).

## 2. Mandatory Denylist Verification
Confirm zero impact on restricted assets (MUST be all checked):
- [ ] **NO** changes to ruleset logic (`lib/rulesets/**`).
- [ ] **NO** changes to curated runs or yardstick matrix.
- [ ] **NO** changes to IA structure, `navigation_audit.md`, or deep-link mapping.
- [ ] **NO** changes to public deep-link paths in `/runs`, `/rulesets`, or `/policies`.
- [ ] **NO** introduction of "certified / ranking / endorsement" terminology.

## 3. Machine-Verifiable Proof
### 3. Purity Re-Verification
- [ ] **Freeze Gate Status**: PASS (`npx tsx scripts/gates/gate-v0.17.0-freeze.ts`)
- [ ] **EOL Purity Check**: PASS (No CRLF detected in `governance/` or `public/_meta/`)
- [ ] **Hash Reconciliation**: Manifest updated with new patch-level SEAL (if applicable)

## 4. Institutional Anchoring
- **Verification Hash Scope**: (Freeze gate report + patch diff summary + updated manifest sha256).
- [ ] **New Patch-Level SEAL issued** (`SEAL-v0.17.x.md`).
- [ ] **Reconciliation Entry updated** in `lab-manifest.json`.

---
**Institutional Verification Hash**: `sha256(triad_set)`
