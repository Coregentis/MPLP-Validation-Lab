# RULESET-EVOLUTION-v0.16.0: Semantic Explainability

**Status**: ACTIVE
**Series**: v0.16 Explainable Ruleset Diff
**Ruleset From**: `ruleset-1.2`
**Ruleset To**: `ruleset-1.3`
**Audit Verdict**: **PASS** (Zero-Flip Stable)

## 1. Executive Summary
This document explains the semantic evolution from Ruleset 1.2 to 1.3. The refinement focuses on increasing the precision of budget enforcement detection in agentic traces without altering the final adjudication status of any known samples.

## 2. Logic Refinement: CL-D1-03
The primary change in v1.3 is to **CL-D1-03 (Budget Deny Gate)**. 

### Before (v1.2)
The adjudicator searched for evidence of enforcement using a limited set of tokens: `gate`, `block`, `stop`.

### After (v1.3)
The adjudicator now searches for an expanded set of engineering-faithful tokens: `gate`, `block`, `stop`, `enforcement`, `throttle`.

**Rationale**: Substrates like MCP and Pydantic-AI often emit `budget.enforcement` or `throttle` events when a budget is depleted. v1.3 recognizes these as valid enforcement signals, reducing the risk of false-positive "missing evidence" FAILs in future high-fidelity runs.

> [!CAUTION]
> **Boundary Declaration**: 
> This refinement increases detection precision for known enforcement signals; it does not alter adjudication policy or introduce scoring/ranking.

## 3. Stability Proof: Zero-Flip Audit
To verify that this refinement did not introduce unintended side effects, the Lab executed a machine-audited comparison across 30 curated runs.

| Metric | Value | Audit Verdict |
| :--- | :--- | :--- |
| **Total Runs Audited** | 30 | **PASS** |
| **Verdict Flips** | 0 | **PASS** (100% Stable) |
| **Evidence Pattern Changes** | 9 | **PASS** (Refinement Signal) |

## 4. Institutional Anchors
The machine-readable evidence for this evolution is anchored in the following triad:
- **DiffPack**: `ruleset-1.2_to_ruleset-1.3.diffpack.json`
- **Shadow Input**: `shadow-input.json`
- **Audit Script**: `scripts/generate-ruleset-diff.ts`

---
**Custodian**: Institutional Explainability Guard
**Date**: 2026-01-25
