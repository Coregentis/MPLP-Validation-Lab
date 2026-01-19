---
doc_type: reference
normativity: non-normative
authority: Validation Lab
status: active
---

# Asset Catalog — Validation Lab

**Authority**: Validation Lab (Non-Normative)  
**Last Updated**: 2026-01-14

> This is a human-readable projection of `ASSET_INVENTORY.json`. For machine-readable data, see that file.

---

## 1. Frozen Evidence (Releases)

| Asset | Version | Scope | Strength | Key Anchors |
|:---|:---|:---|:---|:---|
| Initial Release | v0.1 | S1 | E-A | `releases/v0.1/` |
| P2 Signed Proof | v0.5 | S1 | E-A, E-S | `releases/v0.5/artifacts/signed-proof/` |
| Type-A Multi-Substrate | v0.6 | S1, S2 | E-A | `releases/v0.6/artifacts/packs/` |
| Type-B Full Repro | v0.7.2 | S1, S2 | E-B | `releases/v0.7.2/REPRODUCE.md` |
| SIGN-02 Seal | v0.7.3 | S1, S2 | E-S | `releases/v0.7.3/artifacts/signed-proof/SIGN-02/` |

---

## 2. Rulesets & Governance

| Asset | Mutability | Key Anchors |
|:---|:---|:---|
| Ruleset 1.0 | Versioned | `data/rulesets/ruleset-1.0/` |
| Curated Runs SSOT | Versioned | `data/curated-runs/allowlist.yaml` |
| Adjudication Model | Versioned | `adjudication/`, `adjudication/matrix/coverage.gf-01.yaml` |
| Governance Contracts | Versioned | `governance/contracts/` |
| Gate Definitions | Versioned | `governance/gates/VLAB-GATE-*.md` |

---

## 3. Core Logic Layer (`lib/`)

> **Critical Asset**: 13 modules forming the complete evidence evaluation pipeline

| Module | Purpose | Key Files |
|:---|:---|:---|
| `engine/` | Core verification engine | `verify.ts` (1249 LOC), `ingest.ts`, `types.ts` |
| `evaluate/` | Phase D evaluation logic | 2 files |
| `verdict/` | Verdict types & taxonomy | 4 files |
| `gates/` | 9 executable runtime gates | `gate-02..10-*.ts` |
| `curated/` | Curation & allowlist filtering | 3 files |
| `runs/` | Run loader & management | 4 files |
| `rulesets/` | Ruleset loader | 1 file |
| `proof/` | Proof generation/verification | 2 files |
| `policy/` | Policy enforcement | 1 file |
| `schemas/` | 67 upstream-synced schema files | See ASSET-SYNCED-SCHEMAS |
| `invariants/` | Upstream-synced invariants | See ASSET-SYNCED-INVARIANTS |
| `security/` | Security & admission controls | 1 file |
| `utils/` | Shared utilities | 1 file |

**Implements**: `evidence-pack-contract-v1.0`, `admission-criteria-v1.0`, `ruleset-contract-v1.0`

---

## 4. Standalone Packages

| Asset | Purpose | Key Anchors |
|:---|:---|:---|
| Recompute Package | Third-party reproduction | `packages/recompute/` |

---

## 5. UI Projection

| Asset | Purpose | Key Anchors |
|:---|:---|:---|
| Next.js App | Runs/Rulesets/Guarantees UI | `app/`, `components/` |

---

## 6. Scope × Strength Matrix

|  | E-A | E-B | E-S |
|:---|:---|:---|:---|
| **S1** | v0.1, v0.5, v0.6 | v0.7.2 | v0.5, v0.7.3 |
| **S2** | v0.6 | v0.7.2 | v0.7.3 |
| **S3** | ❌ Not Implemented | ❌ Not Implemented | ❌ Not Implemented |

---

**See Also**: `ASSET_INVENTORY.json`, `REPO_SHAPE.md`, `CROSS_REPO_DEPS.md`
