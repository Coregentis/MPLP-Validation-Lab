/**
 * CanonPtr v1 - Portable Evidence Pointer
 * 
 * Provides a stable, producer-agnostic way to identify evidence across substrates.
 * Unlike event_id (which is producer-specific), canonptr uses semantic fields only.
 * 
 * Format: canonptr:v1:<domain>:<decision_kind>:<seq>:<digest>
 * 
 * Example: canonptr:v1:D1:budget:001:a3f2b8c1
 * 
 * @module lib/evidence/canonptr
 */

import * as crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface CanonPtrComponents {
    version: 'v1';
    domain: 'D1' | 'D2' | 'D3' | 'D4';
    decision_kind: string;
    seq: string;           // 3-digit sequence within scenario
    digest: string;        // 8-char hex digest of semantic fields
}

export interface SemanticFields {
    // D1: Budget
    outcome?: 'allow' | 'deny' | string;
    resource?: string;
    amount?: number;

    // D2: Lifecycle
    to_state?: string;

    // D3: AuthZ
    subject?: string;
    action?: string;

    // D4: Termination
    termination_reason?: string;

    // Common
    decision_kind?: string;
}

// Decision kind to domain mapping
const DECISION_KIND_TO_DOMAIN: Record<string, 'D1' | 'D2' | 'D3' | 'D4'> = {
    'budget': 'D1',
    'lifecycle': 'D2',
    'authz': 'D3',
    'terminate': 'D4',
    'termination': 'D4',
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Compute digest from semantic fields (excluding event_id, timestamp)
 */
export function computeSemanticDigest(fields: SemanticFields): string {
    // Canonicalize: sort keys, stringify, hash
    const sortedKeys = Object.keys(fields).sort();
    const canonical = sortedKeys
        .filter(k => fields[k as keyof SemanticFields] !== undefined)
        .map(k => `${k}:${fields[k as keyof SemanticFields]}`)
        .join('|');

    const hash = crypto.createHash('sha256').update(canonical).digest('hex');
    return hash.slice(0, 8); // 8-char digest
}

/**
 * Format a canonptr from components
 */
export function formatCanonPtrV1(
    domain: 'D1' | 'D2' | 'D3' | 'D4',
    decisionKind: string,
    seq: number | string,
    semanticFields: SemanticFields
): string {
    const seqStr = String(seq).padStart(3, '0');
    const digest = computeSemanticDigest(semanticFields);
    return `canonptr:v1:${domain}:${decisionKind}:${seqStr}:${digest}`;
}

/**
 * Parse a canonptr string into components
 */
export function parseCanonPtrV1(ptr: string): CanonPtrComponents | null {
    const match = ptr.match(/^canonptr:v1:(D[1-4]):([a-z_]+):(\d{3}):([a-f0-9]{8})$/);
    if (!match) return null;

    return {
        version: 'v1',
        domain: match[1] as 'D1' | 'D2' | 'D3' | 'D4',
        decision_kind: match[2],
        seq: match[3],
        digest: match[4],
    };
}

/**
 * Check if a string is a valid canonptr
 */
export function isCanonPtr(ptr: string): boolean {
    return /^canonptr:v1:D[1-4]:[a-z_]+:\d{3}:[a-f0-9]{8}$/.test(ptr);
}

/**
 * Convert an event object to a canonptr
 * (Used by producers to generate canonptr from trace events)
 */
export function eventToCanonPtr(
    event: Record<string, unknown>,
    seq: number
): string | null {
    const decisionKind = event.decision_kind as string;
    if (!decisionKind) return null;

    const domain = DECISION_KIND_TO_DOMAIN[decisionKind];
    if (!domain) return null;

    // Extract semantic fields based on domain
    const semanticFields: SemanticFields = {
        decision_kind: decisionKind,
    };

    switch (domain) {
        case 'D1':
            if (event.outcome) semanticFields.outcome = event.outcome as string;
            if (event.resource) semanticFields.resource = event.resource as string;
            if (event.amount !== undefined) semanticFields.amount = event.amount as number;
            break;
        case 'D2':
            if (event.to_state) semanticFields.to_state = event.to_state as string;
            break;
        case 'D3':
            if (event.outcome) semanticFields.outcome = event.outcome as string;
            if (event.subject) semanticFields.subject = event.subject as string;
            if (event.resource) semanticFields.resource = event.resource as string;
            if (event.action) semanticFields.action = event.action as string;
            break;
        case 'D4':
            if (event.termination_reason) {
                semanticFields.termination_reason = event.termination_reason as string;
            }
            break;
    }

    return formatCanonPtrV1(domain, decisionKind, seq, semanticFields);
}

/**
 * Extract all canonical pointers from a trace (NDJSON events array)
 */
export function extractCanonPtrsFromTrace(
    events: Record<string, unknown>[]
): { ptr: string; event_id?: string }[] {
    const result: { ptr: string; event_id?: string }[] = [];
    let seq = 0;

    for (const event of events) {
        if (event.decision_kind) {
            const ptr = eventToCanonPtr(event, seq);
            if (ptr) {
                result.push({
                    ptr,
                    event_id: event.event_id as string | undefined,
                });
                seq++;
            }
        }
    }

    return result;
}
