---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
mplp_mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-030"
---

# METHOD-VLAB-01: Validation Lab Evaluation Method

**Status**: Frozen Lab methodology reference

## Document Type

Non-normative / informative for MPLP protocol semantics.
Authoritative only for bounded Lab procedure and teaching order.

## 1. Purpose & Boundaries

Validation Lab evaluates **evidence packs** against **versioned rulesets** and
produces adjudication outputs.

It does not:

- define protocol semantics
- certify systems
- determine legal compliance
- host execution

## 2. Evaluation Object

At the Lab boundary, the evaluation object is an **evidence pack** plus a
selected **ruleset identity**.

The Lab does not evaluate a live system directly.

## 3. Current Public Lab Model

The current public Lab model has two coexisting adjudication lines:

### Legacy V1 Guarantee Line

- guarantee source: `governance/LIFECYCLE_GUARANTEES.yaml`
- ruleset identity: `ruleset-1.0`
- public display: `LG-01` to `LG-05`
- current strength: presence-level

### V2 Clause Bundle Line

- bundle source: `public/_data/v2/rulesets/ruleset-v2.0.0.json`
- later published bundle also present: `ruleset-v2.0.1.json`
- public display: V2 clause IDs

These two lines coexist on the current public Lab surface. This method document
must not collapse them into a single doctrine.

## 4. Evidence Inputs and Contracts

The evidence-pack input side is governed by Lab contract assets such as:

- `governance/contracts/evidence-pack-contract-v1.0.md`
- `governance/contracts/evidence-pack-contract-v1.1.md`
- `governance/contracts/admission-criteria-v1.0.md`
- `governance/contracts/pointer-contract-v1.0.md`

The public contract authority page is:

- `/policies/contract`

Input evidence-pack contract and outward export contract are related but not the
same thing.

## 5. Admission, Adjudication, Reverification

Keep these stages distinct:

| Stage | Meaning |
|:---|:---|
| Admission | structural admissibility / intake result |
| Adjudication | ruleset-based verdict over evidence |
| Reverification | later repeat verification over a published artifact line |

## 6. Deterministic Ruleset Principle

The Lab's deterministic rule is:

**same evidence + same ruleset identity = same verdict hash**

This is a Lab adjudication property. It is not a certification or protocol
authority claim.

## 7. Version Domains

This methodology should be read through explicit version domains:

- `protocol_version`
- `validation_ruleset_version`
- `validation_lab_release_version`

Historical labels such as `pack-v*` and `site-v*` remain historical-only.

## 8. Historical Teaching Note

Older Lab materials used:

- `pack-v0.2`, `pack-v0.3`, `pack-v0.4`
- `ruleset-1.1` / `ruleset-1.2` four-domain and semantic-invariant teaching

Those remain historical/lineage context only. They are not the primary public
teaching model for the current aggregate V1/V2 Lab surface.

## 9. Substrate Boundary

A substrate is an execution environment that produces evidence for the Lab.

The Lab adjudicates the **evidence** produced via that substrate path.
It does not thereby certify or semantically validate the substrate itself.

## 10. References

- `/about`
- `/guarantees`
- `/rulesets`
- `/policies/contract`
- `governance/LIFECYCLE_GUARANTEES.yaml`

---

**Final Boundary**: this method document describes bounded Lab adjudication
procedure only. Repository-backed protocol sources prevail on protocol meaning.
