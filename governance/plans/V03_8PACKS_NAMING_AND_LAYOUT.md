---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-015"
---

# V03 8-Packs Naming & Layout Plan

**Document ID**: VLAB-PLAN-V03-8PACKS-01  
**Status**: Active  
**Authority**: MPGC / Validation Lab Governance  
**Effective**: 2026-01-17  
**Applies To**: v0.3 Release Gate V03-G1

---

## 0. Purpose

This document defines the **naming convention and directory layout** for the 8 evidence packs required by v0.3 to satisfy V03-G1 (Four domains adjudicable).

Each domain requires 1 PASS + 1 FAIL pack = 8 packs total.

---

## 1. Run ID Naming Convention (Frozen)

**Pattern**:

```
arb-d{n}-{domain_slug}-{pass|fail}-fixture-v0.3
```

| Component | Description |
|:---|:---|
| `arb` | Arbitration domains track (distinct from GF series) |
| `d{n}` | Domain number: d1/d2/d3/d4 |
| `{domain_slug}` | Domain slug (see table below) |
| `{pass\|fail}` | Expected verdict |
| `fixture` | Initial producer type (static/script) |
| `v0.3` | Version suffix |

**Domain Slugs**:

| Domain | Slug |
|:---|:---|
| D1 Budget | `budget` |
| D2 Lifecycle State | `lifecycle-state` |
| D3 Authz Decision | `authz-decision` |
| D4 Termination & Recovery | `termination-recovery` |

---

## 2. 8 Packs Master List (v0.3)

| Domain | Type | run_id |
|:---|:---|:---|
| D1 Budget | PASS | `arb-d1-budget-pass-fixture-v0.3` |
| D1 Budget | FAIL | `arb-d1-budget-fail-fixture-v0.3` |
| D2 Lifecycle State | PASS | `arb-d2-lifecycle-state-pass-fixture-v0.3` |
| D2 Lifecycle State | FAIL | `arb-d2-lifecycle-state-fail-fixture-v0.3` |
| D3 Authz Decision | PASS | `arb-d3-authz-decision-pass-fixture-v0.3` |
| D3 Authz Decision | FAIL | `arb-d3-authz-decision-fail-fixture-v0.3` |
| D4 Termination & Recovery | PASS | `arb-d4-termination-recovery-pass-fixture-v0.3` |
| D4 Termination & Recovery | FAIL | `arb-d4-termination-recovery-fail-fixture-v0.3` |

---

## 3. Directory Layout (ABMC-compliant)

Each run MUST have the following structure per [ADJUDICATION_BUNDLE_MIN_CONTRACT.md](../contracts/ADJUDICATION_BUNDLE_MIN_CONTRACT.md):

```
data/runs/<run_id>/
├── verdict.json                    # B1 - Final verdict
├── bundle.manifest.json            # B2 - Bundle metadata + reason_code
├── evidence_pointers.json          # B4 - Pointer to evidence
├── integrity/
│   └── sha256sums.txt              # B3 - Hash integrity
└── pack/                           # Evidence pack root
    ├── manifest.json               # Pack manifest
    ├── trace/
    │   └── events.ndjson           # Event timeline
    ├── snapshots/                  # Optional state snapshots
    │   └── snapshot-001.json
    ├── plan/                       # Optional plan artifacts
    └── confirm/                    # Optional confirm artifacts
```

**Key References**:
- `bundle.manifest.json.pack_root` → `pack/`
- `bundle.manifest.json.hash_scope` → declares what's hashed
- `bundle.manifest.json.reason_code` → REQUIRED for FAIL packs

---

## 4. Verdict & Reason Code Rules

### 4.1 PASS Packs

| Field | Value |
|:---|:---|
| `verdict.json` topline | `PASS` |
| `bundle.manifest.json.reason_code` | (not required) |
| `evidence_pointers.json` | All RQ-Dx-xx with `status: PRESENT` |

### 4.2 FAIL Packs

| Field | Value |
|:---|:---|
| `verdict.json` topline | `FAIL` |
| `bundle.manifest.json.reason_code` | `REQ-FAIL-RQ-Dx-01` |
| `evidence_pointers.json` | RQ-Dx-xx with `status: ABSENT` or pointer to counter-evidence |

---

## 5. Ruleset Mapping (ruleset-1.1)

Each pack MUST be adjudicated against ruleset-1.1 which contains:

| Clause ID | Requirement ID | Domain |
|:---|:---|:---|
| `CL-D1-01` | `RQ-D1-01` | D1 Budget |
| `CL-D2-01` | `RQ-D2-01` | D2 Lifecycle State |
| `CL-D3-01` | `RQ-D3-01` | D3 Authz Decision |
| `CL-D4-01` | `RQ-D4-01` | D4 Termination & Recovery |

---

## 6. Tier-0 Extension Path

When AutoGen / Semantic Kernel / CrewAI are added, extend using same scenario family:

| Original | Extended |
|:---|:---|
| `arb-d1-budget-pass-fixture-v0.3` | `arb-d1-budget-pass-autogen-v0.3.x` |
| `arb-d1-budget-pass-fixture-v0.3` | `arb-d1-budget-pass-sk-v0.3.x` |
| `arb-d1-budget-pass-fixture-v0.3` | `arb-d1-budget-pass-crewai-v0.3.x` |

**Rules for extension**:
1. Same RQ / same ERC / same ruleset clause
2. Only change producer (fixture → framework SDK)
3. Upgrade claim_level from Declared → Reproduced when run-twice hash match achieved

---

## 7. V03-G1 Completion Criteria

V03-G1 is PASS when:

- [ ] All 8 run_ids exist in `data/runs/`
- [ ] All 8 have ABMC-compliant bundles (B1–B4)
- [ ] Each domain has 1 PASS + 1 FAIL
- [ ] FAIL packs have correct `reason_code`
- [ ] All 8 added to `allowlist.yaml` with `scenario_id: arb-d{n}-*`

---

## 8. Allowlist Entry Template

```yaml
- run_id: arb-d1-budget-pass-fixture-v0.3
  scenario_id: arb-d1-budget
  ruleset_version: ruleset-1.1
  substrate: fixture
  substrate_claim_level: declared
  substrate_execution: static
  inference_mode: none
  repro_ref: governance/erc/ERC_D1_BUDGET.md
  exporter_version: 0.1.0
  pack_root_hash: '<sha256>'
  verdict_hash: '<sha256>'
  status: active
  indexable: true
  notes: "v0.3 D1 PASS pack: budget decision record present"
  created_at: '2026-01-17T00:00:00Z'
```

---

**Document Status**: Active  
**Version**: 1.0.0  
**Governed By**: MPGC / Validation Lab
