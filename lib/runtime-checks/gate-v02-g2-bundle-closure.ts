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
