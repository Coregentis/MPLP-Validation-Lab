/**
 * RunBundle Loader
 * 
 * Loads runs into ABMC-compliant RunBundle structure.
 * Supports both legacy GF runs and new v0.3 runs.
 * 
 * DOES NOT REPLACE loadRun.ts - parallel implementation.
 * 
 * All verdicts are normalized at load time via mapToNormalizedVerdict.
 * Downstream code always receives NormalizedVerdict.
 */

import * as fs from 'fs';
import * as path from 'path';
import { mapToNormalizedVerdict } from './normalize';
import type {
    RunBundle,
    BundleManifest,
    EvidencePointers,
    TraceData,
    Event,
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
// JSON Helpers (distinguish missing vs invalid)
// =============================================================================

type JsonReadResult<T> =
    | { ok: true; data: T }
    | { ok: false; reason: 'missing' | 'invalid'; error: string };

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
    // =========================================================================
    const verdictPath = path.join(base, 'verdict.json');
    const verdictResult = readJsonSafe<unknown>(verdictPath);

    if (verdictResult.ok) {
        const raw = verdictResult.data as Record<string, unknown>;

        // All verdicts go through normalization
        // This ensures consistent structure regardless of disk format
        result.verdict = mapToNormalizedVerdict(raw, runId);
        result.load_status.b1_verdict = 'ok';

        // Track if it came from legacy format (no topline + domain_verdicts)
        const hadABMCFields = 'topline' in raw && 'domain_verdicts' in raw;
        result.load_status.b1_was_legacy = !hadABMCFields;
    } else {
        // Properly distinguish missing vs invalid
        result.load_status.b1_verdict = verdictResult.reason;
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
    // B2: bundle.manifest.json (optional for legacy runs)
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
    // B3: integrity/sha256sums.txt (required)
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
    // B4: evidence_pointers.json (optional for legacy runs)
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
        path.join(packRoot, 'timeline', 'events.ndjson'), // EPC 1.0 Canonical
        path.join(packRoot, 'trace', 'events.ndjson'),    // v0.3 Beta
        path.join(base, 'timeline', 'events.ndjson'),      // Legacy location
    ];

    let trace: TraceData | undefined;
    for (const p of eventPaths) {
        if (fs.existsSync(p)) {
            const traceData = fs.readFileSync(p, 'utf-8');
            const traceEvents = traceData.split('\n')
                .filter(line => line.trim())
                .map(line => ({ ...JSON.parse(line), ts: undefined }));

            trace = {
                events: traceEvents as Event[],
                raw_path: p,
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
