---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-028"
---

# ADJUDICATION_MATURITY_MODEL — Ruleset Strength Ladder & Release Stop Criteria

**Document ID**: VLAB-POL-AMM-01  
**Status**: Formative (Target: Frozen at v0.3)  
**Authority**: MPGC / Validation Lab Governance  
**Effective**: 2026-01-17  
**Applies To**: MPLP Validation Lab (only)

---

## 0. Authority & Boundary

This document governs the **maturity ladder** of adjudication in the Validation Lab.

- The Lab adjudicates **evidence** under a **versioned ruleset**.
- The Lab does not host execution and does not endorse frameworks.
- "PASS/FAIL" is a deterministic ruling under a declared ruleset, not a claim of superiority.

Entry authority reminder: **Repository > Documentation > Website** (non-negotiable).

---

## 1. Two-dimensional Model (Scope × Strength)

### 1.1 Adjudication Scope

| Scope | Name | Description |
|:---|:---|:---|
| **S1** | Single-Substrate | Single substrate evidence validation |
| **S2** | Cross-Substrate Equivalence | Partial/targeted cross-substrate comparison |
| **S3** | Cross-Substrate E2E | End-to-end equivalence (future) |

### 1.2 Evidence Strength

| Strength | Name | Description |
|:---|:---|:---|
| **E-A** | Static/Declared | No live generator execution |
| **E-B** | Generator-Based | Run-twice determinism reproduction |
| **E-S** | Sealed Proof | Non-repudiation boundary (standardization-grade gate) |

> [!IMPORTANT]
> **E-S "mechanism present" ≠ "standardization-grade achieved".**  
> E-S becomes meaningful only when combined with ruleset governance + third-party reproducibility.

---

## 2. Maturity Ladder (v0.2 → v0.5)

### 2.1 v0.2 — Evidence Adjudication Engine (Presence-level)

**Goal**: Evidence pack → ruleset → verdict → hashes → export → replay closed loop.

**What is adjudicated**:
- Presence/contract validity
- Deterministic verdict hash & pack hash integrity
- Explicit NOT-EVALUATED for semantic invariants

**Release Stop Criteria (v0.2)**:

| ID | Criterion |
|:---|:---|
| **V02-G1** | UI reachable closure (all curated runs reachable) |
| **V02-G2** | Runs ↔ Adjudication bundle 100% closure |
| **V02-G3** | Determinism reproducible (hash/sha256sums) |
| **V02-G4** | Protocol/Schema/Ruleset pin never "unknown" |
| **V02-G5** | Non-endorsement statement visible at key touchpoints |

> [!WARNING]
> **V02-G2 is a HARD gate**: Every curated run in `allowlist.yaml` MUST have a complete adjudication bundle. Missing bundle = run removed from curated list OR bundle must be generated before release.  
> See [ADJUDICATION_BUNDLE_MIN_CONTRACT.md](./contracts/ADJUDICATION_BUNDLE_MIN_CONTRACT.md) for bundle completeness definition.

---

### 2.2 v0.3 — Four-Domain Adjudicability (ERC + minimal invariants)

**Goal**: Make four arbitration domains **adjudicable objects**.

**Required Deliverables**:

| Deliverable | Description |
|:---|:---|
| 4 × ERC | Evidence Requirement Cards (one per domain) |
| 4 × Ruleset Rules | At least 1 invariant rule per domain |
| 8 × Packs | 1 PASS + 1 FAIL per domain |
| Tier-0 Expansion | At least 2 new execution frameworks enter Declared |

**Release Stop Criteria (v0.3)**:

| ID | Criterion |
|:---|:---|
| **V03-G1** | All four domains have: ERC + ≥1 rule + PASS/FAIL packs |
| **V03-G2** | At least 2 new Tier-0 execution frameworks in Declared (total ≥3) |
| **V03-G3** | GF-01 coverage growth across new frameworks |

**v0.3.x Iteration Target**: Push all 4 Tier-0 frameworks to Reproduced.

---

### 2.3 v0.4 — Semantic Invariant Strength (Explainable Failures)

**Goal**: Raise semantic strength, not substrate count.

**Required Deliverables**:

| Deliverable | Description |
|:---|:---|
| Invariants | ≥3 core invariants per domain |
| Failure Taxonomy | Deterministic reason codes |
| CLI Alignment | Lab vs CLI must match on same evidence |

---

### 2.4 v0.5 — Standardization-grade (Third-party Reproducible Conformance)

**Goal**: Third parties can independently reproduce rulings.

**Required Deliverables**:

| Deliverable | Description |
|:---|:---|
| E-S Usable Policy | Signature strategy + key management + evidence portability |
| Public Test Vectors | ≥5 PASS + ≥5 FAIL per domain |
| Cross-Paradigm Reproduction | ≥3 paradigms produce stable PASS/FAIL under same ruleset |
| Ruleset Governance | Versioning, compatibility, deprecation, changelog |

---

## 3. The Four Evidence Adjudication Domains (Normative for Lab)

The Lab defines four evidence adjudication domains:

| Domain | ID | Description |
|:---|:---|:---|
| **Budget Evidence Adjudication** | D1 | Resource/budget governance evidence |
| **Lifecycle State Evidence Adjudication** | D2 | State machine and completion evidence |
| **Authorization Decision Evidence Adjudication** | D3 | PoLP and authorization gate evidence |
| **Termination & Recovery Evidence Adjudication** | D4 | Loop/TTL/terminate and recovery evidence |

Each domain MUST be represented by:
- **ERC** (required evidence + pointers)
- **Ruleset clauses** (deterministic conditions)
- **PASS/FAIL example packs**

---

## 4. Anti-Inflation Law (Non-negotiable)

| Rule | Description |
|:---|:---|
| **R1** | Never trade reproducibility for coverage |
| **R2** | Never add substrates to claim "industry coverage" without evidence strength |
| **R3** | Never introduce endorsement semantics (badges/rankings/scores) |
| **R4** | Never host execution |

---

## 5. Version Stop Lines Summary

| Version | Stop Line (满足即发版) |
|:---|:---|
| **v0.2** | Evidence engine closed loop + Runs↔Bundle 100% |
| **v0.3** | Four domains adjudicable + 2 new Tier-0 frameworks |
| **v0.4** | Semantic strength + failure taxonomy |
| **v0.5** | Standardization-grade (核弹级最低封板) |

---

## 6. Non-Goals

- ❌ No execution hosting.
- ❌ No certification program.
- ❌ No framework benchmarking.
- ❌ No adapter development as admission requirement.

---

**Document Status**: Formative  
**Version**: 1.0.0  
**Governed By**: MPGC / Validation Lab
