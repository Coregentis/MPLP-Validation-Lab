# lib/gates — DEPRECATED

> [!CAUTION]
> This directory is **DEPRECATED** as of v0.6.
> 
> All runtime checks have been moved to `lib/runtime-checks/`.
> 
> The files in this directory are **re-export shims** for backwards compatibility.
> They will be removed in a future version.

## Migration Guide

| Old Import | New Import |
|------------|------------|
| `lib/gates/gate-04-language` | `lib/runtime-checks/gate-04-language` |
| `lib/gates/reason-codes/*` | `lib/runtime-checks/reason-codes/*` |

## Why This Change?

1. **Eliminate "gate dual location"**: Gates were split between `lib/gates/` (runtime checks) and `scripts/gates/` (CI entrypoints)
2. **Clarify semantics**: `lib/runtime-checks/` = reusable logic; `scripts/gates/` = CI entrypoints
3. **Align with GATES.yaml**: Registry now explicitly tracks gate entrypoints

## Timeline

- **v0.6**: Re-export shims active (backwards compatible)
- **v0.7**: Remove `lib/gates/` entirely (breaking change)
