# MPLP Validation Lab V2 - Official Seal Record

**Build ID**: `v2-rc-20260127-1300`  
**Git Commit**: `7e0b502fae4d6530ccae076305cf1baf98d285d1`  
**Date**: 2026-01-27  
**Status**: SEALED (Release Candidate 1)

---

## 1. Scope & Governance
This seal covers the **MPLP Validation Lab V2** release candidate. It establishes a bit-identical baseline for protocol conformance as described in the [Auditability Backbone](file:///Users/jasonwang/.gemini/antigravity/brain/cbad7751-4f07-4512-a5f2-ae6dd1b91055/implementation_plan.md).

### Substrate Coverage Boundary (v2-rc-1)
The following substrates are included in this sealed inventory as verified evidence:
- **MCP** (Model Context Protocol): REAL & SYNTHETIC support.
- **ACP** (Agent Communication Protocol): SYNTHETIC baseline.
- **CrewAI**: REAL implementation.
- **Magnetic One**: REAL implementation (AutoGen/Magentic-one stack).

> [!WARNING]
> The following substrates are **NOT** included in the v2-rc-1 inventory: LangChain, LangGraph, A2A, Semantic Kernel, MetaGPT. These are scheduled for future RC cycles.

> [!IMPORTANT]
> This laboratory focuses on deterministic evidence packs. It does not provide real-time execution or certification services. Any conformance claim must link to a specific `run_id` in this sealed inventory.

---

## 2. Frozen Inputs
The following inputs are frozen for this release:
- **Ruleset**: [ruleset-v2.0.0.json](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab_V2/rulesets/ruleset-v2.0.0.json) (Baseline)
- **Ruleset Evolution**: [diff-v2.0.0-to-v2.0.1.json](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab_V2/rulesets/evolution/diff-v2.0.0-to-v2.0.1.json)
- **Canonicalization Rules**: `v2.0.0 Stable`
- **Field Mapping Matrix (FMM)**: [mappings.json](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab_V2/public/_data/v2/fmm/mappings.json)

---

## 3. Evidence Inventory (Indexable Runs)

### INDEXABLE_REAL (7 Runs)
| Run ID | Canonical Pack Root Hash (SHA256) | Verdict | Substrate |
| :--- | :--- | :--- | :--- |
| `crewai...det-001` | `0fc7cf63c6...` | PASS | crewai |
| `crewai...det-002` | `0fc7cf63c6...` | PASS | crewai |
| `magentic...det-001` | `1e260f6d1a...` | PASS | magentic_one |
| `magentic...det-002` | `1e260f6d1a...` | PASS | magentic_one |
| `mcp-d1-real-runner-001` | `265d64817a...` | PASS | mcp |
| `mcp...det-001` | `17036587cb...` | PASS | mcp |
| `mcp...det-002` | `17036587cb...` | PASS | mcp |

### INDEXABLE_SYNTHETIC (3 Runs)
| Run ID | Canonical Pack Root Hash (SHA256) | Verdict | Substrate |
| :--- | :--- | :--- | :--- |
| `acp...runner-001` | `b05d3f34b8...` | PASS | acp |
| `acp...runner-002` | `b05d3f34b8...` | PASS | acp |
| `mcp...synthetic-001` | `e056417ca1...` | PASS | mcp |

---

## 4. Gate Results (Summary)
| Gate | ID | Result |
| :--- | :--- | :--- |
| **Identity Integrity** | `GATE-V2-RELEASE-ID-01` | ✅ PASS |
| **Runner Seal (SSOT)** | `GATE-V2-RUNNER-SSOT-01` | ✅ PASS |
| **Determinism Proof** | `GATE-V2-DET-01` | ✅ PASS |
| **Real Qualification** | `GATE-V2-REAL-QUALIFY-01` | ✅ PASS |
| **Projection Integrity** | `GATE-V2-PROJ-ONLY-01` | ✅ PASS |

---

## 5. Repro Commands
To re-verify this seal locally, run:
1. `npm install`
2. `npm run verify:mcp:d1` (Builds adjudication and FMM)
3. `npm run projection:build` (Builds UI inventory)
4. `npx tsx scripts/gates/run-all.ts --strict`

---

## 6. Known Limits
- **SYNTHETIC** runs are for regression testing and do not count toward official protocol coverage metrics.
- Adjudication is strictly based on `mplp://` pointers. Direct file manipulation of the pack will invalidate the hash and trigger `DET-01` failure.
