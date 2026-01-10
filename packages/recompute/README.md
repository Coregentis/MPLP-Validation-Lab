# @mplp/recompute

Third-party verdict recomputation CLI for MPLP evidence packs.

## Purpose

Enable repo-external, offline verification of MPLP evidence pack verdicts without requiring the full monorepo or network access.

## Features

- **Bundled Ruleset**: Includes ruleset-1.0 for deterministic recomputation
- **Offline Capable**: No network dependencies
- **Simple API**: Single command to recompute verdict hashes

## Installation

```bash
npm install @mplp/recompute
```

Or use directly with npx:

```bash
npx @mplp/recompute <pack_path> --ruleset 1.0
```

## Usage

```bash
# Recompute verdict for an evidence pack
mplp-recompute ./path/to/pack --ruleset 1.0
```

### Output

```json
{
  "ruleset_source": "bundled",
  "ruleset_version": "1.0",
  "pack_id": "example-pack-001",
  "verdict_hash": "abc123...",
  "match": null,
  "curated_hash": null
}
```

## Requirements

- Node.js >= 18.0.0

## Strategy

This CLI uses **Strategy A: Bundled Ruleset**:
- ruleset-1.0 is bundled within the package
- No network requests required
- Deterministic results across different environments

## License

MIT

## Sprint

Cross-Vendor Evidence Spine v0.1
