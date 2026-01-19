/**
 * Reason Code Taxonomy - Pattern Rules
 * 
 * Allowed regex patterns for dynamically-generated reason codes.
 * These support function-generated codes like BUNDLE-POINTER-MISSING-{rqId}.
 * 
 * IMPORTANT: All dynamic code generation MUST match one of these patterns.
 * Do NOT create new patterns without updating this file.
 */

/**
 * Pattern rule definition.
 */
export interface PatternRule {
    /** Human-readable name for this pattern */
    name: string;
    /** Regex pattern that codes must match */
    pattern: RegExp;
    /** Description of what this pattern covers */
    description: string;
}

/**
 * Allowed reason code patterns.
 * Order matters: first match wins.
 */
export const REASON_CODE_PATTERNS: PatternRule[] = [
    {
        name: 'BUNDLE_POINTER_MISSING',
        pattern: /^BUNDLE-POINTER-MISSING-[A-Z0-9-]+$/,
        description: 'Missing evidence pointer for a requirement (e.g., RQ-D1-01)',
    },
    {
        name: 'REQ_FAIL',
        pattern: /^REQ-FAIL-[A-Z0-9-]+$/,
        description: 'Requirement evaluation failure (generic)',
    },
    {
        name: 'EVAL_NOT_APPLICABLE',
        pattern: /^EVAL-NOT-APPLICABLE-[A-Z0-9-]+$/,
        description: 'Evaluation not applicable for a requirement',
    },
    {
        name: 'GF_FAILED',
        pattern: /^GF-[A-Z0-9-]+-FAILED$/,
        description: 'GoldenFlow evaluation failure',
    },
    {
        name: 'GF_NOT_EVALUATED',
        pattern: /^GF-[A-Z0-9-]+-NOT-EVALUATED$/,
        description: 'GoldenFlow not evaluated',
    },
    {
        name: 'GF_NOT_ADMISSIBLE',
        pattern: /^GF-[A-Z0-9-]+-NOT-ADMISSIBLE$/,
        description: 'GoldenFlow not admissible',
    },
];

/**
 * Check if a code matches any allowed pattern.
 * Returns the matching pattern rule if found.
 */
export function matchesReasonCodePattern(code: string): PatternRule | null {
    for (const rule of REASON_CODE_PATTERNS) {
        if (rule.pattern.test(code)) {
            return rule;
        }
    }
    return null;
}

/**
 * Check if a code matches any allowed pattern (boolean).
 */
export function isPatternReasonCode(code: string): boolean {
    return matchesReasonCodePattern(code) !== null;
}
