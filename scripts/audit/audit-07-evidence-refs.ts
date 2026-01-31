#!/usr/bin/env tsx
/**
 * AUDIT-07: Evidence Reference Resolution
 * 
 * Verifies:
 * 1. ALL evidence_refs in diffpacks resolve to runs in curated-runs.json
 * 2. No orphan references (diffpack points to non-existent run)
 * 3. Referenced runs have valid adjudication status
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AuditReporter } from './lib/report';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const CURATED_RUNS_PATH = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
const DIFF_INDEX_PATH = path.join(PROJECT_ROOT, 'public/_meta/ruleset-diff-index.json');

interface CuratedRun {
    run_id: string;
    adjudication_status: string;
}

interface CuratedRunsIndex {
    runs: CuratedRun[];
}

interface DiffpackIndexEntry {
    diff_id: string;
    path: string;
}

interface DiffpackIndex {
    diffs: DiffpackIndexEntry[];
}

// Support both v0.11 and v0.16 diffpack schemas
interface DiffpackV0_11 {
    diffpack_version: string;
    clauses_changed: Array<{
        clause_id: string;
        evidence_refs?: string[];
    }>;
}

interface DiffpackV0_16 {
    diffpack_version: string;
    logic_diff: Array<{
        clause_id: string;
        // v0.16 doesn't have evidence_refs
    }>;
    run_deltas?: Array<{
        run_id: string;
    }>;
}

type Diffpack = DiffpackV0_11 | DiffpackV0_16;

function extractEvidenceRefs(diffpack: Diffpack): string[] {
    // v0.11 format
    if ('clauses_changed' in diffpack) {
        return diffpack.clauses_changed
            .flatMap(clause => clause.evidence_refs || []);
    }

    // v0.16 format - extract from run_deltas
    if ('run_deltas' in diffpack && diffpack.run_deltas) {
        return diffpack.run_deltas.map(delta => delta.run_id);
    }

    return [];
}

export default async function audit(reporter: AuditReporter): Promise<void> {
    // Load curated runs index
    if (!fs.existsSync(CURATED_RUNS_PATH)) {
        reporter.blocker({
            code: 'AUDIT-07-CURATED-INDEX-MISSING',
            layer: 'LAYER_4_CROSS_REF',
            file: CURATED_RUNS_PATH,
            message: 'Curated runs index does not exist',
            suggested_fix: 'Run: npm run generate:curated'
        });
        return;
    }

    let curatedIndex: CuratedRunsIndex;
    try {
        curatedIndex = JSON.parse(fs.readFileSync(CURATED_RUNS_PATH, 'utf8'));
    } catch (error) {
        reporter.blocker({
            code: 'AUDIT-07-CURATED-INDEX-INVALID',
            layer: 'LAYER_4_CROSS_REF',
            file: CURATED_RUNS_PATH,
            message: `Could not parse curated runs index: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: 'Fix JSON or regenerate index'
        });
        return;
    }

    // Load diff index
    if (!fs.existsSync(DIFF_INDEX_PATH)) {
        reporter.important({
            code: 'AUDIT-07-DIFF-INDEX-MISSING',
            layer: 'LAYER_4_CROSS_REF',
            file: DIFF_INDEX_PATH,
            message: 'Ruleset diff index does not exist, skipping evidence ref check',
            suggested_fix: 'Generate diff index if needed'
        });
        return;
    }

    let diffIndex: DiffpackIndex;
    try {
        diffIndex = JSON.parse(fs.readFileSync(DIFF_INDEX_PATH, 'utf8'));
    } catch (error) {
        reporter.critical({
            code: 'AUDIT-07-DIFF-INDEX-INVALID',
            layer: 'LAYER_4_CROSS_REF',
            file: DIFF_INDEX_PATH,
            message: `Could not parse diff index: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: 'Fix JSON or regenerate index'
        });
        return;
    }

    // Build set of valid run IDs
    const validRunIds = new Set(curatedIndex.runs.map(r => r.run_id));

    // Check each diffpack
    for (const diffEntry of diffIndex.diffs) {
        const diffpackPath = path.join(PROJECT_ROOT, 'public', diffEntry.path);

        if (!fs.existsSync(diffpackPath)) {
            reporter.critical({
                code: 'AUDIT-07-DIFFPACK-MISSING',
                layer: 'LAYER_4_CROSS_REF',
                file: diffEntry.path,
                message: `Diffpack file does not exist: ${diffEntry.path}`,
                suggested_fix: 'Remove from index or restore file',
                context: { diff_id: diffEntry.diff_id }
            });
            continue;
        }

        let diffpack: Diffpack;
        try {
            diffpack = JSON.parse(fs.readFileSync(diffpackPath, 'utf8'));
        } catch (error) {
            reporter.critical({
                code: 'AUDIT-07-DIFFPACK-INVALID-JSON',
                layer: 'LAYER_4_CROSS_REF',
                file: diffpackPath,
                message: `Could not parse diffpack: ${error instanceof Error ? error.message : String(error)}`,
                suggested_fix: 'Fix JSON syntax',
                context: { diff_id: diffEntry.diff_id }
            });
            continue;
        }

        // Extract evidence refs (handles both schemas)
        const evidenceRefs = extractEvidenceRefs(diffpack);

        if (evidenceRefs.length === 0) {
            // Not necessarily an error - some diffs may reference no specific runs
            continue;
        }

        // Check each reference
        evidenceRefs.forEach((runId, refIdx) => {
            if (!validRunIds.has(runId)) {
                reporter.blocker({
                    code: 'AUDIT-07-ORPHAN-EVIDENCE-REF',
                    layer: 'LAYER_4_CROSS_REF',
                    file: diffpackPath,
                    pointer: `clauses_changed[?(@.evidence_refs[*]="${runId}")]` || `/run_deltas[${refIdx}]/run_id`,
                    message: `Orphan evidence reference: "${runId}" not in curated-runs.json`,
                    suggested_fix: `Add ${runId} to curated-runs.json or remove from diffpack`,
                    context: {
                        diff_id: diffEntry.diff_id,
                        orphan_run_id: runId,
                        diffpack_path: diffEntry.path
                    }
                });
            } else {
                // Reference resolves - optionally check if run is adjudicated
                const referencedRun = curatedIndex.runs.find(r => r.run_id === runId);
                if (referencedRun && referencedRun.adjudication_status === 'NOT_ADMISSIBLE') {
                    reporter.important({
                        code: 'AUDIT-07-EVIDENCE-REF-NOT-ADMISSIBLE',
                        layer: 'LAYER_4_CROSS_REF',
                        file: diffpackPath,
                        message: `Evidence ref "${runId}" has status NOT_ADMISSIBLE (may be intentional)`,
                        suggested_fix: 'Verify this is correct or replace with admissible run',
                        context: {
                            diff_id: diffEntry.diff_id,
                            run_id: runId,
                            status: referencedRun.adjudication_status
                        }
                    });
                }
            }
        });
    }
}
