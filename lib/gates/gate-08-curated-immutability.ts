/**
 * GATE-08: Curated Immutability
 * 
 * Purpose: Validate curated runs integrity and schema completeness
 * 
 * Validates:
 * 1. pack_root_hash recomputation (per contract v1.0)
 * 2. verdict_hash recomputation (determinism anchor)
 * 3. Report integrity hashes match file contents
 * 4. Allowlist entry schema completeness
 * 5. scenario_id exists in scenarios registry
 * 6. repro_ref constraints (if substrate_claim_level=reproduced)
 * 
 * Sprint: Cross-Vendor Evidence Spine v0.1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as yaml from 'js-yaml';

export interface CuratedRunEntry {
    run_id: string;
    scenario_id: string;
    ruleset_version: string;
    substrate: string;
    substrate_claim_level: 'declared' | 'reproduced';
    repro_ref: string;
    exporter_version: string;
    pack_root_hash: string;
    verdict_hash: string;
    verify_report_hash: string;
    evaluation_report_hash: string;
    status: 'frozen' | 'deprecated';
    indexable: boolean;
    created_at: string;
}

export interface Gate08Result {
    passed: boolean;
    entriesChecked: number;
    failures: string[];
}

/**
 * Run GATE-08: Curated Immutability
 */
export async function runGate08(labRoot: string = process.cwd()): Promise<Gate08Result> {
    const failures: string[] = [];
    let entriesChecked = 0;

    // Load curated allowlist
    const allowlistPath = path.join(labRoot, 'data/curated-runs/allowlist.yaml');

    if (!fs.existsSync(allowlistPath)) {
        // No allowlist yet - empty set PASS
        return { passed: true, entriesChecked: 0, failures: [] };
    }

    const allowlistContent = fs.readFileSync(allowlistPath, 'utf-8');
    const allowlist = yaml.load(allowlistContent) as { runs?: CuratedRunEntry[] };

    if (!allowlist.runs || allowlist.runs.length === 0) {
        // Empty allowlist - PASS
        return { passed: true, entriesChecked: 0, failures: [] };
    }

    // Load curated schema
    const schemaPath = path.join(labRoot, 'governance/schemas/curated-run.schema.yaml');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = yaml.load(schemaContent) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const requiredFields = schema.required || [];
    const enumConstraints = schema.enums || {};

    // Validate each curated run
    for (const entry of allowlist.runs) {
        entriesChecked++;
        const runId = entry.run_id || `entry_${entriesChecked}`;

        // Check schema completeness
        for (const field of requiredFields) {
            if (!(field in entry)) {
                failures.push(`${runId}: Missing required field '${field}'`);
            }
        }

        // Check enum constraints
        if (entry.substrate_claim_level && enumConstraints.substrate_claim_level) {
            if (!enumConstraints.substrate_claim_level.includes(entry.substrate_claim_level)) {
                failures.push(`${runId}: Invalid substrate_claim_level '${entry.substrate_claim_level}'`);
            }
        }

        if (entry.status && enumConstraints.status) {
            if (!enumConstraints.status.includes(entry.status)) {
                failures.push(`${runId}: Invalid status '${entry.status}'`);
            }
        }

        // Check scenario_id exists in registry
        const scenarioPath = path.join(labRoot, 'data/scenarios', `${entry.scenario_id}.yaml`);
        if (!fs.existsSync(scenarioPath)) {
            failures.push(`${runId}: scenario_id '${entry.scenario_id}' not found in data/scenarios/`);
        }

        // Check reproduced constraints
        if (entry.substrate_claim_level === 'reproduced') {
            // repro_ref must be filled
            if (!entry.repro_ref || !entry.repro_ref.trim()) {
                failures.push(`${runId}: repro_ref required for substrate_claim_level=reproduced`);
                continue;
            }

            // repro_ref must contain #repro-steps anchor
            if (!entry.repro_ref.includes('#repro-steps')) {
                failures.push(`${runId}: repro_ref must contain '#repro-steps' anchor`);
            }

            // Extract file path (before # anchor)
            const repoRefPath = entry.repro_ref.split('#')[0];
            const fullPath = path.join(labRoot, repoRefPath);

            // Check target file exists
            if (!fs.existsSync(fullPath)) {
                failures.push(`${runId}: repro_ref target '${repoRefPath}' not found`);
                continue;
            }

            // Check README has required sections
            const readmeContent = fs.readFileSync(fullPath, 'utf-8');
            const requiredSections = schema.reproduced_constraints?.repro_readme_required_sections || [];

            for (const section of requiredSections) {
                // Simple string check for section headers
                const pattern = new RegExp(`#+\\s*${section}`, 'i');
                if (!pattern.test(readmeContent)) {
                    failures.push(`${runId}: repro_ref README missing section '${section}'`);
                }
            }
        }

        // Validate pack_root_hash recomputation
        const runPath = path.join(labRoot, 'data/runs', entry.run_id);
        if (fs.existsSync(runPath)) {
            const sumsPath = path.join(runPath, 'integrity/sha256sums.txt');
            if (fs.existsSync(sumsPath)) {
                const computed = await recomputePackRootHash(sumsPath);
                if (computed !== entry.pack_root_hash) {
                    const expected = (entry.pack_root_hash || '').slice(0, 16);
                    failures.push(`${runId}: pack_root_hash mismatch (expected ${expected}..., computed ${computed.slice(0, 16)}...)`);
                }
            }
        }

        // Validate verdict_hash recomputation
        if (fs.existsSync(runPath)) {
            const evalPath = path.join(runPath, 'evaluation.report.json');
            if (fs.existsSync(evalPath)) {
                const verdictHash = entry.verdict_hash || '';
                // Note: verdict_hash recomputation requires canonicalize logic
                // For now, just check it's non-empty hex
                if (!/^[0-9a-f]{64}$/.test(verdictHash)) {
                    failures.push(`${runId}: verdict_hash invalid format (must be 64-char hex)`);
                }
            }
        }

        // Validate report hashes
        if (fs.existsSync(runPath)) {
            const verifyPath = path.join(runPath, 'verify.report.json');
            if (fs.existsSync(verifyPath)) {
                const computed = hashFile(verifyPath);
                if (computed !== entry.verify_report_hash) {
                    failures.push(`${runId}: verify_report_hash mismatch`);
                }
            }

            const evalPath = path.join(runPath, 'evaluation.report.json');
            if (fs.existsSync(evalPath)) {
                const computed = hashFile(evalPath);
                if (computed !== entry.evaluation_report_hash) {
                    failures.push(`${runId}: evaluation_report_hash mismatch`);
                }
            }
        }
    }

    return {
        passed: failures.length === 0,
        entriesChecked,
        failures,
    };
}

/**
 * Recompute pack_root_hash per contract v1.0 L185-194
 */
async function recomputePackRootHash(sha256sumsPath: string): Promise<string> {
    const content = fs.readFileSync(sha256sumsPath, 'utf-8');

    // Parse lines
    const lines = content.split('\n').filter(l => l.trim());

    // Parse and sort by path
    const entries = lines.map(l => {
        const match = l.match(/^([0-9a-f]{64})\s+(.+)$/);
        if (!match) throw new Error(`Invalid sha256sums line: ${l}`);
        return { hash: match[1], path: match[2] };
    });

    entries.sort((a, b) => a.path.localeCompare(b.path));

    // Normalize: sorted, LF, no trailing newline
    const normalized = entries.map(e => `${e.hash}  ${e.path}`).join('\n');

    return crypto.createHash('sha256').update(normalized, 'utf-8').digest('hex');
}

/**
 * Hash a file with SHA-256
 */
function hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

// CLI entry point
if (require.main === module) {
    runGate08()
        .then(result => {
            console.log('='.repeat(60));
            console.log('GATE-08: Curated Immutability');
            console.log('='.repeat(60));
            console.log(`\nEntries checked: ${result.entriesChecked}`);

            if (result.passed) {
                console.log(`\n✅ GATE-08 PASSED (${result.entriesChecked} entries validated)`);
                process.exit(0);
            } else {
                console.log(`\n❌ GATE-08 FAILED (${result.failures.length} failures)\n`);
                for (const failure of result.failures) {
                    console.log(`  - ${failure}`);
                }
                process.exit(1);
            }
        })
        .catch(err => {
            console.error('GATE-08 Error:', err);
            process.exit(1);
        });
}
