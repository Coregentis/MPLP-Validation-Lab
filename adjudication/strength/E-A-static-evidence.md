---
entry_surface: validation_lab
doc_type: reference
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-REF-001"
---


# E-A — Static Evidence (No Generator Execution)

E-A indicates evidence is adjudicated **without** re-running a generator:
- structural validation (contract/schema),
- internal consistency (hash inventory present),
- ruleset evaluation over declared artifacts.

## What E-A provides
- "adjudicable structure": pack is valid and can be evaluated
- baseline integrity checks

## What E-A does NOT provide
- reproduction guarantee
- run-twice determinism claim
- any implication of runtime determinism

## Typical sources
- curated runs submitted or generated once and frozen in `releases/`
- Type-A multi-substrate packs (static submission)

## Anchors
- `releases/v0.6/artifacts/packs/` (Type-A snapshot example)
- contracts: `governance/contracts/evidence-pack-contract-v1.*.md`
