import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * export-ruleset-diff-index.ts
 * 
 * Aggregates all .diffpack.json files into a single SSOT index.
 * This prevents runtime directory enumeration in the UI.
 */

const PROJECT_ROOT = process.cwd();
const DIFFPACKS_DIR = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public/_meta/ruleset-diff-index.json');

function getFileHash(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function main() {
    console.log('📦 Exporting Ruleset Diff Index...');

    if (!fs.existsSync(DIFFPACKS_DIR)) {
        console.log('ℹ️ No diffpacks found.');
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ generated_at: new Date().toISOString(), diffs: [] }, null, 2));
        return;
    }

    const diffDirs = fs.readdirSync(DIFFPACKS_DIR).filter(d =>
        fs.statSync(path.join(DIFFPACKS_DIR, d)).isDirectory()
    );

    const diffs: any[] = [];

    for (const dirName of diffDirs) {
        const diffpackPath = path.join(DIFFPACKS_DIR, dirName, 'diffpack.json');
        if (!fs.existsSync(diffpackPath)) continue;

        const data = JSON.parse(fs.readFileSync(diffpackPath, 'utf8'));

        diffs.push({
            diff_id: data.ruleset_diff_id,
            from_ruleset: data.from_ruleset,
            to_ruleset: data.to_ruleset,
            generated_at: data.generated_at,
            metrics: data.metrics,
            baseline_commit_sha: data.baseline_commit_sha,
            shadow_input_sha256: data.inputs.shadow_input_sha256,
            diffpack_hash: getFileHash(diffpackPath),
            path: `_data/ruleset-diffs/${dirName}/diffpack.json`
        });
    }

    const index = {
        index_version: '0.11.0',
        generated_at: new Date().toISOString(),
        diffs: diffs.sort((a, b) => b.generated_at.localeCompare(a.generated_at))
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
    console.log(`✅ Exported ${diffs.length} entries to ${OUTPUT_PATH}`);
}

main();
