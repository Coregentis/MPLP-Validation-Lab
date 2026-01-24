---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
mplp_mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-027"
---

# SUBSTRATE_SCOPE_POLICY — Validation Lab Substrate Scope & Inclusion Policy

**Document ID**: VLAB-POL-SSP-01  
**Status**: Formative (Target: Frozen at v0.3)  
**Authority**: MPGC / Validation Lab Governance  
**Effective**: 2026-01-17  
**Applies To**: MPLP Validation Lab Repository (only)

---

## 0. Authority & Boundary

This policy governs **which execution substrates ("substrates") may appear in the Validation Lab** and under what evidence strength / adjudication scope they may be admitted.

- This policy **does not** define MPLP protocol requirements.
- This policy **does not** certify or endorse any framework.
- The Lab adjudicates **evidence**, not execution.

Entry authority reminder: **Repository > Documentation > Website** (non-negotiable).

---

## 1. Definitions

### 1.1 Substrate
An "execution substrate" is any framework, runtime, protocol rail, or orchestration environment that can **produce MPLP Evidence Packs** for adjudication.

### 1.2 Claim Level (Admissibility)
Each substrate MUST be labeled with a claim level:

| Level | Definition |
|:---|:---|
| **Declared** | Static or mocked producer; evidence present but not reproduced |
| **Reproduced** | Deterministic reproduction demonstrated (run-twice hash match within declared hash scope) |
| **Cross-Verified** | Equivalence evidence across paradigms under the same ruleset (future tier) |

---

## 2. Scope Tiers (List-first)

### 2.1 Tier-0 Canonical Target List (MUST-INVEST, MAINSTREAM)
Tier-0 is the **minimal mainstream set** required to credibly claim cross-framework adjudication for MPLP as "The Agent OS Protocol".

#### Tier-0 Execution Frameworks (Target = Reproduced)

| # | Framework | Ecosystem | Target Claim Level |
|:---|:---|:---|:---|
| 1 | **LangGraph / LangChain** | LangChain | Reproduced |
| 2 | **AutoGen** | Microsoft | Reproduced |
| 3 | **Semantic Kernel** | Microsoft | Reproduced |
| 4 | **CrewAI** | Community | Reproduced |

> **Note**: Scenario/profile for AutoGen may reference Magnetic-One.

#### Tier-0 Protocol Rails (Target = at least Declared, prefer Reproduced)

| # | Rail | Status |
|:---|:---|:---|
| A | **MCP** | Active target |
| B | **A2A** | Active target |
| C | **ACP** | Scheduled target (may be later; MUST be listed) |

**Scope Stop Rule**:
Tier-0 is considered "complete" only when the 4 execution frameworks reach Reproduced
(see Section 5 Stop Criteria). Once complete, Tier-0 MUST be frozen.

### 2.2 Tier-1 Extended (ROLLING)
Frameworks with meaningful adoption that expand comparability, without becoming a long-tail directory (e.g., LlamaIndex, Haystack). Tier-1 is optional and can remain Declared for extended periods.

### 2.3 Tier-2 Ecosystem (LONG-TAIL)
Long-tail, closed-source, experimental, or niche substrates. Default claim level is Declared; no Reproduced expectation unless a deterministic producer is provided.

### 2.4 Internal Metadata (Non-normative, for scope control only)
Each admitted substrate MUST carry internal metadata:

| Field | Values |
|:---|:---|
| `paradigm_tag` | `graph` \| `multi-agent` \| `plugin-runtime` \| `role-crew` \| `rail` |
| `ecosystem_tag` | `langchain` \| `microsoft` \| `community` \| `rail` |

These tags are used ONLY for auditing stop criteria and preventing scope inflation.
They MUST NOT be used for endorsement, ranking, or marketing claims.

---

## 3. Inclusion Criteria (Admission Gates)

A substrate MAY be admitted only if ALL conditions are met:

### G1. Non-endorsement / Non-certification (HARD)
- No badges, rankings, scores, "certified", "compliant", or equivalent language.
- Evidence strength labels MUST be framed as **evidence quality**, not substrate quality.

### G2. No Execution Hosting (HARD)
- Lab MUST NOT provide "upload-and-run".
- Evidence Packs MUST be produced externally.

### G3. Evidence Pack Contract Compatibility (HARD)
- Packs must validate against the active Evidence Pack Contract version.
- Packs must pin: protocol version, schema bundle version/commit, ruleset version.

### G4. Claim Level Rules

| Claim Level | Requirements |
|:---|:---|
| **Declared** | At least 1 curated run with admissible pack |
| **Reproduced** | At least 1 PASS + 1 FAIL for same scenario family, plus run-twice hash match |

### G5. No Adapter Trap (HARD)
- The Lab MUST NOT ship framework adapters as a requirement for admission.
- Evidence must be produced externally by the substrate owner/community or a neutral producer.

---

## 4. Mapping to Adjudication Model (Scope × Strength)

Admitted substrates MUST be mapped to:
- **Scope**: S1 / S2 / S3
- **Strength**: E-A / E-B / E-S

This mapping is a labeling constraint; it does not imply completeness of semantic adjudication.

---

## 5. Scope Stop Criteria (Freeze Rule)

Once ALL conditions are met, scope expansion MUST stop and Tier-0 MUST be frozen:

| ID | Criterion |
|:---|:---|
| **S1** | 4 Tier-0 execution frameworks are present in allowlist |
| **S2** | Each reaches Reproduced (run-twice `pack_root_hash` match under declared hash scope) |
| **S3** | At least 2 rails are admitted (MCP + A2A). ACP remains a stated target but must not block freeze. |
| **S4** | GF-01 is Reproduced across all 4 Tier-0 frameworks (v0.3.x target / v0.4 gate) |

> [!IMPORTANT]
> **S4 MUST NOT block v0.3 release.**  
> v0.3 release gates are defined in [ADJUDICATION_MATURITY_MODEL.md](./ADJUDICATION_MATURITY_MODEL.md).  
> S1–S4 define the **Tier-0 Freeze Condition**, not the v0.3 Release Gate.

---

## 6. Lifecycle & Governance

### 6.1 Add / Upgrade / Downgrade

| Action | Rule |
|:---|:---|
| **Add** | New substrate admitted as Declared by default |
| **Upgrade** | Declared → Reproduced requires determinism evidence |
| **Downgrade** | Any breach of gates (endorsement creep, hosting creep, contract break) triggers downgrade or removal |

### 6.2 Required Records
Each change MUST include:
- rationale
- affected runs
- claim level change
- evidence pointers

---

## 7. Non-Goals

- ❌ Not a directory of all agent frameworks.
- ❌ Not a recommendation list.
- ❌ Not a compliance program.

---

## 8. Frozen Governance Statement

> Tier-0 的目标不是"分类学"，而是"主流框架全部纳入同一证据法域"：**LangGraph/LangChain、AutoGen、Semantic Kernel、CrewAI** 四个执行框架为最小集合；**MCP/A2A** 为当前 rails，**ACP** 为后置目标 rail。Tier-0 完成后即冻结，其他框架只允许分级进入，不得影响主线裁决叙事。

---

**Document Status**: Formative  
**Version**: 1.1.0  
**Governed By**: MPGC / Validation Lab
