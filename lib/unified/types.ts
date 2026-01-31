/**
 * Unified Runs Types
 * 
 * Shared types for merged V1 + V2 runs data model.
 */

/**
 * Run tier classification:
 * - DECLARED: Manifest only, no evidence executed
 * - SIMULATED: V1-style synthetic evidence packs
 * - REPRODUCED: V2-style real runner execution with proof
 * - DISPUTE_READY: FAIL cases with FMM pointer for arbitration
 */
export type RunTier = 'DECLARED' | 'SIMULATED' | 'REPRODUCED' | 'DISPUTE_READY';

/**
 * Unified run index item - works for both V1 and V2 data
 */
export interface UnifiedRunIndexItem {
    /** Unique run identifier */
    id: string;

    /** Data source: v1 (simulated) or v2 (real runners) */
    source: 'v1' | 'v2';

    /** Evidence tier classification */
    tier: RunTier;

    /** Framework/substrate identifier */
    substrate: string;

    /** Scenario name */
    scenario: string;

    /** Verdict: PASS, FAIL, or N/A if not adjudicated */
    verdict: 'PASS' | 'FAIL' | 'N/A';

    /** Ruleset reference (e.g., "ruleset-1.2", "ruleset-v2.0.1") */
    ruleset: string;

    /** Whether evidence artifacts are present */
    evidence_present: boolean;

    /** Canonical detail page URL */
    href: string;

    // V1-specific optional fields
    adjudication_status?: string;

    // V2-specific optional fields
    indexability_status?: string;
    interop_stack?: string[];
    surfaces?: Record<string, boolean>;

    /** Optional tags */
    tags?: string[];
}

/**
 * Unified runs data structure with facets and metadata
 */
export interface UnifiedRunsData {
    runs: UnifiedRunIndexItem[];

    facets: {
        sources: ('v1' | 'v2')[];
        tiers: RunTier[];
        substrates: string[];
        verdicts: string[];
        rulesets: string[];
    };

    metadata: {
        v1_count: number;
        v2_count: number;
        total: number;
        generated_at: string;
    };
}
