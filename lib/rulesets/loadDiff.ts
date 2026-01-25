import fs from 'fs';
import path from 'path';

/**
 * Ruleset Diff Index Helper
 */

const INDEX_PATH = path.join(process.cwd(), 'public/_meta/ruleset-diff-index.json');

export interface RulesetDiffEntry {
    diff_id: string;
    from_ruleset: string;
    to_ruleset: string;
    generated_at: string;
    metrics: {
        total_runs: number;
        verdict_flips: number;
        equivalence_shift: {
            from_rate: number;
            to_rate: number;
            delta: number;
        };
    };
    baseline_commit_sha: string;
    shadow_input_sha256: string;
    diffpack_hash: string;
    path: string;
}

export interface RulesetDiffIndex {
    index_version: string;
    generated_at: string;
    diffs: RulesetDiffEntry[];
}

export function getRulesetDiffIndex(): RulesetDiffIndex {
    if (!fs.existsSync(INDEX_PATH)) {
        return { index_version: '0.11.0', generated_at: new Date().toISOString(), diffs: [] };
    }
    return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
}

export function getRulesetDiff(id: string): RulesetDiffEntry | undefined {
    const index = getRulesetDiffIndex();
    return index.diffs.find(d => d.diff_id === id);
}

export function getRulesetDiffPack(filePath: string): any {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}
