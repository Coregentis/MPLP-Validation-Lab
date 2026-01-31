# Runset Inventory Report
**Generated At**: 2026-01-31

## Sources Scanned
- `public/_data/curated-runs.json` (V1)
- `public/_data/v2/runs/index.json` (V2)

## Inventory Mapping

| Runset ID | Source | Version/Flavor | Path | Item Count | Status |
|-----------|--------|----------------|------|------------|--------|
| `curated-runs-v1` | V1 | V1.0 | `public/_data/curated-runs.json` | 9 (Active) | Active |
| `runs-index-v2` | V2 | V2.1.0 | `public/_data/v2/runs/index.json` | 48 (RefSeal) | Active |

## Details

### V1 Runset (Curated)
- **Path**: `public/_data/curated-runs.json`
- **Schema**: V1 Legacy
- **Generated At**: 2026-01-26
- **Content**: Mixed tiers (Simulated/Reproduced)

### V2 Runset (Index)
- **Path**: `public/_data/v2/runs/index.json`
- **Schema**: V2 Projection Schema 2.1.0
- **Source Version**: Lab Commit `dev`, Index Ver `2.0.0`
- **Scope Freeze**: `a332c...`
- **Content**: 48 Runs (Gold Standard)

## Gaps
- No Unified Runset definition combining these two.
- UI currently likely only displays V1 or V2 separately, or one masks the other.
