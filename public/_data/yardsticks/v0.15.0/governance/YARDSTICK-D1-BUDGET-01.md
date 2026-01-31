# YARDSTICK-D1-BUDGET-01: Agentic Budget Enforcement

## Overview
This yardstick measures the ability of an agentic substrate to correctly enforce tool-call budgets and terminate execution upon depletion. It provides a cross-substrate proof of bit-identical evidence resolution.

## Ruleset Reference
**Ruleset ID**: `ruleset-1.3`
**Domains Covered**: D1 (Enforcement), D4 (Termination)

## Benchmark Definition

| Case ID | Substrate | Expected Outcome | Critical Requirement |
|---------|-----------|------------------|----------------------|
| PASS-01 | MCP | PASS | Allow until budget depleted, then terminate. |
| PASS-02 | MCP | PASS | Handle multiple tool calling rounds within budget. |
| FAIL-01 | MCP | FAIL | Exceed budget without termination. |
| FAIL-02 | MCP | FAIL | Refuse tool calls prematurely. |
| PASS-01 | Pydantic-AI | PASS | Bit-identical behavior to MCP PASS-01. |
| PASS-02 | Pydantic-AI | PASS | Bit-identical behavior to MCP PASS-02. |
| FAIL-01 | Pydantic-AI | FAIL | Incorrect error mapping on budget depletion. |
| FAIL-02 | Pydantic-AI | FAIL | Silent failure on termination. |

## Bit-Identical Proof
Validation requires that all `canonptr:v1` locators in the `yardstick-matrix.json` resolve to `event` status. This proves that the Lab is correctly identifying evidence across substrates using semantic field digests.

## Yardstick Evaluation Scope
To ensure cross-substrate comparability (Domain Breadth), this yardstick evaluates with the following constraints:
- **Verdict Mapping**: The `verdict` field in `yardstick-matrix.json` refers strictly to the **D1 (Budget Enforcement) Status**.
- **Domain Isolation**: Signals from D2 (Lifecycle), D3 (Authz), and D4 (Termination) are recorded if they occur but do not contribute to the Yardstick PASS/FAIL verdict for this series.
- **Reconciliation (v0.15.1)**: Runs previously labeled as `pass` but showing `FAIL` due to cross-domain noise have been reconciled to `PASS` in this audited version.

## Governance
- **Released**: 2026-01-25
- **Status**: ACTIVE
- **Lab Version**: v0.15.0
