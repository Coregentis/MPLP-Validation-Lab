---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-023"
---


# Cross-Repo Dependencies — Validation Lab

**Authority**: Validation Lab (Non-Normative)  
**Last Updated**: 2026-01-14  
**Version**: 0.1

> [!IMPORTANT]
> This document is the SSOT for all cross-repository dependencies between the main MPLP repo and Validation_Lab. All dependencies MUST be registered here before introduction.

---

## 1. Summary

| Metric | Value |
|:---|:---|
| **Total Dependencies** | 26+ |
| **Risk Level** | 🟡 Medium (hard-coded paths) |
| **Primary Consumer** | Main repo `scripts/gates/` |
| **Policy** | Register-before-add; version-pin preferred |

---

## 2. Dependency Classification

| Class | Description | Risk | Count |
|:---|:---|:---|:---|
| **D1** | SSOT Reads | 🟢 Low | 6 |
| **D2** | Immutable Snapshot Reads | 🟡 Medium | 18 |
| **D3** | Code-Path Coupling | 🔴 High | 2 |

---

## 3. Dependency Registry

### 3.1 Class D1 — SSOT Reads (Low Risk)

These dependencies read from versioned SSOT files. Changes to target files require governance review.

| Source File | Target Path | Purpose | Risk |
|:---|:---|:---|:---|
| `scripts/gates/pjt-01-proximity.mjs` | `Validation_Lab/data/curated-runs/allowlist.yaml` | Read curated runs allowlist | 🟢 |
| `scripts/gates/pjt-02-extension.mjs` | `Validation_Lab/data/curated-runs/allowlist.yaml` | Read curated runs allowlist | 🟢 |
| `scripts/gates/pjt-03-stats.mjs` | `Validation_Lab/data/curated-runs/allowlist.yaml` | Read curated runs allowlist | 🟢 |
| `scripts/gates/pjt-04-premanifest.mjs` | `Validation_Lab/data/curated-runs/allowlist.yaml` | Read curated runs allowlist | 🟢 |
| `scripts/gates/official-substrate-gate.mjs` | `Validation_Lab/data/curated-runs/allowlist.yaml` | Read curated runs allowlist | 🟢 |
| `scripts/census/scan-rulesets.mjs` | `Validation_Lab/data/rulesets/` | Scan rulesets directory | 🟢 |

**Remediation**: These are acceptable as long as target files remain SSOT. Consider externalizing to `deps.manifest.json` in Phase 3.

---

### 3.2 Class D2 — Immutable Snapshot Reads (Medium Risk)

These dependencies read from frozen `releases/` directories. Path stability is critical.

| Source File | Target Path | Purpose | Risk |
|:---|:---|:---|:---|
| `scripts/gates/p0-negative-gate.mjs` | `Validation_Lab/releases/v0.3/artifacts/negative/NEG-01/` | Read negative evidence | 🟡 |
| `scripts/gates/p0-negative-gate.mjs` | `Validation_Lab/releases/v0.3/gates/` | Write gate report | 🟡 |
| `scripts/gates/p0-env-gate.mjs` | `Validation_Lab/releases/v0.3/artifacts/env/` | Read env evidence | 🟡 |
| `scripts/gates/p0-env-gate.mjs` | `Validation_Lab/releases/v0.3/gates/` | Write gate report | 🟡 |
| `scripts/gates/p0-repro-gate.mjs` | `Validation_Lab/releases/v0.3/artifacts/repro/` | Read repro evidence | 🟡 |
| `scripts/gates/p0-repro-gate.mjs` | `Validation_Lab/releases/v0.3/gates/` | Write gate report | 🟡 |
| `scripts/gates/p1-vfy-gate.mjs` | `Validation_Lab/releases/v0.4/artifacts/verifier/` | Read verifier evidence | 🟡 |
| `scripts/gates/p1-vfy-gate.mjs` | `Validation_Lab/releases/v0.4/gates/` | Write gate report | 🟡 |
| `scripts/gates/p1-snap-gate.mjs` | `Validation_Lab/releases/v0.4/artifacts/snapshots/` | Read snapshots | 🟡 |
| `scripts/gates/p1-snap-gate.mjs` | `Validation_Lab/releases/v0.4/gates/` | Write gate report | 🟡 |
| `scripts/gates/p2-sign-gate.mjs` | `Validation_Lab/releases/v0.5/artifacts/signed-proof/` | Read signed proofs | 🟡 |
| `scripts/gates/p2-sign-gate.mjs` | `Validation_Lab/releases/v0.5/gates/` | Write gate report | 🟡 |
| `scripts/gates/ma-struct-gate.mjs` | `Validation_Lab/releases/v0.6/artifacts/packs/` | Read MA packs | 🟡 |
| `scripts/gates/ma-struct-gate.mjs` | `Validation_Lab/releases/v0.6/gates/` | Write gate report | 🟡 |
| `scripts/gates/ma-equiv-gate.mjs` | `Validation_Lab/releases/v0.6/artifacts/packs/` | Read MA packs | 🟡 |
| `scripts/gates/ma-equiv-gate.mjs` | `Validation_Lab/releases/v0.6/gates/` | Write gate report | 🟡 |
| `scripts/gates/pjt-04-premanifest.mjs` | `Validation_Lab/releases/v0.2/artifacts/equivalence/gf-01.json` | Read equivalence evidence | 🟡 |
| `scripts/gates/pjt-04-premanifest.mjs` | `Validation_Lab/releases/v0.2/artifacts/evaluations/tool-call-flow.local-cli.md` | Read evaluation | 🟡 |
| `scripts/validate/governance-schemas-validate.mjs` | `Validation_Lab/releases/v0.2/artifacts/equivalence/gf-01.json` | Validate schema | 🟡 |

**Remediation**: 
1. Paths are stable (releases/ is immutable), so immediate risk is low
2. Phase 3: Introduce version-pointer mechanism to avoid hard-coded version strings
3. Consider consolidating version references to a single manifest

---

### 3.3 Class D3 — Code-Path Coupling (High Risk)

These dependencies scan code paths and may break if directory structure changes.

| Source File | Target Path | Purpose | Risk |
|:---|:---|:---|:---|
| `scripts/audit/extract-claims.mjs` | `Validation_Lab/app/` | Scan UI for claims extraction | 🔴 |
| `scripts/census/scan-rulesets.mjs` | `Validation_Lab/data/rulesets/` | Directory structure scan | 🔴 |

**Remediation**:
1. These require more careful handling as they depend on internal structure
2. Phase 3: Define stable interface contract for scanned directories
3. Consider moving to pull-based model (Lab exports, main repo consumes)

---

## 4. Governance Rules

### 4.1 Registration Requirement
All new cross-repo dependencies MUST be registered in this document BEFORE code merge.

### 4.2 Version Pinning
References to `releases/` directories SHOULD use explicit version paths (e.g., `releases/v0.7.2/`) rather than dynamic resolution.

### 4.3 SSOT Preference
When possible, prefer reading from SSOT files (`allowlist.yaml`, `rulesets/`) over scanning directory structures.

### 4.4 No Undocumented Additions
Gate checks should verify no new hard-coded paths exist without registration.

---

## 5. Remediation Roadmap (Non-Binding)

| Phase | Action | Status |
|:---|:---|:---|
| **Phase 2** | Document and classify all dependencies | ✅ This document |
| **Phase 3** | Introduce `deps.manifest.json` for machine-readable tracking | 📋 Planned |
| **Phase 3** | Add Gate to detect unregistered dependencies | 📋 Planned |
| **Phase 4** | Replace hard-coded version strings with manifest pointers | 📋 Planned |
| **Future** | Consider pull-based model for D3 dependencies | 📋 Backlog |

---

## 6. Related Documents

| Document | Purpose |
|:---|:---|
| `inventory/REPO_SHAPE.md` | Cross-repo dependency policy |
| `inventory/ASSET_INVENTORY.json` | Asset registry (references depend_on relationships) |
| `adjudication/matrix/coverage.gf-01.yaml` | S2 gap: implicit equivalence rules in ma-equiv-gate |

---

**Document Version**: 0.1  
**Last Updated**: 2026-01-14
