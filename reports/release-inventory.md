# Release & Seal Inventory Report
**Generated At**: 2026-01-31

## Sources Scanned
- `releases/unified`
- `releases/v2`

## Inventory Mapping

| Release ID | Type | Path | Status | Seal Valid? |
|------------|------|------|--------|-------------|
| `rc-6` | V2 | `releases/v2/rc-6` | Legacy V2 RC | N/A |
| `rc-20260131151110` | Unified | `releases/unified/rc-20260131151110` | Active Sealed | PASS |

## Details

### Unified Releases
- **Location**: `releases/unified/`
- **Artifacts**: `seal.md`, `gate-report.log`, `audit-report.log`
- **Latest**: `rc-20260131151110` (Sealed just now)

### V2 Releases (Legacy)
- **Location**: `releases/v2/`
- **Artifacts**: `rc-6.json`, `rc-6-seal.md`

## Gaps
- UI `/releases` page needs to visualize `releases/unified` specifically.
- `public/_data` does not seem to have a `releases/index.json` projection for easy UI consumption (might need parsing dir).
