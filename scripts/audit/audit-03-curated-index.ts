#!/usr/bin/env tsx
/**
 * AUDIT-03: Curated Runs Index Integrity
 * 
 * Verifies:
 * 1. Every run has a corresponding directory in data/runs/
 * 2. Every run has ALL required hash fields (not fff...fff)
 * 3. Hash requirements vary by adjudication_status
 * 4. No missing runs that should be indexed
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AuditReporter } from './lib/report';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const CURATED_RUNS_PATH = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
const RUNS_DIR = path.join(PROJECT_ROOT, 'data/runs');

const PLACEHOLDER_HASH = 'f'.repeat(64);

interface CuratedRun {
    run_id: string;
    adjudication_status: 'ADJUDICATED' | 'NOT_ADJUDICATED' | 'NOT_ADMISSIBLE';
    substrate: string;
    pack_root_hash?: string;
    verdict_hash?: string;
    verify_report_hash?: string;
    evaluation_report_hash?: string;
    indexable?: boolean;
    status?: string;
}

interface CuratedRunsIndex {
    ssot: { generated_at: string };
    runs: CuratedRun[];
}

function getRequiredHashFields(status: string, substrate: string): string[] {
    // NOT_ADMISSIBLE: Only verdict_hash required (pack may be broken)
    if (status === 'NOT_ADMISSIBLE') {
        return ['verdict_hash'];
    }

    // Fixture substrate: May be intentionally incomplete, require minimal hashes
    if (substrate === 'fixture') {
        return ['pack_root_hash', 'verdict_hash'];
    }

    // ADJUDICATED: All hashes required
    if (status === 'ADJUDICATED') {
        return ['pack_root_hash', 'verdict_hash', 'verify_report_hash', 'evaluation_report_hash'];
    }

    // NOT_ADJUDICATED (normal runs): pack, verdict, verify required
    return ['pack_root_hash', 'verdict_hash', 'verify_report_hash'];
}

export default async function audit(reporter: AuditReporter): Promise<void> {
    // Check index file exists
    if (!fs.existsSync(CURATED_RUNS_PATH)) {
        reporter.blocker({
            code: 'AUDIT-03-INDEX-MISSING',
            layer: 'LAYER_2_INDEX',
            file: CURATED_RUNS_PATH,
            message: 'Curated runs index file does not exist',
            suggested_fix: 'Run: npm run generate:curated'
        });
        return;
    }

    let index: CuratedRunsIndex;
    try {
        index = JSON.parse(fs.readFileSync(CURATED_RUNS_PATH, 'utf8'));
    } catch (error) {
        reporter.blocker({
            code: 'AUDIT-03-INDEX-INVALID-JSON',
            layer: 'LAYER_2_INDEX',
            file: CURATED_RUNS_PATH,
            message: `Index file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: 'Fix JSON syntax or regenerate index'
        });
        return;
    }

    if (!index.runs || !Array.isArray(index.runs)) {
        reporter.blocker({
            code: 'AUDIT-03-INDEX-INVALID-STRUCTURE',
            layer: 'LAYER_2_INDEX',
            file: CURATED_RUNS_PATH,
            pointer: '/runs',
            message: 'Index file missing or invalid "runs" array',
            suggested_fix: 'Regenerate index with correct structure'
        });
        return;
    }

    // Check each run
    index.runs.forEach((run, idx) => {
        const runPointer = `/runs[${idx}]`;

        // Check run directory exists
        const runDir = path.join(RUNS_DIR, run.run_id);
        if (!fs.existsSync(runDir)) {
            reporter.blocker({
                code: 'AUDIT-03-RUN-DIR-MISSING',
                layer: 'LAYER_2_INDEX',
                file: CURATED_RUNS_PATH,
                pointer: `${runPointer}/run_id`,
                message: `Run directory does not exist: data/runs/${run.run_id}`,
                suggested_fix: `Create run directory or remove from index`,
                context: { run_id: run.run_id }
            });
        }

        // Skip hash validation for non-indexable runs
        if ((run as any).indexable === false) {
            // Non-indexable runs should have unavailable_reason
            if (!(run as any).unavailable_reason) {
                reporter.important({
                    code: 'AUDIT-03-NON-INDEXABLE-MISSING-REASON',
                    layer: 'LAYER_2_INDEX',
                    file: CURATED_RUNS_PATH,
                    pointer: `${runPointer}/unavailable_reason`,
                    message: `Non-indexable run ${run.run_id} missing unavailable_reason field`,
                    suggested_fix: 'Add unavailable_reason field (e.g., MISSING_VERIFY_REPORT, LEGACY_MISSING_EVIDENCE)',
                    context: { run_id: run.run_id, indexable: (run as any).indexable }
                });
            }
            return; // Skip hash validation for non-indexable runs
        }

        // Determine required hash fields based on status
        const requiredFields = getRequiredHashFields(run.adjudication_status, run.substrate);

        requiredFields.forEach(field => {
            const hashValue = (run as any)[field];

            // Check if field is missing
            if (hashValue === undefined || hashValue === null) {
                reporter.blocker({
                    code: 'AUDIT-03-HASH-MISSING',
                    layer: 'LAYER_2_INDEX',
                    file: CURATED_RUNS_PATH,
                    pointer: `${runPointer}/${field}`,
                    message: `Missing required hash field "${field}" for run ${run.run_id}`,
                    suggested_fix: `Run: npm run generate:curated to regenerate hashes`,
                    context: {
                        run_id: run.run_id,
                        adjudication_status: run.adjudication_status,
                        substrate: run.substrate,
                        missing_field: field
                    }
                });
            }
            // Check if hash is placeholder
            else if (hashValue === PLACEHOLDER_HASH) {
                reporter.blocker({
                    code: 'AUDIT-03-HASH-PLACEHOLDER',
                    layer: 'LAYER_2_INDEX',
                    file: CURATED_RUNS_PATH,
                    pointer: `${runPointer}/${field}`,
                    message: `Placeholder hash (fff...fff) for "${field}" in run ${run.run_id}`,
                    suggested_fix: `Run: npm run generate:curated to compute real hashes`,
                    context: {
                        run_id: run.run_id,
                        field: field
                    }
                });
            }
            // Check if hash format is valid (64 hex chars)
            else if (typeof hashValue === 'string') {
                if (!/^[0-9a-f]{64}$/.test(hashValue)) {
                    reporter.critical({
                        code: 'AUDIT-03-HASH-INVALID-FORMAT',
                        layer: 'LAYER_2_INDEX',
                        file: CURATED_RUNS_PATH,
                        pointer: `${runPointer}/${field}`,
                        message: `Invalid hash format for "${field}" in run ${run.run_id}: ${hashValue.substring(0, 32)}...`,
                        suggested_fix: `Hash should be 64 hexadecimal characters`,
                        context: { run_id: run.run_id, field: field, value: hashValue }
                    });
                }
            }
        });

        // Check adjudication_status is valid
        const validStatuses = ['ADJUDICATED', 'NOT_ADJUDICATED', 'NOT_ADMISSIBLE'];
        if (!validStatuses.includes(run.adjudication_status)) {
            reporter.critical({
                code: 'AUDIT-03-INVALID-ADJUDICATION-STATUS',
                layer: 'LAYER_2_INDEX',
                file: CURATED_RUNS_PATH,
                pointer: `${runPointer}/adjudication_status`,
                message: `Invalid adjudication_status "${run.adjudication_status}" for run ${run.run_id}`,
                suggested_fix: `Use one of: ${validStatuses.join(', ')}`,
                context: { run_id: run.run_id, status: run.adjudication_status }
            });
        }
    });

    // Check for runs in data/runs that are not in index
    if (fs.existsSync(RUNS_DIR)) {
        const runDirs = fs.readdirSync(RUNS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const indexedRunIds = new Set(index.runs.map(r => r.run_id));

        runDirs.forEach(runId => {
            if (!indexedRunIds.has(runId)) {
                // Check if directory has evidence files (not just a placeholder)
                const runDir = path.join(RUNS_DIR, runId);
                const hasManifest = fs.existsSync(path.join(runDir, 'manifest.json'));
                const hasVerdict = fs.existsSync(path.join(runDir, 'verdict.json'));

                if (hasManifest || hasVerdict) {
                    reporter.important({
                        code: 'AUDIT-03-RUN-NOT-INDEXED',
                        layer: 'LAYER_2_INDEX',
                        file: CURATED_RUNS_PATH,
                        message: `Run directory exists but not in index: ${runId}`,
                        suggested_fix: `Add to allowlist.yaml and regenerate index, or mark as archived`,
                        context: { run_id: runId, has_manifest: hasManifest, has_verdict: hasVerdict }
                    });
                }
            }
        });
    }
}
