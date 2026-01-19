/**
 * Lifecycle Guarantees Registry — Display Layer SSOT
 * 
 * GOVERNANCE:
 *   - External display: LG-01~05 (Lifecycle Guarantees)
 *   - Internal ID: gf-01~05 (frozen, do not change)
 *   - v0.2 compatible: no breaking changes
 * 
 * TERMINOLOGY PARTITION:
 *   - FLOW = Test Scenarios (main repo: tests/golden/flows/)
 *   - LG = Lifecycle Guarantees (Lab: adjudication targets)
 * 
 * © 2026 Bangshi Beijing Network Technology Co., Ltd.
 * Licensed under Apache License 2.0. Governed by MPGC.
 */

export interface LifecycleGuarantee {
    /** External display ID (use this in UI) */
    display_id: string;
    /** Internal ID (frozen, maps to gf-xx.yaml) */
    internal_id: string;
    /** Human-readable title */
    title: string;
    /** Brief description */
    description: string;
    /** Protocol layer coverage */
    layer: string;
}

/**
 * Lifecycle Guarantees Registry
 * 
 * These are ADJUDICATION TARGETS, not test scenarios.
 * Test scenarios are FLOW-01~05 in main repo.
 */
export const LIFECYCLE_GUARANTEES: LifecycleGuarantee[] = [
    {
        display_id: 'LG-01',
        internal_id: 'gf-01',
        title: 'Single Agent Lifecycle',
        description: 'Context → Plan → Confirm → Trace chain validation.',
        layer: 'L1/L2',
    },
    {
        display_id: 'LG-02',
        internal_id: 'gf-02',
        title: 'Multi-Agent Collaboration',
        description: 'Agent collaboration patterns and handoff validation.',
        layer: 'L2',
    },
    {
        display_id: 'LG-03',
        internal_id: 'gf-03',
        title: 'Human-in-the-Loop Gating',
        description: 'Confirm gate with human approval validation.',
        layer: 'L2',
    },
    {
        display_id: 'LG-04',
        internal_id: 'gf-04',
        title: 'Drift Detection & Recovery',
        description: 'Snapshot diff and recovery validation.',
        layer: 'L3',
    },
    {
        display_id: 'LG-05',
        internal_id: 'gf-05',
        title: 'External Tool Integration',
        description: 'Tool invocation and result handling validation.',
        layer: 'L3/L4',
    },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get display ID from internal ID.
 * @example getDisplayId('gf-01') → 'LG-01'
 */
export function getDisplayId(internalId: string): string {
    const entry = LIFECYCLE_GUARANTEES.find(lg => lg.internal_id === internalId);
    return entry?.display_id || internalId.toUpperCase().replace('gf-', 'LG-');
}

/**
 * Get internal ID from display ID.
 * @example getInternalId('LG-01') → 'gf-01'
 */
export function getInternalId(displayId: string): string {
    const entry = LIFECYCLE_GUARANTEES.find(lg => lg.display_id === displayId);
    return entry?.internal_id || displayId.toLowerCase().replace('lg-', 'gf-');
}

/**
 * Get full entry by internal ID.
 */
export function getByInternalId(internalId: string): LifecycleGuarantee | undefined {
    return LIFECYCLE_GUARANTEES.find(lg => lg.internal_id === internalId);
}

/**
 * Get full entry by display ID.
 */
export function getByDisplayId(displayId: string): LifecycleGuarantee | undefined {
    return LIFECYCLE_GUARANTEES.find(lg => lg.display_id === displayId);
}

/**
 * Format for external display.
 * @example formatForDisplay('gf-01') → 'LG-01: Single Agent Lifecycle'
 */
export function formatForDisplay(internalId: string): string {
    const entry = getByInternalId(internalId);
    if (!entry) return internalId;
    return `${entry.display_id}: ${entry.title}`;
}
