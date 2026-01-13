# Phase 4 Execution Checklist: UI Updates

**Sprint**: Cross-Vendor Evidence Spine v0.1  
**Phase**: 4 — UI Updates (Scenario-aware Projection + Evidence Drilldown)  
**Date**: 2026-01-10  
**Status**: READY TO EXECUTE

---

## Core Principles

1. **SSOT Single Source**: `data/curated-runs/allowlist.yaml` is the ONLY editable source
2. **No Hash Hardcoding**: UI reads from build-time generated `curated-runs.json`
3. **P0.7 Mandatory**: Scenario-aware projection (GF-01 focus + presence-level)
4. **Gate Reuse**: GATE-04/05/06/07 must continue to PASS
5. **New Gate**: GATE-09 prevents hash hardcoding in UI/docs

---

## Task Index

- [x] P4-0: Phase 4 Plan Document
- [ ] P4-1: Build Artifact Generator  
- [ ] P4-2: Typed Loader + Model
- [ ] P4-3: Runs Index Page (`/runs`)
- [ ] P4-4: Run Detail Page (`/runs/[run_id]`)
- [ ] P4-5: Evidence Drilldown Alignment
- [ ] P4-6: SSOT Provenance Footer
- [ ] P4-7: Test Harness
- [ ] P4-8: GATE-09 Implementation

---

## P4-0: Phase 4 Plan Document

### Objective

Establish Phase 4 execution checklist for archival and verification.

### Files to Create

- [x] `.gemini/antigravity/brain/.../phase-4-checklist.md` (this document)

### Acceptance Criteria

- [x] Document contains all P4-1 through P4-8 tasks
- [x] Each task has: files, commands, expected output, PASS criteria
- [x] Three hard constraints documented:
  1. SSOT = allowlist.yaml
  2. No hash hardcoding in UI
  3. P0.7 text mandatory

### Commit

- Message: `docs(phase-4): Add Phase 4 execution checklist`
- Status: ✅ COMPLETE

---

## P4-1: Build Artifact Generator

### Objective

Generate `public/_data/curated-runs.json` from `allowlist.yaml` at build time.

### Files to Create

1. **`scripts/generate-curated-runs.mjs`**

```javascript
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

const ALLOWLIST_PATH = 'data/curated-runs/allowlist.yaml';
const OUTPUT_PATH = 'public/_data/curated-runs.json';

// Read allowlist
const allowlistContent = fs.readFileSync(ALLOWLIST_PATH, 'utf-8');
const allowlist = yaml.load(allowlistContent);

// Get git commit (fallback to 'unknown' if not in git context)
let gitCommit = 'unknown';
try {
  gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch (e) {
  console.warn('Could not get git commit, using "unknown"');
}

// Generate artifact
const artifact = {
  ssot: {
    source: ALLOWLIST_PATH,
    generated_at: new Date().toISOString(),
    git_commit: gitCommit
  },
  runs: allowlist.runs.sort((a, b) => a.run_id.localeCompare(b.run_id))
};

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write artifact
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(artifact, null, 2), 'utf-8');

console.log(`✅ Generated ${OUTPUT_PATH}`);
console.log(`   Runs: ${artifact.runs.length}`);
console.log(`   Commit: ${gitCommit}`);
```

2. **`public/_data/.gitkeep`** (optional, ensures directory exists)

### Files to Modify

**`package.json`**:

```json
{
  "scripts": {
    "generate:curated": "node scripts/generate-curated-runs.mjs",
    "build": "npm run generate:curated && next build",
    "gates": "npm run generate:curated && npm run gate:04 && npm run gate:05 && npm run gate:06 && npm run gate:07"
  }
}
```

### Commands

```bash
# Install yaml dependency if needed
npm install js-yaml

# Generate artifact
npm run generate:curated

# Verify output
cat public/_data/curated-runs.json | jq '.runs | length'
cat public/_data/curated-runs.json | jq '.ssot'
```

### Expected Output

```json
{
  "ssot": {
    "source": "data/curated-runs/allowlist.yaml",
    "generated_at": "2026-01-10T...",
    "git_commit": "c988e71"
  },
  "runs": [
    {
      "run_id": "gf-01-a2a-pass",
      "pack_root_hash": "04b5b65e13c284a0...",
      "verdict_hash": "b1dfcb3adee361ce...",
      ...
    },
    ...
  ]
}
```

### Acceptance Criteria (PASS)

- [ ] `public/_data/curated-runs.json` exists
- [ ] `runs.length === 3`
- [ ] All three `run_id`, `pack_root_hash`, `verdict_hash` match allowlist exactly
- [ ] Script does NOT modify allowlist.yaml (read-only)
- [ ] `npm run build` includes generation step

### Commit

- Message: `feat(phase-4): Add curated runs build artifact generator (P4-1)`
- Files: `scripts/generate-curated-runs.mjs`, `package.json`, `public/_data/.gitkeep`

---

## P4-2: Typed Loader + Normalized Model

### Objective

UI components only read from JSON artifact, never from YAML.

### Files to Create

1. **`lib/curated/types.ts`**

```typescript
export type ClaimLevel = 'declared' | 'reproduced';
export type RulesetVersion = '1.0';

export interface CuratedRunRecord {
  run_id: string;
  scenario_id: string;
  ruleset_version: RulesetVersion;
  substrate: string;
  substrate_claim_level: ClaimLevel;
  repro_ref: string;
  exporter_version: string;
  pack_root_hash: string;
  verdict_hash: string;
  verify_report_hash: string;
  evaluation_report_hash: string;
  status: 'frozen' | 'deprecated';
  indexable: boolean;
  created_at: string;
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

2. **`lib/curated/load-curated-runs.ts`**

```typescript
import fs from 'fs';
import path from 'path';
import type { CuratedRunsArtifact } from './types';

const ARTIFACT_PATH = 'public/_data/curated-runs.json';

export function getCuratedRuns(): CuratedRunsArtifact {
  const fullPath = path.join(process.cwd(), ARTIFACT_PATH);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Curated runs artifact not found. Run: npm run generate:curated`
    );
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content) as CuratedRunsArtifact;
}
```

3. **`lib/curated/ssot.ts`**

```typescript
export const SSOT_SOURCE = 'data/curated-runs/allowlist.yaml';
export const SSOT_DESCRIPTION = 'Single Source of Truth for curated evidence packs';
```

### Commands

```bash
# TypeScript check
npx tsc --noEmit

# Test import
node -e "const {getCuratedRuns} = require('./lib/curated/load-curated-runs.ts'); console.log(getCuratedRuns().runs.length)"
```

### Acceptance Criteria (PASS)

- [ ] TypeScript compilation succeeds
- [ ] `getCuratedRuns()` returns artifact with 3 runs
- [ ] Runs are sorted by `run_id` (stable order)
- [ ] No direct import of YAML parser in these files

### Commit

- Message: `feat(phase-4): Add typed curated runs loader (P4-2)`
- Files: `lib/curated/types.ts`, `lib/curated/load-curated-runs.ts`, `lib/curated/ssot.ts`

---

## P4-3: Runs Index Page (`/runs`)

### Objective

Display curated runs as verifiable list with P0.7 context.

### Files to Create

1. **`app/runs/page.tsx`**

```typescript
import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { CuratedRunsTable } from './_components/CuratedRunsTable';
import { ScenarioAwareBanner } from './_components/ScenarioAwareBanner';

export const metadata = {
  title: 'Curated Runs | MPLP Validation Lab',
  description: 'Vendor-neutral evidence packs for third-party verification'
};

export default function RunsPage() {
  const data = getCuratedRuns();
  
  return (
    <div className="container">
      <h1>Curated Runs</h1>
      
      <ScenarioAwareBanner />
      
      <section>
        <h2>Evidence Packs (v0.1)</h2>
        <p>
          These packs have been verified against frozen ruleset-1.0 and can be 
          independently recomputed using <code>@mplp/recompute</code>.
        </p>
        <CuratedRunsTable runs={data.runs} />
      </section>
      
      <footer className="text-sm text-gray-600 mt-8">
        <p>SSOT: {data.ssot.source} @ {data.ssot.git_commit}</p>
        <p>Generated: {data.ssot.generated_at}</p>
      </footer>
    </div>
  );
}
```

2. **`app/runs/_components/ScenarioAwareBanner.tsx`**

```typescript
export function ScenarioAwareBanner() {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
      <h3 className="font-semibold">Cross-Vendor Evidence Spine v0.1</h3>
      <ul className="mt-2 space-y-1 text-sm">
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
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">Run ID</th>
          <th className="text-left p-2">Substrate</th>
          <th className="text-left p-2">Claim Level</th>
          <th className="text-left p-2">Verdict Hash</th>
          <th className="text-left p-2">Pack Root Hash</th>
          <th className="text-left p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {runs.map(run => (
          <tr key={run.run_id} className="border-b hover:bg-gray-50">
            <td className="p-2">
              <Link href={`/runs/${run.run_id}`} className="text-blue-600 hover:underline">
                {run.run_id}
              </Link>
            </td>
            <td className="p-2">{run.substrate}</td>
            <td className="p-2">
              {run.substrate_claim_level === 'reproduced' ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  Reproduced ✓
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                  Declared
                </span>
              )}
            </td>
            <td className="p-2">
              <HashCell hash={run.verdict_hash} label="verdict" />
            </td>
            <td className="p-2">
              <HashCell hash={run.pack_root_hash} label="pack_root" />
            </td>
            <td className="p-2">
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
  );
}
```

4. **`app/runs/_components/HashCell.tsx`**

```typescript
'use client';

import { useState } from 'react';

export function HashCell({ hash, label }: { hash: string; label: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center gap-2">
      <code className="text-xs bg-gray-100 px-2 py-1 rounded" title={hash}>
        {hash.slice(0, 8)}...
      </code>
      <button
        onClick={handleCopy}
        className="text-xs text-blue-600 hover:underline"
        title={`Copy ${label}_hash`}
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  );
}
```

### Commands

```bash
# Visit page
npm run dev
# Navigate to http://localhost:3002/runs

# Check rendering
curl http://localhost:3002/runs | grep "Curated Runs"

# Verify no forbidden terms
npm run gate:04
npm run gate:05
```

### Acceptance Criteria (PASS)

- [ ] `/runs` page accessible
- [ ] Displays 3 runs
- [ ] ScenarioAwareBanner shows GF-01 focus + presence-level warning
- [ ] Each run shows: run_id (clickable), substrate, claim_level, hashes
- [ ] "Reproduced" badge only for langchain
- [ ] No forbidden terms (GATE-04/05 PASS)
- [ ] Footer shows SSOT source + commit

### Commit

- Message: `feat(phase-4): Add /runs index page with P0.7 banner (P4-3)`
- Files: `app/runs/page.tsx`, `app/runs/_components/*`

---

## P4-4: Run Detail Page (`/runs/[run_id]`)

### Objective

Provide third-party verification panel with evidence pack browser.

### Files to Create

1. **`app/runs/[run_id]/page.tsx`**

```typescript
import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { notFound } from 'next/navigation';
import { RunSummaryCard } from './_components/RunSummaryCard';
import { VerificationPanel } from './_components/VerificationPanel';
import { EvidencePackBrowser } from './_components/EvidencePackBrowser';
import { GovernancePanel } from './_components/GovernancePanel';

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
    <div className="container max-w-4xl">
      <RunSummaryCard run={run} />
      <VerificationPanel run={run} />
      <EvidencePackBrowser runId={run.run_id} />
      <GovernancePanel />
      
      <footer className="text-sm text-gray-600 mt-8">
        <p>SSOT: {data.ssot.source} @ {data.ssot.git_commit}</p>
      </footer>
    </div>
  );
}
```

2. **`app/runs/[run_id]/_components/RunSummaryCard.tsx`**

```typescript
import type { CuratedRunRecord } from '@/lib/curated/types';

export function RunSummaryCard({ run }: { run: CuratedRunRecord }) {
  return (
    <section className="bg-white border rounded-lg p-6 mb-6">
      <h1>{run.run_id}</h1>
      
      <dl className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <dt className="text-sm font-semibold">Substrate</dt>
          <dd>{run.substrate}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold">Claim Level</dt>
          <dd>
            {run.substrate_claim_level === 'reproduced' ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Reproduced ✓
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                Declared
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold">Scenario</dt>
          <dd>{run.scenario_id}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold">Ruleset</dt>
          <dd>ruleset-{run.ruleset_version} (presence-level)</dd>
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
      <h2>Third-Party Verification</h2>
      
      <p className="text-sm text-gray-600 mb-4">
        Anyone can independently verify this verdict using the recompute CLI:
      </p>
      
      <div className="bg-gray-900 text-white p-4 rounded font-mono text-sm mb-4">
        <code>{recomputeCmd}</code>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-2">Expected Output</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-xs text-gray-600">verdict_hash</dt>
            <dd className="font-mono text-sm bg-gray-100 p-2 rounded">
              {run.verdict_hash}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-600">pack_root_hash</dt>
            <dd className="font-mono text-sm bg-gray-100 p-2 rounded">
              {run.pack_root_hash}
            </dd>
          </div>
        </dl>
      </div>
      
      {run.substrate_claim_level === 'reproduced' && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
          <h3 className="font-semibold">Reproduction Available</h3>
          <p className="text-sm mt-1">
            Full reproduction steps: <a href={run.repro_ref} className="text-blue-600 hover:underline">
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
      <h2>Evidence Pack (7 files)</h2>
      
      <ul className="mt-4 space-y-2">
        {files.map(file => (
          <li key={file} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <code className="text-sm">{file}</code>
            <div className="flex gap-2">
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
    <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
      <h2>Governance & Guarantees</h2>
      
      <div className="space-y-4 text-sm mt-4">
        <div>
          <h3 className="font-semibold">v0.1 Scenario Focus</h3>
          <p>
            This spine validates <strong>GF-01: Single Agent Lifecycle</strong>.
            While ruleset-1.0 checks GF-02~05, these checks are presence-level only.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold">Presence-Level Validation</h3>
          <p>
            ruleset-1.0 verifies artifact <em>presence</em>, not semantic correctness.
            A "PASS" for GF-02~05 indicates required files exist, not that they are semantically valid for those flows.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold">No Execution Hosting</h3>
          <p>
            The Lab does NOT execute agent code. All evidence generation occurs in third-party environments.
          </p>
        </div>
      </div>
    </section>
  );
}
```

### Commands

```bash
# Visit detail pages
http://localhost:3002/runs/gf-01-langchain-pass
http://localhost:3002/runs/gf-01-a2a-pass
http://localhost:3002/runs/gf-01-mcp-pass

# Check for P0.7 text
curl http://localhost:3002/runs/gf-01-langchain-pass | grep "presence-level"
curl http://localhost:3002/runs/gf-01-langchain-pass | grep "GF-01"

# Verify gates
npm run gate:04
npm run gate:05
```

### Acceptance Criteria (PASS)

- [ ] All 3 detail pages accessible
- [ ] `gf-01-langchain-pass` shows "Reproduced ✓" + repro link
- [ ] `gf-01-a2a-pass` shows "Declared" (no repro link)
- [ ] VerificationPanel shows correct recompute command
- [ ] VerificationPanel shows expected verdict_hash and pack_root_hash from allowlist
- [ ] EvidencePackBrowser lists exactly 7 files
- [ ] GovernancePanel shows P0.7 text (GF-01 focus + presence-level)
- [ ] No forbidden terms (GATE-04/05 PASS)

### Commit

- Message: `feat(phase-4): Add /runs/[run_id] detail pages with verification panel (P4-4)`
- Files: `app/runs/[run_id]/page.tsx`, `app/runs/[run_id]/_components/*`

---

## P4-5: Evidence Drilldown Alignment

### Objective

Ensure evidence file preview/download works from detail pages.

### Files to Check/Modify

- Existing: `app/api/runs/[run_id]/files/[...path]/route.ts` (if from Phase H)
- Existing: `app/api/runs/[run_id]/download/[...path]/route.ts` (if from Phase H)

### Actions

If APIs exist:
- [ ] Verify they work for new run_ids (gf-01-a2a-pass, etc.)
- [ ] Test file preview links

If APIs don't exist:
- [ ] Create minimal file server APIs for /api/runs/[run_id]/files and /download

### Commands

```bash
# Test file access
curl http://localhost:3002/api/runs/gf-01-langchain-pass/files/manifest.json

# Test download
curl -I http://localhost:3002/api/runs/gf-01-langchain-pass/download/manifest.json
```

### Acceptance Criteria (PASS)

- [ ] All 7 files accessible via View/Download links
- [ ] No 404 errors on file requests
- [ ] Download headers correct (Content-Disposition: attachment)

### Commit

- Message: `fix(phase-4): Align evidence drilldown for curated runs (P4-5)`
- Files: (depends on existing implementation)

---

## P4-6: SSOT Provenance Footer

### Objective

Every page displays SSOT source + generation metadata.

### Files to Create

**`components/ProvenanceFooter.tsx`** (or in `app/runs/_components/`)

```typescript
import { getCuratedRuns } from '@/lib/curated/load-curated-runs';

export function ProvenanceFooter() {
  const data = getCuratedRuns();
  
  return (
    <footer className="mt-8 pt-4 border-t text-sm text-gray-600">
      <div className="flex items-center gap-4">
        <span>
          <strong>SSOT:</strong> <code>{data.ssot.source}</code>
        </span>
        <span>
          <strong>Commit:</strong> <code>{data.ssot.git_commit}</code>
        </span>
        <span>
          <strong>Generated:</strong> {new Date(data.ssot.generated_at).toLocaleString()}
        </span>
      </div>
    </footer>
  );
}
```

### Files to Modify

- Update `app/runs/page.tsx` and `app/runs/[run_id]/page.tsx` to use `<ProvenanceFooter />`

### Acceptance Criteria (PASS)

- [ ] Footer appears on `/runs` and all `/runs/[run_id]` pages
- [ ] Shows correct SSOT path, commit, timestamp

### Commit

- Message: `feat(phase-4): Add SSOT provenance footer (P4-6)`
- Files: `components/ProvenanceFooter.tsx`, updated page files

---

## P4-7: Test Harness

### Objective

Lock down critical invariants with minimal tests.

### Files to Create

1. **`lib/curated/__tests__/curated-runs-artifact.test.ts`**

```typescript
import { getCuratedRuns } from '../load-curated-runs';

describe('Curated Runs Artifact', () => {
  it('should have exactly 3 runs', () => {
    const data = getCuratedRuns();
    expect(data.runs).toHaveLength(3);
  });
  
  it('should have all required run_ids', () => {
    const data = getCuratedRuns();
    const runIds = data.runs.map(r => r.run_id);
    expect(runIds).toContain('gf-01-a2a-pass');
    expect(runIds).toContain('gf-01-langchain-pass');
    expect(runIds).toContain('gf-01-mcp-pass');
  });
  
  it('should have valid 64-char hex hashes', () => {
    const data = getCuratedRuns();
    const hexPattern = /^[0-9a-f]{64}$/;
    
    data.runs.forEach(run => {
      expect(run.verdict_hash).toMatch(hexPattern);
      expect(run.pack_root_hash).toMatch(hexPattern);
    });
  });
});
```

2. **`lib/curated/__tests__/no-ssot-drift.test.ts`**

```typescript
import fs from 'fs';
import path from 'path';

describe('SSOT Drift Prevention', () => {
  it('should not read allowlist.yaml directly in UI code', () => {
    const appDir = path.join(process.cwd(), 'app');
    const componentsDir = path.join(process.cwd(), 'components');
    
    const searchDirs = [appDir, componentsDir].filter(d => fs.existsSync(d));
    
    for (const dir of searchDirs) {
      const files = getAllTsxFiles(dir);
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).not.toContain('allowlist.yaml');
      }
    }
  });
});

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      files.push(...getAllTsxFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}
```

### Commands

```bash
# Run tests
npm test

# Or if using specific test runner
npx jest lib/curated
```

### Acceptance Criteria (PASS)

- [ ] All tests pass
- [ ] Tests fail if curated-runs.json is missing
- [ ] Tests fail if app/ code imports allowlist.yaml

### Commit

- Message: `test(phase-4): Add curated runs test harness (P4-7)`
- Files: `lib/curated/__tests__/*`

---

## P4-8: GATE-09 Implementation

### Objective

Prevent hash hardcoding in UI/docs via automated gate.

### Files to Create

**`lib/gates/gate-09-ssot-projection.ts`**

```typescript
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

interface Gate09Result {
  passed: boolean;
  filesScanned: number;
  matches: Match[];
}

interface Match {
  file: string;
  line: number;
  content: string;
  term: string;
}

const SCAN_DIRS = ['app', 'components', 'lib', 'docs'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'coverage', '.git'];
const ALLOWLIST_PATHS = [
  'data/curated-runs/allowlist.yaml',
  'public/_data/curated-runs.json',
  'phase-3-seal.md',
  'governance/preflight'
];

const FORBIDDEN_PATTERNS = [
  { term: 'verdict_hash:', pattern: /verdict_hash:\s*["']?[a-f0-9]{64}/ },
  { term: 'pack_root_hash:', pattern: /pack_root_hash:\s*["']?[a-f0-9]{64}/ },
  { term: '64-hex-literal', pattern: /\b[a-f0-9]{64}\b/ }
];

function runGate09(): Gate09Result {
  const matches: Match[] = [];
  let filesScanned = 0;
  
  for (const dir of SCAN_DIRS) {
    if (!fs.existsSync(dir)) continue;
    scanDirectory(dir, matches);
  }
  
  function scanDirectory(dirPath: string, matches: Match[]) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry.name)) {
          scanDirectory(fullPath, matches);
        }
      } else if (entry.isFile()) {
        // Check if in allowlist
        if (ALLOWLIST_PATHS.some(allowed => fullPath.includes(allowed))) {
          continue;
        }
        
        // Scan file
        if (fullPath.match(/\.(ts|tsx|js|jsx|md|mdx)$/)) {
          filesScanned++;
          scanFile(fullPath, matches);
        }
      }
    }
  }
  
  function scanFile(filePath: string, matches: Match[]) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      for (const { term, pattern } of FORBIDDEN_PATTERNS) {
        if (pattern.test(line)) {
          matches.push({
            file: filePath,
            line: index + 1,
            content: line.trim().slice(0, 100),
            term
          });
        }
      }
    });
  }
  
  return {
    passed: matches.length === 0,
    filesScanned,
    matches: matches.slice(0, 20) // Limit output
  };
}

// CLI
if (require.main === module) {
  const result = runGate09();
  
  console.log('='.repeat(60));
  console.log('GATE-09: SSOT Projection Guard');
  console.log('='.repeat(60));
  console.log(`\nFiles scanned: ${result.filesScanned}`);
  
  if (result.passed) {
    console.log('\n✅ GATE-09 PASSED (no hash hardcoding detected)');
    process.exit(0);
  } else {
    console.log(`\n❌ GATE-09 FAILED (${result.matches.length} violations)\n`);
    
    for (const match of result.matches) {
      console.log(`  - ${match.file}:${match.line} [${match.term}]`);
      console.log(`    ${match.content}`);
    }
    
    console.log('\nFix: Remove hardcoded hashes; read from curated-runs.json artifact.');
    process.exit(1);
  }
}

export { runGate09 };
```

### Files to Modify

**`package.json`**:

```json
{
  "scripts": {
    "gate:09": "tsx lib/gates/gate-09-ssot-projection.ts",
    "gates": "npm run generate:curated && npm run gate:04 && npm run gate:05 && npm run gate:06 && npm run gate:07 && npm run gate:09"
  }
}
```

### Commands

```bash
# Test GATE-09
npm run gate:09

# Test failure case (add a 64-hex to app/test.tsx, then run gate:09)
echo "const hash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';" > app/test-hash.tsx
npm run gate:09
# Should FAIL

# Clean up
rm app/test-hash.tsx
npm run gate:09
# Should PASS

# Run all gates
npm run gates
```

### Acceptance Criteria (PASS)

- [ ] GATE-09 PASS when no hardcoded hashes in app/components/lib/docs
- [ ] GATE-09 FAIL when 64-hex appears in non-allowlisted files
- [ ] allowlist.yaml, curated-runs.json, phase-3-seal.md are exempted
- [ ] `npm run gates` includes GATE-09

### Commit

- Message: `feat(phase-4): Add GATE-09 SSOT projection guard (P4-8)`
- Files: `lib/gates/gate-09-ssot-projection.ts`, `package.json`

---

## Phase 4 Final Verification

### All Gates Must PASS

```bash
npm run gates
```

**Expected**:
- GATE-04: PASS
- GATE-05: PASS
- GATE-06: PASS
- GATE-07: PASS
- GATE-09: PASS

### Frozen Boundaries Check

```bash
git diff --name-only | grep -E "data/rulesets/ruleset-1.0|app/policies/contract|app/policies/strength"
```

**Expected**: (empty)

### UI Functional Check

- [ ] `/runs` displays 3 curated runs
- [ ] `/runs/gf-01-langchain-pass` shows reproduced status
- [ ] Verification panel shows correct recompute command
- [ ] Evidence pack browser lists 7 files
- [ ] P0.7 text visible on all pages
- [ ] Provenance footer shows SSOT metadata

---

## Phase 4 Seal

### Final Commit

```bash
git add -A
git commit -m "feat(phase-4): Complete UI updates with SSOT projection

Phase 4 deliverables:
- Build-time curated-runs.json generator from allowlist.yaml
- Typed loader (read-only JSON, never YAML)
- /runs index page with ScenarioAwareBanner (P0.7)
- /runs/[run_id] detail pages with verification panel
- EvidencePackBrowser (7 files)
- GovernancePanel (GF-01 focus + presence-level)
- ProvenanceFooter (SSOT metadata)
- GATE-09: prevents hash hardcoding

All gates PASS (04, 05, 06, 07, 09)
Frozen boundaries intact
No SSOT drift

Phase 4: COMPLETE"
```

### Status

- [ ] All P4-1 through P4-8 tasks complete
- [ ] All gates PASS
- [ ] Frozen boundaries clean
- [ ] Ready for Phase 6 (Final Acceptance + Release Note)

---

**Phase 4: READY FOR EXECUTION**

Execute tasks P4-1 through P4-8 sequentially, commit after each task, verify gates continuously.
