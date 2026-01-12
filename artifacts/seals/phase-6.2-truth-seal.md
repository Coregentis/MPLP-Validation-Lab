# Phase 6.2 Seal: Truthful Boundary Patch

**Date**: 2026-01-12
**Status**: SEALED
**Component**: Validation Lab (v0.1 patch)
**Commit SHA**: 58fd8b457fb8e39042fdd81f33a5b9fca9d9ae21
**Verification Date**: 2026-01-12
**Priority**: CRITICAL (Semantic Integrity)

## 1. Scope
Explicitly distinguishing between "Reproduced" (Execution Verified) and "Declared" (Static Specimen) evidence packs. This addresses the risk of misrepresenting static specimens as framwork-verified executions.

## 2. Audit Findings
| Substrate | Run ID | Audit Result | Action |
|-----------|--------|--------------|--------|
| **LangChain** | `gf-01-langchain-pass` | No reproduction script in repo. Specimen only. | **DOWNGRADE** to `Declared` |
| **MCP** | `gf-01-mcp-pass` | No reproduction script in repo. Specimen only. | Confirm `Declared` |
| **A2A** | `gf-01-a2a-pass` | No reproduction script in repo. Specimen only. | Confirm `Declared` |

## 3. Changes
- **Metadata**: Added `substrate_execution` ("real"|"mocked"|"static") and `inference_mode` to `CuratedRunRecord`.
- **Allowlist**: Updated all 3 runs to `execution: static`. Downgraded LangChain claim level to `declared`.
- **UI**: `RunSummaryCard` now displays "Declared (Specimen)" and explicit "Exec/Inf" modes to prevent ambiguity.

## 4. Verification
- **Build**: `npm run build` PASSED.
- **Generator**: `npm run generate:curated` successfully propagated metadata to JSON.
- **UI Integrity**: Validated via build check (500 error resolved by rebuild).

## 5. Artifacts
- `lib/curated/types.ts`
- `data/curated-runs/allowlist.yaml`
- `app/runs/[run_id]/_components/RunSummaryCard.tsx`
