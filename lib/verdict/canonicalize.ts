/**
 * Phase D: Verdict Canonicalization
 * 
 * Ensures deterministic verdict_hash by:
 * - Removing non-deterministic fields (timestamps, durations, paths)
 * - Sorting all arrays consistently
 * - Using stable JSON stringify
 */

import * as crypto from 'crypto';
import { EvaluationReport, GFVerdict, RequirementVerdict, EvaluationFailure } from '../evaluate/types';
import { EvidencePointer } from './types';

// =============================================================================
// Canonicalization (for verdict_hash)
// =============================================================================

/**
 * Canonicalize evaluation report for verdict_hash computation.
 * Removes all non-deterministic fields and sorts arrays.
 */
export function canonicalizeForVerdictHash(report: EvaluationReport): CanonicalReport {
    return {
        report_version: report.report_version,
        ruleset_version: report.ruleset_version,
        pack_id: report.pack_id,
        pack_root_hash: report.pack_root_hash,
        protocol_version: report.protocol_version,
        gf_verdicts: canonicalizeGFVerdicts(report.gf_verdicts),
    };
}

/**
 * Compute deterministic verdict hash.
 */
export function computeVerdictHash(report: EvaluationReport): string {
    const canonical = canonicalizeForVerdictHash(report);
    const serialized = stableStringify(canonical);
    return crypto.createHash('sha256').update(serialized, 'utf-8').digest('hex');
}

// =============================================================================
// Canonical Types (subset of full types, no runtime fields)
// =============================================================================

interface CanonicalReport {
    report_version: string;
    ruleset_version: string;
    pack_id: string;
    pack_root_hash: string;
    protocol_version: string;
    gf_verdicts: CanonicalGFVerdict[];
}

interface CanonicalGFVerdict {
    gf_id: string;
    status: string;
    requirements: CanonicalRequirementVerdict[];
    failures: CanonicalFailure[];
}

interface CanonicalRequirementVerdict {
    requirement_id: string;
    status: string;
    pointers: CanonicalPointer[];
    message: string;
    taxonomy?: string;
}

interface CanonicalPointer {
    artifact_path: string;
    content_hash: string;
    locator: string;
    requirement_id: string;
    // note excluded from hash (optional, may vary)
}

interface CanonicalFailure {
    taxonomy: string;
    message: string;
    pointers: CanonicalPointer[];
    requirement_id?: string;
}

// =============================================================================
// Array Sorting (for determinism)
// =============================================================================

function canonicalizeGFVerdicts(verdicts: GFVerdict[]): CanonicalGFVerdict[] {
    return [...verdicts]
        .sort((a, b) => a.gf_id.localeCompare(b.gf_id))
        .map(v => ({
            gf_id: v.gf_id,
            status: v.status,
            requirements: canonicalizeRequirements(v.requirements),
            failures: canonicalizeFailures(v.failures),
        }));
}

function canonicalizeRequirements(reqs: RequirementVerdict[]): CanonicalRequirementVerdict[] {
    return [...reqs]
        .sort((a, b) => a.requirement_id.localeCompare(b.requirement_id))
        .map(r => ({
            requirement_id: r.requirement_id,
            status: r.status,
            pointers: canonicalizePointers(r.pointers),
            message: sanitizeMessage(r.message),
            taxonomy: r.taxonomy,
        }));
}

function canonicalizeFailures(failures: EvaluationFailure[]): CanonicalFailure[] {
    return [...failures]
        .sort((a, b) => {
            // Primary: taxonomy
            const taxCompare = a.taxonomy.localeCompare(b.taxonomy);
            if (taxCompare !== 0) return taxCompare;

            // Secondary: requirement_id (if present)
            const reqA = a.requirement_id || '';
            const reqB = b.requirement_id || '';
            return reqA.localeCompare(reqB);
        })
        .map(f => ({
            taxonomy: f.taxonomy,
            message: sanitizeMessage(f.message),
            pointers: canonicalizePointers(f.pointers),
            requirement_id: f.requirement_id,
        }));
}

function canonicalizePointers(pointers: EvidencePointer[]): CanonicalPointer[] {
    return [...pointers]
        .sort((a, b) => {
            // Primary: artifact_path
            const pathCompare = a.artifact_path.localeCompare(b.artifact_path);
            if (pathCompare !== 0) return pathCompare;

            // Secondary: locator
            const locatorCompare = a.locator.localeCompare(b.locator);
            if (locatorCompare !== 0) return locatorCompare;

            // Tertiary: requirement_id
            return a.requirement_id.localeCompare(b.requirement_id);
        })
        .map(p => ({
            artifact_path: p.artifact_path,
            content_hash: p.content_hash,
            locator: p.locator,
            requirement_id: p.requirement_id,
            // note intentionally excluded (may vary, optional field)
        }));
}

// =============================================================================
// Message Sanitization (User HARD-04)
// =============================================================================

/**
 * Sanitize message for deterministic hashing.
 * - Removes absolute paths
 * - Removes stack traces
 * - Normalizes whitespace
 */
export function sanitizeMessage(message: string): string {
    let result = message;

    // Remove absolute paths (Unix and Windows)
    result = result.replace(/\/[^\s:]+\/[^\s:]*/g, '<path>');
    result = result.replace(/[A-Za-z]:\\[^\s:]+\\[^\s:]*/g, '<path>');

    // Remove stack traces (lines starting with "at " or containing stack frame patterns)
    result = result.replace(/\s+at\s+[^\n]+/g, '');
    result = result.replace(/Error:.*\n(\s+at\s+.*\n)*/g, 'Error: <sanitized>');

    // Normalize whitespace
    result = result.replace(/\s+/g, ' ').trim();

    return result;
}

// =============================================================================
// Stable JSON Stringify
// =============================================================================

/**
 * JSON stringify with sorted keys for deterministic output.
 */
export function stableStringify(obj: unknown): string {
    return JSON.stringify(obj, sortedReplacer);
}

/**
 * JSON replacer that sorts object keys.
 */
function sortedReplacer(_key: string, value: unknown): unknown {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const sorted: Record<string, unknown> = {};
        const keys = Object.keys(value as Record<string, unknown>).sort();
        for (const k of keys) {
            sorted[k] = (value as Record<string, unknown>)[k];
        }
        return sorted;
    }
    return value;
}
