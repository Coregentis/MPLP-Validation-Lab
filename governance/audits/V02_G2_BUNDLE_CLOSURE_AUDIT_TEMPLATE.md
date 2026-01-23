---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-017"
---

# V02-G2 Bundle Closure Audit — Template

**Audit ID**: VLAB-AUD-V02G2-01  
**Status**: Draft (generated per release candidate)  
**Authority**: MPGC / Validation Lab Governance  
**Applies To**: v0.2 Release Gate V02-G2  
**Contract**: [ADJUDICATION_BUNDLE_MIN_CONTRACT.md](../contracts/ADJUDICATION_BUNDLE_MIN_CONTRACT.md)  
**Generated At**: `<ISO-8601>`  
**Source**: `allowlist.yaml` + `data/runs/*`

---

## 0. Pass/Fail Rule

V02-G2 PASS iff:  
For every `run_id` in `allowlist.yaml`, bundle contains **B1–B4**, and for any non-PASS verdict, `reason_code` is present in `bundle.manifest.json`.

---

## 1. Summary

| Metric | Value |
|:---|:---|
| allowlist total runs | `<N>` |
| complete bundles (B1–B4) | `<N>` |
| incomplete bundles | `<N>` |
| runs removed from allowlist due to incompleteness | `<N>` |
| V02-G2 result | **PASS / FAIL** |

---

## 2. Audit Table (run_id × bundle items × reason_code)

**Legend**: ✅ present / ❌ missing / ⚠️ invalid

| run_id | substrate | claim_level | verdict_topline | B1 verdict.json | B2 bundle.manifest.json | B3 sha256sums.txt | B4 evidence_pointers.json | reason_code_required | reason_code_present | notes |
|:---|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| `<run_id>` | mcp/a2a/langchain/... | Declared/Reproduced | PASS/FAIL/NOT_ADMISSIBLE | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | YES/NO | ✅/❌ | `<short note>` |

---

## 3. Incompleteness Register (must be empty for PASS)

| run_id | missing/invalid artifacts | action required | owner | due |
|:---|:---|:---|:---|:---|
| `<run_id>` | B2 invalid (missing protocol_pin) | fix bundle.manifest.json | `<name>` | `<date>` |

---

## 4. Allowlist Removals (if any)

| removed_run_id | reason | replacement/run plan |
|:---|:---|:---|
| `<run_id>` | V02-G2 incompleteness | restore after bundle completion |

---

## 5. Evidence

| Property | Value |
|:---|:---|
| allowlist snapshot | `<path>` @ commit `<sha>` |
| audit table generation method | `<script name or manual procedure>` |
| reference contract | `governance/contracts/ADJUDICATION_BUNDLE_MIN_CONTRACT.md` |

---

## 6. Result

**V02-G2**: PASS / FAIL  
**Signed-off**: `<name/role>`  
**Date**: `<ISO-8601>`

---

**Document Status**: Template  
**Version**: 1.0.0  
**Governed By**: MPGC / Validation Lab
