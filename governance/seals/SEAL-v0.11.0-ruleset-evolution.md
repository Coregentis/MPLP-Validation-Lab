# SEAL: v0.11.0 - Ruleset Evolution & Shadow Adjudication

**Status**: SEALED
**Version**: v0.11.0
**Date**: 2026-01-25
**Scope**: Ruleset Evolution Visibility Layer, Shadow Adjudication Pipeline, and Evolution Governance Gates.

## 1. Scope Declaration
This seal covers the engineering facts and visibility layer associated with the transition from **Ruleset 1.0** to **Ruleset 1.1**. It establishes the "Shadow Adjudication" pipeline as the authoritative method for quantifying ruleset deltas without modifying the core mainline adjudication of v0.10.x.

## 2. Engineering Anchors (SSOT)
The following cryptographic anchors lock the state of the evolution visibility layer. This "Evolution Triad" ensures reproducibility and auditability of logic deltas.

| Asset | Path | SHA256 Hash |
| :--- | :--- | :--- |
| **Shadow Input Anchor** | `public/_data/ruleset-diffs/shadow-input.json` | `1b7ebf570ff773e824e2bd17e2b750541933abf4791c71b98cacc29d22f351ef` |
| **Diff Index SSOT** | `public/_meta/ruleset-diff-index.json` | `f5b79370cce37bac1dcadf0eff613f04c3e5e40473d8b4bed68c7a2b86abfa8f` |
| **Specific DiffPack (1.0->1.1)** | `public/_data/ruleset-diffs/ruleset-1.0__ruleset-1.1/diffpack.json` | `1db2703438bbc4ffe79a6a9ca8a699d7b98570dc23f213ee62d88a774a8ee114` |
| **Shadow Summary Output** | `public/_data/ruleset-diffs/ruleset-1.0__ruleset-1.1/shadow-summary.json` | `45758a1a8a57043d5b29b3677e41c9a74e4466341290473a0d4400c4b5cd709e` |
| **Diff Schema** | `governance/schemas/diffpack.schema.json` | `63aec5662764b99287ff32c39ea8855d199d176cd12ccb9f8a076aab0565f29c` |
| **Baseline Commit** | N/A | `4708f2597b83ec5510b65a443a992634f19b2520` |

## 3. Governance Gates (VLAB-GATE-EVO Suite)
The following gates must remain in a **PASS** state to maintain seal integrity:

*   **EVO-01 (Rationale Attribution)**: Ensures no vague terms in evolution rationales.
*   **EVO-02 (Schema Alignment)**: Validates `diffpack.json` against the pinned diff schema.
*   **EVO-03 (Evidence Closure)**: Verifies all `evidence_refs` point to valid runs or registered diffs.
*   **EVO-04 (Input Integrity)**: Verifies that the shadow input anchor hash matches the locked baseline.
*   **EVO-UI-01~03**: Ensures discoverability (L1/L2), SSOT binding, and boundary terminology (no "ranking/certification").

## 4. Operational Commands
To reproduce or verify this seal, the following commands are authoritative:

```bash
# Verify Evolution Engineering Facts
npm run gate:evo

# Verify Visibility Layer & Discoverability
npm run gate:evo-ui
npm run audit:nav-depth
```

## 5. Non-Certification & Non-Authoritative Statements
> [!IMPORTANT]
> **Non-Certification**: The Ruleset Evolution visibility layer is a measure of deterministic delta between logic sets. It does **not** constitute a performance ranking, endorsement, or official certification of any agentic system or framework.
> 
> **Non-Authoritative Output**: Shadow adjudication outputs (metrics and flips) are non-authoritative for compliance purposes. Only baseline-series (v0.10.x) adjudication outputs are citeable verdicts.

## 6. Audit Pack JSON Block
```json
{
  "seal_version": "0.11.0",
  "baseline_commit_sha": "4708f2597b83ec5510b65a443a992634f19b2520",
  "shadow_input_sha256": "1b7ebf570ff773e824e2bd17e2b750541933abf4791c71b98cacc29d22f351ef",
  "diff_index_sha256": "f5b79370cce37bac1dcadf0eff613f04c3e5e40473d8b4bed68c7a2b86abfa8f",
  "active_diffpacks": [
    {
      "id": "ruleset-1.0__ruleset-1.1",
      "diffpack_sha256": "1db2703438bbc4ffe79a6a9ca8a699d7b98570dc23f213ee62d88a774a8ee114",
      "shadow_summary_sha256": "45758a1a8a57043d5b29b3677e41c9a74e4466341290473a0d4400c4b5cd709e"
    }
  ],
  "schema_pin": {
    "path": "governance/schemas/diffpack.schema.json",
    "sha256": "63aec5662764b99287ff32c39ea8855d199d176cd12ccb9f8a076aab0565f29c"
  },
  "evolution_hub_anchor": "/rulesets/evolution",
  "gateset": [
    "EVO-01", "EVO-02", "EVO-03", "EVO-04",
    "EVO-UI-01", "EVO-UI-02", "EVO-UI-03"
  ]
}
```
