---
entry_surface: repository
entry_model_class: validation_surface
doc_type: governance
status: final
authority: repository
doc_id: "MPLP-VALIDATION-LAB-COREGENTIS-TWO-LAYER-GOVERNANCE-BASELINE-v0.1"
surface_role: validation_surface_governance
record_state: final
title: "MPLP Validation Lab Coregentis Two-Layer Governance Baseline v0.1"
---

# MPLP Validation Lab Coregentis Two-Layer Governance Baseline v0.1

## Purpose

This record closes the Coregentis two-layer governance baseline for
`MPLP-Validation-Lab` as the validation/evidence surface repo.

The Coregentis canonical workspace root is
`/Users/jasonwang/Documents/AI_Dev/Coregentis`.

## Repository Role

| Field | Value |
|:---|:---|
| Repo | `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Validation-Lab` |
| Role | `VALIDATION_SURFACE` |
| Authoritative upstream | `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol-Dev` |
| Remote authority | `origin` after inspection, task branches only unless explicitly authorized |
| Not authority for | MPLP protocol truth, package truth, package publication, certification authority, release authority |

## Two-Layer Governance

Layer A: Repository Governance defines validation run packs, evidence records,
rulesets, public validation surfaces, generated/evidence surfaces, remote
authority, and publication boundaries.

Layer B: Codex Agentic Harness requires
`.agents/skills/agentic-harness-goal-preflight/SKILL.md` and
`governance/codex-goals/CODEX-GOAL-TEMPLATE.md` for every non-trivial Goal.
Goals must execute `SCTM`, `GLFB`, `ITCM`, `RBCT`, `VIM`, and `PRM`.

Repository methods `DIV`, `TSV`, `XCV`, `SCV`, `SUC`, and `EVC` apply only when
the Goal touches their relevant repository surfaces.

## SOT Boundary

| Layer | Boundary |
|:---|:---|
| `L0 Protocol Truth` | MPLP-Protocol-Dev only |
| `L1 Projection Source` | Lab rulesets/run-pack source only when traced to upstream truth |
| `L2 Generated Artifact` | Generated evidence artifacts only with provenance |
| `L3 Verification Evidence` | Validation evidence, not protocol mutation or package publication authority |
| `L4 Publication Surface` | Public evidence surfaces require claim-boundary review |
| `L5 Downstream Runtime/Product` | Evidence may inform downstream and upstream candidate work |
| `L6 Codex Execution Governance` | `AGENTS.md`, `.codex/config.toml`, `.agents/skills`, `.codex/skills`, Goal Template |

## Evidence Boundary

Validation evidence may support candidate decisions, but it cannot directly
mutate MPLP L0 protocol truth. Evidence is not authorization for publish,
upload, tag, seal, merge, package version change, registry mutation, or public
certification claims.

## Forbidden Authority Misuse

This repo must not be used as MPLP protocol truth, package truth, package
publication root, certification authority, endorsement authority, regulator
approval authority, legal-compliance proof authority, npm publish root, PyPI
upload root, registry mutation authority, tag authority, seal authority, PR
merge authority, or L0 schema mutation authority without explicit owner
approval.

V1.0_release is frozen as migration/evidence source only and must not be
treated as global MPLP SOT.

## Cross-Repo Rules

MPLP -> Validation Lab projection requires explicit validation or evidence
goal. Lab -> MPLP feedback requires explicit candidate/evidence intake scope. No
cross-repo sync, copy, cherry-pick, source restoration, or dist restoration is
authorized by this baseline.

## Blocking Verdicts

Relevant blockers include:

- `BLOCKED_WORKSTREAM_AUTHORITY_MISMATCH`
- `BLOCKED_LOCAL_REPO_AUTHORITY_MISMATCH`
- `BLOCKED_REMOTE_AUTHORITY_MISMATCH`
- `BLOCKED_CROSS_REPO_SYNC_NOT_AUTHORIZED`
- `BLOCKED_OWNER_AUTHORIZATION_REQUIRED`
- `BLOCKED_PUBLIC_PROJECTION_AUTHORIZATION_REQUIRED`
- `BLOCKED_V1_USED_AS_GLOBAL_MPLP_SOT`
- `BLOCKED_DEV_TRUTH_REQUIRED`
- `BLOCKED_DOWNSTREAM_REPO_USED_AS_PROTOCOL_TRUTH`
- `BLOCKED_SCHEMA_TRUTH_SOURCE_MISSING`
- `BLOCKED_L0_MUTATION_WITHOUT_SCHEMA_INTAKE`
- `BLOCKED_VALIDATION_SURFACE_USED_AS_PROTOCOL_TRUTH`

## Forbidden Action Compliance

No npm publish. No PyPI upload. No tag. No seal. No merge. No registry
mutation. No package version change. No L0 schema mutation. No package artifact
generation. No source/dist restoration. No public projection push is authorized
by this baseline.

## Final Verdict

`VALIDATION_SURFACE_TWO_LAYER_GOVERNANCE_BASELINE_RECORDED`
