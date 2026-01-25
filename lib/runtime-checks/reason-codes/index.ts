/**
 * Reason Code Taxonomy - Unified Entry Point
 * 
 * This is the SINGLE SOURCE OF TRUTH for all reason code validation.
 * All components must import from here for reason code validation.
 * 
 * Usage:
 *   import { isAllowedReasonCode, explainReasonCode } from '@/lib/gates/reason-codes';
 * 
 * Gate contract: ALL non-PASS verdicts must have reason_code that passes isAllowedReasonCode().
 */

// Re-export all domain codes for direct access
export * from './common';
export * from './d1';
export * from './d2';
export * from './d3';
export * from './d4';
export * from './patterns';

// Import for internal use
import { COMMON_REASON_CODES, isCommonReasonCode } from './common';
import { D1_REASON_CODES, isD1ReasonCode } from './d1';
import { D2_REASON_CODES, isD2ReasonCode } from './d2';
import { D3_REASON_CODES, isD3ReasonCode } from './d3';
import { D4_REASON_CODES, isD4ReasonCode } from './d4';
import { matchesReasonCodePattern, isPatternReasonCode } from './patterns';

// =============================================================================
// Unified Validation
// =============================================================================

export type ReasonCodeDomain = 'COMMON' | 'D1' | 'D2' | 'D3' | 'D4' | 'PATTERN';
export type ReasonCodeKind = 'enum' | 'pattern' | 'unknown';

/**
 * Explanation of a reason code's classification.
 */
export interface ReasonCodeExplanation {
    kind: ReasonCodeKind;
    domain?: ReasonCodeDomain;
    rule?: string;
    allowed: boolean;
}

/**
 * Check if a reason code is allowed (either enum or pattern match).
 * This is the primary validation function for CI gates.
 */
export function isAllowedReasonCode(code: string | null | undefined): boolean {
    if (!code) return false;

    // Check common codes
    if (isCommonReasonCode(code)) return true;

    // Check domain-specific codes
    if (isD1ReasonCode(code)) return true;
    if (isD2ReasonCode(code)) return true;
    if (isD3ReasonCode(code)) return true;
    if (isD4ReasonCode(code)) return true;

    // Check patterns
    if (isPatternReasonCode(code)) return true;

    return false;
}

/**
 * Explain a reason code's classification.
 * Returns detailed information about which category the code falls into.
 */
export function explainReasonCode(code: string | null | undefined): ReasonCodeExplanation {
    if (!code) {
        return { kind: 'unknown', allowed: false };
    }

    // Check common codes
    if (isCommonReasonCode(code)) {
        return { kind: 'enum', domain: 'COMMON', allowed: true };
    }

    // Check domain-specific codes
    if (isD1ReasonCode(code)) {
        return { kind: 'enum', domain: 'D1', allowed: true };
    }
    if (isD2ReasonCode(code)) {
        return { kind: 'enum', domain: 'D2', allowed: true };
    }
    if (isD3ReasonCode(code)) {
        return { kind: 'enum', domain: 'D3', allowed: true };
    }
    if (isD4ReasonCode(code)) {
        return { kind: 'enum', domain: 'D4', allowed: true };
    }

    // Check patterns
    const patternMatch = matchesReasonCodePattern(code);
    if (patternMatch) {
        return { kind: 'pattern', domain: 'PATTERN', rule: patternMatch.name, allowed: true };
    }

    return { kind: 'unknown', allowed: false };
}

/**
 * Assert that a reason code is allowed.
 * Throws an error with context if the code is not allowed.
 */
export function assertAllowedReasonCode(
    code: string | null | undefined,
    context: { run_id?: string; clause_id?: string; status?: string }
): void {
    if (!isAllowedReasonCode(code)) {
        const ctxStr = JSON.stringify(context);
        throw new Error(`Unknown reason_code "${code}" in context: ${ctxStr}`);
    }
}

// =============================================================================
// Taxonomy Statistics (for reporting)
// =============================================================================

/**
 * Get counts of all registered reason codes.
 */
export function getReasonCodeStats(): {
    common: number;
    d1: number;
    d2: number;
    d3: number;
    d4: number;
    total_enum: number;
    patterns: number;
} {
    return {
        common: COMMON_REASON_CODES.length,
        d1: D1_REASON_CODES.length,
        d2: D2_REASON_CODES.length,
        d3: D3_REASON_CODES.length,
        d4: D4_REASON_CODES.length,
        total_enum:
            COMMON_REASON_CODES.length +
            D1_REASON_CODES.length +
            D2_REASON_CODES.length +
            D3_REASON_CODES.length +
            D4_REASON_CODES.length,
        patterns: 6, // From patterns.ts
    };
}
