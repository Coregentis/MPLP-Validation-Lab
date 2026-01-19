# PR-3 & PR-4 Engineering Specification — Code-Level Implementation Guide

**Document ID**: VLAB-ENG-PR34-SPEC-01  
**Status**: Engineering Specification  
**Date**: 2026-01-17  
**Purpose**: Precise file paths, function signatures, and type definitions for PR-3 and PR-4

---

## Frozen Engineering Constraints (From PR-1/2 Review)

1. **Input is SSOT**: All gates and resolvers consume `RunBundle` with `NormalizedVerdict`
2. **V02-G2 does not replace GATE-02~15**: New gate, additive only
3. **strict/non-strict mode**: allowlist runs = strict (B2/B4 required); legacy runs = non-strict

---

# PR-4: Synonym Table + Evidence Resolver

> **Note**: PR-4 comes before PR-3 in implementation order to reduce gate/clause rework.

## 4.1 File: `lib/evidence/synonyms.ts` (NEW)

```typescript
/**
 * Synonym Table for Evidence Field Normalization
 * 
 * Provides unified token normalization and synonym group matching
 * for four-domain clause evaluation.
 */

// =============================================================================
// Synonym Group IDs
// =============================================================================

export type SynonymGroupId =
    | 'decision_kind_budget'
    | 'decision_kind_authz'
    | 'decision_kind_terminate'
    | 'terminal_state_success'
    | 'terminal_state_failure'
    | 'terminal_state_cancelled'
    | 'outcome_allow'
    | 'outcome_deny'
    | 'outcome_terminated';

// =============================================================================
// Token Normalization
// =============================================================================

/**
 * Normalize any value to a comparable token string.
 * Handles: trim, lowercase, replace separators with underscore.
 */
export function normalizeToken(input: unknown): string {
    return String(input ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '_');
}

// =============================================================================
// Synonym Definitions
// =============================================================================

export const SYNONYMS: Record<SynonymGroupId, Set<string>> = {
    // D1: Budget decision kinds
    decision_kind_budget: new Set([
        'budget', 'cost', 'quota', 'token_budget', 'rate_limit',
        'resource_budget', 'throttle', 'suspend', 'resume'
    ]),
    
    // D3: Authorization decision kinds
    decision_kind_authz: new Set([
        'authz', 'authorize', 'authorization', 'permission',
        'access_control', 'access'
    ]),
    
    // D4: Termination decision kinds
    decision_kind_terminate: new Set([
        'terminate', 'termination', 'abort', 'stop', 'cancel', 'kill'
    ]),
    
    // D2: Terminal states - success
    terminal_state_success: new Set([
        'success', 'succeeded', 'done', 'completed', 'finished'
    ]),
    
    // D2: Terminal states - failure
    terminal_state_failure: new Set([
        'fail', 'failed', 'error', 'failure'
    ]),
    
    // D2: Terminal states - cancelled
    terminal_state_cancelled: new Set([
        'cancelled', 'canceled', 'aborted'
    ]),
    
    // Decision outcomes - allow
    outcome_allow: new Set([
        'allow', 'allowed', 'grant', 'granted', 'permit', 'permitted', 'approve', 'approved'
    ]),
    
    // Decision outcomes - deny
    outcome_deny: new Set([
        'deny', 'denied', 'reject', 'rejected', 'refuse', 'refused', 'block', 'blocked'
    ]),
    
    // Decision outcomes - terminated
    outcome_terminated: new Set([
        'terminated', 'stopped', 'aborted', 'killed', 'cancelled', 'canceled'
    ]),
};

// =============================================================================
// Synonym Matching
// =============================================================================

/**
 * Check if a value matches any token in a synonym group.
 */
export function inSynonymGroup(group: SynonymGroupId, value: unknown): boolean {
    const normalized = normalizeToken(value);
    return SYNONYMS[group].has(normalized);
}

/**
 * Check if a value matches any of the provided synonym groups.
 */
export function inAnySynonymGroup(groups: SynonymGroupId[], value: unknown): boolean {
    const normalized = normalizeToken(value);
    return groups.some(group => SYNONYMS[group].has(normalized));
}

/**
 * Check if value is a terminal state (success, failure, or cancelled).
 */
export function isTerminalState(value: unknown): boolean {
    return inAnySynonymGroup([
        'terminal_state_success',
        'terminal_state_failure',
        'terminal_state_cancelled'
    ], value);
}
```

---

## 4.2 File: `lib/evidence/resolve.ts` (NEW)

```typescript
/**
 * Evidence Resolver
 * 
 * Resolves evidence pointers to actual event/snapshot data.
 * v0.3: Supports event_id locators; snapshot support stubbed.
 */

import type { EvidencePointer, Event, RunBundle } from '@/lib/bundles/types';

// =============================================================================
// EvidenceRef (Resolution Result)
// =============================================================================

export interface EvidenceRef {
    pointer: EvidencePointer;
    resolved: 'event' | 'snapshot' | 'none';
    event?: Event;
    snapshot?: { snapshot_id: string; data: Record<string, unknown> };
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
// Main Resolver
// =============================================================================

/**
 * Resolve a single pointer to its evidence.
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
            return { pointer: p, resolved: 'event', event: hit };
        }
        
        case 'line': {
            const lineNum = parseInt(loc.value, 10);
            const hit = resolveEventByLine(events, lineNum);
            if (!hit) {
                return { pointer: p, resolved: 'none', notes: ['LINE_OUT_OF_RANGE'] };
            }
            return { pointer: p, resolved: 'event', event: hit };
        }
        
        case 'snapshot': {
            // v0.3 stub: snapshot resolution not yet implemented
            return { pointer: p, resolved: 'none', notes: ['SNAPSHOT_NOT_IMPLEMENTED'] };
        }
        
        case 'jsonptr': {
            // v0.3 stub: JSON pointer resolution not yet implemented
            return { pointer: p, resolved: 'none', notes: ['JSONPTR_NOT_IMPLEMENTED'] };
        }
        
        default:
            return { pointer: p, resolved: 'none', notes: ['UNSUPPORTED_LOCATOR'] };
    }
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
```

---

## 4.3 Verification Criteria (PR-4)

```bash
# Test 1: Token normalization consistency
node -e "
const { normalizeToken } = require('./lib/evidence/synonyms');
console.log(normalizeToken('Budget') === 'budget');
console.log(normalizeToken('budget-check') === 'budget_check');
console.log(normalizeToken('  TERMINATED  ') === 'terminated');
"
# Expected: true, true, true

# Test 2: Synonym group matching
node -e "
const { inSynonymGroup, isTerminalState } = require('./lib/evidence/synonyms');
console.log(inSynonymGroup('decision_kind_budget', 'quota'));
console.log(inSynonymGroup('terminal_state_success', 'completed'));
console.log(isTerminalState('failed'));
console.log(isTerminalState('running'));  // should be false
"
# Expected: true, true, true, false

# Test 3: Event resolution by event_id
node -e "
const { loadRunBundle } = require('./lib/bundles/load_run_bundle');
const { resolvePointer } = require('./lib/evidence/resolve');
const bundle = loadRunBundle('gf-01-a2a-pass');
const testPointer = { requirement_id: 'test', artifact_path: 'trace/events.ndjson', locator: 'event_id:test-ctx-001', status: 'PRESENT' };
const ref = resolvePointer(bundle, testPointer);
console.log('Resolved:', ref.resolved);
console.log('Event exists:', !!ref.event);
"
# Expected: Resolved: event (or none if event doesn't exist), Event exists: true/false

# Test 4: Missing pointers return empty array (no exception)
node -e "
const { loadRunBundle } = require('./lib/bundles/load_run_bundle');
const { getPointersByRequirement } = require('./lib/evidence/resolve');
const bundle = loadRunBundle('gf-01-a2a-pass');  // legacy run without evidence_pointers.json
const pointers = getPointersByRequirement(bundle, 'RQ-D1-01');
console.log('Pointers length:', pointers.length);
"
# Expected: Pointers length: 0 (no exception thrown)
```

---

# PR-3: V02-G2 Gate + Reason Codes

## 3.1 File: `lib/gates/reason_codes.ts` (NEW)

```typescript
/**
 * Standardized Reason Codes
 * 
 * Single source of truth for all reason codes used by gates,
 * evaluators, and UI. Ensures consistency across the system.
 */

export const REASON_CODES = {
    // Bundle structure - B1 (verdict)
    BUNDLE_MISSING_B1: 'BUNDLE-MISSING-B1',
    BUNDLE_INVALID_B1: 'BUNDLE-INVALID-B1',
    
    // Bundle structure - B2 (bundle.manifest)
    BUNDLE_MISSING_B2: 'BUNDLE-MISSING-B2',
    BUNDLE_INVALID_B2: 'BUNDLE-INVALID-B2',
    
    // Bundle structure - B3 (integrity)
    BUNDLE_MISSING_B3: 'BUNDLE-MISSING-B3',
    BUNDLE_INVALID_B3: 'BUNDLE-INVALID-B3',
    
    // Bundle structure - B4 (evidence_pointers)
    BUNDLE_MISSING_B4: 'BUNDLE-MISSING-B4',
    BUNDLE_INVALID_B4: 'BUNDLE-INVALID-B4',
    
    // Pack
    PACK_MISSING: 'PACK-MISSING',
    PACK_PARTIAL: 'PACK-PARTIAL',
    
    // Pointer requirements
    BUNDLE_POINTER_MISSING: (rqId: string) => `BUNDLE-POINTER-MISSING-${rqId}`,
    
    // Reason code requirements (V02-G2)
    REASON_CODE_REQUIRED_MISSING: 'REASON-CODE-REQUIRED-MISSING',
    
    // Admission gates
    ADM_GATE_PIN_FAIL: 'ADM-GATE-PIN-FAIL',
    ADM_GATE_CONTRACT_FAIL: 'ADM-GATE-CONTRACT-FAIL',
    
    // Requirement failures (used by clauses)
    REQ_FAIL: (rqId: string) => `REQ-FAIL-${rqId}`,
    
    // Not evaluated
    EVAL_NOT_APPLICABLE: (rqId: string) => `EVAL-NOT-APPLICABLE-${rqId}`,
} as const;

// Type for static reason codes
export type StaticReasonCode = Exclude<
    typeof REASON_CODES[keyof typeof REASON_CODES],
    (...args: unknown[]) => string
>;
```

---

## 3.2 File: `lib/gates/gate-v02-g2-bundle-closure.ts` (NEW)

```typescript
/**
 * V02-G2 Gate: ABMC Bundle Closure Check
 * 
 * Verifies that a run has all required ABMC artifacts.
 * Does NOT replace GATE-02~15; this is an additive gate.
 */

import type { RunBundle, LoadStatus } from '@/lib/bundles/types';
import { REASON_CODES } from './reason_codes';

// =============================================================================
// Types
// =============================================================================

export interface V02G2Result {
    gate_id: 'V02-G2';
    run_id: string;
    status: 'PASS' | 'FAIL';
    
    artifacts: {
        b1: ArtifactCheck;
        b2: ArtifactCheck;
        b3: ArtifactCheck;
        b4: ArtifactCheck;
        pack: ArtifactCheck;
    };
    
    /** True if topline !== 'PASS' */
    reason_code_required: boolean;
    /** True if reason_code exists in B2 or verdict */
    reason_code_present: boolean;
    
    errors: GateError[];
}

export interface ArtifactCheck {
    status: 'ok' | 'missing' | 'invalid' | 'partial';
    path?: string;
    notes?: string[];
}

export interface GateError {
    code: string;
    message: string;
    artifact?: 'B1' | 'B2' | 'B3' | 'B4' | 'pack';
}

export interface V02G2Options {
    /** 
     * strict=true: B2/B4 must be present (for allowlist runs)
     * strict=false: B2/B4 missing is allowed (for legacy runs)
     * Default: false
     */
    strict?: boolean;
}

// =============================================================================
// Artifact Check Helpers
// =============================================================================

function checkArtifact(
    loadStatus: LoadStatus['b1_verdict'] | LoadStatus['b2_manifest'] | LoadStatus['b3_integrity'] | LoadStatus['b4_pointers'],
    path?: string
): ArtifactCheck {
    switch (loadStatus) {
        case 'ok':
            return { status: 'ok', path };
        case 'missing':
            return { status: 'missing', path };
        case 'invalid':
            return { status: 'invalid', path };
        default:
            return { status: 'missing' };
    }
}

function checkPackArtifact(packStatus: LoadStatus['pack']): ArtifactCheck {
    switch (packStatus) {
        case 'ok':
            return { status: 'ok' };
        case 'partial':
            return { status: 'partial', notes: ['Pack partially loaded'] };
        case 'missing':
            return { status: 'missing' };
        default:
            return { status: 'missing' };
    }
}

// =============================================================================
// Main Gate Function
// =============================================================================

/**
 * Check V02-G2 bundle closure requirements.
 * 
 * @param bundle - The loaded RunBundle (SSOT structure)
 * @param opts - Options for strict/non-strict mode
 * @returns V02G2Result with pass/fail status and detailed errors
 */
export function checkV02G2(bundle: RunBundle, opts: V02G2Options = {}): V02G2Result {
    const strict = opts.strict ?? false;
    const errors: GateError[] = [];
    
    // Check each artifact
    const b1 = checkArtifact(bundle.load_status.b1_verdict);
    const b2 = checkArtifact(bundle.load_status.b2_manifest);
    const b3 = checkArtifact(bundle.load_status.b3_integrity);
    const b4 = checkArtifact(bundle.load_status.b4_pointers);
    const pack = checkPackArtifact(bundle.load_status.pack);
    
    // B1: Always required
    if (b1.status !== 'ok') {
        const code = b1.status === 'invalid' 
            ? REASON_CODES.BUNDLE_INVALID_B1 
            : REASON_CODES.BUNDLE_MISSING_B1;
        errors.push({ code, message: 'verdict.json is required', artifact: 'B1' });
    }
    
    // B1: run_id must exist
    if (b1.status === 'ok' && !bundle.verdict?.run_id) {
        errors.push({
            code: REASON_CODES.BUNDLE_INVALID_B1,
            message: 'verdict.json must contain run_id',
            artifact: 'B1'
        });
    }
    
    // B3: Always required
    if (b3.status !== 'ok') {
        const code = b3.status === 'invalid'
            ? REASON_CODES.BUNDLE_INVALID_B3
            : REASON_CODES.BUNDLE_MISSING_B3;
        errors.push({ code, message: 'integrity/sha256sums.txt is required', artifact: 'B3' });
    }
    
    // Pack: Required (partial not allowed in v0.3)
    if (pack.status !== 'ok') {
        errors.push({
            code: pack.status === 'partial' ? REASON_CODES.PACK_PARTIAL : REASON_CODES.PACK_MISSING,
            message: 'Pack trace/events.ndjson is required',
            artifact: 'pack'
        });
    }
    
    // B2/B4: Only required in strict mode
    if (strict) {
        if (b2.status !== 'ok') {
            const code = b2.status === 'invalid'
                ? REASON_CODES.BUNDLE_INVALID_B2
                : REASON_CODES.BUNDLE_MISSING_B2;
            errors.push({ code, message: 'bundle.manifest.json is required (strict mode)', artifact: 'B2' });
        }
        
        if (b4.status !== 'ok') {
            const code = b4.status === 'invalid'
                ? REASON_CODES.BUNDLE_INVALID_B4
                : REASON_CODES.BUNDLE_MISSING_B4;
            errors.push({ code, message: 'evidence_pointers.json is required (strict mode)', artifact: 'B4' });
        }
    }
    
    // Reason code requirement check
    const topline = bundle.verdict?.topline ?? 'UNKNOWN';
    const isPassTopline = topline.toUpperCase() === 'PASS';
    const reason_code_required = !isPassTopline;
    
    // Check for reason_code presence
    const reason_code_present = !!(
        bundle.bundle_manifest?.reason_code ||
        bundle.verdict?.reason_code
    );
    
    if (reason_code_required && !reason_code_present) {
        errors.push({
            code: REASON_CODES.REASON_CODE_REQUIRED_MISSING,
            message: `Non-PASS topline (${topline}) requires reason_code`
        });
    }
    
    // Determine final status
    const status: 'PASS' | 'FAIL' = errors.length === 0 ? 'PASS' : 'FAIL';
    
    return {
        gate_id: 'V02-G2',
        run_id: bundle.run_id,
        status,
        artifacts: { b1, b2, b3, b4, pack },
        reason_code_required,
        reason_code_present,
        errors,
    };
}

// =============================================================================
// Batch Operations
// =============================================================================

/**
 * Check V02-G2 for multiple runs with configurable strict mode per run.
 */
export function checkV02G2Batch(
    bundles: RunBundle[],
    strictRunIds: Set<string> = new Set()
): Map<string, V02G2Result> {
    const results = new Map<string, V02G2Result>();
    
    for (const bundle of bundles) {
        const strict = strictRunIds.has(bundle.run_id);
        results.set(bundle.run_id, checkV02G2(bundle, { strict }));
    }
    
    return results;
}
```

---

## 3.3 Verification Criteria (PR-3)

```bash
# Test 1: Legacy run (non-strict mode) - B2/B4 missing is OK
node -e "
const { loadRunBundle } = require('./lib/bundles/load_run_bundle');
const { checkV02G2 } = require('./lib/gates/gate-v02-g2-bundle-closure');
const bundle = loadRunBundle('gf-01-a2a-pass');
const result = checkV02G2(bundle, { strict: false });
console.log('Status:', result.status);
console.log('B2:', result.artifacts.b2.status);
console.log('B4:', result.artifacts.b4.status);
console.log('Errors:', result.errors.length);
"
# Expected: Status: PASS (if B1/B3/pack ok), B2: missing, B4: missing, Errors: 0

# Test 2: Legacy run (strict mode) - B2/B4 missing causes FAIL
node -e "
const { loadRunBundle } = require('./lib/bundles/load_run_bundle');
const { checkV02G2 } = require('./lib/gates/gate-v02-g2-bundle-closure');
const bundle = loadRunBundle('gf-01-a2a-pass');
const result = checkV02G2(bundle, { strict: true });
console.log('Status:', result.status);
console.log('Errors:', result.errors.map(e => e.code));
"
# Expected: Status: FAIL, Errors: [BUNDLE-MISSING-B2, BUNDLE-MISSING-B4]

# Test 3: FAIL topline without reason_code causes error
node -e "
const { checkV02G2 } = require('./lib/gates/gate-v02-g2-bundle-closure');
// Mock a bundle with FAIL topline and no reason_code
const mockBundle = {
  run_id: 'test',
  verdict: { run_id: 'test', topline: 'FAIL', gf_verdicts: [], domain_verdicts: [], admission: 'ADMISSIBLE', scenario_id: 'test', versions: { protocol: '1.0', schema: '1.0', ruleset: '1.0' }, evaluated_at: '2026-01-17', reason_code: null },
  bundle_manifest: null,
  evidence_pointers: null,
  integrity_hash_path: '/test/sha256sums.txt',
  pack: { root: '/test', trace: { events: [], raw_path: '/test/events.ndjson' } },
  load_status: { b1_verdict: 'ok', b2_manifest: 'missing', b3_integrity: 'ok', b4_pointers: 'missing', pack: 'ok', b1_was_legacy: false },
  load_errors: []
};
const result = checkV02G2(mockBundle, { strict: false });
console.log('Status:', result.status);
console.log('reason_code_required:', result.reason_code_required);
console.log('reason_code_present:', result.reason_code_present);
console.log('Has REASON-CODE error:', result.errors.some(e => e.code === 'REASON-CODE-REQUIRED-MISSING'));
"
# Expected: Status: FAIL, reason_code_required: true, reason_code_present: false, Has error: true
```

---

## Summary: Implementation Order

| Order | PR | Dependencies | Key Deliverables |
|:------|:---|:-------------|:-----------------|
| 1 | PR-1 | None | `registry.ts`, extend `loadRuleset.ts` |
| 2 | PR-2 | None | `types.ts`, `normalize.ts`, `load_run_bundle.ts` |
| 3 | PR-4 | PR-2 | `synonyms.ts`, `resolve.ts` |
| 4 | PR-3 | PR-2 | `reason_codes.ts`, `gate-v02-g2-bundle-closure.ts` |
| 5 | PR-5 | PR-3, PR-4 | Four clauses + adjudicate.ts |
| 6 | PR-6 | PR-5 | 8 packs + UI |

---

**Document Status**: Engineering Specification  
**Version**: 1.0.0
