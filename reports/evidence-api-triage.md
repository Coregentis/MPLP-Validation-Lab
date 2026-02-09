# Evidence API Triage Report

**Date**: 2026-02-01
**Status**: Critical (P0)

## 1. Issue Description
Users executing "View JSON" or "Download Evidence" on V2 Run Detail pages receive 404/500 errors.

## 2. Fact Gathering

### A. Requested URLs
The `V2RunDetail` component (`app/runs/[run_id]/page.tsx`) explicitly links to:
- **View JSON**: `/api/v2/runs/:id`
- **Download Evidence**: `/api/v2/runs/:id/evidence`

### B. Route Existence (Root Cause)
**The directory `app/api/v2` does NOT exist.**
The links point to non-existent API routes. This is a dead link (404) condition, potentially interpreted as 500 by some middleware or the browser's generic error page for missing API endpoints.

### C. Evidence Storage Layout
Evidence is stored as flat files in `public/_data/v2/runs/`:
- `[run_id].json` (The Run Data / Ruleset adjudication)
- `[run_id].evidence.json` (The raw evidence lines)

Example for `acp-d1-real-runner-001`:
- `public/_data/v2/runs/acp-d1-real-runner-001.json`
- `public/_data/v2/runs/acp-d1-real-runner-001.evidence.json`

There are NO subdirectories per run.

## 3. Resolution Strategy

### A. Unified Resolver (`lib/v2/evidence/resolve-evidence-pack.ts`)
We need a resolver that knows this flat-file structure.
- `resolveEvidencePack(runId)` should return paths to both files.

### B. API Implementation
1. **JSON Route** (`app/api/v2/runs/[run_id]/route.ts`):
   - Should serve `[run_id].json`.
   - Fallback: `404` if file missing.

2. **Download/Evidence Route** (`app/api/v2/runs/[run_id]/evidence/route.ts`):
   - Should bundle `[run_id].json` AND `[run_id].evidence.json` into a ZIP.
   - Using `archiver` or `jszip`.
   - Filename: `[run_id]-evidence-pack.zip`.

### C. UI Update
Verify the existing links match the new route file structure.
- Current Link: `/api/v2/runs/[id]/evidence` -> Route: `app/api/v2/runs/[run_id]/evidence/route.ts` (Matches).

## 4. Conclusion
The "500" error is actually a "404 Not Found" due to missing API implementation. We must implement the missing routes and a resolver to handle the flat-file storage strategy.
