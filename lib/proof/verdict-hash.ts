/**
 * Verdict Hash - v0.4 Hash Scope SSOT
 * 
 * Defines the canonical hash computation for RulesetEvalResult.
 * This is the SINGLE SOURCE OF TRUTH for determining verdict parity.
 * 
 * Hash Scope Rules:
 * - INCLUDED: fields that affect adjudication semantics
 * - EXCLUDED: fields that are display-only or time-variant
 * 
 * If two adjudications produce the same hash, they are semantically identical.
 * If the hash differs, the adjudication semantics differ.
 */

import { createHash } from 'crypto';
import type { RulesetEvalResult, ClauseResult, DomainMeta } from '@/lib/rulesets/registry';

// =============================================================================
// Hash Scope Constants (SSOT)
// =============================================================================

/**
 * Fields INCLUDED in verdict hash (affect adjudication semantics).
 */
export const HASH_SCOPE_INCLUDED = [
    'ruleset_id',
    'run_id',
    'topline_verdict',
    'reason_code',
    'clauses[].clause_id',
    'clauses[].requirement_id',
    'clauses[].status',
    'clauses[].reason_code',
    'clauses[].domain_id',
    'clauses[].evidence_refs[].pointer',  // Only pointer, not resolved/content
    'domain_meta[].domain_id',
    'domain_meta[].status',
] as const;

/**
 * Fields EXCLUDED from verdict hash (display-only or time-variant).
 */
export const HASH_SCOPE_EXCLUDED = [
    'evaluated_at',                       // Time-variant
    'clauses[].notes',                    // Diagnostic display
    'clauses[].evidence_refs[].resolved', // Resolution status (display)
    'clauses[].evidence_refs[].content',  // Semantic fields (UI drilldown)
    'domain_meta[].domain_name',          // Display label
] as const;

/**
 * Fields INCLUDED in PORTABLE verdict hash (cross-substrate parity).
 * EXCLUDES: run_id (producer-specific)
 * REQUIRES: evidence_refs[].pointer must be canonptr format
 */
export const HASH_SCOPE_PORTABLE_INCLUDED = [
    'ruleset_id',
    // 'run_id' - EXCLUDED for portability
    'topline_verdict',
    'reason_code',
    'clauses[].clause_id',
    'clauses[].requirement_id',
    'clauses[].status',
    'clauses[].reason_code',
    'clauses[].domain_id',
    'clauses[].evidence_refs[].pointer',  // MUST be canonptr:v1:*
    'domain_meta[].domain_id',
    'domain_meta[].status',
] as const;

// =============================================================================
// Canonical Hash Input
// =============================================================================

/**
 * Canonical representation of a clause for hashing.
 */
interface CanonicalClause {
    clause_id: string;
    requirement_id: string;
    status: string;
    reason_code: string | null;
    domain_id: string | null;
    evidence_pointers: string[];  // Sorted canonical pointer strings
}

/**
 * Canonical representation of domain meta for hashing.
 */
interface CanonicalDomainMeta {
    domain_id: string;
    status: string;
}

/**
 * Canonical hash input structure.
 */
interface CanonicalHashInput {
    ruleset_id: string;
    run_id: string;
    topline_verdict: string;
    reason_code: string | null;
    domain_meta: CanonicalDomainMeta[];
    clauses: CanonicalClause[];
}

// =============================================================================
// Canonicalization Functions
// =============================================================================

/**
 * Canonicalize a pointer to a stable string representation.
 */
function canonicalizePointer(pointer: unknown): string {
    if (typeof pointer === 'string') {
        return pointer;
    }
    if (pointer && typeof pointer === 'object') {
        // Sort object keys and stringify
        return JSON.stringify(pointer, Object.keys(pointer as object).sort());
    }
    return String(pointer);
}

/**
 * Canonicalize a clause for hashing.
 */
function canonicalizeClause(clause: ClauseResult): CanonicalClause {
    // Extract and sort evidence pointers
    const evidencePointers = (clause.evidence_refs ?? [])
        .map(ref => canonicalizePointer(ref.pointer))
        .sort();

    return {
        clause_id: clause.clause_id,
        requirement_id: clause.requirement_id,
        status: clause.status,
        reason_code: clause.reason_code ?? null,
        domain_id: clause.domain_id ?? null,
        evidence_pointers: evidencePointers,
    };
}

/**
 * Canonicalize domain meta for hashing.
 */
function canonicalizeDomainMeta(meta: DomainMeta): CanonicalDomainMeta {
    return {
        domain_id: meta.domain_id,
        status: meta.status,
    };
}

/**
 * Build the canonical hash input from a RulesetEvalResult.
 */
export function buildCanonicalHashInput(result: RulesetEvalResult): CanonicalHashInput {
    // Sort clauses by clause_id
    const sortedClauses = [...result.clauses]
        .sort((a, b) => a.clause_id.localeCompare(b.clause_id))
        .map(canonicalizeClause);

    // Sort domain_meta by domain_id
    const sortedDomainMeta = (result.domain_meta ?? [])
        .slice()
        .sort((a, b) => a.domain_id.localeCompare(b.domain_id))
        .map(canonicalizeDomainMeta);

    return {
        ruleset_id: result.ruleset_id,
        run_id: result.run_id,
        topline_verdict: result.topline_verdict,
        reason_code: result.reason_code ?? null,
        domain_meta: sortedDomainMeta,
        clauses: sortedClauses,
    };
}

// =============================================================================
// Hash Computation
// =============================================================================

/**
 * Compute the verdict hash from a RulesetEvalResult.
 * 
 * This is the SSOT for determining parity between Lab and shadow recomputation.
 * 
 * @param result - The adjudication result
 * @returns SHA-256 hash as hex string
 */
export function computeVerdictHash(result: RulesetEvalResult): string {
    const canonicalInput = buildCanonicalHashInput(result);

    // Canonical JSON serialization (deterministic key order via sorted keys)
    const canonicalJson = JSON.stringify(canonicalInput);

    // SHA-256 hash
    const hash = createHash('sha256')
        .update(canonicalJson, 'utf8')
        .digest('hex');

    return hash;
}

/**
 * Verify that two evaluation results produce the same verdict hash.
 */
export function verifyParityHash(
    labResult: RulesetEvalResult,
    shadowResult: RulesetEvalResult
): { match: boolean; labHash: string; shadowHash: string } {
    const labHash = computeVerdictHash(labResult);
    const shadowHash = computeVerdictHash(shadowResult);

    return {
        match: labHash === shadowHash,
        labHash,
        shadowHash,
    };
}

// =============================================================================
// Hash Scope Version
// =============================================================================

/**
 * Hash scope version for tracking changes to the hashing algorithm.
 * Increment this when the hash scope or canonicalization rules change.
 */
export const HASH_SCOPE_VERSION = '1.0.0';

/**
 * Portable hash scope version for cross-substrate parity.
 */
export const HASH_SCOPE_PORTABLE_VERSION = '1.0.0';

// =============================================================================
// Portable Hash Computation (Cross-Substrate)
// =============================================================================

/**
 * Canonical portable hash input (excludes run_id for cross-substrate parity).
 */
interface CanonicalPortableHashInput {
    ruleset_id: string;
    // run_id EXCLUDED for portability
    topline_verdict: string;
    reason_code: string | null;
    domain_meta: CanonicalDomainMeta[];
    clauses: CanonicalClause[];
}

/**
 * Build canonical PORTABLE hash input (excludes run_id).
 */
export function buildCanonicalPortableHashInput(result: RulesetEvalResult): CanonicalPortableHashInput {
    // Sort clauses by clause_id
    const sortedClauses = [...result.clauses]
        .sort((a, b) => a.clause_id.localeCompare(b.clause_id))
        .map(canonicalizeClause);

    // Sort domain_meta by domain_id
    const sortedDomainMeta = (result.domain_meta ?? [])
        .slice()
        .sort((a, b) => a.domain_id.localeCompare(b.domain_id))
        .map(canonicalizeDomainMeta);

    return {
        ruleset_id: result.ruleset_id,
        // run_id EXCLUDED for cross-substrate portability
        topline_verdict: result.topline_verdict,
        reason_code: result.reason_code ?? null,
        domain_meta: sortedDomainMeta,
        clauses: sortedClauses,
    };
}

/**
 * Compute the PORTABLE verdict hash from a RulesetEvalResult.
 * 
 * This hash is designed for cross-substrate parity:
 * - EXCLUDES run_id (producer-specific)
 * - Requires evidence_refs.pointer to be canonptr format
 * 
 * Same scenario across different substrates should produce identical portable hash.
 * 
 * @param result - The adjudication result
 * @returns SHA-256 hash as hex string
 */
export function computePortableVerdictHash(result: RulesetEvalResult): string {
    const canonicalInput = buildCanonicalPortableHashInput(result);

    // Canonical JSON serialization (deterministic key order via sorted keys)
    const canonicalJson = JSON.stringify(canonicalInput);

    // SHA-256 hash
    const hash = createHash('sha256')
        .update(canonicalJson, 'utf8')
        .digest('hex');

    return hash;
}

/**
 * Verify that two evaluation results from different substrates 
 * produce the same PORTABLE verdict hash.
 */
export function verifyPortableParityHash(
    result1: RulesetEvalResult,
    result2: RulesetEvalResult
): { match: boolean; hash1: string; hash2: string } {
    const hash1 = computePortableVerdictHash(result1);
    const hash2 = computePortableVerdictHash(result2);

    return {
        match: hash1 === hash2,
        hash1,
        hash2,
    };
}
