export type IndexabilityStatus = 'INDEXABLE_REAL' | 'INDEXABLE_SYNTHETIC' | 'NON_INDEXABLE';
export type EvidenceMaturityTier = 'DECLARED' | 'REPRODUCED' | 'DISPUTE_READY';

export interface AdjudicableSurfaces {
    intent: boolean;
    plan: boolean;
    confirm: boolean;
    trace: boolean;
    snapshots: boolean;
    mcp?: boolean;
    a2a?: boolean;
}

export interface RunProjectionIndexItem {
    pack_id: string;
    indexability_status: IndexabilityStatus;
    substrate_id: string;
    substrate_name: string;
    scenario: string;
    verdict: string;
    tags: string[];
    // RC-2 Scope Fields
    tier?: EvidenceMaturityTier;
    interop_stack?: string[];
    surfaces?: AdjudicableSurfaces;
}

export interface RunProjectionFacets {
    substrate: string[];
    verdict: string[];
    indexability_status: string[];
    tier?: string[];
    interop_stack?: string[][]; // Array of stacks (which are string arrays)
}

export interface RunProjectionIndex {
    projection_type: 'runs_index';
    generated_at: string;
    source_version: unknown;
    projection_schema_version?: string;
    scope_ssot_version?: string;
    scope_freeze_ref?: string;
    data: {
        runs: RunProjectionIndexItem[];
        facets: RunProjectionFacets;
    };
}
