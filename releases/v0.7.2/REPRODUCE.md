---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-007"
---

# How to Reproduce v0.7.2 Evidence

> **Release**: Validation Lab v0.7.2 (Full 6-Substrate Type-B)  
> **Reproducibility Regime**: Generator-Based Reproduction

---

## Prerequisites

| Component | Required Version |
|-----------|------------------|
| Python | 3.9+ |
| Node.js | 18+ |
| pnpm | 8+ (or npm 9+) |
| OS | macOS / Linux |

---

## One-Command Reproduction

```bash
# Clone and setup
git clone https://github.com/Coregentis/mplp_prerelease.git
cd mplp_prerelease
git checkout validation-lab/v0.7.2

# Run all 6 generators twice each
./scripts/repro/run-ma-repro-full.sh
```

Or run each substrate individually:

```bash
# LangChain
python3 tests/cross-substrate/gf-01/langchain/generate_ma_pack.py --out /tmp/lc1
python3 tests/cross-substrate/gf-01/langchain/generate_ma_pack.py --out /tmp/lc2

# AutoGen
python3 tests/cross-substrate/gf-01/autogen/generate_ma_pack.py --out /tmp/ag1
python3 tests/cross-substrate/gf-01/autogen/generate_ma_pack.py --out /tmp/ag2

# Magnetic-One
python3 tests/cross-substrate/gf-01/magnetic-one/generate_ma_pack.py --out /tmp/m11
python3 tests/cross-substrate/gf-01/magnetic-one/generate_ma_pack.py --out /tmp/m12

# PydanticAI
python3 tests/cross-substrate/gf-01/pydanticai/generate_ma_pack.py --out /tmp/pa1
python3 tests/cross-substrate/gf-01/pydanticai/generate_ma_pack.py --out /tmp/pa2

# MCP
node tests/cross-substrate/gf-01/mcp/generate_ma_pack.mjs --out /tmp/mcp1
node tests/cross-substrate/gf-01/mcp/generate_ma_pack.mjs --out /tmp/mcp2

# A2A
python3 tests/cross-substrate/gf-01/a2a/generate_ma_pack.py --out /tmp/a2a1
python3 tests/cross-substrate/gf-01/a2a/generate_ma_pack.py --out /tmp/a2a2
```

---

## Expected Outputs

Each generator produces a `pack_root_hash.txt`. Run-twice should produce identical hashes:

| Substrate | Expected pack_root_hash |
|-----------|-------------------------|
| LangChain | `e35b8cef684a2cfc1509097ed4b0c154027fb67e0db632fcdad3a13c6c92f534` |
| AutoGen | `2af6a0481930f8cd86ec1cebca0b449e2535f1120439463e154002c19e7a67e7` |
| Magnetic-One | `15787a8b5a456656d6d9ec758fd51a5337a2418985d74260d05f0a6487407fc7` |
| PydanticAI | `8cbad37ea509e07eafeb8b856af3258bce8ec8c883f216c76902d96c5213b7fe` |
| MCP | `b5237c83e51026e058964c6e9b58fe6f2664c63616f4e35b353ef58ba04ddb03` |
| A2A | `6728e24aa07bdf9610a4a62d6c6c2fa261e8718e946896addf88940c6a6d45c1` |

---

## Verification with Evaluator

```bash
# Validate pack structure & invariants
node scripts/evaluator/pack-evaluator.mjs /tmp/lc1
# Expected: verdict: PASS
```

---

## Gate Report Location

```
Validation_Lab/releases/v0.7.2/gates/ma-repro-gate.report.json
```

---

## Canonicalization Rules

Determinism is achieved via:

1. **Fixed timestamp**: All artifacts use `2026-01-14T00:00:00Z`
2. **Seeded UUIDs**: `uuid5(NAMESPACE, name)` for reproducible IDs
3. **Sorted JSON**: All objects written with `sort_keys=True`
4. **No absolute paths**: Pack content is path-agnostic

> **Note**: Type-B determinism applies under declared generator + lock + env conditions.  
> It does not claim runtime determinism in distributed production environments.
