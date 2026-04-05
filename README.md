---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-016"
---

# MPLP Validation Lab

**Validation Lab is a bounded, non-normative evidence adjudication surface for
MPLP.**

It evaluates evidence against versioned rulesets and publishes adjudication
artifacts. It does **not** define protocol semantics, certify systems, or host
execution.

## Lab Home Boundary

Within the current repository governance scope:

- `Validation_Lab` is the authoritative Lab home in this repository
- `Validation_Lab_V2` is a non-authoritative `engineering_track`
- the Lab remains an auxiliary public surface, not a protocol truth source

## Upstream Truth Boundary

Protocol truth remains upstream of the Lab:

| Domain | Source |
|:---|:---|
| Protocol semantics | repository-backed schemas, invariants, profiles, and approved governance records |
| Lab adjudication logic | Lab rulesets, Lab governance contracts, Lab projection/runtime assets |

`UPSTREAM_BASELINE.yaml` pins the protocol baseline the Lab is aligned to.

## Version Domains Used Here

This README uses explicit version domains:

| Domain | Current Value |
|:---|:---|
| `protocol_version` | `1.0.0` |
| `schema_bundle_version` | `2.0.0` |
| `validation_lab_release_version` | `1.0.1` |
| `validation_ruleset_version` | `ruleset-1.0` |
| `lab_series` | `v0.17.0` |

Canonical version-domain meaning comes from:

- `../governance/05-versioning/version-taxonomy-manifest.json`
- `public/_meta/lab-manifest.json`

Historical labels such as `site-v*`, `pack-v*`, and `rel-lab-*` remain
historical label families only. They are not first-class canonical version
domains.

## Four Boundaries

| Boundary | Meaning |
|:---|:---|
| Non-certification / Non-endorsement | no badges, rankings, or compliance marks |
| Non-normative | Lab does not define protocol semantics |
| No execution hosting | Lab evaluates submitted evidence; it does not run user code |
| Deterministic ruleset | same evidence + same ruleset identity = same verdict hash |

For substrates with `type: protocol` such as MCP, A2A, or ACP, the Lab
adjudicates **MPLP evidence produced via that path**. It does not adjudicate the
semantic correctness of those protocols themselves.

## Current Public Adjudication Model

The current public Lab reality has two coexisting lines:

### Legacy V1 Guarantee Line

- source: `governance/LIFECYCLE_GUARANTEES.yaml`
- display identifiers: `LG-01` to `LG-05`
- current default published ruleset identity: `ruleset-1.0`
- strength: presence-level

### V2 Clause Bundle Line

- source: `public/_data/v2/rulesets/ruleset-v2.0.0.json`
- later published bundle also present: `ruleset-v2.0.1.json`
- display identifiers: bundle clause IDs such as `PROV-V2-01`

The public `/guarantees` surface is an aggregate V1/V2 view. These two lines
must not be collapsed into one doctrine.

## Evidence, Rulesets, and Contracts

- **Evidence Pack**: adjudication input bundle
- **Ruleset**: versioned adjudication logic
- **Verdict**: adjudication output
- **Evidence-pack input contract**: governed by Lab contract provenance assets
- **Public contract surface**: `/policies/contract`

The export contract surface and the evidence-pack input contract are related but
not identical.

## Public Entry Surfaces

Key public Lab routes:

- `/`
- `/runs`
- `/runsets`
- `/rulesets`
- `/guarantees`
- `/policies/contract`
- `/validation`
- `/releases`

## Quick Start

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## References

- `UPSTREAM_BASELINE.yaml`
- `public/_meta/lab-manifest.json`
- `governance/LIFECYCLE_GUARANTEES.yaml`
- `governance/contracts/`
- `data/rulesets/`
- `public/_data/v2/rulesets/`

---

**Final Boundary**: the Validation Lab is a bounded evidence adjudication
surface only. Repository-backed protocol sources prevail on protocol meaning.
