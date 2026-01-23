---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-016"
---

# MPLP Validation Lab

**Evidence-based verdicts for MPLP lifecycle guarantees (Golden Flows), under a versioned deterministic ruleset.**

---

## Upstream Truth Source

This repository is a **governed projection** of the MPLP Protocol.
All schemas, invariants, and rulesets are derived from:

| Property | Value |
|:---|:---|
| **Upstream Repo** | [Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) |
| **Pinned Commit** | See `UPSTREAM_BASELINE.yaml` |
| **Protocol Version** | MPLP v1.0.0 (Frozen) |

> [!WARNING]
> **Validation Lab does NOT define protocol semantics.**
> It evaluates evidence against versioned rulesets derived from the upstream truth source.

---

## Four Boundaries (Non-Negotiable)

| Boundary | Description |
|:---|:---|
| **Non-certification / Non-endorsement** | No badges, rankings, or official compliance marks |
| **Non-normative** | Lab does not define protocol semantics; it evaluates evidence only |
| **No execution hosting** | Lab does not run your code; you provide evidence packs |
| **Deterministic ruleset** | Same evidence + same ruleset = same verdict |

---

## Version Taxonomy

This repository uses **four distinct version types**. Do not confuse them:

| Type | Prefix | Current | Description |
|:---|:---|:---|:---|
| **Site Freeze** | `site-v*` | `site-v0.5` | Website information architecture and public commitment |
| **Evidence Pack Format** | `pack-v*` | `pack-v0.2~v0.4` | Evidence pack structure and field requirements |
| **Ruleset** | `ruleset-*` | `ruleset-1.0~1.2` | Adjudication decision rules and requirements |
| **Release Seal** | `rel-lab-*` | `rel-lab-0.5` | Versioned governance seal for a frozen release |

> [!NOTE]
> When you see `v0.x` in this repository:
> - In `/runs` page sections → refers to **pack format** (pack-v0.2, pack-v0.3, pack-v0.4)
> - In Footer/Home → refers to **site freeze** (site-v0.5)
> - In `data/rulesets/` → refers to **ruleset version** (ruleset-1.0, 1.1, 1.2)

---

## Projection Authority

Website pages are **projections** of Single Sources of Truth (SSOT). Governance documents MUST NOT embed live registry tables.

| SSOT File | Authority |
|:---|:---|
| `data/curated-runs/substrate-index.yaml` | Substrate registry |
| `export/curated-runs.json` | Consumer export contract |
| `governance/LIFECYCLE_GUARANTEES.yaml` | LG-01~05 definitions |
| `data/rulesets/*/manifest.yaml` | Ruleset definitions |
| `governance/releases/release-index.yaml` | Release seals |

> [!IMPORTANT]
> Pages load from SSOT at build time. If a page's data differs from SSOT, the page is wrong.

---

## What This Lab Provides

- ✅ Evidence-based evaluation tools
- ✅ Self-assessment frameworks
- ✅ Golden Flow (GF-01~05) verdict generation
- ✅ Schema validation utilities
- ✅ Reproducible, auditable verdicts

## What This Lab Does NOT Provide

- ❌ Official certification or compliance marks
- ❌ Badges, seals, or rankings
- ❌ Execution hosting or runtime environments
- ❌ Implementation advice or adaptor recommendations
- ❌ Regulatory or legal guarantees

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run governance gates
npm run gates

# Generate sample run
npx tsx scripts/generate-sample-run.ts ./fixtures/packs/minimal-pass my-run

# Build for production
npm run build
```

---

## Routes

| Route | Description |
|:---|:---|
| `/` | Home |
| `/runs` | Runs Index |
| `/runs/[run_id]` | Run Detail (Overview, Guarantees, Export, Execution) |
| `/rulesets` | Rulesets Index |
| `/rulesets/[version]` | Ruleset Detail |
| `/guarantees` | Golden Flows Overview (non-normative) |

---

## Directory Structure

```
Validation_Lab/
├── UPSTREAM_BASELINE.yaml    # Upstream truth source pin
├── governance/               # Governance documents
│   ├── TERMINOLOGY_MAPPING.md
│   ├── contracts/            # Data contracts
│   └── gates/                # CI gate definitions
├── lib/                      # Core logic
│   ├── engine/               # Ingest/Verify/Evaluate
│   ├── gates/                # GATE-04/05/06
│   ├── evaluate/             # Phase D Evaluation
│   ├── runs/                 # Run loader
│   ├── rulesets/             # Ruleset loader
│   ├── policy/               # Curation policy
│   ├── schemas/              # Synced from upstream
│   ├── invariants/           # Synced from upstream
│   └── verdict/              # Types and taxonomy
├── data/
│   ├── rulesets/             # Versioned rulesets
│   ├── runs/                 # Sample runs (engine output)
│   └── policy/               # Governance policies
├── app/                      # Next.js App Router
├── components/               # UI components
└── scripts/                  # Utilities
```

---

## Governance

This project is governed by **VLAB-DGB-01** (Validation Lab Development Governance Baseline).

### Gates

| Gate | Name | Purpose |
|:---|:---|:---|
| GATE-02 | Admission | Integrity-first enforcement |
| GATE-03 | Determinism | Same input = same verdict |
| GATE-04 | Language Lint | Non-endorsement language |
| GATE-05 | No Exec Hosting | No execution hosting phrases |
| GATE-06 | Robots Policy | Run detail noindex by default |

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company** (Coregentis AI)

See [LICENSE](./LICENSE) for full text and upstream attribution.

---

## Related Resources

- **MPLP Protocol**: [https://www.mplp.io](https://www.mplp.io)
- **Documentation**: [https://docs.mplp.io](https://docs.mplp.io)
- **Validation Lab Repo**: [https://github.com/Coregentis/MPLP-Validation-Lab](https://github.com/Coregentis/MPLP-Validation-Lab)
- **Protocol Source Repo**: [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol)
