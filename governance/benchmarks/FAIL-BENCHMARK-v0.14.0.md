# Forensic FAIL Benchmark: v0.14.0 [MUST-2]

**Status**: FORENSIC-CLOSED
**Series**: v0.14 Forensic Depth
**Target Run**: `pydantic-ai-d1-budget-fail-01`

## 1. Forensic Closure Map (Dispute-Ready)

| Forensic Dimension | Value / Identifier | Audit Verdict |
| :--- | :--- | :--- |
| **Run Identity** | `pydantic-ai-d1-budget-fail-01` | **VERIFIED** |
| **Scenario Family** | `d1-budget` | **STATIONARY** |
| **Substrate** | `pydantic-ai` | **REGISTERED** |
| **Verdict Claim** | `ruleset-1.2` / `CL-D1-03` | **FAIL** |
| **Violation Reason** | `D1_BUDGET_DENY_WITHOUT_GATE` | **MATCH** |

---

## 2. Evidence Triad (Cryptographic Anchors)

| Artifact | Pointer | SHA-256 Anchor |
| :--- | :--- | :--- |
| **Timeline Trace** | `evt-pydantic-ai-d1-budget-fail-01-001` | `16cd784e9810f5021eea0fd367f5f8e3529131c2580d38040c5906094ee8a296` |
| **Forensic State** | `snap-pydantic-ai-d1-budget-fail-01-001` | `d7d16020194cbdb04672a678b01b955411d2c73cb1e1eed5dcc9f4b2d3659324` |
| **Pointer Index** | `evidence_pointers.json` | `f422ec02545c0440e2b80f6f3f0e064adffb1290d6faf5db3a641f58c1added9` |

---

## 3. Forensic Interpretation

> [!IMPORTANT]
> **Claim: Denial Without Enforcement**
> The target run demonstrates a semantic denial (`outcome: "invalid_outcome"`) that did not trigger any engineering gate or enforcement event (e.g., `budget.enforcement`, `gate`, `block`). 

> [!WARNING]
> **Dispute Potential**: A claim might be made that `invalid_outcome` is not a "denial". 
> **Forensic Refutation**: The `forensic-state.json` proves that `budget_remaining: 0` and `violation_detected: true` existed at the time of the decision, making any non-allow outcome a de facto denial within this substrate's context.

---

## 4. Reproduction Commands

1. **Integrity Check**:
   ```bash
   shasum -a 256 public/data/runs/pydantic-ai-d1-budget-fail-01/pack/timeline/events.ndjson
   ```
2. **Forensic Replay**:
   ```bash
   npx tsx scripts/gates/gate-v0.14.0-fail-forensics.ts
   ```

---
**Custodian**: v0.14 Forensic Guard
**Audit Date**: 2026-01-25
