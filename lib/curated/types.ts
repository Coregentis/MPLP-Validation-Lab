export type ClaimLevel = 'declared' | 'reproduced';
export type RulesetVersion = string; // Allows 'ruleset-1.0' and future versions
export type RunStatus = 'frozen' | 'deprecated';

export interface CuratedRunRecord {
    // Core identifiers
    run_id: string;
    scenario_id: string;

    // Substrate metadata
    substrate: string;
    substrate_claim_level: ClaimLevel;
    substrate_execution: 'real' | 'mocked' | 'static';
    inference_mode: 'real_llm' | 'fake_llm' | 'record_replay' | 'none';
    repro_ref: string;
    exporter_version: string;

    // Ruleset & validation
    ruleset_version: RulesetVersion;
    pack_root_hash: string;
    verdict_hash: string;
    verify_report_hash: string;
    evaluation_report_hash: string;

    // Governance
    status: RunStatus;
    indexable: boolean;
    adjudication_status?: string;
    unavailable_reason?: string;
    created_at: string;
}

export interface SSOTMetadata {
    source: string;
    generated_at: string;
    git_commit: string;
}

export interface CuratedRunsArtifact {
    ssot: SSOTMetadata;
    runs: CuratedRunRecord[];
}
