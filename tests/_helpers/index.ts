/**
 * Test Helper Utilities
 * 
 * Common utilities for tests: temp directories, fixture loading, etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

/**
 * Create a temporary directory for test isolation.
 * Returns the path and a cleanup function.
 */
export function createTempDir(prefix = 'vlab-test-'): {
    path: string;
    cleanup: () => void;
} {
    const tmpPath = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

    return {
        path: tmpPath,
        cleanup: () => {
            try {
                fs.rmSync(tmpPath, { recursive: true, force: true });
            } catch {
                // Ignore cleanup errors
            }
        },
    };
}

/**
 * Write a JSON file helper.
 */
export function writeJson(filePath: string, data: unknown): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Write a text file helper.
 */
export function writeText(filePath: string, content: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
}

/**
 * Compute SHA256 hash of file content.
 */
export function hashContent(content: string | Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get the project root directory.
 */
export function getProjectRoot(): string {
    return path.resolve(__dirname, '../..');
}

/**
 * Create a mock reverification bundle directory structure.
 */
export function createMockReverificationBundle(
    baseDir: string,
    bundleName: string,
    verdict: { overall_status: string } & Record<string, unknown>
): string {
    const bundlePath = path.join(baseDir, bundleName);
    fs.mkdirSync(bundlePath, { recursive: true });

    writeJson(path.join(bundlePath, 'verdict.json'), {
        reverification_version: '1.0',
        release: bundleName.replace(/\+rev\d+$/, ''),
        bundle_name: bundleName,
        verified_at: new Date().toISOString(),
        ...verdict,
    });

    return bundlePath;
}

/**
 * Create a mock export directory with manifest and files.
 */
export function createMockExport(
    baseDir: string,
    options: { tamper?: boolean } = {}
): void {
    const exportDir = path.join(baseDir, 'export');
    fs.mkdirSync(exportDir, { recursive: true });

    // Create index files
    const releaseIndex = { releases: [] };
    const rulesetIndex = { rulesets: [] };
    const curatedRuns = { runs: [] };
    const verdictIndex = { verdicts: [] };

    writeJson(path.join(exportDir, 'release-index.json'), releaseIndex);
    writeJson(path.join(exportDir, 'ruleset-index.json'), rulesetIndex);
    writeJson(path.join(exportDir, 'curated-runs.json'), curatedRuns);
    writeJson(path.join(exportDir, 'verdict-index.json'), verdictIndex);

    // Compute hashes
    const files = ['release-index.json', 'ruleset-index.json', 'curated-runs.json', 'verdict-index.json'];
    const sums: string[] = [];

    for (const file of files) {
        const content = fs.readFileSync(path.join(exportDir, file));
        let hash = hashContent(content);

        // Tamper with one hash if requested
        if (options.tamper && file === 'release-index.json') {
            hash = hash.replace(/^./, 'x'); // Change first char
        }

        sums.push(`${hash}  ${file}`);
    }

    writeText(path.join(exportDir, 'sha256sums.txt'), sums.join('\n') + '\n');

    // Create manifest
    const manifest = {
        export_version: '1.0',
        generated_at: new Date().toISOString(),
        verifier: {
            id: 'test-verifier',
            version: '1.0.0',
            identity_path: 'verifier/VERIFIER_IDENTITY.json',
        },
        files: {
            release_index: 'export/release-index.json',
            ruleset_index: 'export/ruleset-index.json',
            curated_runs: 'export/curated-runs.json',
            verdict_index: 'export/verdict-index.json',
            sha256sums: 'export/sha256sums.txt',
        },
        stats: {
            releases: 0,
            rulesets: 0,
            curated_runs: 0,
            verdicts: 0,
            reverified_count: 0,
        },
    };

    writeJson(path.join(exportDir, 'manifest.json'), manifest);
}
