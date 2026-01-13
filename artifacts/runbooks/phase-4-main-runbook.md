# Phase 4 Main: Detailed Execution Runbook (P4-1 → P4-8)

**Date**: 2026-01-11  
**Prerequisite**: Phase 4 Preflight SEALED (commits 315ea3d → cd7cd7d, gates 04-10 ALL PASS)  
**Status**: READY TO EXECUTE

---

## Hard Constraints (Immutable Boundaries)

These constraints apply to ALL Phase 4 Main tasks:

1. **SSOT Single Source**: `allowlist.yaml` → `curated-runs.json` (generated) → UI (read-only)
2. **No Execution Hosting**: Lab does NOT execute/host agent code (GATE-05)
3. **Non-Endorsement**: No certification/ranking/badge language (GATE-04)
4. **Frozen Boundaries**: No modifications to `data/rulesets/ruleset-1.0/`, `app/policies/contract/`, `app/policies/strength/`
5. **Gates Always Green**: Every commit must pass `npm run gates` (04-10)

---

## Recommended Commit Strategy

To maintain rollback safety and audit granularity:

**Commit M1**: P4-1 + P4-2 (Data Plane)  
**Commit M2**: P4-3 + P4-4 (UI Plane)  
**Commit M3**: P4-5 + P4-6 (API + Provenance Plane)  
**Commit M4**: P4-7 + P4-8 (Gates/Documentation/Seal)

Each commit MUST pass:
```bash
npx tsc --noEmit
npm run generate:curated
npm run gates
git diff --name-only | grep -E "ruleset|contract|strength" || echo "✅ Clean"
```

---

## P4-1: Curated Artifact Pipeline Verification

**Objective**: Confirm generator stability, error handling, and output contract.

**Status**: ✅ ALREADY COMPLETE (from Preflight)

**Files**: 
- `scripts/generate-curated-runs.mjs` ✅
- `public/_data/curated-runs.json` ✅

**Verification**:
```bash
# Regenerate
npm run generate:curated

# Verify structure
jq '.runs | length' public/_data/curated-runs.json
# Expected: 3

jq '.ssot.source' public/_data/curated-runs.json
# Expected: "data/curated-runs/allowlist.yaml"

# Verify sorting stability
jq '.runs[].run_id' public/_data/curated-runs.json
# Expected: alphabetical order
```

**Acceptance**:
- [x] Generator handles `{runs: [...]}` and `[...]` formats
- [x] Error messages are actionable
- [x] Output is deterministic (same input → same output)

---

## P4-2: Typed Loader + SSOT Constants

**Objective**: Provide single consumption interface for curated runs.

**Status**: ✅ ALREADY COMPLETE (from Preflight)

**Files**:
- `lib/curated/types.ts` ✅
- `lib/curated/load-curated-runs.ts` ✅
- `lib/curated/ssot.ts` ✅

**Verification**:
```bash
# Verify no direct allowlist.yaml reads in UI
rg "allowlist\.yaml" app/ components/ --type ts --type tsx || echo "✅ Clean"

# Run GATE-10 (checks UI layer SSOT usage)
npm run gate:10
```

**Acceptance**:
- [x] `getCuratedRuns()` is the ONLY way to load curated data
- [x] Types match allowlist structure exactly
- [x] GATE-10 PASS (no YAML parsing in UI)

---

## P4-3: Runs Index Page (`/runs`)

**Objective**: Create browsable list of curated runs with P0.7 context.

### Files to Create

1. **`app/runs/page.tsx`** (Server Component)

```typescript
import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { CuratedRunsTable } from './_components/CuratedRunsTable';
import { ScenarioAwareBanner } from './_components/ScenarioAwareBanner';
import { ProvenanceFooter } from '@/components/ProvenanceFooter';

export const metadata = {
  title: 'Curated Runs | MPLP Validation Lab',
  description: 'Vendor-neutral evidence packs for third-party verification'
};

export default function RunsPage() {
  const data = getCuratedRuns();
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Curated Runs</h1>
      
      <ScenarioAwareBanner />
      
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Evidence Packs (v0.1)</h2>
        <p className="text-gray-600 mb-6">
          These packs have been verified against frozen ruleset-1.0 and can be 
          independently recomputed using <code className="bg-gray-100 px-2 py-1 rounded">@mplp/recompute</code>.
        </p>
        <CuratedRunsTable runs={data.runs} />
      </section>
      
      <ProvenanceFooter ssot={data.ssot} />
    </div>
  );
}
```

2. **`app/runs/_components/ScenarioAwareBanner.tsx`**

```typescript
export function ScenarioAwareBanner() {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
      <h3 className="font-semibold text-lg mb-2">Cross-Vendor Evidence Spine v0.1</h3>
      <ul className="space-y-2 text-sm">
        <li>
          <strong>Scenario Focus</strong>: GF-01 (Single Agent Lifecycle)
        </li>
        <li>
          <strong>Ruleset</strong>: ruleset-1.0 (presence-level validation)
        </li>
        <li>
          <strong>Important</strong>: GF-02~05 PASS results indicate artifact presence only,
          not semantic correctness for those flows.
        </li>
      </ul>
    </div>
  );
}
```

3. **`app/runs/_components/CuratedRunsTable.tsx`**

```typescript
import type { CuratedRunRecord } from '@/lib/curated/types';
import { HashCell } from './HashCell';
import Link from 'next/link';

export function CuratedRunsTable({ runs }: { runs: CuratedRunRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3 border-b">Run ID</th>
            <th className="text-left p-3 border-b">Substrate</th>
            <th className="text-left p-3 border-b">Claim Level</th>
            <th className="text-left p-3 border-b">Verdict Hash</th>
            <th className="text-left p-3 border-b">Pack Root Hash</th>
            <th className="text-left p-3 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(run => (
            <tr key={run.run_id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <Link href={`/runs/${run.run_id}`} className="text-blue-600 hover:underline font-mono text-sm">
                  {run.run_id}
                </Link>
              </td>
              <td className="p-3">{run.substrate}</td>
              <td className="p-3">
                {run.substrate_claim_level === 'reproduced' ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Reproduced ✓
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    Declared
                  </span>
                )}
              </td>
              <td className="p-3">
                <HashCell hash={run.verdict_hash} label="verdict" />
              </td>
              <td className="p-3">
                <HashCell hash={run.pack_root_hash} label="pack_root" />
              </td>
              <td className="p-3">
                {run.substrate_claim_level === 'reproduced' && (
                  <a 
                    href={run.repro_ref} 
                    className="text-blue-600 hover:underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reproduce →
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

4. **`app/runs/_components/HashCell.tsx`** (Client Component)

```typescript
'use client';

import { useState } from 'react';

export function HashCell({ hash, label }: { hash: string; label: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center gap-2">
      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono" title={hash}>
        {hash.slice(0, 8)}...{hash.slice(-8)}
      </code>
      <button
        onClick={handleCopy}
        className="text-xs text-blue-600 hover:text-blue-800 transition"
        title={`Copy ${label}_hash`}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
```

### Verification

```bash
# Check page renders
npm run dev
# Visit http://localhost:3002/runs

# Check for forbidden terms
npm run gate:04
npm run gate:05

# Full gates
npm run gates
```

### Acceptance

- [ ] `/runs` page accessible
- [ ] Displays 3 runs in table
- [ ] ScenarioAwareBanner shows GF-01 focus + presence-level warning
- [ ] "Reproduced ✓" badge only for `gf-01-langchain-pass`
- [ ] No certification/ranking/badge language (GATE-04 PASS)
- [ ] ProvenanceFooter shows SSOT metadata

### Commit M1

```bash
git add -A
git commit -m "feat(phase-4): Add /runs index page with P0.7 awareness (M1)

Phase 4 Main - Commit M1 (Data + UI Foundation):
- P4-1: Curated artifact pipeline (verified)
- P4-2: Typed loader + SSOT constants (verified)
- P4-3: /runs index page with ScenarioAwareBanner

Components:
- CuratedRunsTable: 3-run display with claim levels
- HashCell: Copy-friendly hash display
- ScenarioAwareBanner: P0.7 presence-level context

Gates: 04-10 ALL PASS
Frozen: CLEAN"
```

---

## P4-4: Run Detail Page (`/runs/[run_id]`)

**Objective**: Provide evidence pack browser and verification instructions.

### Files to Create

1. **`app/runs/[run_id]/page.tsx`**

```typescript
import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { notFound } from 'next/navigation';
import { RunSummaryCard } from './_components/RunSummaryCard';
import { VerificationPanel } from './_components/VerificationPanel';
import { EvidencePackBrowser } from './_components/EvidencePackBrowser';
import { GovernancePanel } from './_components/GovernancePanel';
import { ProvenanceFooter } from '@/components/ProvenanceFooter';

export async function generateStaticParams() {
  const data = getCuratedRuns();
  return data.runs.map(run => ({ run_id: run.run_id }));
}

export default function RunDetailPage({ params }: { params: { run_id: string } }) {
  const data = getCuratedRuns();
  const run = data.runs.find(r => r.run_id === params.run_id);
  
  if (!run) {
    notFound();
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <RunSummaryCard run={run} />
      <VerificationPanel run={run} />
      <EvidencePackBrowser runId={run.run_id} />
      <GovernancePanel />
      <ProvenanceFooter ssot={data.ssot} />
    </div>
  );
}
```

2. **`app/runs/[run_id]/_components/RunSummaryCard.tsx`**

```typescript
import type { CuratedRunRecord } from '@/lib/curated/types';

export function RunSummaryCard({ run }: { run: CuratedRunRecord }) {
  return (
    <section className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
      <h1 className="text-2xl font-bold mb-4">{run.run_id}</h1>
      
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-semibold text-gray-600">Substrate</dt>
          <dd className="mt-1">{run.substrate}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-gray-600">Claim Level</dt>
          <dd className="mt-1">
            {run.substrate_claim_level === 'reproduced' ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Reproduced ✓
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Declared
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-gray-600">Scenario</dt>
          <dd className="mt-1">{run.scenario_id}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-gray-600">Ruleset</dt>
          <dd className="mt-1">{run.ruleset_version} <span className="text-sm text-gray-500">(presence-level)</span></dd>
        </div>
      </dl>
    </section>
  );
}
```

3. **`app/runs/[run_id]/_components/VerificationPanel.tsx`**

```typescript
import type { CuratedRunRecord } from '@/lib/curated/types';

export function VerificationPanel({ run }: { run: CuratedRunRecord }) {
  const recomputeCmd = `npx @mplp/recompute data/runs/${run.run_id} --ruleset 1.0`;
  
  return (
    <section className="border rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Third-Party Verification</h2>
      
      <p className="text-sm text-gray-600 mb-4">
        Anyone can independently verify this verdict using the recompute CLI:
      </p>
      
      <div className="bg-gray-900 text-white p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
        <code>{recomputeCmd}</code>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3">Expected Output</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-gray-600 mb-1">verdict_hash</dt>
            <dd className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
              {run.verdict_hash}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-600 mb-1">pack_root_hash</dt>
            <dd className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
              {run.pack_root_hash}
            </dd>
          </div>
        </dl>
      </div>
      
      {run.substrate_claim_level === 'reproduced' && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <h3 className="font-semibold text-green-900">Reproduction Available</h3>
          <p className="text-sm mt-1 text-green-800">
            Full reproduction steps: <a href={run.repro_ref} className="text-blue-600 hover:underline font-semibold">
              {run.repro_ref.split('/').pop()}
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
```

4. **`app/runs/[run_id]/_components/EvidencePackBrowser.tsx`**

```typescript
export function EvidencePackBrowser({ runId }: { runId: string }) {
  const files = [
    'manifest.json',
    'integrity/sha256sums.txt',
    'integrity/pack.sha256',
    'timeline/events.ndjson',
    'artifacts/context.json',
    'artifacts/plan.json',
    'artifacts/trace.json'
  ];
  
  return (
    <section className="border rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Evidence Pack (7 files)</h2>
      
      <ul className="space-y-2">
        {files.map(file => (
          <li key={file} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
            <code className="text-sm font-mono">{file}</code>
            <div className="flex gap-3">
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
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. **`app/runs/[run_id]/_components/GovernancePanel.tsx`**

```typescript
export function GovernancePanel() {
  return (
    <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Governance & Guarantees</h2>
      
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-semibold mb-2">v0.1 Scenario Focus</h3>
          <p>
            This spine validates <strong>GF-01: Single Agent Lifecycle</strong>.
            While ruleset-1.0 checks GF-02~05, these checks are <strong>presence-level only</strong>.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Presence-Level Validation</h3>
          <p>
            ruleset-1.0 verifies artifact <em>presence</em>, not semantic correctness.
            A "PASS" for GF-02~05 indicates required files exist, not that they are semantically valid for those flows.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">No Execution Hosting</h3>
          <p>
            The Lab does NOT execute agent code. All evidence generation occurs in third-party environments.
          </p>
        </div>
      </div>
    </section>
  );
}
```

### Verification

```bash
# Check pages render
npm run dev
# Visit http://localhost:3002/runs/gf-01-langchain-pass
# Visit http://localhost:3002/runs/gf-01-a2a-pass

# Check gates
npm run gates
```

### Acceptance

- [ ] All 3 detail pages accessible
- [ ] `gf-01-langchain-pass` shows "Reproduced ✓" with repro link
- [ ] `gf-01-a2a-pass` shows "Declared" (no repro section)
- [ ] VerificationPanel shows correct recompute command and hashes
- [ ] EvidencePackBrowser lists exactly 7 files
- [ ] GovernancePanel shows P0.7 text (GF-01 focus, presence-level)
- [ ] No forbidden terms (GATE-04/05 PASS)

### Commit M2

```bash
git add -A
git commit -m "feat(phase-4): Add /runs/[run_id] detail pages (M2)

Phase 4 Main - Commit M2 (Run Detail):
- P4-4: Run detail pages with full evidence browser

Components:
- RunSummaryCard: Shows ruleset version as-is (no double prefix)
- VerificationPanel: Third-party recompute instructions
- EvidencePackBrowser: 7-file browser with View/Download (no %2F encoding)
- GovernancePanel: P0.7 governance context

Gates: 04-10 ALL PASS
Frozen: CLEAN"
```

---

## P4-5: API Routes for Evidence Files

**Objective**: Provide secure file access APIs (view/download only, no execution).

### Security Requirements

1. **Path Traversal Prevention**: Block `..`, absolute paths, symlinks
2. **Whitelist Validation**: Only allow known evidence pack structure
3. **No Path Leakage**: Errors must not reveal disk paths (GATE-07)

### Files to Create

**`app/api/runs/[run_id]/files/[...path]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_FILES = new Set([
  'manifest.json',
  'integrity/sha256sums.txt',
  'integrity/pack.sha256',
  'timeline/events.ndjson',
  'artifacts/context.json',
  'artifacts/plan.json',
  'artifacts/trace.json'
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { run_id: string; path: string[] } }
) {
  const runId = params.run_id;
  const filePath = params.path.join('/');
  
  // Validate against whitelist
  if (!ALLOWED_FILES.has(filePath)) {
    return NextResponse.json({ error: 'File not allowed' }, { status: 403 });
  }
  
  // Prevent path traversal
  if (filePath.includes('..') || path.isAbsolute(filePath)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }
  
  // Construct safe path
  const runDir = path.join(process.cwd(), 'data/runs', runId);
  const fullPath = path.join(runDir, filePath);
  
  // Verify path is within run directory
  if (!fullPath.startsWith(runDir)) {
    return NextResponse.json({ error: 'Path escape detected' }, { status: 403 });
  }
  
  // Check file exists
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  
  // Read and return file
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': filePath.endsWith('.json') ? 'application/json' : 'text/plain',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    // No stack trace or path leakage
    return NextResponse.json({ error: 'Read failed' }, { status: 500 });
  }
}
```

**`app/api/runs/[run_id]/download/[...path]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_FILES = new Set([
  'manifest.json',
  'integrity/sha256sums.txt',
  'integrity/pack.sha256',
  'timeline/events.ndjson',
  'artifacts/context.json',
  'artifacts/plan.json',
  'artifacts/trace.json'
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { run_id: string; path: string[] } }
) {
  const runId = params.run_id;
  const filePath = params.path.join('/');
  
  // Same validation as files route
  if (!ALLOWED_FILES.has(filePath)) {
    return NextResponse.json({ error: 'File not allowed' }, { status: 403 });
  }
  
  if (filePath.includes('..') || path.isAbsolute(filePath)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }
  
  const runDir = path.join(process.cwd(), 'data/runs', runId);
  const fullPath = path.join(runDir, filePath);
  
  if (!fullPath.startsWith(runDir)) {
    return NextResponse.json({ error: 'Path escape detected' }, { status: 403 });
  }
  
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const filename = path.basename(filePath);
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
```

### Verification

```bash
# Test valid file access
curl http://localhost:3002/api/runs/gf-01-langchain-pass/files/manifest.json

# Test path traversal (should fail)
curl http://localhost:3002/api/runs/gf-01-langchain-pass/files/../../../package.json

# Test invalid file (should fail)
curl http://localhost:3002/api/runs/gf-01-langchain-pass/files/secret.txt

# Run gates
npm run gates
```

### Acceptance

- [ ] All 7 files accessible via GET
- [ ] Path traversal attempts return 403 (no path leakage)
- [ ] Invalid files return 403
- [ ] Download route sets correct headers (Content-Disposition: attachment)
- [ ] GATE-07 PASS (no PII/path leaks)

### Commit M3

```bash
git add -A
git commit -m "feat(phase-4): Add secure API routes for evidence files (M3)

Phase 4 Main - Commit M3 (API + Security):
- P4-5: File view/download APIs with security boundaries

Security:
- Whitelist-based file validation
- Path traversal prevention
- No disk path leakage in errors
- Immutable cache headers

Gates: 04-10 ALL PASS
Frozen: CLEAN"
```

---

## P4-6: Provenance Integration

**Status**: ✅ ALREADY COMPLETE

`ProvenanceFooter` already implemented with props injection in Preflight.

---

## P4-7: Gate-10 Integration

**Status**: ✅ ALREADY COMPLETE

GATE-10 implemented in Preflight, integrated into `npm run gates`.

---

## P4-8: Phase 4 Seal Report

**Objective**: Create archival-quality seal report with all evidence.

### File to Create

**`governance/preflight/phase-4-seal.md`**

```markdown
# Phase 4 Seal Report: UI Updates

**Date**: 2026-01-11  
**Phase**: 4 — UI Updates (Scenario-aware Projection + Evidence Drilldown)  
**Status**: SEALED

---

## Executive Summary

Phase 4 delivered user-verifiable UI projection of Phase 3 evidence chain while maintaining:
- SSOT single source (allowlist.yaml)
- No execution hosting
- Non-endorsement language
- Frozen governance boundaries

---

## Deliverables

### Preflight (P4-0.1 + P4-0.1.1)

**Commits**:
- P4-0.1: 315ea3d
- P4-0.1.1 FINAL: cd7cd7d

**Gates**: ALL PASS (04-10)
**Production**: VERIFIED (--omit=dev)

### Main (M1-M3)

**Commits**:
- M1: [SHA] (Data + UI Foundation)
- M2: [SHA] (Run Detail)
- M3: [SHA] (API + Security)

---

## Components Delivered

### Data Plane
- Curated runs generator (allowlist.yaml → curated-runs.json)
- Typed loader (server-side only)
- SSOT constants

### UI Plane
- `/runs`: Index page with P0.7 banner
- `/runs/[run_id]`: Detail pages with verification panel
- ScenarioAwareBanner, CuratedRunsTable, HashCell
- RunSummaryCard, VerificationPanel, EvidencePackBrowser, GovernancePanel

### API Plane
- `/api/runs/[run_id]/files/[...path]`: View API
- `/api/runs/[run_id]/download/[...path]`: Download API
- Security: Whitelist validation, path traversal prevention

### Gates
- GATE-09: SSOT projection guard (prevents hash hardcoding)
- GATE-10: Curated invariants (prevents SSOT/UI drift)

---

## Final Verification

### All Gates PASS

```
[GATE-04] Non-endorsement Language Lint: PASS
[GATE-05] No Execution Hosting Guard: PASS
[GATE-06] Robots/Noindex Policy: PASS
[GATE-07] PII/Path Leak Lint: PASS
[GATE-08] Curated Immutability: PASS (3 entries)
[GATE-09] SSOT Projection: PASS (0 hardcoded hashes)
[GATE-10] Curated Invariants: PASS (4 checks)
```

### Frozen Boundaries

✅ CLEAN (no changes to ruleset/contract/strength)

### Production Build

✅ SUCCESS (`npm ci --omit=dev`)

---

## Generator Commit SHA Note

**Observed**: `ssot.git_commit` shows "315ea3d" in gates.B.log while HEAD is "cd7cd7d"

**Explanation**: Generator captures `git rev-parse HEAD` at execution time. During Commit B verification, generator ran **before** commit was finalized, thus recording Commit A's SHA (315ea3d). This is correct workflow: verify-then-commit.

**Semantic**: `ssot.git_commit` represents "snapshot of git state when artifact was generated" for audit traceability, not the "final commit SHA" of the phase.

---

## P0.7 Compliance

All UI pages include scenario-aware context:
- GF-01 focus explicitly stated
- Presence-level validation clearly explained
- No semantic correctness claims for GF-02~05

---

## Next Steps

**Phase 5**: Website/Docs minimal mention (link-only)  
**Phase 6**: Final acceptance + Release Note seal

---

**Phase 4: SEALED**
```

### Verification

```bash
# Final gates run
npm run gates 2>&1 | tee phase-4-main-final-gates.log

# Frozen check
git diff --name-only | grep -E "ruleset|contract|strength" || echo "✅ Clean"
```

### Commit M4

```bash
git add -A
git commit -m "docs(phase-4): Add Phase 4 seal report (M4 FINAL)

Phase 4 Main - Commit M4 (Seal):
- P4-8: Phase 4 seal report with full evidence

Documentation:
- Preflight commits and verification
- Main commits (M1-M3)
- Component inventory
- Generator commit SHA explanation
- P0.7 compliance verification
- Final gates output (ALL PASS)

Phase 4: SEALED
Gates: 04-10 ALL PASS
Frozen: CLEAN
Next: Phase 5 (Website/Docs)"
```

---

## Final Checklist

- [ ] P4-1: Generator verified ✅ (Preflight)
- [ ] P4-2: Loader verified ✅ (Preflight)
- [ ] P4-3: /runs index page
- [ ] P4-4: /runs/[run_id] detail pages
- [ ] P4-5: API routes (view/download)
- [ ] P4-6: Provenance ✅ (Preflight)
- [ ] P4-7: GATE-10 ✅ (Preflight)
- [ ] P4-8: Seal report
- [ ] All commits (M1-M4) completed
- [ ] All gates PASS
- [ ] Frozen boundaries CLEAN
- [ ] Production build verified

---

**Phase 4 Main: READY TO EXECUTE**

Follow commits M1 → M2 → M3 → M4, verify gates after each.
