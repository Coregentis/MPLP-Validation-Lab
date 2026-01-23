---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-015"
---

# Third-Party Verification

**Applicable Site Version**: site-v0.5 | **Ruleset**: ruleset-1.0

## Overview

The MPLP Validation Lab provides a standalone CLI tool (`@mplp/recompute`) that enables third-party verification of evidence pack verdicts without requiring the full monorepo or network access.

## Key Features

- **Bundled Ruleset**: Includes ruleset-1.0 for deterministic recomputation
- **Offline Capable**: No network dependencies - runs entirely offline
- **Deterministic**: Same pack always produces same verdict_hash
- **Repo-External**: Can be used outside the monorepo environment

## Installation

```bash
npm install @mplp/recompute
```

Or use directly with npx:

```bash
npx @mplp/recompute <pack_path> --ruleset 1.0
```

## Usage

### Basic Verification

```bash
mplp-recompute ./path/to/evidence-pack --ruleset 1.0
```

### Example Output

```json
{
  "ruleset_source": "bundled",
  "ruleset_version": "1.0",
  "pack_id": "example-pack-001",
  "verdict_hash": "abc123def456...",
  "match": null,
  "curated_hash": null
}
```

## Output Fields

| Field | Description |
|:---|:---|
| `ruleset_source` | Always "bundled" - ruleset is packaged with CLI |
| `ruleset_version` | Ruleset version used (currently only "1.0" supported) |
| `pack_id` | Identifier from pack's manifest.json |
| `verdict_hash` | Recomputed deterministic verdict hash (SHA-256) |
| `match` | Boolean if curated_hash provided and compared |
| `curated_hash` | Reference hash from curated allowlist (if provided) |

## Verification Process

1. **Load Evidence Pack**: Reads pack manifest and evaluation report
2. **Apply Ruleset**: Uses bundled ruleset-1.0 for evaluation logic
3. **Compute Verdict Hash**: Generates deterministic SHA-256 hash
4. **Output Result**: Returns JSON with recomputed hash

## Requirements

- **Node.js**: >= 18.0.0
- **No Network**: Fully offline capable
- **No Monorepo**: Standalone package, no repository dependencies

## Supported Rulesets

Currently supports:
- `ruleset-1.0` (bundled)

Future ruleset versions will be added as separate package versions to maintain deterministic verification.

## Determinism Guarantee

The same evidence pack evaluated with the same ruleset version will **always** produce the same `verdict_hash`, regardless of:
- Operating system
- Machine architecture  
- Time of execution
- Network availability

This enables trustless third-party verification.

## Comparing with Curated Verdicts

To verify a pack matches the Lab's curated verdict:

1. Obtain the curated `verdict_hash` from the Lab's allowlist
2. Run recompute on the pack
3. Compare the output `verdict_hash` with curated hash
4. Match = verification successful

## Sprint

Cross-Vendor Evidence Spine (Historical — pack-v0.1)

## License

MIT
