---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-004"
---

# VLAB-GATE-05: NoIndex Policy

**Gate ID**: VLAB-GATE-05  
**Status**: ACTIVE  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## Purpose

Ensures that non-curated runs are not indexed by search engines, preventing the Lab from becoming a "certification directory."

---

## Trigger

This gate MUST run on:
- Every PR that modifies `app/runs/**`
- Every PR that modifies `data/curated-runs/allowlist.yaml`
- Every release build

---

## Policy

### Default: NoIndex

All run pages (`/runs/[run_id]`) MUST have:
```typescript
robots: { index: false, follow: false }
```

### Exception: Curated Runs

Runs listed in `data/curated-runs/allowlist.yaml` with `indexable: true` MAY have:
```typescript
robots: { index: true, follow: true }
```

---

## Allowlist Structure

```yaml
# data/curated-runs/allowlist.yaml
curated_runs:
  - run_id: "flow-01-reference-2026-01"
    status: "frozen"
    indexable: true
```

### Allowlist Requirements

1. Only `frozen` runs can be `indexable: true`
2. Each entry must have documented purpose
3. Changes require governance review

---

## Checks

### Check 1: Metadata Verification

For each run page:

| Run Type | Expected Robots | Fail If |
|:---|:---|:---|
| Not in allowlist | `noindex, nofollow` | Index enabled |
| In allowlist, `indexable: false` | `noindex, nofollow` | Index enabled |
| In allowlist, `indexable: true` | `index, follow` | (allowed) |

### Check 2: robots.txt (Informational Only)

> [!NOTE]
> **Page metadata is authoritative.** robots.txt serves as a fallback signal only.
> Curated runs with `indexable: true` are indexed via page-level metadata, not robots.txt Allow rules.

`public/robots.txt` SHOULD contain (informational):
```
# Validation Lab robots.txt
# Note: Page-level metadata is authoritative for index decisions

User-agent: *
# Non-curated runs are noindex via page metadata
# Curated runs are explicitly allowed via sitemap
Sitemap: /sitemap.xml
```

### Check 3: Sitemap Verification

Sitemap MUST only include runs from allowlist with `indexable: true`.

---

## Implementation

```typescript
// lib/curated-runs.ts
import { readFileSync } from 'fs';
import { parse } from 'yaml';

interface CuratedRun {
  run_id: string;
  status: string;
  indexable: boolean;
}

interface Allowlist {
  curated_runs: CuratedRun[];
}

const allowlistPath = './data/curated-runs/allowlist.yaml';

export function isCuratedRun(runId: string): boolean {
  try {
    const content = readFileSync(allowlistPath, 'utf-8');
    const allowlist: Allowlist = parse(content);
    const run = allowlist.curated_runs.find(r => r.run_id === runId);
    return run?.indexable === true;
  } catch {
    return false;
  }
}
```

---

## Failure Response

If this gate fails:
1. PR cannot be merged
2. Developer must fix robots metadata or update allowlist
3. Re-run gate after changes

---

## Audit Evidence

Gate produces:
- `GATE-05-RESULT.json` with pass/fail and run list
- Stored in CI artifacts

---

**Document Status**: Gate Definition  
**Version**: 1.0.0
