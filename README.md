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
pnpm install

# Run development server
pnpm dev

# Verify upstream pin
pnpm verify:upstream-pin

# Run all gates
pnpm verify:gates
```

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
│   ├── engine/               # Ingest/Verify/Index/Evaluate
│   ├── schemas/              # Synced from upstream
│   ├── invariants/           # Synced from upstream
│   └── verdict/              # Types and taxonomy
├── data/
│   ├── rulesets/             # Versioned rulesets
│   ├── scenarios/            # Scenario catalog
│   └── curated-runs/         # Frozen reference runs
├── app/                      # Next.js pages
└── components/               # UI components
```

---

## Governance

This project is governed by **VLAB-DGB-01** (Validation Lab Development Governance Baseline).

Key gates:
- `VLAB-GATE-00`: Upstream pin verification
- `VLAB-GATE-01`: Schema alignment
- `VLAB-GATE-02`: Integrity-first enforcement
- `VLAB-GATE-03`: Deterministic verdict
- `VLAB-GATE-04`: Non-endorsement language
- `VLAB-GATE-05`: NoIndex policy

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
