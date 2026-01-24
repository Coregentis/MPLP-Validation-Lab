# AUDIT-RECONCILIATION-2026-01-24

## 1. Executive Summary

As of 2026-01-24, the Validation Lab repository has completed its v0.9.2-seal asset reconciliation. All physical indicators now align with Governance SSOT files, and no placeholder hashes remain.

**Risk Level: LOW (v0.9.2-seal baseline established)**.

---

## 2. Key Observations

### 2.1 SSOT vs. Physical Discrepancies
*   **Official Runs Mismatch**: Several "official" runs (e.g., `gf-01-langchain-official-v0.2`) are referenced in `allowlist.yaml` but are physically located in `releases/archive/` instead of `data/runs/`.
*   **Unregistered Test Assets**: Directories like `sample-pass` and `test-gf01-only` exist in `data/runs/` but are not registered in any allowlist or runset.
*   **Hash Drift**: Multiple curated runs in `allowlist.yaml` carry placeholder hashes (`00...00`), necessitating a reconciliation to lock them to physical facts.

### 2.2 Governance Gaps
*   **Tier-0 Incompleteness**: `SUBSTRATE_SCOPE_POLICY.md` requires CrewAI as a Tier-0 framework, but it was missing from the `substrate-index.yaml` (partially mitigated in previous step).
*   **Runset Categorization**: `runsets.yaml` lacks explicit categories for internal smoke tests, leading to confusion between "curated evidence" and "technical samples".

---

## 3. Remediation Actions (v0.9.2-preflight Patch)

### 3.1 Category Hardening (Completed)
- [x] **SSOT Sync**: Updated `substrate-index.yaml` with CrewAI entry (status: `not_admitted`).
- [x] **Orphan Cleanup**: Identified and categorized rogue test directories; resolved set overlaps in `runsets.yaml`.
- [x] **Hash Locking**: All `00...00` placeholders eliminated; official v0.2 runs locked to reproduction hashes; legacy reports marked with `ff...f`.
- [x] **Path Flattening**: Canonicalized nested `pack/` structures into `data/runs/`.

### 3.2 Gate Reinforcement (Sealed)
- [x] **GATE-RUNSET-ALIGN-01**: Formally implemented in `scripts/gates/gate-runset-alignment.ts` and passed.
- [x] **Export Policy**: `scripts/generate-curated-runs.mjs` patched to prevent internal data leaks.

---

## 4. Conclusion

The repository is now being stabilized to provide a clean baseline for **v0.10.x**. All "Hard Evidence" claims must hereafter reference fixed hashes and verified paths as documented in `inventory/reconciliation-report.json`.
