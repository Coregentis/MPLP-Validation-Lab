#!/usr/bin/env tsx
/**
 * AUDIT-04: Ruleset Diff Index Integrity
 * 
 * Verifies:
 * 1. No duplicate diff_id entries
 * 2. All path fields point to existing files
 * 3. All diffpack_hash values match actual file hash
 * 4. Metrics in index match metrics in diffpack file
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import type { AuditReporter } from './lib/report';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const INDEX_PATH = path.join(PROJECT_ROOT, 'public/_meta/ruleset-diff-index.json');

interface RulesetDiffIndexEntry {
    diff_id: string;
    from_ruleset: string;
    to_ruleset: string;
    generated_at: string;
    metrics: {
        total_runs: number;
        verdict_flips?: number;
        verdict_flips_total?: number;
        equivalence_shift?: {
            from_rate: number;
            to_rate: number;
            delta: number;
        };
        evidence_pattern_changes?: number;
    };
    baseline_commit_sha: string;
    shadow_input_sha256: string;
    diffpack_hash: string;
    path: string;
}

interface RulesetDiffIndex {
    index_version: string;
    generated_at: string;
    diffs: RulesetDiffIndexEntry[];
}

function computeFileHash(filePath: string): string {
    const fullPath = path.join(PROJECT_ROOT, 'public', filePath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
    }
    const output = execSync(`shasum -a 256 "${fullPath}"`).toString();
    return output.split(' ')[0].trim();
}

export default async function audit(reporter: AuditReporter): Promise<void> {
    // Check index file exists
    if (!fs.existsSync(INDEX_PATH)) {
        reporter.blocker({
            code: 'AUDIT-04-INDEX-MISSING',
            layer: 'LAYER_2_INDEX',
            file: INDEX_PATH,
            message: 'Ruleset diff index file does not exist',
            suggested_fix: 'Run the diff index generation script'
        });
        return;
    }

    let index: RulesetDiffIndex;
    try {
        index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    } catch (error) {
        reporter.blocker({
            code: 'AUDIT-04-INDEX-INVALID-JSON',
            layer: 'LAYER_2_INDEX',
            file: INDEX_PATH,
            message: `Index file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: 'Fix JSON syntax errors in index file'
        });
        return;
    }

    if (!index.diffs || !Array.isArray(index.diffs)) {
        reporter.blocker({
            code: 'AUDIT-04-INDEX-INVALID-STRUCTURE',
            layer: 'LAYER_2_INDEX',
            file: INDEX_PATH,
            pointer: '/diffs',
            message: 'Index file missing or invalid "diffs" array',
            suggested_fix: 'Regenerate index file with correct structure'
        });
        return;
    }

    // Check for duplicate diff_ids
    const diffIds = index.diffs.map(d => d.diff_id);
    const uniqueDiffIds = new Set(diffIds);

    if (diffIds.length !== uniqueDiffIds.size) {
        const duplicates = diffIds.filter((id, index) => diffIds.indexOf(id) !== index);
        const uniqueDuplicates = [...new Set(duplicates)];

        uniqueDuplicates.forEach(dupId => {
            const entries = index.diffs.filter(d => d.diff_id === dupId);
            reporter.blocker({
                code: 'AUDIT-04-DUPLICATE-DIFF-ID',
                layer: 'LAYER_2_INDEX',
                file: INDEX_PATH,
                pointer: `/diffs[?(@.diff_id="${dupId}")]`,
                message: `Duplicate diff_id found: "${dupId}" (${entries.length} entries)`,
                suggested_fix: `Remove duplicate entry. Keep newer schema version or merge data.`,
                context: {
                    duplicate_id: dupId,
                    count: entries.length,
                    paths: entries.map(e => e.path)
                }
            });
        });
    }

    // Check each entry
    index.diffs.forEach((diff, idx) => {
        const entryPointer = `/diffs[${idx}]`;

        // Check path exists
        const fullPath = path.join(PROJECT_ROOT, 'public', diff.path);
        if (!fs.existsSync(fullPath)) {
            reporter.blocker({
                code: 'AUDIT-04-DIFFPACK-FILE-MISSING',
                layer: 'LAYER_2_INDEX',
                file: INDEX_PATH,
                pointer: `${entryPointer}/path`,
                message: `Diffpack file does not exist: ${diff.path}`,
                suggested_fix: `Create diffpack file or remove index entry`,
                context: { diff_id: diff.diff_id, expected_path: diff.path }
            });
            return;
        }

        // Verify hash matches
        try {
            const actualHash = computeFileHash(diff.path);
            if (actualHash !== diff.diffpack_hash) {
                reporter.blocker({
                    code: 'AUDIT-04-DIFFPACK-HASH-MISMATCH',
                    layer: 'LAYER_2_INDEX',
                    file: INDEX_PATH,
                    pointer: `${entryPointer}/diffpack_hash`,
                    message: `D Hash mismatch for ${diff.diff_id}`,
                    suggested_fix: `Regenerate index or update diffpack_hash to ${actualHash.substring(0, 16)}...`,
                    context: {
                        diff_id: diff.diff_id,
                        indexed_hash: diff.diffpack_hash,
                        actual_hash: actualHash
                    }
                });
            }
        } catch (error) {
            reporter.critical({
                code: 'AUDIT-04-HASH-COMPUTATION-FAILED',
                layer: 'LAYER_2_INDEX',
                file: fullPath,
                message: `Failed to compute hash for ${diff.path}: ${error instanceof Error ? error.message : String(error)}`,
                suggested_fix: 'Check file permissions and content'
            });
        }

        // Verify metrics match diffpack content
        try {
            const diffpackContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

            if (diffpackContent.metrics) {
                // Check total_runs
                if (diffpackContent.metrics.total_runs !== diff.metrics.total_runs) {
                    reporter.critical({
                        code: 'AUDIT-04-METRICS-MISMATCH-TOTAL-RUNS',
                        layer: 'LAYER_2_INDEX',
                        file: INDEX_PATH,
                        pointer: `${entryPointer}/metrics/total_runs`,
                        message: `Metrics mismatch for ${diff.diff_id}: total_runs ${diff.metrics.total_runs} vs ${diffpackContent.metrics.total_runs}`,
                        suggested_fix: 'Regenerate index to sync metrics',
                        context: { diff_id: diff.diff_id }
                    });
                }

                // Check verdict_flips (handle both schema versions)
                const indexFlips = diff.metrics.verdict_flips ?? diff.metrics.verdict_flips_total;
                const diffpackFlips = diffpackContent.metrics.verdict_flips ?? diffpackContent.metrics.verdict_flips_total;

                if (indexFlips !== undefined && diffpackFlips !== undefined && indexFlips !== diffpackFlips) {
                    reporter.critical({
                        code: 'AUDIT-04-METRICS-MISMATCH-VERDICT-FLIPS',
                        layer: 'LAYER_2_INDEX',
                        file: INDEX_PATH,
                        pointer: `${entryPointer}/metrics/verdict_flips`,
                        message: `Metrics mismatch for ${diff.diff_id}: verdict_flips ${indexFlips} vs ${diffpackFlips}`,
                        suggested_fix: 'Regenerate index to sync metrics',
                        context: { diff_id: diff.diff_id }
                    });
                }
            }
        } catch (error) {
            reporter.important({
                code: 'AUDIT-04-DIFFPACK-READ-FAILED',
                layer: 'LAYER_2_INDEX',
                file: fullPath,
                message: `Could not read/parse diffpack to verify metrics: ${error instanceof Error ? error.message : String(error)}`,
                suggested_fix: 'Check diffpack file format',
                context: { diff_id: diff.diff_id }
            });
        }
    });
}
