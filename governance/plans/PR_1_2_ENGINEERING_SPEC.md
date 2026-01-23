---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-014"
---

# PR-1 & PR-2 Engineering Specification — Code-Level Implementation Guide

**Document ID**: VLAB-ENG-PR12-SPEC-01  
**Status**: Engineering Specification  
**Date**: 2026-01-17  
**Purpose**: Precise file paths, function signatures, and type definitions for PR-1 and PR-2

---

## Frozen Engineering Constraints (From Gap Analysis Review)

1. **V02-G2 B1 Compatibility**: B1 validity = JSON parseable + `run_id` exists (map from legacy if needed)
2. **Only fix allowlist runs**: ABMC completion only targets runs in `allowlist.yaml`
3. **Parallel not replace**: Add `loadRunBundle` as new function; `loadRun` remains unchanged

---

# PR-1: Ruleset Loader Extension + Registry

## 1.1 File: `lib/rulesets/loadRuleset.ts` (EXTEND)

### Current Interface (DO NOT BREAK)
```typescript
export interface RulesetManifest {
    id: string;
    version: string;
    name: string;
    status: string;
    protocol?: { version: string; upstream_commit?: string; };
    compatibility?: { ... };
    golden_flows: string[];      // ← KEEP
    created_at?: string;
}
```

### Extended Interface (ADD)
```typescript
export interface RulesetManifest {
    // ... existing fields unchanged ...
    golden_flows: string[];
    
    // NEW: v0.3 four-domain clauses (optional for backward compat)
    four_domain_clauses?: string[];  // e.g., ["CL-D1-01", "CL-D2-01", ...]
}
```

### Implementation Change
Line ~100 in `loadRuleset()`: No change needed if YAML loader is generic.
Just ensure `manifest.yaml` is read with `four_domain_clauses` field.

---

## 1.2 File: `lib/rulesets/registry.ts` (NEW)

```typescript
/**
 * Ruleset Registry
 * 
 * Maps ruleset IDs to their adjudicators.
 * Supports both ruleset-1.0 (GoldenFlow) and ruleset-1.1 (Four-Domain).
 */

import { loadRuleset, RulesetManifest, RulesetData } from './loadRuleset';
import type { RunBundle } from '@/lib/bundles/types';

// Re-export for convenience
export { RulesetManifest, RulesetData };

// =============================================================================
// Registry Types
// =============================================================================

/**
 * Result structure from ruleset evaluation.
 * This is the output contract for all adjudicators.
 */
export interface RulesetEvalResult {
    ruleset_id: string;
    run_id: string;
    evaluated_at: string;
    clauses: ClauseResult[];
    topline_verdict: string;
}

export interface ClauseResult {
    clause_id: string;
    requirement_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';
    reason_code?: string;
    evidence_refs?: Array<{ pointer: unknown; resolved: 'event' | 'snapshot' | 'none' }>;
    notes?: string[];
}

export interface RegisteredRuleset {
    id: string;
    manifest: RulesetManifest;
    /** Adjudicator function (null if not implemented) */
    adjudicator: AdjudicatorFn | null;
}

/** 
 * Typed adjudicator signature.
 * All adjudicators take RunBundle and return RulesetEvalResult.
 */
export type AdjudicatorFn = (bundle: RunBundle) => Promise<RulesetEvalResult>;

// =============================================================================
// Registry Implementation
// =============================================================================

const SUPPORTED_RULESETS = ['ruleset-1.0', 'ruleset-1.1'] as const;
type SupportedRulesetId = typeof SUPPORTED_RULESETS[number];

// Manifest cache to avoid repeated file I/O
const manifestCache = new Map<string, RulesetManifest>();

/** 
 * Check if a ruleset ID is supported.
 */
export function isSupportedRuleset(id: string): id is SupportedRulesetId {
    return SUPPORTED_RULESETS.includes(id as SupportedRulesetId);
}

/**
 * Get a registered ruleset by ID.
 * Returns null if ruleset not found or not loadable.
 * Uses caching to avoid repeated disk reads.
 */
export async function getRuleset(id: string): Promise<RegisteredRuleset | null> {
    if (!isSupportedRuleset(id)) {
        return null;
    }

    // Check cache first
    let manifest = manifestCache.get(id);
    if (!manifest) {
        const data = loadRuleset(id);
        if (!data.manifest) {
            return null;
        }
        manifest = data.manifest;
        manifestCache.set(id, manifest);
    }

    return {
        id,
        manifest,
        adjudicator: await getAdjudicator(id),
    };
}

/**
 * List all available rulesets.
 */
export async function listRegisteredRulesets(): Promise<RegisteredRuleset[]> {
    const results: RegisteredRuleset[] = [];
    for (const id of SUPPORTED_RULESETS) {
        const ruleset = await getRuleset(id);
        if (ruleset) {
            results.push(ruleset);
        }
    }
    return results;
}

/**
 * Clear manifest cache (for testing).
 */
export function clearManifestCache(): void {
    manifestCache.clear();
}

// =============================================================================
// Adjudicator Mapping (Lazy-loaded)
// =============================================================================

async function getAdjudicator(id: SupportedRulesetId): Promise<AdjudicatorFn | null> {
    switch (id) {
        case 'ruleset-1.0':
            // GoldenFlow adjudicator (existing, if exposed)
            return null; // TODO: wire to existing evaluateGoldenFlows
        case 'ruleset-1.1':
            // Four-domain adjudicator (PR-5 will implement)
            // Dynamic import when implemented:
            // const { adjudicateRuleset11 } = await import('./ruleset-1.1/adjudicate');
            // return adjudicateRuleset11;
            return null; // Placeholder until PR-5
        default:
            return null;
    }
}
```

---

## 1.3 Verification Criteria (PR-1)

```bash
# Test 1: Registry can load both rulesets (async)
node -e "
(async () => {
  const { getRuleset } = require('./lib/rulesets/registry');
  const r10 = await getRuleset('ruleset-1.0');
  const r11 = await getRuleset('ruleset-1.1');
  console.log('ruleset-1.0:', r10?.manifest?.golden_flows);
  console.log('ruleset-1.1:', r11?.manifest?.four_domain_clauses);
})();
"
# Expected: both non-null, golden_flows/four_domain_clauses arrays printed

# Test 2: Unknown ruleset returns null (async)
node -e "
(async () => {
  const { getRuleset } = require('./lib/rulesets/registry');
  console.log(await getRuleset('unknown'));
})();
"
# Expected: null

# Test 3: AdjudicatorFn signature is typed
node -e "
const { RulesetEvalResult } = require('./lib/rulesets/registry');
console.log('RulesetEvalResult type exported:', typeof RulesetEvalResult !== 'undefined' || 'type-only');
"
# Expected: type-only (TypeScript types not available at runtime, but compilation should succeed)
```

---

# PR-2: RunBundle Type + Loader (Parallel to loadRun)

## 2.1 File: `lib/bundles/types.ts` (NEW) — **INTERNAL SSOT**

> **Core Principle**: Only one internal structure (NormalizedVerdict) exists in the codebase. Legacy formats are mapped at the loader entry point.
> UI, Gate, and Evaluator always see NormalizedVerdict only — no branching logic required.

```typescript
/**
 * RunBundle Types — Internal SSOT
 * 
 * All downstream code (UI, Gate, Evaluator) ONLY sees these types.
 * Legacy format mapping happens ONLY in loader.
 */

// =============================================================================
// Load Status
// =============================================================================

export interface LoadStatus {
    b1_verdict: 'ok' | 'missing' | 'invalid';
    b2_manifest: 'ok' | 'missing' | 'invalid';
    b3_integrity: 'ok' | 'missing' | 'invalid';
    b4_pointers: 'ok' | 'missing' | 'invalid';
    pack: 'ok' | 'missing' | 'partial';
    /** True if B1 was mapped from legacy format */
    b1_was_legacy: boolean;
}

export interface LoadError {
    artifact: 'B1' | 'B2' | 'B3' | 'B4' | 'pack';
    code: string;
    message: string;
    path?: string;
}

// =============================================================================
// Bundle Manifest (B2)
// =============================================================================

export interface BundleManifest {
    run_id: string;
    pack_root: string;
    ruleset_ref: string;
    protocol_pin: string;
    schema_bundle_sha256: string;
    hash_scope: string[];
    reason_code: string | null;
    scenario_meta?: ScenarioMeta;
}

export interface ScenarioMeta {
    privileged_action?: boolean;
    termination_case?: boolean;
}

// =============================================================================
// Evidence Pointers (B4)
// =============================================================================

export interface EvidencePointers {
    pointers: EvidencePointer[];
}

export interface EvidencePointer {
    requirement_id: string;
    artifact_path: string;
    locator: string;
    status: 'PRESENT' | 'ABSENT' | 'NOT_EVALUATED';
}

// =============================================================================
// NormalizedVerdict (B1) — The Only Internal Structure
// =============================================================================

/**
 * THE ONLY VERDICT STRUCTURE seen by evaluator/gate/UI.
 * Legacy disk format is mapped to this at load time.
 */
export interface NormalizedVerdict {
    run_id: string;
    scenario_id: string;
    admission: 'ADMISSIBLE' | 'NOT_ADMISSIBLE' | 'UNKNOWN';
    
    // GoldenFlow verdicts (from legacy/ruleset-1.0)
    gf_verdicts: GoldenFlowVerdict[];
    
    // Domain verdicts (from ruleset-1.1+)
    domain_verdicts: DomainVerdict[];
    
    // Unified topline (PASS | FAIL | NOT_ADMISSIBLE | ...)
    topline: string;
    
    // Version pins
    versions: {
        protocol: string;
        schema: string;
        ruleset: string;
    };
    
    evaluated_at: string;
    
    // Reason code (for non-PASS, from bundle.manifest or derived)
    reason_code: string | null;
}

export interface GoldenFlowVerdict {
    gf_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';
    coverage: { total: number; passed: number; failed: number; not_evaluated: number };
    pointers: Array<{
        artifact_path: string;
        locator: string;
        requirement_id: string;
        content_hash?: string;
    }>;
}

export interface DomainVerdict {
    domain: 'D1' | 'D2' | 'D3' | 'D4';
    clause_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';
    reason_code?: string;
    evidence_refs?: Array<{ pointer: EvidencePointer; resolved: 'event' | 'snapshot' | 'none' }>;
}

// =============================================================================
// NOTE: Legacy parsing types and mapping functions are in normalize.ts
// This keeps types.ts focused on type definitions only.
// =============================================================================
```

---

## 2.2 File: `lib/bundles/normalize.ts` (NEW)

> **Review Patch #2**: Extracted from types.ts to prevent "type file becomes logic file" anti-pattern.
> This file contains all legacy → NormalizedVerdict mapping logic.

```typescript
/**
 * Verdict Normalization
 * 
 * Maps legacy disk verdict format to NormalizedVerdict.
 * This is the ONLY place legacy format parsing happens.
 * All downstream code sees NormalizedVerdict only.
 */

import type {
    NormalizedVerdict,
    GoldenFlowVerdict,
    DomainVerdict,
} from './types';

// =============================================================================
// Legacy Format (internal parsing only)
// =============================================================================

/** @internal - Only used for parsing legacy verdict.json */
interface LegacyVerdictDisk {
    run_id?: string;
    scenario_id?: string;
    admission?: string;
    gf_verdicts?: Array<{
        gf_id: string;
        status: string;
        coverage?: { total: number; passed: number; failed: number; not_evaluated: number };
        pointers?: Array<{ artifact_path: string; locator: string; requirement_id: string; content_hash?: string }>;
    }>;
    versions?: { protocol?: string; schema?: string; ruleset?: string };
    evaluated_at?: string;
    topline?: string;
    domain_verdicts?: DomainVerdict[];
}

// =============================================================================
// Normalization Helpers
// =============================================================================

function normalizeAdmission(s?: string): 'ADMISSIBLE' | 'NOT_ADMISSIBLE' | 'UNKNOWN' {
    const upper = String(s ?? '').toUpperCase();
    if (upper === 'ADMISSIBLE') return 'ADMISSIBLE';
    if (upper === 'NOT_ADMISSIBLE') return 'NOT_ADMISSIBLE';
    return 'UNKNOWN';
}

function normalizeStatus(s: string): 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE' {
    const upper = String(s ?? '').toUpperCase();
    if (upper === 'PASS') return 'PASS';
    if (upper === 'FAIL') return 'FAIL';
    if (upper === 'NOT_ADMISSIBLE') return 'NOT_ADMISSIBLE';
    return 'NOT_EVALUATED';
}

/**
 * Derive topline from normalized verdicts.
 * IMPORTANT: This uses NORMALIZED gf_verdicts, not raw, to avoid case/enum drift.
 */
function deriveTopline(
    admission: NormalizedVerdict['admission'],
    gfVerdicts: GoldenFlowVerdict[],
    rawTopline?: string
): string {
    // If topline exists in raw (ABMC format), use it directly
    if (rawTopline) return rawTopline;
    
    // Derive from admission
    if (admission === 'NOT_ADMISSIBLE') return 'NOT_ADMISSIBLE';
    if (admission === 'UNKNOWN') return 'UNKNOWN';
    
    // Derive from normalized gf_verdicts
    if (gfVerdicts.length === 0) return 'UNKNOWN';
    if (gfVerdicts.some(g => g.status === 'FAIL')) return 'FAIL';
    if (gfVerdicts.every(g => g.status === 'PASS')) return 'PASS';
    return 'PARTIAL';
}

// =============================================================================
// Main Mapping Function
// =============================================================================

/**
 * Map any disk verdict (legacy or ABMC) to NormalizedVerdict.
 * This is the single normalization entry point.
 * 
 * @param raw - Raw parsed JSON from verdict.json
 * @param runId - Fallback run_id from directory name
 * @returns Normalized verdict structure
 */
export function mapToNormalizedVerdict(
    raw: Record<string, unknown>,
    runId: string
): NormalizedVerdict {
    const legacyRaw = raw as LegacyVerdictDisk;
    
    // Normalize admission first
    const admission = normalizeAdmission(legacyRaw.admission);
    
    // Normalize GF verdicts
    const gfVerdicts: GoldenFlowVerdict[] = (legacyRaw.gf_verdicts || []).map(gf => ({
        gf_id: gf.gf_id,
        status: normalizeStatus(gf.status),
        coverage: gf.coverage || { total: 0, passed: 0, failed: 0, not_evaluated: 0 },
        pointers: gf.pointers || [],
    }));
    
    // Derive topline AFTER normalization (Review Patch #3)
    const topline = deriveTopline(admission, gfVerdicts, legacyRaw.topline);
    
    return {
        run_id: legacyRaw.run_id || runId,
        scenario_id: legacyRaw.scenario_id || 'unknown',
        admission,
        gf_verdicts: gfVerdicts,
        domain_verdicts: legacyRaw.domain_verdicts || [],
        topline,
        versions: {
            protocol: legacyRaw.versions?.protocol || 'unknown',
            schema: legacyRaw.versions?.schema || 'unknown',
            ruleset: legacyRaw.versions?.ruleset || 'unknown',
        },
        evaluated_at: legacyRaw.evaluated_at || new Date().toISOString(),
        reason_code: null, // Legacy doesn't have this; populated from bundle.manifest if needed
    };
}

// =============================================================================
// Pack Structure
// =============================================================================

export interface Pack {
    root: string;
    trace?: TraceData;
    snapshots?: SnapshotData[];
}

export interface TraceData {
    events: Event[];
    raw_path: string;
}

export interface Event {
    event_id: string;
    event_type: string;
    timestamp: string;
    [key: string]: unknown;  // Domain-specific fields
}

export interface SnapshotData {
    snapshot_id: string;
    path: string;
    data: Record<string, unknown>;
}

// =============================================================================
// RunBundle (Main Structure)
// =============================================================================

export interface RunBundle {
    run_id: string;
    
    // ABMC Four-piece set (B1 is always NormalizedVerdict internally)
    verdict: NormalizedVerdict | null;      // B1 - ALWAYS normalized, never legacy
    bundle_manifest: BundleManifest | null; // B2
    integrity_hash_path: string | null;     // B3 path
    evidence_pointers: EvidencePointers | null; // B4
    
    // Pack contents
    pack: Pack | null;
    
    // Loading metadata
    load_status: LoadStatus;
    load_errors: LoadError[];
    
    // Ruleset reference (from B2 or legacy manifest)
    ruleset_ref?: string;
}
```

---

## 2.3 File: `lib/bundles/load_run_bundle.ts` (NEW)

```typescript
/**
 * RunBundle Loader
 * 
 * Loads runs into ABMC-compliant RunBundle structure.
 * Supports both legacy GF runs and new v0.3 runs.
 * 
 * DOES NOT REPLACE loadRun.ts - parallel implementation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { mapToNormalizedVerdict } from './normalize';
import type {
    RunBundle,
    NormalizedVerdict,
    BundleManifest,
    EvidencePointers,
    Pack,
    TraceData,
    Event,
    LoadStatus,
    LoadError,
} from './types';

const RUNS_ROOT = path.resolve(process.cwd(), 'data/runs');

// =============================================================================
// Path Safety
// =============================================================================

const SAFE_RUN_ID_PATTERN = /^[a-z0-9._-]+$/i;

function isValidRunId(runId: string): boolean {
    if (!runId || runId.includes('..') || runId.includes('/') || runId.includes('\\')) {
        return false;
    }
    return SAFE_RUN_ID_PATTERN.test(runId);
}

// =============================================================================
// JSON Helpers (Review Patch #4: distinguish missing vs invalid)
// =============================================================================

interface JsonReadResult<T> {
    ok: true;
    data: T;
} | {
    ok: false;
    reason: 'missing' | 'invalid';
    error: string;
}

function readJsonSafe<T>(filePath: string): JsonReadResult<T> {
    try {
        if (!fs.existsSync(filePath)) {
            return { ok: false, reason: 'missing', error: 'File not found' };
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content) as T;
        return { ok: true, data };
    } catch (e) {
        // File exists but parse failed = invalid (not missing)
        return { 
            ok: false, 
            reason: 'invalid', 
            error: e instanceof Error ? e.message : 'Parse error' 
        };
    }
}

// =============================================================================
// NDJSON Parser
// =============================================================================

function parseNdjson(filePath: string): Event[] {
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    const events: Event[] = [];
    for (const line of lines) {
        try {
            events.push(JSON.parse(line));
        } catch {
            // Skip invalid lines
        }
    }
    return events;
}

// =============================================================================
// Main Loader
// =============================================================================

export function loadRunBundle(runId: string): RunBundle {
    // Initialize result
    const result: RunBundle = {
        run_id: runId,
        verdict: null,
        bundle_manifest: null,
        integrity_hash_path: null,
        evidence_pointers: null,
        pack: null,
        load_status: {
            b1_verdict: 'missing',
            b2_manifest: 'missing',
            b3_integrity: 'missing',
            b4_pointers: 'missing',
            pack: 'missing',
            b1_was_legacy: false,
        },
        load_errors: [],
    };

    // Path safety check
    if (!isValidRunId(runId)) {
        result.load_errors.push({
            artifact: 'B1',
            code: 'INVALID-RUN-ID',
            message: `Invalid run_id: ${runId}`,
        });
        return result;
    }

    const base = path.join(RUNS_ROOT, runId);
    if (!fs.existsSync(base)) {
        result.load_errors.push({
            artifact: 'B1',
            code: 'RUN-NOT-FOUND',
            message: `Run directory not found: ${runId}`,
            path: base,
        });
        return result;
    }

    // =========================================================================
    // B1: verdict.json → ALWAYS normalize to NormalizedVerdict
    // Review Patch #1: All verdicts go through normalize (not just legacy)
    // =========================================================================
    const verdictPath = path.join(base, 'verdict.json');
    const verdictResult = readJsonSafe<unknown>(verdictPath);
    
    if (verdictResult.ok) {
        const raw = verdictResult.data as Record<string, unknown>;
        
        // All verdicts go through normalization (Review Patch #1)
        // This ensures consistent structure regardless of disk format
        result.verdict = mapToNormalizedVerdict(raw, runId);
        result.load_status.b1_verdict = 'ok';
        
        // Track if it came from legacy format (no topline + domain_verdicts)
        const hadABMCFields = 'topline' in raw && 'domain_verdicts' in raw;
        result.load_status.b1_was_legacy = !hadABMCFields;
    } else {
        // Review Patch #4: Properly distinguish missing vs invalid
        result.load_status.b1_verdict = verdictResult.reason; // 'missing' or 'invalid'
        result.load_status.b1_was_legacy = false;
        
        const code = verdictResult.reason === 'invalid' 
            ? 'BUNDLE-INVALID-B1' 
            : 'BUNDLE-MISSING-B1';
        
        result.load_errors.push({
            artifact: 'B1',
            code,
            message: verdictResult.error,
            path: verdictPath,
        });
    }

    // =========================================================================
    // B2: bundle.manifest.json (NEW - may not exist for legacy runs)
    // =========================================================================
    const bundleManifestPath = path.join(base, 'bundle.manifest.json');
    const bundleResult = readJsonSafe<BundleManifest>(bundleManifestPath);
    
    if (bundleResult.ok) {
        result.bundle_manifest = bundleResult.data;
        result.load_status.b2_manifest = 'ok';
        result.ruleset_ref = bundleResult.data.ruleset_ref;
    } else {
        // Use reason field to determine missing vs invalid
        result.load_status.b2_manifest = bundleResult.reason;
        if (bundleResult.reason === 'invalid') {
            result.load_errors.push({
                artifact: 'B2',
                code: 'BUNDLE-INVALID-B2',
                message: bundleResult.error,
                path: bundleManifestPath,
            });
        }
        // 'missing' is not an error for legacy runs
    }

    // =========================================================================
    // B3: integrity/sha256sums.txt
    // =========================================================================
    const integrityPath = path.join(base, 'integrity', 'sha256sums.txt');
    if (fs.existsSync(integrityPath)) {
        result.integrity_hash_path = integrityPath;
        result.load_status.b3_integrity = 'ok';
    } else {
        result.load_status.b3_integrity = 'missing';
        result.load_errors.push({
            artifact: 'B3',
            code: 'BUNDLE-MISSING-B3',
            message: 'sha256sums.txt not found',
            path: integrityPath,
        });
    }

    // =========================================================================
    // B4: evidence_pointers.json (NEW - may not exist for legacy runs)
    // =========================================================================
    const pointersPath = path.join(base, 'evidence_pointers.json');
    const pointersResult = readJsonSafe<EvidencePointers>(pointersPath);
    
    if (pointersResult.ok) {
        result.evidence_pointers = pointersResult.data;
        result.load_status.b4_pointers = 'ok';
    } else {
        // Use reason field to determine missing vs invalid
        result.load_status.b4_pointers = pointersResult.reason;
        if (pointersResult.reason === 'invalid') {
            result.load_errors.push({
                artifact: 'B4',
                code: 'BUNDLE-INVALID-B4',
                message: pointersResult.error,
                path: pointersPath,
            });
        }
        // 'missing' is not an error for legacy runs
    }

    // =========================================================================
    // Pack: Load trace events
    // =========================================================================
    const packRoot = result.bundle_manifest?.pack_root 
        ? path.join(base, result.bundle_manifest.pack_root)
        : base;  // Legacy: pack is at run root
    
    // Try multiple possible event locations
    const eventPaths = [
        path.join(packRoot, 'trace', 'events.ndjson'),
        path.join(base, 'timeline', 'events.ndjson'),  // Legacy location
    ];
    
    let trace: TraceData | undefined;
    for (const eventPath of eventPaths) {
        if (fs.existsSync(eventPath)) {
            trace = {
                events: parseNdjson(eventPath),
                raw_path: eventPath,
            };
            break;
        }
    }

    if (trace) {
        result.pack = {
            root: packRoot,
            trace,
        };
        result.load_status.pack = 'ok';
    } else {
        result.load_status.pack = 'missing';
        result.load_errors.push({
            artifact: 'pack',
            code: 'PACK-TRACE-MISSING',
            message: 'No events.ndjson found',
        });
    }

    // =========================================================================
    // Ruleset ref fallback (from legacy manifest if B2 missing)
    // =========================================================================
    if (!result.ruleset_ref) {
        const legacyManifestPath = path.join(base, 'manifest.json');
        const legacyResult = readJsonSafe<{ ruleset_version?: string }>(legacyManifestPath);
        if (legacyResult.ok && legacyResult.data.ruleset_version) {
            result.ruleset_ref = legacyResult.data.ruleset_version;
        }
    }

    return result;
}

// =============================================================================
// Batch Operations
// =============================================================================

export function loadAllRunBundles(runIds: string[]): Map<string, RunBundle> {
    const results = new Map<string, RunBundle>();
    for (const runId of runIds) {
        results.set(runId, loadRunBundle(runId));
    }
    return results;
}

export function listRunIds(): string[] {
    if (!fs.existsSync(RUNS_ROOT)) return [];
    return fs.readdirSync(RUNS_ROOT).filter((d) => {
        const p = path.join(RUNS_ROOT, d);
        return fs.statSync(p).isDirectory() && isValidRunId(d);
    });
}
```

---

## 2.3 Verification Criteria (PR-2)

```bash
# Test 1: Load legacy run (SSOT: b1_verdict=ok, b1_was_legacy=true)
node -e "
const { loadRunBundle } = require('./lib/bundles/load_run_bundle');
const bundle = loadRunBundle('gf-01-a2a-pass');
console.log('B1:', bundle.load_status.b1_verdict);
console.log('B1 was legacy:', bundle.load_status.b1_was_legacy);
console.log('B2:', bundle.load_status.b2_manifest);
console.log('B3:', bundle.load_status.b3_integrity);
console.log('B4:', bundle.load_status.b4_pointers);
console.log('Pack:', bundle.load_status.pack);
console.log('Verdict topline:', bundle.verdict?.topline);
console.log('Verdict has gf_verdicts:', bundle.verdict?.gf_verdicts?.length);
"
# Expected: B1=ok, b1_was_legacy=true, B2=missing, B3=ok, B4=missing, Pack=ok
# Expected: Verdict is NormalizedVerdict with topline and gf_verdicts populated

# Test 2: Load non-existent run (should have errors)
node -e "
const { loadRunBundle } = require('./lib/bundles/load_run_bundle');
const bundle = loadRunBundle('non-existent');
console.log('Errors:', bundle.load_errors);
"
# Expected: Errors array has RUN-NOT-FOUND

# Test 3: Path traversal protection
node -e "
const { loadRunBundle } = require('./lib/bundles/load_run_bundle');
const bundle = loadRunBundle('../../../etc/passwd');
console.log('Errors:', bundle.load_errors);
"
# Expected: Errors array has INVALID-RUN-ID

# Test 4: Downstream code sees unified structure (UI/Gate/Evaluator)
node -e "
const { loadRunBundle } = require('./lib/bundles/load_run_bundle');
const bundle = loadRunBundle('gf-01-a2a-pass');
// NormalizedVerdict guarantees these fields exist
console.log(typeof bundle.verdict?.gf_verdicts);   // 'object' (array)
console.log(typeof bundle.verdict?.domain_verdicts); // 'object' (array, may be empty)
console.log(typeof bundle.verdict?.topline);        // 'string'
"
# Expected: All typeof checks pass - unified structure guaranteed
```

---

## 2.4 Integration with Existing Code

The new loader **does not replace** `lib/runs/loadRun.ts`. Both can be used:

```typescript
// Existing code (unchanged)
import { loadRun } from '@/lib/runs/loadRun';
const oldData = loadRun('gf-01-a2a-pass');

// New code (v0.3+)
import { loadRunBundle } from '@/lib/bundles/load_run_bundle';
const bundle = loadRunBundle('gf-01-a2a-pass');
```

---

**Document Status**: Engineering Specification  
**Version**: 1.0.0
