---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-008"
---

# Phase 4 Seal — Validation Lab v0.7.0 (MA-REPRO Pilot)

> **Release ID**: Validation Lab v0.7.0  
> **Release Type**: MA-REPRO Pilot (Type-B)  
> **Seal Date**: 2026-01-14  
> **Authority**: Validation Lab (Non-Normative)

---

## Overview

v0.7.0 upgrades evidence validation from **Type-A (Static)** to **Type-B (Generator-Based Reproduction)**:

| Aspect | Type-A (v0.6.x) | Type-B (v0.7.0) |
|--------|-----------------|-----------------|
| Evidence source | Submitted packs | Regenerated packs |
| Execution | None | Generator script |
| Determinism | Assumed | Run-twice verified |
| Scope | 6 substrates | 2 substrates (Pilot) |

---

## Type-B Evidence

### Substrates In Scope

| Substrate | Generator | pack_root_hash |
|-----------|-----------|----------------|
| LangChain 0.2.16 | `generate_ma_pack.py` | `e35b8cef...` |
| PydanticAI 0.0.14 | `generate_ma_pack.py` | `8cbad37e...` |

### Out of Scope (v0.7.1+)

- AutoGen, Magnetic-One, MCP, A2A

---

## Run-Twice Determinism

Each generator was executed **twice consecutively** with identical inputs:

| Substrate | Run 1 | Run 2 | Match |
|-----------|-------|-------|-------|
| LangChain | `e35b8cef684a2cfc1509097ed4b0c154027fb67e0db632fcdad3a13c6c92f534` | `e35b8cef684a2cfc1509097ed4b0c154027fb67e0db632fcdad3a13c6c92f534` | ✅ |
| PydanticAI | `8cbad37ea509e07eafeb8b856af3258bce8ec8c883f216c76902d96c5213b7fe` | `8cbad37ea509e07eafeb8b856af3258bce8ec8c883f216c76902d96c5213b7fe` | ✅ |

---

## Evaluator Verdicts

| Run | Verdict |
|-----|---------|
| LangChain Run-1 | ✅ PASS |
| LangChain Run-2 | ✅ PASS |
| PydanticAI Run-1 | ✅ PASS |
| PydanticAI Run-2 | ✅ PASS |

---

## Gate Verdicts

| Gate | Verdict | Report |
|------|---------|--------|
| MA-REPRO | ✅ PASS | gates/ma-repro-gate.report.json |

---

## What This Proves

1. **Generators produce real packs**: Evidence is not hand-crafted or copied
2. **Deterministic output**: Same inputs → same pack_root_hash
3. **Evaluator validates**: All packs pass MA-STRUCT/MA-EQUIV checks
4. **Reproducible**: Third parties can run generators and verify

## What This Does NOT Prove

- Substrate framework quality
- Certification or endorsement
- Coverage of all 6 substrates (only 2 in pilot)

---

## Non-Endorsement Boundary

> **MPLP does not endorse, certify, or rank any agent framework.**  
> Type-B classification indicates **evidence reproducibility**, not framework capability.

---

## Seal Attestation

- **Sealed By**: Antigravity Agent
- **Seal Date**: 2026-01-14T10:00:00+08:00
- **manifest_sha256**: `a7d76b17e5ae33483c49d0a4e4c2b06e0ac612118ca1e0a41f96e149f964e9d2`
- **content_sha256** (lines 1-75): `55a1210a4f59264f46136cdeffeaeca977dfe4f6313b907ad24ef1b88864a918`
