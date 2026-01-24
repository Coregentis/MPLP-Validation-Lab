# Export Catalog

This directory contains **exported artifacts** produced by the Validation Lab for reproducibility, projection mapping, and auditability. These exports explain evidence and ruleset evolution; they MUST NOT be interpreted as framework certification, endorsement, ranking, or scoring.

## Non-Endorsement Boundary

Exports reflect governance decisions about evidence requirements and reproducibility. They do NOT assess "framework quality".

## Contents

- `projection-map.json` — Projection SSOT map (routes ↔ artifacts)
- `ruleset-diff/` — Ruleset evolution diff reports (MUST-3)
- `gate-reports/` — Gate execution evidence (machine outputs)
- `curated-runs.json` — Curated run listing (catalog only; not a ranking)
- `audit/` — Documentation association audits and gap files (non-normative)

## Reproducibility (Hash Verification)

Recommended verification pattern:

```bash
# example
shasum -a 256 export/projection-map.json
```

For directory-wide integrity verification:

```bash
find export -type f \( -name "*.json" -o -name "*.md" -o -name "*.txt" \) | sort | shasum -a 256
```

## MUST-3 Boundary

Ruleset diff reports describe **ruleset evolution only**. They MUST NOT be interpreted as certification, endorsement, or quality judgement of any framework/substrate/vendor.
