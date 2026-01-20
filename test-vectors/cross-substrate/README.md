# Cross-Substrate Test Vectors

> **Asset Owner:** MPLP Validation Lab  
> **Site Version:** site-v0.5  
> **Status:** Active Evaluation Asset

---

## Purpose

This directory contains **cross-substrate test vectors** for GF-01 (Single Agent Lifecycle) adjudication. Each substrate subdirectory provides evidence packs that can be:

1. **Verified** against the Evidence Pack Contract
2. **Adjudicated** using frozen rulesets (ruleset-1.0~1.2)
3. **Compared** for cross-substrate equivalence

---

## Directory Structure

```
cross-substrate/
└── gf-01/
    ├── README.md
    ├── scenario.yaml           # GF-01 scenario definition
    ├── verify_equivalence.ts   # Equivalence verification script
    ├── a2a/                    # Agent-to-Agent substrate
    ├── autogen/                # AutoGen substrate
    ├── langchain/              # LangChain substrate
    ├── magnetic-one/           # Magnetic One substrate
    ├── mcp/                    # MCP substrate
    └── pydanticai/             # PydanticAI substrate
```

---

## Substrates Included

| Substrate | GF-01 Status | Notes |
|-----------|--------------|-------|
| **a2a** | ✅ Available | Agent-to-Agent (Google) |
| **autogen** | ⚪ Archived | Microsoft AutoGen |
| **langchain** | ✅ Available | LangChain Python |
| **magnetic-one** | ⚪ Archived | Microsoft Magnetic One |
| **mcp** | ✅ Available | Model Context Protocol |
| **pydanticai** | ⚪ Available | PydanticAI framework |

---

## How to Use

### Verify a Pack

```bash
npx tsx src/cli/vlab.ts verify test-vectors/cross-substrate/gf-01/langchain/pack/
```

### Run Equivalence Check

```bash
npx tsx test-vectors/cross-substrate/gf-01/verify_equivalence.ts
```

---

## Relationship to Other Assets

| Asset | Path | Relationship |
|-------|------|--------------|
| **Allowlist v0.5** | `test-vectors/v0.5/allowlist-v0.5.yaml` | Curated runs include some cross-substrate packs |
| **Substrate Index** | `data/curated-runs/substrate-index.yaml` | Producer × GF matrix |
| **Coverage Matrix** | `/coverage/adjudication` (website) | UI for coverage visualization |

---

## Governance

This asset is part of **Validation Lab evidence assets** and governed by:

- `governance/releases/release-index.yaml` — Release seal registry
- `governance/NAVIGATION_MAP.yaml` — Site navigation SSOT

---

**Migrated From:** `V1.0_release/tests/cross-substrate/`  
**Migration Date:** 2026-01-20  
**Reason:** Protocol boundary governance (evaluation assets belong to Lab, not Protocol)
