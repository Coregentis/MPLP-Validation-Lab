# Single Entry & Link Audit Report
**Generated At**: 2026-01-31

## Single Entry Validation
- **Requirement**: No split entry points (e.g., `/v1/runs` vs `/v2/runs`).
- **Status**: ✅ PASS
- **Evidence**:
    - `app/runs/page.tsx` handles both sources.
    - `app/v2` directory exists but contains NO `page.tsx` (no routes exposed).
    - No `/v2/*` routes found in `app` directory structure.

## Link Safety (Internal Refs)
- **Scanning**: Searched for `/v2/` in code.
- **Findings**:
    - `app/v2/_registry/route-registry.ts`: Defines `/v2/` paths, but these appear to be internal registry keys or API paths, not user-facing UI routes.
    - `app/runs/[run_id]/page.tsx`: Links to `/api/v2/runs/...` for raw evidence. This is Acceptable (API access).
    - **Conclusion**: No unauthorized User Interface split found.

## Navigation Topology
- **Primary Entry**: `/runs` (Unified List)
- **Governance Entry**: `/governance` (Unified Index)
- **Problem**: `/governance` does not robustly link to "Rulesets" or "Runsets" deep pages, relying on the top navbar `Nav` component.

## Recommendations
1. Maintain the safe state of `app/v2` (Component coloc only).
2. Fix `app/governance` to clearly signpost the Unified Runsets/Rulesets.
