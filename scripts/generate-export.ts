/**
 * Export Interface Generator
 * 
 * Generates the export/ directory with stable interface files
 * for main repo consumption.
 * 
 * Output:
 *   export/manifest.json      - Interface manifest (stable entry point)
 *   export/release-index.json - Release → Canonical Bundle mapping
 *   export/ruleset-index.json - Ruleset versions
 *   export/curated-runs.json  - Curated runs (YAML → JSON projection)
 *   export/verdict-index.json - Reverification verdicts index
 *   export/sha256sums.txt     - Integrity seal
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as yaml from 'js-yaml';
import { selectCanonicalBundle } from '../lib/reverification/selectCanonicalBundle';

// =============================================================================
// Configuration
// =============================================================================

const VLAB_ROOT = path.resolve(__dirname, '..');
const EXPORT_DIR = path.join(VLAB_ROOT, 'export');

// =============================================================================
// Helpers
// =============================================================================

function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function loadJson(filePath: string): unknown {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadYaml(filePath: string): unknown {
    return yaml.load(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// =============================================================================
// Generators
// =============================================================================

interface ReleaseEntry {
    version: string;
    release_path: string;
    canonical_bundle: string | null;
    canonical_verdict_path: string | null;
    overall_status: string | null;
}

function generateReleaseIndex(): ReleaseEntry[] {
    const releasesDir = path.join(VLAB_ROOT, 'releases');
    const reverificationDir = path.join(VLAB_ROOT, 'reverification');
    if (!fs.existsSync(releasesDir)) return [];

    const releases = fs.readdirSync(releasesDir)
        .filter(entry => {
            const fullPath = path.join(releasesDir, entry);
            return fs.statSync(fullPath).isDirectory() && entry.startsWith('v');
        })
        .sort();

    return releases.map(version => {
        // Use SSOT canonical bundle selection
        const canonical = selectCanonicalBundle(reverificationDir, version);
        let overall_status: string | null = null;

        if (canonical) {
            const verdictPath = path.join(canonical.bundlePath, 'verdict.json');
            if (fs.existsSync(verdictPath)) {
                const verdict = loadJson(verdictPath) as { overall_status?: string };
                overall_status = verdict.overall_status || null;
            }
        }

        return {
            version,
            release_path: `releases/${version}/`,
            canonical_bundle: canonical?.bundleName || null,
            canonical_verdict_path: canonical ? `reverification/${canonical.bundleName}/verdict.json` : null,
            overall_status,
        };
    });
}

interface RulesetEntry {
    version: string;
    path: string;
    manifest_path: string | null;
}

function generateRulesetIndex(): RulesetEntry[] {
    const rulesetsDir = path.join(VLAB_ROOT, 'data/rulesets');
    if (!fs.existsSync(rulesetsDir)) return [];

    const rulesets = fs.readdirSync(rulesetsDir)
        .filter(entry => {
            const fullPath = path.join(rulesetsDir, entry);
            return fs.statSync(fullPath).isDirectory();
        })
        .sort();

    return rulesets.map(version => {
        const manifestPath = path.join(rulesetsDir, version, 'manifest.json');
        return {
            version,
            path: `data/rulesets/${version}/`,
            manifest_path: fs.existsSync(manifestPath) ? `data/rulesets/${version}/manifest.json` : null,
        };
    });
}

interface CuratedRun {
    run_id: string;
    scenario_id?: string;
    release?: string;
    status?: string;
    // PR-8: Adjudication linking fields
    adjudication_status?: string;      // ADJUDICATED | INCOMPLETE | NOT_ADMISSIBLE | NOT_ADJUDICATED
    adjudication_verdict_hash?: string;
    adjudication_ruleset?: string;
    adjudication_protocol_pin?: string;
    [key: string]: unknown;
}

function generateCuratedRuns(): { runs: CuratedRun[] } {
    const allowlistPath = path.join(VLAB_ROOT, 'data/curated-runs/allowlist.yaml');
    if (!fs.existsSync(allowlistPath)) {
        return { runs: [] };
    }

    const allowlist = loadYaml(allowlistPath) as { runs?: CuratedRun[] };
    const runs = allowlist.runs || [];

    // PR-8: Enrich with adjudication data
    const adjudicationDir = path.join(VLAB_ROOT, 'adjudication');

    for (const run of runs) {
        if (!run.run_id) continue;

        const verdictPath = path.join(adjudicationDir, run.run_id, 'verdict.json');
        if (fs.existsSync(verdictPath)) {
            try {
                const verdict = loadJson(verdictPath) as {
                    overall_status?: string;
                    verdict_hash?: string;
                    ruleset_version?: string;
                    protocol_pin?: string;
                };
                run.adjudication_status = verdict.overall_status || 'UNKNOWN';
                run.adjudication_verdict_hash = verdict.verdict_hash;
                run.adjudication_ruleset = verdict.ruleset_version;
                run.adjudication_protocol_pin = verdict.protocol_pin;
            } catch {
                run.adjudication_status = 'PARSE_ERROR';
            }
        } else {
            run.adjudication_status = 'NOT_ADJUDICATED';
        }
    }

    return { runs };
}

interface VerdictEntry {
    release: string;
    bundle_name: string;
    bundle_path: string;
    verdict_path: string;
    overall_status: string;
    verified_at: string;
    verifier_version: string;
    ruleset_version: string;
    gate_results: {
        total: number;
        passed: number;
        failed: number;
    };
}

function generateVerdictIndex(): VerdictEntry[] {
    const reverificationDir = path.join(VLAB_ROOT, 'reverification');
    if (!fs.existsSync(reverificationDir)) return [];

    const entries: VerdictEntry[] = [];

    const bundles = fs.readdirSync(reverificationDir)
        .filter(entry => {
            const fullPath = path.join(reverificationDir, entry);
            return fs.statSync(fullPath).isDirectory() && entry.startsWith('v');
        });

    for (const bundleName of bundles) {
        const verdictPath = path.join(reverificationDir, bundleName, 'verdict.json');
        if (!fs.existsSync(verdictPath)) continue;

        try {
            const verdict = loadJson(verdictPath) as {
                release?: string;
                bundle_name?: string;
                overall_status?: string;
                verified_at?: string;
                verifier?: { version?: string };
                ruleset_version?: string;
                gate_results?: { total?: number; passed?: number; failed?: number };
            };

            // Extract base release from bundle name
            const release = bundleName.replace(/\+rev\d+$/, '');

            entries.push({
                release,
                bundle_name: bundleName,
                bundle_path: `reverification/${bundleName}/`,
                verdict_path: `reverification/${bundleName}/verdict.json`,
                overall_status: verdict.overall_status || 'UNKNOWN',
                verified_at: verdict.verified_at || '',
                verifier_version: verdict.verifier?.version || '',
                ruleset_version: verdict.ruleset_version || '',
                gate_results: {
                    total: verdict.gate_results?.total || 0,
                    passed: verdict.gate_results?.passed || 0,
                    failed: verdict.gate_results?.failed || 0,
                },
            });
        } catch {
            console.warn(`Failed to parse verdict: ${verdictPath}`);
        }
    }

    // Sort by release, then by bundle (rev order)
    entries.sort((a, b) => {
        if (a.release !== b.release) return a.release.localeCompare(b.release);
        return a.bundle_name.localeCompare(b.bundle_name);
    });

    return entries;
}

// =============================================================================
// Adjudication Index
// =============================================================================

interface AdjudicationEntry {
    run_id: string;
    bundle_path: string;
    verdict_path: string;
    verdict_hash: string;
    ruleset_version: string;
    protocol_pin: string;
    admission_status: string;
    overall_status: string;
    adjudicated_at: string;
}

function generateAdjudicationIndex(): AdjudicationEntry[] {
    const adjudicationDir = path.join(VLAB_ROOT, 'adjudication');
    if (!fs.existsSync(adjudicationDir)) return [];

    const entries: AdjudicationEntry[] = [];

    const runIds = fs.readdirSync(adjudicationDir)
        .filter(entry => {
            const fullPath = path.join(adjudicationDir, entry);
            return fs.statSync(fullPath).isDirectory();
        });

    for (const runId of runIds) {
        const verdictPath = path.join(adjudicationDir, runId, 'verdict.json');
        if (!fs.existsSync(verdictPath)) continue;

        try {
            const verdict = loadJson(verdictPath) as {
                run_id?: string;
                verdict_hash?: string;
                ruleset_version?: string;
                protocol_pin?: string;
                admission_status?: string;
                overall_status?: string;
                adjudicated_at?: string;
            };

            entries.push({
                run_id: runId,
                bundle_path: `adjudication/${runId}/`,
                verdict_path: `adjudication/${runId}/verdict.json`,
                verdict_hash: verdict.verdict_hash || '',
                ruleset_version: verdict.ruleset_version || '',
                protocol_pin: verdict.protocol_pin || '',
                admission_status: verdict.admission_status || '',
                overall_status: verdict.overall_status || 'UNKNOWN',
                adjudicated_at: verdict.adjudicated_at || '',
            });
        } catch {
            console.warn(`Failed to parse verdict: ${verdictPath}`);
        }
    }

    entries.sort((a, b) => a.run_id.localeCompare(b.run_id));
    return entries;
}

interface ExportManifest {
    export_version: string;
    generated_at: string;
    verifier: {
        id: string;
        version: string;
        identity_path: string;
    };
    files: {
        release_index: string;
        ruleset_index: string;
        curated_runs: string;
        verdict_index: string;
        adjudication_index: string;
        sha256sums: string;
    };
    stats: {
        releases: number;
        rulesets: number;
        curated_runs: number;
        verdicts: number;
        reverified_count: number;
        adjudications: number;
        adjudicated_count: number;
    };
}

function generateManifest(
    releaseIndex: ReleaseEntry[],
    rulesetIndex: RulesetEntry[],
    curatedRuns: { runs: CuratedRun[] },
    verdictIndex: VerdictEntry[],
    adjudicationIndex: AdjudicationEntry[]
): ExportManifest {
    // Load verifier identity
    const identityPath = path.join(VLAB_ROOT, 'verifier/VERIFIER_IDENTITY.json');
    const identity = fs.existsSync(identityPath)
        ? loadJson(identityPath) as { verifier_id?: string; version?: string }
        : { verifier_id: 'unknown', version: '0.0.0' };

    const reverifiedCount = verdictIndex.filter(v => v.overall_status === 'REVERIFIED').length;
    const adjudicatedCount = adjudicationIndex.filter(a => a.overall_status === 'ADJUDICATED').length;

    return {
        export_version: '1.2',
        generated_at: new Date().toISOString(),
        verifier: {
            id: identity.verifier_id || 'validation-lab-verifier',
            version: identity.version || '1.0.0',
            identity_path: 'verifier/VERIFIER_IDENTITY.json',
        },
        files: {
            release_index: 'export/release-index.json',
            ruleset_index: 'export/ruleset-index.json',
            curated_runs: 'export/curated-runs.json',
            verdict_index: 'export/verdict-index.json',
            adjudication_index: 'export/adjudication-index.json',
            sha256sums: 'export/sha256sums.txt',
        },
        stats: {
            releases: releaseIndex.length,
            rulesets: rulesetIndex.length,
            curated_runs: curatedRuns.runs.length,
            verdicts: verdictIndex.length,
            reverified_count: reverifiedCount,
            adjudications: adjudicationIndex.length,
            adjudicated_count: adjudicatedCount,
        },
    };
}

function generateSha256sums(): string[] {
    const files = [
        'manifest.json',
        'release-index.json',
        'ruleset-index.json',
        'curated-runs.json',
        'verdict-index.json',
        'adjudication-index.json',
    ];

    const sums: string[] = [];
    for (const file of files) {
        const filePath = path.join(EXPORT_DIR, file);
        if (fs.existsSync(filePath)) {
            const hash = hashFile(filePath);
            sums.push(`${hash}  ${file}`);
        }
    }
    return sums;
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
    console.log('\n📤 Generating Export Interface...\n');

    // Ensure export directory exists
    ensureDir(EXPORT_DIR);

    // Generate indexes
    console.log('[1/6] Generating release-index.json...');
    const releaseIndex = generateReleaseIndex();
    writeJson(path.join(EXPORT_DIR, 'release-index.json'), { releases: releaseIndex });
    console.log(`   ✅ ${releaseIndex.length} releases indexed`);

    console.log('[2/6] Generating ruleset-index.json...');
    const rulesetIndex = generateRulesetIndex();
    writeJson(path.join(EXPORT_DIR, 'ruleset-index.json'), { rulesets: rulesetIndex });
    console.log(`   ✅ ${rulesetIndex.length} rulesets indexed`);

    console.log('[3/6] Generating curated-runs.json...');
    const curatedRuns = generateCuratedRuns();
    writeJson(path.join(EXPORT_DIR, 'curated-runs.json'), curatedRuns);
    console.log(`   ✅ ${curatedRuns.runs.length} curated runs`);

    console.log('[4/6] Generating verdict-index.json...');
    const verdictIndex = generateVerdictIndex();
    writeJson(path.join(EXPORT_DIR, 'verdict-index.json'), { verdicts: verdictIndex });
    const reverifiedCount = verdictIndex.filter(v => v.overall_status === 'REVERIFIED').length;
    console.log(`   ✅ ${verdictIndex.length} verdicts (${reverifiedCount} REVERIFIED)`);

    console.log('[5/6] Generating adjudication-index.json...');
    const adjudicationIndex = generateAdjudicationIndex();
    writeJson(path.join(EXPORT_DIR, 'adjudication-index.json'), { adjudications: adjudicationIndex });
    const adjudicatedCount = adjudicationIndex.filter(a => a.overall_status === 'ADJUDICATED').length;
    console.log(`   ✅ ${adjudicationIndex.length} adjudications (${adjudicatedCount} ADJUDICATED)`);

    // Generate manifest (depends on all other files)
    console.log('[6/6] Generating manifest.json...');
    const manifest = generateManifest(releaseIndex, rulesetIndex, curatedRuns, verdictIndex, adjudicationIndex);
    writeJson(path.join(EXPORT_DIR, 'manifest.json'), manifest);
    console.log('   ✅ manifest.json');

    // Generate sha256sums last (after all other files)
    console.log('\n📋 Generating sha256sums.txt...');
    const sums = generateSha256sums();
    fs.writeFileSync(path.join(EXPORT_DIR, 'sha256sums.txt'), sums.join('\n') + '\n');
    console.log('   ✅ sha256sums.txt');

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Export generation complete');
    console.log('═'.repeat(60));
    console.log(`   Output directory: export/`);
    console.log(`   Releases: ${releaseIndex.length}`);
    console.log(`   Rulesets: ${rulesetIndex.length}`);
    console.log(`   Curated Runs: ${curatedRuns.runs.length}`);
    console.log(`   Verdicts: ${verdictIndex.length} (${reverifiedCount} REVERIFIED)`);
    console.log(`   Adjudications: ${adjudicationIndex.length} (${adjudicatedCount} ADJUDICATED)`);
}

main().catch(err => {
    console.error('Export generation failed:', err);
    process.exit(1);
});
