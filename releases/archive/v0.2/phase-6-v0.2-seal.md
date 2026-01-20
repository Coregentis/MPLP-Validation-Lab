# Phase 6 Seal — Validation Lab v0.2

> **Release ID**: Validation Lab v0.2  
> **Seal Date**: 2026-01-13  
> **Ruleset Version**: ruleset-1.0  
> **Scenario**: gf-01-single-agent-lifecycle

---

## v0.2 Runs

| Run ID | Substrate | Claim Level | Execution | Status |
|--------|-----------|-------------|-----------|--------|
| gf-01-langchain-official-v0.2 | langchain | Reproduced | Reproduced | active |
| gf-01-a2a-official-v0.2 | a2a | Declared (Static Evidence) | Static | eligible for upgrade |
| gf-01-mcp-official-v0.2 | mcp | Reproduced | Reproduced (static-events) | active |

---

## Key Hashes

### Equivalence Record
- **Path**: `Validation_Lab/releases/v0.2/artifacts/equivalence/gf-01.json`
- **scenario_id**: gf-01-single-agent-lifecycle

### MCP Evaluation Evidence
- **Path**: `Validation_Lab/releases/v0.2/artifacts/evaluations/tool-call-flow.local-cli.md`
- **verdict_hash**: `e7f5b31e40d6a645782d219428c731ebed338739b5eadf831ec206fc7d002011`
- **pack_root_hash**: `403b0c41336ae4c674031c53d52447e441fd86fca5c0bf38982e5b29486cf2ca`

### LangChain Pack
- **pack_root_hash**: `1a499c7e9be2b9fb40202130640c33551971c1650f1497fd0f3cf7bebe6a47a4`
- **verdict_hash**: `25102cd201fd8b54f53416b21ef9d3b609fbca34718a0b4eb5ec58db16971c56`

### A2A Pack
- **pack_root_hash**: `80025729808627f4a475fc5cfa536afdc05a3f4cb6601651b957b7910fcc2214`
- **verdict_hash**: `25102cd201fd8b54f53416b21ef9d3b609fbca34718a0b4eb5ec58db16971c56`

---

## Gate Verdicts

| Gate | Verdict | Notes |
|------|---------|-------|
| S0 SUB-GATE-01 | ✅ PASS | All 3 runs use official substrate packages |
| Governance Schema Validator | ✅ PASS | Claim Catalog, Coverage Matrix, Equivalence Record |
| Phase IV (MCP tool-call) | ✅ PASS | tool.call + tool.result events verified |
| V-0 (Evidence Supplement) | ✅ PASS | MCP evaluator diff stability |
| PJT-01 (Proximity) | ⏭️ SKIP | No allowlist line refs in catalog |
| PJT-02 (Extension) | ✅ PASS | 3 repro_ref files verified |
| PJT-03 (Stats) | ✅ PASS | reproduced=2, declared=1, legacy=3 |
| PJT-04 (Pre-Manifest) | ✅ PASS | All v0.2 paths correct |

---

## Waivers

### PJT-01-SKIP-2026-01-13
- **Gate**: PJT-01 Proximity Rule
- **Reason**: Claim Catalog does not use `allowlist.yaml:L<n>` line number anchored references
- **Disposition**: Not Applicable for v0.2
- **v0.3 Action**: Upgrade truth_source to line-anchored or anchor-id mechanism

---

## Non-Endorsement / Non-Certification Boundary

> **MPLP does not endorse, certify, or host execution of any agent system.**  
> This release provides auditable evidence artifacts only. "Reproduced" status indicates that evidence was generated using official substrate SDK packages with deterministic output, not that the substrate is certified or endorsed by MPLP.

---

## Evidence Strength Labeling

**Labels apply to evidence pack strength, not to substrate/framework quality.**

### A2A — Declared (Static Evidence)
The A2A run is labeled **Declared (Static Evidence)** in v0.2 because the current pack generator uses mocked responses rather than live SDK invocation. This is an evidence classification decision, not a capability judgment on A2A.

- **Official SDK dependency**: ✅ Verified (`a2a-sdk==0.1.5` pinned)
- **Live SDK execution chain**: ❌ Not present (mocked producer)
- **Upgrade path**: A2A is eligible to be upgraded to Reproduced once a deterministic, live SDK invocation producer is provided.

---

## Supersedes

| Legacy Run | v0.2 Run |
|------------|----------|
| gf-01-langchain-pass | gf-01-langchain-official-v0.2 |
| gf-01-a2a-pass | gf-01-a2a-official-v0.2 |
| gf-01-mcp-pass | gf-01-mcp-official-v0.2 |

---

## Seal Attestation

- **Sealed By**: Antigravity Agent
- **Seal Date**: 2026-01-13T22:45:00+08:00
- **manifest_sha256**: `771a5514e82e58852bea5020968402abfc28674f74bdc616809281cf31a52b04`
- **seal_sha256**: `cd0486912b4995903b4800bf5383845cdb0f329678a547e0e298e031588ff2ac`

### Hash Audit Report

| Field | Source | Value | Status |
|-------|--------|-------|--------|
| runs[0].verdict_hash | equivalence/gf-01.json | `25102cd201fd8b54f53416b21ef9d3b609fbca34718a0b4eb5ec58db16971c56` | ✅ MATCH |
| runs[1].verdict_hash | equivalence/gf-01.json | `25102cd201fd8b54f53416b21ef9d3b609fbca34718a0b4eb5ec58db16971c56` | ✅ MATCH |
| runs[2].verdict_hash | evaluator evidence | `e7f5b31e40d6a645782d219428c731ebed338739b5eadf831ec206fc7d002011` | ✅ MATCH |
| runs[0].pack_root_hash | langchain/sha256sums | `1a499c7e9be2b9fb40202130640c33551971c1650f1497fd0f3cf7bebe6a47a4` | ✅ MATCH |
| runs[1].pack_root_hash | a2a/sha256sums | `80025729808627f4a475fc5cfa536afdc05a3f4cb6601651b957b7910fcc2214` | ✅ MATCH |
| runs[2].pack_root_hash | mcp/sha256sums | `403b0c41336ae4c674031c53d52447e441fd86fca5c0bf38982e5b29486cf2ca` | ✅ MATCH |
