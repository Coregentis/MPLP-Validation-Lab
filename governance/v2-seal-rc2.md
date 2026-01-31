# Validation Lab V2 - Release Seal Record (RC-2)

> **Status**: SEALED & VERIFIED (RC-2 / SCOPE ENGINEERING)
> **Date**: 2026-01-27
> **Build ID**: `v2-rc-2-20260127-0800`
> **Git Anchor**: `0984b0888ecf2ad57edd6e`

## 1. Executive Summary
Release Candidate 2 (RC-2) introduces **Scope Engineering**, transforming the adjudication scope from documentation into machine-verifiable attributes. This release enforces **Evidence Maturity Tiers**, **Adjudicable Surfaces**, and **Interop Stacks** via strict SSOT Gates, while maintaining bit-identical compatibility with RC-1 evidence.

## 2. Scope Engineering (SSOT)
The following references are FROZEN and ENFORCED by `GATE-V2-SCOPE-SSOT-01`:

| Attribute | Value | Ref (SHA256) |
| :--- | :--- | :--- |
| **Scope SSOT** | `v2-mvp-scope-01` | `5d1880b8...` |
| **Schema Ver** | `v2-mvp-schema-01` | N/A |
| **Tiers** | `DECLARED`, `REPRODUCED` | Verified |
| **Profile** | `ps-v2-mvp-01` | Verified |

## 3. Inventory & Coverage
Total Runs: **10** (7 REAL, 3 SYNTHETIC).

### Tier Breakdown
*   **REPRODUCED**: runs: `mcp-d1-real-runner-001`, `mcp-d1-real-runner-det-001`, `mcp-d1-real-runner-det-002`, `acp-d1-real-runner-001`, `acp-d1-real-runner-002`, `mcp-d1-synthetic-001`.
*   **DECLARED**: `crewai-d1-real-runner-det-001`, `crewai-d1-real-runner-det-002`, `magentic-one-d1-real-runner-det-001`, `magentic-one-d1-real-runner-det-002` (Downgraded due to missing verification closure).

### Ruleset Status
*   **Active Ruleset**: `v2.0.0` (FROZEN)
*   **Evolution**: None (RC-2 is Scope-Only)

## 4. Gate Execution Registry
Executed via `npm run gate:all` (Strict Mode).

| Gate ID | Name | Status |
| :--- | :--- | :--- |
| `NO-LEGACY-01` | No V1 Legacy Content | PASS |
| `HOST-ALLOW-UI-01` | Host Allowlist (UI) | PASS |
| `HOST-ALLOW-DATA-01` | Host Allowlist (Data) | PASS |
| `DET-01` | Determinism Proof | PASS |
| `CROSSLINK-SSOT-01` | Cross-Site Link SSOT | PASS |
| `PROJ-01` | Projection-Only Access | PASS |
| `REAL-QUALIFY-01` | Real Provenance Qualification | PASS |
| `RUNNER-SSOT-01` | Runner Seal Integrity | PASS |
| `INVENTORY-SSOT-01` | Inventory Counts | PASS |
| `RELEASE-HYGIENE-01` | Deployment Hygiene | PASS |
| `RELEASE-ID-01` | Release Identity Integrity | PASS |
| `PROJECTION-CLOSURE-01` | Projection Closure | PASS |
| **`SCOPE-SSOT-01`** | **Scope SSOT Compliance** | **PASS** |
| **`TIER-CONSISTENCY-01`** | **Tier Closure Logic** | **PASS** |
| **`PROJECTION-SCHEMA-01`** | **Projection Schema Validation** | **PASS** |

### ACP Tier Classification
*   **ACP Runs** (`acp-d1-real-runner-001/002`) are classified as **REPRODUCED** in RC-2.
*   **Note**: In RC-1, these were designated as "Synthetic Baseline". In RC-2, they satisfy all `REPRODUCED` tier criteria (Runner Seal, Canonical Hash, Verification Report). This is a **metadata definition upgrade** based on the new Tier Logic; the underlying evidence artifacts remain unmodified from RC-1.

## 5. Artifact Verification
*   **Projections**: Rebuilt via `build-projection.ts` with RC-2 Dynamic Tier logic.
*   **UI**: Verified `RunsFilter` facets and `RunDetail` scope banner.
*   **Evidence**: No raw evidence packs were modified (Read-Only).

## 6. Known Limitations
*   **CrewAI / Magentic-One**: Currently `DECLARED` tier. Requires full `verify-repro` execution to upgrade to `REPRODUCED`.
*   **Dispute Tier**: Logic placeholder only (deferred to RC-3).

---
**Signed-off by**: Validation Lab Engineering Lead
