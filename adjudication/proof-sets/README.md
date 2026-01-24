# Proof Sets (MUST-1)

Proof sets are curated descriptors that group multiple evidence packs under a shared scenario and ruleset in order to demonstrate **cross-substrate comparability**.

## Non-Endorsement Boundary

Proof sets MUST NOT be interpreted as certification, endorsement, ranking, or quality judgement of any framework/vendor/substrate. They document evidence-pack structure and reproducibility only.

## What a Proof Set Represents

A proof set typically specifies:

- Scenario identifier (e.g., GF-01)
- Ruleset version used for evaluation
- Substrates included (e.g., a2a, mcp, langchain)
- Evidence pack root hashes (pack-specific integrity anchors)
- Claim level (e.g., DECLARED vs adjudicated)

## Current Proof Sets

- `same-ruler-gf-01.yaml` — cross-substrate demonstration under the same scenario and ruleset

## Verification

```bash
# view proof set
cat adjudication/proof-sets/same-ruler-gf-01.yaml

# verify referenced packs (example pattern)
find data/runs/<run_id> -type f \( -name "*.json" -o -name "*.yaml" \) | sort | shasum -a 256
```

## Related

* Capability seal: `governance/seals/CAPABILITY-SEAL.v0.8.0.md`
