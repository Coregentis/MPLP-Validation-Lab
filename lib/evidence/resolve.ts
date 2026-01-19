/**
 * Evidence Resolver
 * 
 * Resolves evidence pointers to actual event/snapshot data.
 * v0.4: Supports semantic field extraction for clause evaluation.
 */

import type { EvidencePointer, Event, RunBundle } from '@/lib/bundles/types';
import { extractSemanticFields, type SemanticFields } from './extract';

// =============================================================================
// EvidenceRef (Resolution Result)
// =============================================================================

export interface EvidenceRef {
    pointer: EvidencePointer;
    resolved: 'event' | 'snapshot' | 'none';
    event?: Event;
    snapshot?: { snapshot_id: string; data: Record<string, unknown> };
    /** Extracted semantic fields for clause evaluation (v0.4+) */
    content?: SemanticFields;
    notes?: string[];
}

// =============================================================================
// Locator Parsing
// =============================================================================

interface ParsedLocator {
    kind: 'event_id' | 'line' | 'snapshot' | 'jsonptr' | 'unknown';
    value: string;
}

function parseLocator(locator: string): ParsedLocator {
    const trimmed = locator.trim();

    // event_id:<id>
    const eventMatch = /^event_id:(.+)$/.exec(trimmed);
    if (eventMatch) {
        return { kind: 'event_id', value: eventMatch[1].trim() };
    }

    // line:<n>
    const lineMatch = /^line:(\d+)$/.exec(trimmed);
    if (lineMatch) {
        return { kind: 'line', value: lineMatch[1] };
    }

    // snapshot:<id>
    const snapshotMatch = /^snapshot:(.+)$/.exec(trimmed);
    if (snapshotMatch) {
        return { kind: 'snapshot', value: snapshotMatch[1].trim() };
    }

    // jsonptr:<pointer>
    const jsonptrMatch = /^jsonptr:(.+)$/.exec(trimmed);
    if (jsonptrMatch) {
        return { kind: 'jsonptr', value: jsonptrMatch[1].trim() };
    }

    return { kind: 'unknown', value: trimmed };
}

// =============================================================================
// Event Resolution
// =============================================================================

function resolveEventById(events: Event[], eventId: string): Event | undefined {
    return events.find(e => e.event_id === eventId);
}

function resolveEventByLine(events: Event[], lineNumber: number): Event | undefined {
    // Line numbers are 1-indexed; events array is 0-indexed
    const index = lineNumber - 1;
    if (index >= 0 && index < events.length) {
        return events[index];
    }
    return undefined;
}

// =============================================================================
// Snapshot Resolution (v0.4)
// =============================================================================

function resolveSnapshot(
    bundle: RunBundle,
    snapshotId: string
): { snapshot_id: string; data: Record<string, unknown> } | undefined {
    const snapshots = bundle.pack?.snapshots ?? [];
    const snap = snapshots.find(s => s.snapshot_id === snapshotId);
    if (snap) {
        return { snapshot_id: snap.snapshot_id, data: snap.data };
    }
    return undefined;
}

// =============================================================================
// Main Resolver
// =============================================================================

/**
 * Resolve a single pointer to its evidence.
 * v0.4: Now extracts semantic fields into content.
 * Returns EvidenceRef with resolved='none' if resolution fails.
 */
export function resolvePointer(bundle: RunBundle, p: EvidencePointer): EvidenceRef {
    const events = bundle.pack?.trace?.events ?? [];
    const loc = parseLocator(p.locator);

    switch (loc.kind) {
        case 'event_id': {
            const hit = resolveEventById(events, loc.value);
            if (!hit) {
                return { pointer: p, resolved: 'none', notes: ['EVENT_NOT_FOUND'] };
            }
            // v0.4: Extract semantic fields
            const content = extractSemanticFields(hit);
            return { pointer: p, resolved: 'event', event: hit, content };
        }

        case 'line': {
            const lineNum = parseInt(loc.value, 10);
            const hit = resolveEventByLine(events, lineNum);
            if (!hit) {
                return { pointer: p, resolved: 'none', notes: ['LINE_OUT_OF_RANGE'] };
            }
            // v0.4: Extract semantic fields
            const content = extractSemanticFields(hit);
            return { pointer: p, resolved: 'event', event: hit, content };
        }

        case 'snapshot': {
            const snap = resolveSnapshot(bundle, loc.value);
            if (!snap) {
                return { pointer: p, resolved: 'none', notes: ['SNAPSHOT_NOT_FOUND'] };
            }
            // For snapshots, content is the raw data (clauses can interpret as needed)
            return {
                pointer: p,
                resolved: 'snapshot',
                snapshot: snap,
                content: extractSnapshotFields(snap.data),
            };
        }

        case 'jsonptr': {
            // v0.4 stub: JSON pointer resolution not yet implemented
            return { pointer: p, resolved: 'none', notes: ['JSONPTR_NOT_IMPLEMENTED'] };
        }

        default:
            return { pointer: p, resolved: 'none', notes: ['UNSUPPORTED_LOCATOR'] };
    }
}

/**
 * Extract semantic fields from snapshot data.
 * Attempts to find relevant fields in snapshot structure.
 */
function extractSnapshotFields(data: Record<string, unknown>): SemanticFields {
    const fields: SemanticFields = {
        event_type: 'snapshot',
        timestamp: String(data.timestamp ?? data.captured_at ?? new Date().toISOString()),
    };

    // Extract state-related fields
    if (data.state !== undefined) {
        const stateStr = String(data.state);
        fields.to_state = stateStr.toLowerCase();
        fields.is_terminal = ['success', 'succeeded', 'done', 'completed', 'finished',
            'fail', 'failed', 'error', 'failure', 'cancelled', 'canceled', 'aborted', 'terminated'
        ].includes(fields.to_state);
    }

    // Extract termination reason if present
    if (data.termination_reason !== undefined) {
        fields.termination_reason = String(data.termination_reason).toLowerCase();
    }

    return fields;
}

/**
 * Resolve all pointers for a given requirement.
 * Returns empty array if no pointers or no evidence_pointers.json.
 */
export function resolvePointersForRequirement(
    bundle: RunBundle,
    requirementId: string
): EvidenceRef[] {
    const pointers = getPointersByRequirement(bundle, requirementId);
    return pointers.map(p => resolvePointer(bundle, p));
}

// =============================================================================
// Pointer Helpers
// =============================================================================

/**
 * Get all pointers for a specific requirement ID.
 * Returns empty array if evidence_pointers.json is missing.
 */
export function getPointersByRequirement(
    bundle: RunBundle,
    requirementId: string
): EvidencePointer[] {
    const pointers = bundle.evidence_pointers?.pointers ?? [];
    return pointers.filter(p => p.requirement_id === requirementId);
}

/**
 * Check if a pointer with PRESENT status exists for a requirement.
 */
export function hasRequiredPointer(
    bundle: RunBundle,
    requirementId: string
): boolean {
    const pointers = getPointersByRequirement(bundle, requirementId);
    return pointers.some(p => p.status === 'PRESENT');
}
