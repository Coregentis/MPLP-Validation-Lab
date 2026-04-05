---
entry_surface: validation_lab
doc_type: governance
status: active
authority: validation_lab_governance
mplp_mplp_mplp_protocol_version: "1.0.0"
doc_id: "VLAB-DGB-01"
---

# Validation Lab Development Governance Baseline (VLAB-DGB-01)

**Baseline ID**: `VLAB-DGB-01`  
**Version**: `1.0.0`  
**Status**: `GOVERNANCE-ACTIVE`

## 1. Purpose

This document defines the Lab-side governance baseline for Validation Lab
development and projection behavior.

It governs:

- Lab role and boundaries
- Lab truth-source handling
- Lab derivation discipline
- Lab gate and contract behavior

It does **not** define MPLP protocol semantics.

## 2. Authority Split

### Repository Protocol Authority

Repository-backed schemas, invariants, profiles, taxonomy files, and approved
governance records remain the protocol truth source.

### Validation Lab Authority

Validation Lab authority is bounded to:

- evidence adjudication
- Lab rulesets
- Lab evidence-pack and pointer contracts
- Lab public projection/runtime assets

Validation Lab does **not** become protocol-definition authority by evaluating
evidence.

## 3. Current Lab Home Rule

Within the current repository governance scope:

- `Validation_Lab` is the authoritative Lab home in this repository
- `Validation_Lab_V2` is a non-authoritative `engineering_track`
- no external or mirrored repository may be cited here as a competing current
  Lab authority home

## 4. Upstream Baseline Rule

Protocol-aligned Lab derivations must remain pinned to the upstream baseline in:

- `UPSTREAM_BASELINE.yaml`

The Lab may derive or mirror from the pinned upstream baseline, but derivation
does not transfer protocol-definition authority into Lab governance files.

## 5. Truth-Source Order

For Lab work, read sources in this order:

1. repository-backed protocol artifacts for protocol meaning
2. Lab governance contracts/rulesets for Lab adjudication meaning
3. Lab runtime-consumed manifests and projections for Lab UI/projection meaning

### Prohibited Moves

- inventing protocol semantics from Lab page copy
- treating Lab governance as a substitute for repository protocol truth
- letting UI language outrun the ruleset/contract/projection assets it is bound
  to

## 6. Four Hard Boundaries

These boundaries apply across Lab governance and public Lab surfaces:

| Boundary | Meaning |
|:---|:---|
| Non-certification / Non-endorsement | no compliance marks, badges, rankings, or endorsements |
| Non-normative | Lab does not define protocol semantics |
| No execution hosting | Lab does not run user code or host sandboxes |
| Deterministic ruleset | same evidence + same ruleset identity = same verdict hash |

## 7. Version Domains

Lab governance must use explicit version domains first:

- `protocol_version`
- `schema_bundle_version`
- `validation_ruleset_version`
- `validation_lab_release_version`

Historical labels such as `site-v*`, `pack-v*`, and `rel-lab-*` may remain only
as historical or explanatory labels.

## 8. Derivation Discipline

Lab-side objects may be derived from:

- repository protocol artifacts
- Lab rulesets
- Lab contracts
- Lab projection/runtime assets

But Lab-side derivations must not:

- create new protocol fields
- create new protocol invariants
- create new protocol authority claims

## 9. Gate Role

Lab gates enforce bounded Lab behavior such as:

- upstream pin integrity
- schema alignment of Lab-bound artifacts
- deterministic adjudication behavior
- non-endorsement / no-hosting boundaries

Passing Lab gates does not create certification or protocol-definition
authority.

## 10. References

- `UPSTREAM_BASELINE.yaml`
- `README.md`
- `governance/contracts/`
- `governance/registry/`

---

**Final Boundary**: Validation Lab governance is bounded Lab governance only.
Repository-backed protocol sources prevail on protocol meaning.
