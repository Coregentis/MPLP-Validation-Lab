---
doc_type: governance
normativity: non-normative
authority: Validation Lab
status: active
version: "0.1"
---

# REPO_SHAPE — Validation Lab Directory Constitution

**Authority**: Validation Lab (Non-Normative)  
**Effective Date**: 2026-01-14  
**Version**: 0.1

> [!IMPORTANT]
> This document defines the structural invariants, mutability policies, and change governance for the Validation Lab repository. All structural changes MUST comply with this constitution.

---

## 1. Foundational Boundaries

### 1.1 Non-Normative Authority
Validation Lab is a **non-normative** adjudication system. It does NOT:
- Define MPLP protocol semantics (that is upstream `MPLP-Protocol`)
- Provide certification, endorsement, ranking, or badges
- Host execution or runtime environments
- Make claims about framework capability or quality

### 1.2 Upstream Truth Source
All schemas and invariants are derived from upstream:
- **Upstream Repo**: `Coregentis/MPLP-Protocol`
- **Pin**: `UPSTREAM_BASELINE.yaml` (commit SHA required)
- **Sync**: `scripts/sync-schemas.ts`, `scripts/sync-invariants.ts`

---

## 2. Directory Classification

### 2.1 Legend
| Mutability | Meaning |
|:---|:---|
| **IMMUTABLE** | Content frozen; path and structure must not change |
| **VERSIONED** | Changes require version bump and changelog |
| **MUTABLE** | Changes allowed under normal PR governance |
| **DEV-ONLY** | Development artifacts; not part of release surface |

### 2.2 Classification Table

| Directory | Purpose | Mutability | Owner | Change Policy |
|:---|:---|:---|:---|:---|
| `releases/` | Frozen evidence snapshots (v0.1–v0.7.3) | **IMMUTABLE** | Governance | ❌ No changes allowed |
| `adjudication/` | Adjudication model (S1/S2/S3, E-A/E-B/E-S) | VERSIONED | Governance | Requires governance review |
| `inventory/` | Repo structure & asset SSOT | VERSIONED | Governance | Requires REPO_SHAPE compliance |
| `governance/` | Policies, contracts, gate definitions | VERSIONED | Governance | Requires governance review |
| `data/rulesets/` | Versioned rulesets | VERSIONED | Governance | New versions only; no in-place edits |
| `data/curated-runs/` | Curated runs SSOT (allowlist) | VERSIONED | Governance | Requires governance review |
| `lib/` | Core engine & executable gates | MUTABLE | Engineering | Standard PR review |
| `packages/` | NPM packages (recompute) | VERSIONED | Engineering | Requires version bump |
| `scripts/` | Utility scripts | MUTABLE | Engineering | Standard PR review |
| `app/` | Next.js UI (projection layer) | MUTABLE | Engineering | Standard PR review |
| `components/` | UI components | MUTABLE | Engineering | Standard PR review |
| `fixtures/` | Test fixtures | MUTABLE | Engineering | Standard PR review |
| `artifacts/` | Development history & seals | DEV-ONLY | Engineering | Not part of release surface |
| `public/` | Static assets | MUTABLE | Engineering | Standard PR review |
| `docs/` | Internal documentation | MUTABLE | Engineering | Standard PR review |
| `examples/` | Example code | MUTABLE | Engineering | Standard PR review |

---

## 3. Immutable Zones

### 3.1 `releases/` — Frozen Evidence Snapshots

> [!CAUTION]
> The `releases/` directory is IMMUTABLE. No files may be added, modified, moved, or deleted.

**Rationale**:
- Evidence snapshots are the basis for reproducibility claims (E-B)
- Cryptographic seals (E-S) bind to exact paths and hashes
- External systems may reference specific paths

**What is allowed**:
- Nothing. New evidence must go into a new version directory.

**What is forbidden**:
- Moving, renaming, or reorganizing existing release directories
- Modifying any file content (including typo fixes)
- Deleting any file or directory
- Adding new files to existing version directories

### 3.2 `data/curated-runs/allowlist.yaml` — Curated Runs SSOT

This file is the single source of truth for curated runs. Changes require:
- Governance review
- Changelog entry
- Gate-08 (curated-immutability) must pass

---

## 4. Two-Layer Architecture

### 4.1 Layer 1: Development Artifacts (`artifacts/`)
- Planning documents, runbooks, seals, logs
- Tracks development history and decisions
- NOT part of external release surface
- May be reorganized without external impact

### 4.2 Layer 2: Frozen Evidence (`releases/`)
- Immutable evidence snapshots
- External reference surface
- MUST NOT be reorganized
- New evidence → new version directory only

---

## 5. Cross-Repo Dependency Policy

### 5.1 Current State
26+ hard-coded path references exist from main repo (`scripts/gates/`) to `Validation_Lab/`.
See: `inventory/CROSS_REPO_DEPS.md`

### 5.2 Governance Rules

1. **Registration Required**: All cross-repo dependencies MUST be registered in `CROSS_REPO_DEPS.md`
2. **No Undocumented Additions**: New hard-coded paths require governance review
3. **Version Pinning**: References to `releases/` SHOULD specify exact version paths
4. **SSOT Reads Preferred**: Prefer reading `allowlist.yaml` over scanning directories

### 5.3 Future Roadmap (Non-Binding)
- Phase 3: Introduce `deps.manifest.json` for machine-readable dependency tracking
- Phase 4: Replace hard-coded paths with manifest-pointer mechanism

---

## 6. Forbidden Moves

> [!WARNING]
> The following structural changes are PROHIBITED without governance exception.

| Forbidden Action | Rationale |
|:---|:---|
| Move/rename anything in `releases/` | Breaks external references and seals |
| Delete `UPSTREAM_BASELINE.yaml` | Breaks upstream truth source pin |
| Move generators/pack-evaluator INTO Validation_Lab | Maintains separation of concerns |
| Add certification/badge/ranking language anywhere | Violates non-endorsement boundary |
| Hard-code new cross-repo paths without registration | Violates dependency governance |

---

## 7. Change Governance

### 7.1 Standard Changes (MUTABLE directories)
- Normal PR review process
- No governance sign-off required

### 7.2 Versioned Changes (VERSIONED directories)
- Requires version bump where applicable
- Changelog entry required
- May require governance review for policy directories

### 7.3 Constitutional Changes (This Document)
- Requires governance review
- Must update version number
- Changes to IMMUTABLE classifications require exceptional justification

---

## 8. Related Documents

| Document | Purpose |
|:---|:---|
| `inventory/ASSET_INVENTORY.json` | Machine-readable asset registry |
| `inventory/ASSET_CATALOG.md` | Human-readable asset catalog |
| `inventory/CROSS_REPO_DEPS.md` | Cross-repo dependency tracking |
| `adjudication/README.md` | Adjudication model overview |
| `adjudication/matrix/coverage.gf-01.yaml` | Coverage matrix (machine-readable) |
| `UPSTREAM_BASELINE.yaml` | Upstream truth source pin |

---

**Document Version**: 0.1  
**Last Updated**: 2026-01-14
