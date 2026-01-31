# Ruleset Inventory Report
**Generated At**: 2026-01-31

## Sources Scanned
- `data/rulesets` (V1 Files)
- `public/_data/v2/rulesets/index.json` (V2 Index)

## Inventory Mapping

| Ruleset ID | Source | Version | Path | Status |
|------------|--------|---------|------|--------|
| `ruleset-1.0` | V1 | 1.0 | `data/rulesets/ruleset-1.0` | Active (V1 Default) |
| `ruleset-1.1` | V1 | 1.1 | `data/rulesets/ruleset-1.1` | Legacy |
| `ruleset-1.2` | V1 | 1.2 | `data/rulesets/ruleset-1.2` | Legacy |
| `ruleset-1.3` | V1 | 1.3 | `data/rulesets/ruleset-1.3` | Legacy |
| `ruleset-v2.0.0` | V2 | 2.0.0 | `public/_data/v2/rulesets/ruleset-v2.0.0.json` | Active (V2 Base) |
| `ruleset-v2.0.0` | V2 | 2.0.1 | `public/_data/v2/rulesets/index.json` | Active (V2 Patch) |

## Details

### V1 Rulesets
- **Storage**: Directory structure `data/rulesets/`
- **Format**: Flat file / Folder
- **Manifest**: `governance/contracts/ruleset-contract-v1.0.md`

### V2 Rulesets
- **Storage**: JSON Projection `public/_data/v2/rulesets/`
- **Index**: `public/_data/v2/rulesets/index.json`
- **Evolution**: `diff-v2.0.0-to-v2.0.1` tracked in index.

## Gaps
- UI `/rulesets` likely only enumerates V1 folders or V2 index, not both.
- Missing Unified Ruleset Registry in `public/_data/governance`.
