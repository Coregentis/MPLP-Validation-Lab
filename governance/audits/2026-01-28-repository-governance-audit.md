# Validation Lab V2 - Repository Governance Audit

**Date:** 2026-01-28
**Scope:** Root directory and all primary subdirectories (`governance`, `app`, `schemas`, `releases`, etc.).

## 1. Executive Summary
The repository is in a transition phase from "Research/Experimental" to "Production/Release". While the core architecture (SSOT-driven, Gate-guarded) is robust, the directory structure reflects historical evolution, resulting in "Split Brain" governance and root-level clutter.

## 2. Critical Governance Risks ("Split Brain")
### 2.1 Release Management (High Priority)
- **Problem**: Release artifacts are split between `governance/release/` (Legacy/Planning) and `releases/` (New Artifacts).
- **Risk**: Confusion about where the "Source of Truth" for a release lies. `governance/release` contains mixture of planning docs and raw JSONs, while `releases/` contains sealed bundles.
- **Recommendation**:
    - **Consolidate** all formal release artifacts into `releases/`.
    - **Archive** legacy planning docs from `governance/release/` to `releases/archive/` or delete.
    - **Enforce** `releases/` as the only write-target for PR-10.

### 2.2 Ruleset Definition (Medium Priority)
- **Problem**:
    - `rulesets/*.json`: The actual technical ruleset files used by code.
    - `governance/ruleset-evolution/`: Documentation or policy about rulesets.
    - `schemas/`: Defines the structure of rulesets.
- **Risk**: Separation of "Policy" (`governance`) and "Implementation" (`rulesets` root) can lead to desync.
- **Recommendation**: Verify that `rulesets/*.json` are generated or strictly validated against `governance` policies. If they are manual, consider moving them to `governance/rulesets/` to affirm they are Policy, OR keep them at root but strictly gate them.

## 3. Hygiene Issues ("Ghost Files")
The repository root contains significant debris from previous runs/debugs:
- **Log Files**: `gate_output*.txt` (Multiple versions), `gate_report.txt`, `.server.log`.
- **Stray Manifests**: `det-001-manifest.json`, `det-002-manifest.json`.
- **Risk**: Clutters the workspace and risks being committed (if not ignored), polluting the release.
- **Recommendation**:
    - **Delete** all `*.txt` and `*.json` files in root (except `package.json`, `tsconfig.json`).
    - **Update `.gitignore`** to ensure these don't creep back in.

## 4. Architectural Oddities
### 4.1 Orphaned Modules
- **`canonicalization/`**: This directory sits at root but represents a library/utility logic. In a standard repo, this might belong in `lib/` or `packages/`.
- **`producers/` & `runners/`**: These are functional code blocks sitting at root. Valid for a "Lab" context but inconsistent with `app/`.

### 4.2 Data & Evidence
- **Structure**: `data/runs` appears to be the monolithic store for evidence. This is **Good**. It separates Content from Code (`app`).
- **Policy**: `governance` seems to police `data`. This separation of powers is healthy.

## 5. Remediation Plan (Immediate Actions)

1.  **Release Consolidation (PR-10 Clean)**:
    - Move `governance/release/*` -> `releases/archive/`.
    - Delete `governance/release/`.

2.  **Root Cleanup**:
    - `rm *.txt *.log det-*-manifest.json`

3.  **Governance Unification**:
    - Clarify that `governance/` is for **Human Policy** (Markdown/YAML).
    - `schemas/` is for **Machine Contracts** (JSON Schema).
    - `rulesets/` is **Configuration** (JSON).

## 6. Conclusion
The "Split Brain" in `releases` is the most urgent blocker for a clean PR-10. The rest are hygiene or architectural preference issues that can be handled as part of the Final Seal hardening.
