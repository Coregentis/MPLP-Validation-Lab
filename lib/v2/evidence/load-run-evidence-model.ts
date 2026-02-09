import { resolveEvidencePackFiles } from './resolve-evidence-pack';
import fs from 'fs';

export interface V2RunDetailModel {
    id: string;
    tier: string;
    source: string;
    substrate: string;
    scenario?: string;
    verdict: string;
    timestamp: string;
    interop_stack: string[];
    surfaces: Record<string, boolean>;

    // Parity Fields
    runner_seal?: {
        build_id: string;
        image_digest?: string;
        sealed_at?: string;
    };
    determinism?: {
        canonical_count: number;
        verdict_hash?: string;
    };
    ruleset?: {
        version: string;
        clauses_triggered: string[];
    };
    mapping?: {
        fmm_version: string;
        coverage_summary?: string;
    };
    files: {
        name: string;
        size: number;
        type: 'json' | 'other';
    }[];
}

interface V2Result {
    clause_id: string;
}

export function loadV2RunDetail(runId: string): V2RunDetailModel | null {
    const resolution = resolveEvidencePackFiles(runId);

    if (!resolution.exists || !resolution.mainFile) return null;

    try {
        const raw = JSON.parse(fs.readFileSync(resolution.mainFile, 'utf-8'));
        const data = raw.data || {}; // Handle wrapper

        return {
            id: data.pack_id || runId,
            tier: data.evidence_maturity_tier || 'DECLARED',
            source: 'V2 Real Runner',
            substrate: data.substrate_id || 'Unknown',
            scenario: data.scenario_id || data.scenario || undefined,
            verdict: data.evaluation?.verdict || data.verify?.overall_status || 'UNKNOWN',
            timestamp: data.provenance?.env_ref?.executed_at || data.generated_at || new Date().toISOString(),
            interop_stack: data.interop_stack || [],
            surfaces: data.adjudicable_surfaces || {},

            runner_seal: data.provenance?.env_ref ? {
                build_id: data.provenance.env_ref.runner_id || 'unknown',
                image_digest: data.provenance.env_ref.image_digest,
                sealed_at: data.provenance.env_ref.executed_at
            } : undefined,

            determinism: {
                canonical_count: data.data?.provenance?.canonicalization_ref?.hash_scope?.length || 0, // Approximate
                verdict_hash: data.hashes?.verdict_hash || data.hashes?.pack_root_hash // Fallback to root hash if verdict hash null
            },

            ruleset: data.evaluation ? {
                version: data.evaluation.ruleset_id || 'v2.0.0',
                clauses_triggered: data.evaluation.results?.map((r: V2Result) => r.clause_id) || []
            } : undefined,

            mapping: {
                fmm_version: 'v2.0'
            },

            files: resolution.files.map(f => {
                const stat = fs.statSync(f.path);
                return {
                    name: f.filename,
                    size: stat.size,
                    type: f.filename.endsWith('.json') ? 'json' : 'other'
                };
            })
        };
    } catch (e) {
        console.error(`Failed to load V2 Run Detail for ${runId}`, e);
        return null;
    }
}
