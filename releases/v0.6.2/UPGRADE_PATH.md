# Upgrade Path: Type-A → Type-B (Generator-Based Reproduction)

> **Authority**: Validation Lab (Non-Normative)  
> **Current Release**: v0.6.2 (Type-A: Static Evidence Validation)  
> **Target Release**: v0.7.0+ (Type-B: Generator-Based Reproduction)

---

## Overview

v0.6.x validates **submitted evidence packs** under MA-STRUCT/MA-EQUIV.  
It does **not** re-run substrate SDKs to regenerate packs.

To achieve **Type-B (Reproduced-by-Execution)**, each substrate requires:
1. A deterministic generator script
2. Locked dependency versions
3. Environment fingerprint capture
4. Run-twice determinism validation

---

## MA-REPRO Gate Prerequisites

| Prerequisite | Description | Status |
|--------------|-------------|--------|
| Generator script | Produces evidence pack from SDK invocation | ⏳ Required |
| deps.lock | Exact dependency versions | ⏳ Required |
| env.json | Runtime environment fingerprint | ⏳ Required |
| Run-twice hash match | pack_root_hash identical across 2 runs | ⏳ Required |
| Verifier record | Third-party reproduction (optional) | Optional |

---

## Generator Path Planning (6 Substrates)

| Substrate | Generator Path (Planned) | Priority |
|-----------|--------------------------|----------|
| langchain | `tests/cross-substrate/gf-01/langchain/generate_ma_pack.py` | P1 (Existing baseline) |
| pydanticai | `tests/cross-substrate/gf-01/pydanticai/generate_ma_pack.py` | P1 (Lightweight) |
| autogen | `tests/cross-substrate/gf-01/autogen/generate_ma_pack.py` | P2 |
| magnetic-one | `tests/cross-substrate/gf-01/magnetic-one/generate_ma_pack.py` | P2 |
| mcp | `tests/cross-substrate/gf-01/mcp/generate_ma_pack.mjs` | P3 (Protocol) |
| a2a | `tests/cross-substrate/gf-01/a2a/generate_ma_pack.py` | P3 (Protocol) |

---

## MA-REPRO Gate Fail-Fast Conditions

| Condition | Result |
|-----------|--------|
| Generator script not executable | FAIL |
| Missing deps.lock | FAIL |
| pack_root_hash mismatch (run-twice) | FAIL |
| Evaluator verdict != PASS | FAIL |

---

## Rollout Strategy

### Phase 1: Two-Substrate Pilot (v0.7.0)
- LangChain + PydanticAI
- Validate MA-REPRO gate logic

### Phase 2: Strong Differentiators (v0.7.1)
- AutoGen + Magnetic-One
- "Three-point plane" achieved

### Phase 3: Protocol Substrates (v0.7.2+)
- MCP + A2A
- Full 6-substrate Type-B coverage

---

## Downgrade Policy

If any substrate cannot achieve deterministic reproduction:
1. Mark `execution_mode: "declared_static_evidence"` in MANIFEST
2. Exclude from MA-REPRO gate scope
3. Document reason in per-run notes

This is not failure; it is **honest labeling of evidence strength**.
