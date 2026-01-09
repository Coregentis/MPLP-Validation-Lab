/**
 * Run Data Types
 * 
 * Types for Run data loaded from data/runs/{run_id}/
 * UI does NOT introduce new fields - only references engine output types.
 */

import type { VerificationReport } from '@/lib/engine/types';
import type { EvaluationReport } from '@/lib/evaluate/types';

export interface RunData {
    run_id: string;
    manifest?: {
        pack_id?: string;
        protocol_version?: string;
        substrate?: string;
        [key: string]: unknown;
    };
    verifyReport?: VerificationReport;
    evaluationReport?: EvaluationReport;
    sha256sumsText?: string;
    missing: string[];
}

export interface RunListItem {
    run_id: string;
    pack_id?: string;
    admission_status?: string;
    verdict_hash?: string;
}
