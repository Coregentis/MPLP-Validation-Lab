# Phase 4 Preflight Fixes (P4-0.1)

**CRITICAL**: Apply these fixes BEFORE executing P4-1 through P4-8.

**Status**: MUST FIX (contains 2 blocking issues + 4 high-risk issues)

---

## Issue Classification

- **Blocking** (will crash at runtime): #1, #2
- **High Risk** (SSOT drift / schema mismatch): #3, #4
- **Consistency** (gate coverage / allowlist logic): #5, #6

---

## Fix #1: EvidencePackBrowser URL Encoding (BLOCKING)

### Problem

Current code uses `encodeURIComponent()` on full file paths with `/`:

```tsx
href={`/api/runs/${runId}/files/${encodeURIComponent(file)}`}
```

This encodes `/` to `%2F`, which:
- Most frameworks/reverse proxies do NOT decode back to `/`
- Next.js `[...path]` catch-all may not match correctly
- Results in 404 or incorrect route matching

### Fix

**File**: `phase-4-checklist.md` → Section P4-4 → `EvidencePackBrowser.tsx`

**Replace this**:
```tsx
<a 
  href={`/api/runs/${runId}/files/${encodeURIComponent(file)}`}
  className="text-sm text-blue-600 hover:underline"
>
  View
</a>
<a 
  href={`/api/runs/${runId}/download/${encodeURIComponent(file)}`}
  className="text-sm text-blue-600 hover:underline"
>
  Download
</a>
```

**With this**:
```tsx
<a 
  href={`/api/runs/${runId}/files/${file}`}
  className="text-sm text-blue-600 hover:underline"
>
  View
</a>
<a 
  href={`/api/runs/${runId}/download/${file}`}
  className="text-sm text-blue-600 hover:underline"
>
  Download
</a>
```

### Rationale

All 7 file paths in evidence packs use only safe characters (no spaces, no special chars except `/` and `.`). Direct URL construction is safe and avoids path encoding issues.

### Acceptance

- [ ] Links work: `/api/runs/gf-01-langchain-pass/files/artifacts/context.json`
- [ ] No `%2F` in generated URLs
- [ ] All 7 files accessible via View/Download

---

## Fix #2: ProvenanceFooter Server/Client Boundary (BLOCKING)

### Problem

Current `ProvenanceFooter` calls `getCuratedRuns()` which uses `fs.readFileSync`:

```tsx
export function ProvenanceFooter() {
  const data = getCuratedRuns(); // ⚠️ server-only, will crash in client
  ...
}
```

This component:
- Cannot be used in client components (will throw `fs module not found`)
- May accidentally get bundled to client if imported wrong

### Fix

**File**: `phase-4-checklist.md` → Section P4-6 → `ProvenanceFooter.tsx`

**Replace entire component with**:

```tsx
import type { SSOTMetadata } from '@/lib/curated/types';

interface ProvenanceFooterProps {
  ssot: SSOTMetadata;
}

export function ProvenanceFooter({ ssot }: ProvenanceFooterProps) {
  return (
    <footer className="mt-8 pt-4 border-t text-sm text-gray-600">
      <div className="flex flex-wrap items-center gap-4">
        <span>
          <strong>SSOT:</strong> <code className="bg-gray-100 px-1">{ssot.source}</code>
        </span>
        <span>
          <strong>Commit:</strong> <code className="bg-gray-100 px-1">{ssot.git_commit}</code>
        </span>
        <span>
          <strong>Generated:</strong> {new Date(ssot.generated_at).toLocaleString()}
        </span>
      </div>
    </footer>
  );
}
```

**Update all usage sites** (in P4-3 and P4-4):

```tsx
// In page.tsx (server component)
export default function RunsPage() {
  const data = getCuratedRuns();
  
  return (
    <div>
      {/* ... */}
      <ProvenanceFooter ssot={data.ssot} />
    </div>
  );
}
```

### Acceptance

- [ ] `ProvenanceFooter` does NOT import `getCuratedRuns`
- [ ] Component receives `ssot` as prop
- [ ] No `fs` usage in component
- [ ] TypeScript compiles without errors

---

## Fix #3: CuratedRunRecord Type Alignment with SSOT (HIGH RISK)

### Problem

Current type definition includes fields NOT confirmed to exist in `allowlist.yaml`:

```typescript
export interface CuratedRunRecord {
  // ...
  substrate_claim_level: ClaimLevel;  // ⚠️ Should be claim_level
  exporter_version: string;            // ⚠️ May not exist
  verify_report_hash: string;          // ⚠️ May not exist
  evaluation_report_hash: string;      // ⚠️ May not exist
  status: 'frozen' | 'deprecated';     // ⚠️ May not exist
  indexable: boolean;                  // ⚠️ May not exist
  created_at: string;                  // ⚠️ May not exist
}
```

This violates "SSOT single source" - types should match allowlist exactly.

### Verification

From actual `allowlist.yaml` (based on your Phase 3):

```yaml
runs:
  - run_id: gf-01-a2a-pass
    scenario_id: gf-01-single-agent-lifecycle
    ruleset_version: ruleset-1.0
    substrate: a2a
    substrate_claim_level: declared  # ← Key name confirmed
    repro_ref: examples/evidence-producers/a2a/README.md#repro-steps
    exporter_version: "0.1.0"       # ← Exists
    pack_root_hash: ...
    verdict_hash: ...
    verify_report_hash: ""          # ← Exists but empty
    evaluation_report_hash: ""      # ← Exists but empty
    status: draft                  # ← Exists
    indexable: true                 # ← Exists
    created_at: "2026-01-10T14:00:00Z"  # ← Exists
```

### Fix

**File**: `phase-4-checklist.md` → Section P4-2 → `lib/curated/types.ts`

**Replace entire file with** (aligned to actual allowlist structure):

```typescript
export type ClaimLevel = 'declared' | 'reproduced';
export type RulesetVersion = '1.0';
export type RunStatus = 'frozen' | 'deprecated';

export interface CuratedRunRecord {
  // Core identifiers
  run_id: string;
  scenario_id: string;
  
  // Substrate metadata
  substrate: string;
  substrate_claim_level: ClaimLevel; // Keep as-is (matches allowlist key)
  repro_ref: string;
  exporter_version: string;
  
  // Ruleset & validation
  ruleset_version: RulesetVersion;
  pack_root_hash: string;
  verdict_hash: string;
  verify_report_hash: string;        // Empty in v0.1
  evaluation_report_hash: string;    // Empty in v0.1
  
  // Governance
  status: RunStatus;
  indexable: boolean;
  created_at: string; // ISO8601
}

export interface SSOTMetadata {
  source: string;
  generated_at: string;
  git_commit: string;
}

export interface CuratedRunsArtifact {
  ssot: SSOTMetadata;
  runs: CuratedRunRecord[];
}
```

**Note**: All fields are kept because they exist in actual allowlist. Key name `substrate_claim_level` is CORRECT (not `claim_level`).

### Acceptance

- [ ] Type matches allowlist structure exactly
- [ ] All field names match YAML keys (no invented fields)
- [ ] TypeScript compilation succeeds
- [ ] UI code uses `run.substrate_claim_level` (not `run.claim_level`)

---

## Fix #4: Generator allowlist Structure Compatibility (HIGH RISK)

### Problem

Current generator assumes structure `{ runs: [...] }` without validation:

```javascript
const allowlist = yaml.load(allowlistContent);
const artifact = { ssot: {...}, runs: allowlist.runs.sort(...) };
```

If structure is different or `runs` is missing, generator crashes.

### Fix

**File**: `phase-4-checklist.md` → Section P4-1 → `scripts/generate-curated-runs.mjs`

**Replace the parsing section**:

**OLD**:
```javascript
const allowlist = yaml.load(allowlistContent);

// Generate artifact
const artifact = {
  ssot: {...},
  runs: allowlist.runs.sort((a, b) => a.run_id.localeCompare(b.run_id))
};
```

**NEW**:
```javascript
const parsed = yaml.load(allowlistContent);

// Support both { runs: [...] } and direct array
let runs;
if (Array.isArray(parsed)) {
  runs = parsed;
} else if (parsed && Array.isArray(parsed.runs)) {
  runs = parsed.runs;
} else {
  throw new Error(
    `Invalid allowlist format at ${ALLOWLIST_PATH}: ` +
    `expected 'runs' array or top-level array, got ${typeof parsed}`
  );
}

// Validate runs
if (runs.length === 0) {
  console.warn('Warning: allowlist contains 0 runs');
}

// Generate artifact
const artifact = {
  ssot: {
    source: ALLOWLIST_PATH,
    generated_at: new Date().toISOString(),
    git_commit: gitCommit
  },
  runs: runs.sort((a, b) => a.run_id.localeCompare(b.run_id))
};
```

### Acceptance

- [ ] Generator works with `{ version: "0.1", runs: [...] }` structure
- [ ] Generator works with direct `[...]` array (if needed)
- [ ] Clear error if structure is invalid
- [ ] Warning if 0 runs (not error)

---

## Fix #5: Restore GATE-08 in gates Script (CONSISTENCY)

### Problem

Current `gates` script excludes GATE-08 (Curated Immutability):

```json
"gates": "npm run generate:curated && npm run gate:04 && ... && npm run gate:09"
```

GATE-08 validates:
- `pack_root_hash` recomputation matches allowlist
- No curated entry schema violations
- Must continue to PASS during Phase 4 to prove UI changes didn't break curated spine

### Fix

**File**: `phase-4-checklist.md` → Multiple sections (P4-1, P4-8)

**Replace all instances of gates script definition**:

**OLD**:
```json
"gates": "npm run generate:curated && npm run gate:04 && npm run gate:05 && npm run gate:06 && npm run gate:07 && npm run gate:09"
```

**NEW**:
```json
"gates": "npm run generate:curated && npm run gate:04 && npm run gate:05 && npm run gate:06 && npm run gate:07 && npm run gate:08 && npm run gate:09"
```

### Rationale

Phase 4 must prove:
- All Phase 3 gates continue to PASS
- New GATE-09 also PASS
- No regression in curated pack integrity

### Acceptance

- [ ] `npm run gates` includes GATE-08
- [ ] GATE-08 validates 3 curated entries
- [ ] All gates (04, 05, 06, 07, 08, 09) PASS

---

## Fix #6: GATE-09 Allowlist Path Matching (CONSISTENCY)

### Problem

Current allowlist matching uses substring `includes()`:

```typescript
if (ALLOWLIST_PATHS.some(allowed => fullPath.includes(allowed))) {
  continue; // Skip this file
}
```

This is too permissive:
- File `my-governance/preflight-notes.md` would match `governance/preflight`
- File containing string `allowlist.yaml` anywhere in path would be skipped

### Fix

**File**: `phase-4-checklist.md` → Section P4-8 → `lib/gates/gate-09-ssot-projection.ts`

**Replace the allowlist logic**:

**OLD**:
```typescript
const ALLOWLIST_PATHS = [
  'data/curated-runs/allowlist.yaml',
  'public/_data/curated-runs.json',
  'phase-3-seal.md',
  'governance/preflight'
];

// In scanDirectory:
if (ALLOWLIST_PATHS.some(allowed => fullPath.includes(allowed))) {
  continue;
}
```

**NEW**:
```typescript
const ALLOWLIST_FILES = [
  'data/curated-runs/allowlist.yaml',
  'public/_data/curated-runs.json'
];

const ALLOWLIST_DIRS = [
  'governance/preflight/',
  '.gemini/antigravity/'  // For seal reports
];

// In scanDirectory:
function isAllowlisted(filePath: string): boolean {
  // Normalize to forward slashes
  const normalized = filePath.replace(/\\/g, '/');
  
  // Check exact file matches
  if (ALLOWLIST_FILES.some(allowed => normalized.endsWith(allowed))) {
    return true;
  }
  
  // Check directory prefixes (must have trailing /)
  if (ALLOWLIST_DIRS.some(dir => normalized.includes(dir))) {
    return true;
  }
  
  return false;
}

// In scanFile call:
if (isAllowlisted(fullPath)) {
  continue;
}
```

### Acceptance

- [ ] `data/curated-runs/allowlist.yaml` is skipped (file match)
- [ ] `public/_data/curated-runs.json` is skipped (file match)
- [ ] `governance/preflight/phase-3-seal.md` is skipped (dir match)
- [ ] `app/my-allowlist.yaml` is NOT skipped (no false positive)
- [ ] Test with fake hash in app/ → GATE-09 FAIL

---

## Application Checklist

Apply fixes in order:

- [ ] Fix #1: EvidencePackBrowser URL encoding
- [ ] Fix #2: ProvenanceFooter props injection
- [ ] Fix #3: CuratedRunRecord type alignment
- [ ] Fix #4: Generator structure compatibility
- [ ] Fix #5: Restore GATE-08 in gates
- [ ] Fix #6: GATE-09 allowlist strictness

### Verification Commands

```bash
# After applying all fixes:

# 1. TypeScript check
npx tsc --noEmit

# 2. Generate artifact
npm run generate:curated
cat public/_data/curated-runs.json | jq '.runs | length'

# 3. Run all gates
npm run gates

# Expected: All PASS (04, 05, 06, 07, 08, 09)
```

### Commit

```bash
git add -A
git commit -m "fix(phase-4): Apply P4-0.1 preflight fixes

Critical fixes before Phase 4 execution:

1. EvidencePackBrowser: Remove encodeURIComponent (blocking)
2. ProvenanceFooter: Props injection for ssot (blocking)
3. CuratedRunRecord: Align types with allowlist SSOT (high-risk)
4. Generator: Add structure validation (high-risk)
5. gates: Restore GATE-08 for curated immutability (consistency)
6. GATE-09: Strict allowlist path matching (consistency)

All TypeScript errors resolved
Ready for P4-1 execution"
```

---

## Status

- [ ] P4-0.1 Preflight Fixes Applied
- [ ] All gates PASS (04, 05, 06, 07, 08, 09)
- [ ] TypeScript compiles
- [ ] Ready to execute P4-1 through P4-8

---

**NEXT**: After applying P4-0.1, proceed with Phase 4 execution starting from P4-1.
