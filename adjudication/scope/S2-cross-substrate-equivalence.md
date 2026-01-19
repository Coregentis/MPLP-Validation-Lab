---
doc_type: reference
normativity: non-normative
authority: Validation Lab
status: active
scope_id: S2
---

# S2 — Cross-Substrate Equivalence Adjudication

**What S2 adjudicates**  
S2 adjudicates whether **multiple substrates** can produce evidence that is **equivalent under the same MPLP invariant/ruleset** for the *same scenario*.

Equivalence in S2 means:
- packs satisfy the same **invariant requirements** (e.g., GF-01 invariant set),
- adjudication is performed under the same **ruleset version**,
- comparison is conducted on **evidence semantics**, not framework implementation details.

**What S2 does NOT adjudicate**
- interoperability as in "agents can call each other" (that is a separate engineering claim)
- any statement implying "framework A is better than B"
- end-to-end multi-stage task equivalence (that is S3)

## Evidence Forms
- **Type-A / E-A**: multiple submitted packs across substrates for the same scenario; validate structure + invariants
- **Type-B / E-B**: multiple regenerated packs across substrates (generator-based) with run-twice determinism
- **E-S**: cryptographic sealing over a frozen cross-substrate snapshot

## Key Requirement: Equivalence Rules Must Be Explicit
S2 MUST have an explicit, public "equivalence basis":
- which fields are compared as semantic invariants,
- which fields are allowed to diverge (implementation-specific),
- canonicalization rules (if any) that make comparison deterministic.

> Current risk identified in Phase 0: S2 logic exists but is **implicit in gate code**.
> Phase 1 establishes this scope doc; Phase 2/3 must externalize the rule basis.

## Existing Truth Anchors (repo / upstream)
- Cross-substrate evidence snapshot (Type-A): `releases/v0.6/artifacts/packs/`
- Cross-substrate reproduction snapshot (Type-B): `releases/v0.7.2/artifacts/repro/`
- Determinism / reproduction instructions: `releases/v0.7.2/REPRODUCE.md`
- Seals: `releases/v0.5/artifacts/signed-proof/`, `releases/v0.7.3/artifacts/signed-proof/SIGN-02/`
- Upstream S2 gate implementation (implicit today): `scripts/gates/ma-equiv-gate.mjs` *(main repo)*

## Non-Endorsement Boundary
> **S2 proves evidence portability and equivalence under rulesets, not framework superiority.**
