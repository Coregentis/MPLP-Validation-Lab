# Ruleset Diff Reports (MUST-3)

This directory contains **ruleset evolution diff reports** generated with reproducible hashing. These reports explain how evidence requirements changed across ruleset versions.

## Non-Endorsement Boundary

Ruleset diffs MUST NOT be interpreted as certification, endorsement, ranking, scoring, or quality judgement of any framework/vendor/substrate. They reflect governance decisions about **evidence requirements** only.

## Structure

- `index.json` — machine-readable catalog of all diff reports
- `<diff_id>/diff.json` — a diff report for a specific transition (e.g., `ruleset-1.0_to_ruleset-1.1`)
  - Contains: `from/to versions`, `root_hash_sha256`, `clause_delta`, `requirement_delta`, reproducibility commands, and boundaries.

## Reproducibility

### Verify file hash

```bash
shasum -a 256 export/ruleset-diff/index.json
shasum -a 256 export/ruleset-diff/<diff_id>/diff.json
```

### Regenerate diffs

Generator script:

* `scripts/ruleset/generate-ruleset-diff.mjs`

Example:

```bash
node scripts/ruleset/generate-ruleset-diff.mjs --from ruleset-1.0 --to ruleset-1.1
```

(Exact flags/options, if any, are documented in `scripts/ruleset/README.md`.)

## UI Projection

Browsable UI:

* `/rulesets/diff` (list)
* `/rulesets/diff/[diff_id]` (detail)

## Enhanced Artifacts (v0.9.0+)

Parallel enhanced artifacts provide additional explainability without modifying v0.8 frozen files.

### Files
- `index.enhanced.json` - Enhanced index with template metadata
- `<diff_id>/diff.enhanced.json` - Enhanced diffs with deterministic explanations (template eh-1)

### Generate Enhanced
```bash
node scripts/ruleset/generate-ruleset-diff.mjs --enhanced --explain-profile eh-1 --from ruleset-1.0 --to ruleset-1.1
```

## Repro Pack (v0.9.2, rp-1)

Each diff_id includes a `repro-pack.json` for reproducibility verification.

### Files
- `<diff_id>/repro-pack.json` - Per-diff reproduction pack
- `index.repro.json` - Index of all repro packs with sha256

### Generate Repro Pack
```bash
node scripts/ruleset/generate-ruleset-diff.mjs --repro-pack --repro-profile rp-1 --from ruleset-1.0 --to ruleset-1.1
```

### Contents (rp-1 profile)
- Input manifest sha256 hashes
- Artifact hashes (v0.8 frozen + v0.9 enhanced)
- Verification commands (copy-paste ready)
- Non-endorsement boundary statement

## Frozen v0.8 Integrity

v0.8 artifacts (`index.json`, `diff.json`) are **frozen** and protected by Freeze Guard.

```bash
# Verify frozen hashes match CAPABILITY-SEAL.v0.8.0
shasum -a 256 export/ruleset-diff/index.json
shasum -a 256 export/ruleset-diff/*/diff.json
```

Expected: `index.json` = `e40c28e3d4a38986e5d4c083b00a0ee7eecf26e05a971d7c571291792b116d94`
