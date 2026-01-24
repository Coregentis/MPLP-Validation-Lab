---
doc_type: governance
status: formative
authority: validation_lab_governance
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GATE-07"
---

# GATE-RUNSET-ALIGN-01 — RunSet & Asset Consistency Alignment

**Gate ID**: VLAB-GATE-07  
**Status**: ACTIVE  
**Enforced By**: CI / `scripts/gates/runset-consistency.mjs`

---

## 1. Requirement

All execution substrates and evidence runs must be consistently mapped across the repository's Single Source of Truth (SSOT) files and physical assets.

## 2. Acceptance Criteria

| Criteria | Description |
|:---|:---|
| **Path Existence** | Every `run_id` in `allowlist.yaml` MUST have a matching directory in `data/runs/`. |
| **Hash Match** | `allowlist.yaml.pack_root_hash` MUST match the computed hash of the physical pack. |
| **No Dangling Runs** | Every run in `allowlist.yaml` MUST be assigned to at least one set in `runsets.yaml`. |
| **Substrate Coverage** | All substrates with `status: admitted` MUST have at least one allowlisted run. |
| **No Placeholders** | `allowlist.yaml` MUST NOT contain `00...00` placeholder hashes for active runs. |
| **Export Closure** | `export/curated-runs.json` MUST NOT include any run from `internal_test` or `non_admissible` sets. |

## 3. Violation Policy

- **Severity**: BLOCKER
- **Action**: CI Fail; Manual remediation required via `scripts/reconcile-allowlist.mjs` or physical asset restoration.

---

**Governed By**: VLAB-DGB-01  
**Version**: 1.0.0
