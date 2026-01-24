---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-021"
---

# ADJUDICATION_BUNDLE_MIN_CONTRACT — Minimum Bundle Completeness Contract

**Document ID**: VLAB-CON-ABMC-01  
**Status**: Active  
**Authority**: MPGC / Validation Lab Governance  
**Effective**: 2026-01-17  
**Applies To**: V02-G2 (Runs ↔ Adjudication Bundle 100% Closure)

---

## 0. Purpose

This contract defines the **minimum required artifacts** for an adjudication bundle to be considered "complete" under V02-G2. 

Any curated run in `allowlist.yaml` that fails to meet this contract MUST be:
- Completed (missing artifacts added), OR
- Removed from the curated allowlist until completed.

---

## 1. Minimum Bundle Artifacts (Four-piece Set)

Every curated run MUST contain the following four artifacts:

| # | Artifact | Path Pattern | Required |
|:---|:---|:---|:---|
| **B1** | `verdict.json` | `data/runs/{run_id}/verdict.json` | ✅ HARD |
| **B2** | `bundle.manifest.json` | `data/runs/{run_id}/bundle.manifest.json` | ✅ HARD |
| **B3** | `sha256sums.txt` | `data/runs/{run_id}/integrity/sha256sums.txt` | ✅ HARD |
| **B4** | `evidence_pointers.json` | `data/runs/{run_id}/evidence_pointers.json` | ✅ HARD |

---

## 2. Artifact Specifications

### 2.1 B1: verdict.json

Must contain:
- `run_id` — matches the run directory name
- `admission` — `ADMISSIBLE` | `NOT_ADMISSIBLE`
- `gf_verdicts[]` — array of GF verdicts (may be empty if NOT_ADMISSIBLE)
- `versions.protocol`, `versions.schema`, `versions.ruleset` — all MUST be pinned (not `unknown`)

### 2.2 B2: bundle.manifest.json

Must contain:
- `run_id`
- `pack_root` — path to evidence pack root
- `ruleset_ref` — reference to ruleset used (e.g., `ruleset-1.0`)
- `protocol_pin` — upstream protocol version or commit
- `schema_bundle_sha256` — hash of schema bundle used
- `hash_scope` — declaration of what is included in hashing
- `reason_code` — REQUIRED for `NOT_ADMISSIBLE`, `NOT_EVALUATED`, or `FAIL` verdicts

### 2.3 B3: sha256sums.txt

Must contain:
- SHA256 hash for each file in the evidence pack
- One entry per line: `{hash}  {relative_path}`
- Must be reproducible by running `sha256sum` on pack contents

### 2.4 B4: evidence_pointers.json

Must contain:
- `pointers[]` — array of evidence pointers, each with:
  - `requirement_id` — the requirement being evidenced
  - `artifact_path` — path to artifact
  - `locator` — specific location within artifact (e.g., `event:id`, `line:N`)
  - `status` — `PRESENT` | `ABSENT` | `NOT_EVALUATED`

For runs with `NOT_ADMISSIBLE` verdict: this file MAY be empty (`{ "pointers": [] }`) but MUST exist.

---

## 3. Reason Code Requirement

For any verdict that is NOT a clean `PASS`, a `reason_code` MUST be present in `bundle.manifest.json`:

| Verdict | Reason Code Required |
|:---|:---|
| `PASS` | ❌ No |
| `FAIL` | ✅ Yes — which requirement failed |
| `NOT_EVALUATED` | ✅ Yes — why not evaluated |
| `NOT_ADMISSIBLE` | ✅ Yes — which admission gate failed |

---

## 4. Validation Gate (V02-G2)

The CI gate `V02-G2` MUST verify:

```
For each run_id in allowlist.yaml:
  ✓ B1 exists and is valid JSON
  ✓ B2 exists and is valid JSON with required fields
  ✓ B3 exists and is non-empty
  ✓ B4 exists and is valid JSON
  ✓ If verdict ≠ PASS: reason_code is present in B2
```

Gate output on failure:
- List of `run_id` with missing/invalid artifacts
- Specific artifact(s) that failed validation

---

## 5. Non-Goals

- This contract does NOT validate semantic correctness of verdicts.
- This contract does NOT validate hash reproducibility (that is V02-G3).
- This contract is structural completeness only.

---

**Document Status**: Active  
**Version**: 1.0.0  
**Governed By**: MPGC / Validation Lab
