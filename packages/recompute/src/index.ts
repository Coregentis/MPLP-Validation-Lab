#!/usr/bin/env node
/**
 * @mplp/recompute v0.1.1 - Third-party verdict recomputation CLI
 * 
 * Purpose: Enable repo-external, offline verification of MPLP evidence pack verdicts
 * Strategy: Bundled ruleset-1.0 (no network dependencies)
 * 
 * Sprint: Cross-Vendor Evidence Spine v0.1
 * 
 * PHASE 2.1 HOTFIX: Now performs TRUE recomputation by:
 * - Loading pack artifacts
 * - Executing evaluation logic (bundled ruleset-1.0)
 * - Computing verdict_hash from evaluation results
 * - NOT depending on pre-existing evaluation.report.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface RecomputeResult {
    ruleset_source: 'bundled';
    ruleset_version: string;
    pack_id: string;
    verdict_hash: string;
    match: boolean | null;
    curated_hash: string | null;
}

interface EvaluationReport {
    report_version: string;
    ruleset_version: string;
    pack_id: string;
    pack_root_hash: string;
    protocol_version: string;
    gf_verdicts: GFVerdict[];
}

interface GFVerdict {
    gf_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    requirements: RequirementVerdict[];
    failures: any[];
}

interface RequirementVerdict {
    requirement_id: string;
    status: 'PASS' | 'FAIL';
    pointers: EvidencePointer[];
    message: string;
    taxonomy?: string;
}

interface EvidencePointer {
    artifact_path: string;
    content_hash: string;
    locator: string;
    requirement_id: string;
}

/**
 * Main CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: mplp-recompute <pack_path> --ruleset <version>');
        console.error('Example: mplp-recompute ./data/runs/sample-pass --ruleset 1.0');
        process.exit(2);
    }

    const packPath = path.resolve(args[0]);
    const rulesetFlag = args[1];
    const rulesetVersion = args[2];

    // Validate ruleset flag
    if (rulesetFlag !== '--ruleset') {
        console.error('Error: Expected --ruleset flag');
        process.exit(2);
    }

    // T2.2.1: Only accept ruleset 1.0 (frozen for v0.1)
    if (rulesetVersion !== '1.0') {
        console.error(`Error: Only ruleset version 1.0 is supported (got: ${rulesetVersion})`);
        console.error('This CLI bundles ruleset-1.0 for deterministic recomputation.');
        process.exit(2);
    }

    // Verify pack exists
    if (!fs.existsSync(packPath)) {
        console.error(`Error: Pack path does not exist: ${packPath}`);
        process.exit(1);
    }

    // Load manifest
    const manifestPath = path.join(packPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error(`Error: manifest.json not found in pack`);
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const packId = manifest.pack_id || 'unknown';

    // Compute pack_root_hash
    const packRootHash = await computePackRootHash(packPath);

    // Execute evaluation (bundled ruleset-1.0)
    const evaluationReport = await evaluatePack(packPath, packId, packRootHash, manifest);

    // Compute verdict_hash
    const verdictHash = computeVerdictHash(evaluationReport);

    // Prepare result
    const result: RecomputeResult = {
        ruleset_source: 'bundled',
        ruleset_version: '1.0',
        pack_id: packId,
        verdict_hash: verdictHash,
        match: null,
        curated_hash: null,
    };

    // Output JSON
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}

/**
 * Compute pack_root_hash from integrity/sha256sums.txt
 */
async function computePackRootHash(packPath: string): Promise<string> {
    const sumsPath = path.join(packPath, 'integrity/sha256sums.txt');

    if (!fs.existsSync(sumsPath)) {
        return '0'.repeat(64); // Fallback if no sha256sums
    }

    const content = fs.readFileSync(sumsPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Parse and sort by path (per contract v1.0)
    const entries = lines.map(l => {
        const match = l.match(/^([0-9a-f]{64})\s+(.+)$/);
        if (!match) return null;
        return { hash: match[1], path: match[2] };
    }).filter(e => e !== null) as { hash: string; path: string }[];

    entries.sort((a, b) => a.path.localeCompare(b.path));

    // Normalize: sorted, LF, no trailing newline
    const normalized = entries.map(e => `${e.hash}  ${e.path}`).join('\n');

    return crypto.createHash('sha256').update(normalized, 'utf-8').digest('hex');
}

/**
 * Evaluate pack against bundled ruleset-1.0
 */
async function evaluatePack(
    packPath: string,
    packId: string,
    packRootHash: string,
    manifest: any
): Promise<EvaluationReport> {
    const protocolVersion = manifest.protocol_version || '1.0.0';

    // Bundled ruleset-1.0: hardcoded structure (no YAML parsing needed)
    // ruleset-1.0 defines gf-01 through gf-05
    const gfIds = ['gf-01', 'gf-02', 'gf-03', 'gf-04', 'gf-05'];
    const gfVerdicts: GFVerdict[] = [];

    for (const gfId of gfIds) {
        const verdict = await evaluateGF(packPath, gfId);
        gfVerdicts.push(verdict);
    }

    return {
        report_version: '1.0',
        ruleset_version: 'ruleset-1.0',
        pack_id: packId,
        pack_root_hash: packRootHash,
        protocol_version: protocolVersion,
        gf_verdicts: gfVerdicts,
    };
}

/**
 * Evaluate a single Golden Flow
 * Per bundled ruleset-1.0 YAML files (hardcoded for v0.1)
 */
async function evaluateGF(packPath: string, gfId: string): Promise<GFVerdict> {
    const requirements: RequirementVerdict[] = [];

    // Per actual ruleset-1.0 YAML files:
    let checks: Array<{ id: string; artifact: string }> = [];

    switch (gfId) {
        case 'gf-01':
            checks = [
                { id: 'gf-01-r01', artifact: 'artifacts/context.json' },
                { id: 'gf-01-r02', artifact: 'artifacts/plan.json' },
                { id: 'gf-01-r03', artifact: 'artifacts/trace.json' },
            ];
            break;
        case 'gf-02':
            checks = [{ id: 'gf-02-r01', artifact: 'timeline/events.ndjson' }];
            break;
        case 'gf-03':
            checks = [{ id: 'gf-03-r01', artifact: 'artifacts/context.json' }];
            break;
        case 'gf-04':
            checks = [{ id: 'gf-04-r01', artifact: 'manifest.json' }];
            break;
        case 'gf-05':
            checks = [{ id: 'gf-05-r01', artifact: 'integrity/sha256sums.txt' }];
            break;
    }

    for (const check of checks) {
        const artifactPath = path.join(packPath, check.artifact);
        const exists = fs.existsSync(artifactPath);

        if (exists) {
            requirements.push({
                requirement_id: check.id,
                status: 'PASS',
                pointers: [{
                    artifact_path: check.artifact,
                    content_hash: '',
                    locator: `file:${check.artifact}`,
                    requirement_id: check.id,
                }],
                message: `Evidence present: ${check.artifact}`,
            });
        } else {
            requirements.push({
                requirement_id: check.id,
                status: 'FAIL',
                pointers: [],
                message: `Evidence missing: ${check.artifact}`,
                taxonomy: 'REQUIRED_ARTIFACT_MISSING',
            });
        }
    }

    const allPass = requirements.every(r => r.status === 'PASS');

    return {
        gf_id: gfId,
        status: allPass ? 'PASS' : 'FAIL',
        requirements,
        failures: allPass ? [] : [{ taxonomy: 'REQUIRED_ARTIFACT_MISSING', message: 'One or more artifacts missing' }],
    };
}

/**
 * Compute deterministic verdict_hash from evaluation report
 * Per lib/verdict/canonicalize.ts SSOT
 */
function computeVerdictHash(report: EvaluationReport): string {
    // Canonicalize: only include deterministic fields
    const canonical = {
        report_version: report.report_version,
        ruleset_version: report.ruleset_version,
        pack_id: report.pack_id,
        pack_root_hash: report.pack_root_hash,
        protocol_version: report.protocol_version,
        gf_verdicts: report.gf_verdicts.map(gf => ({
            gf_id: gf.gf_id,
            status: gf.status,
            requirements: gf.requirements.map(req => ({
                requirement_id: req.requirement_id,
                status: req.status,
                pointers: req.pointers.map(p => ({
                    artifact_path: p.artifact_path,
                    content_hash: p.content_hash,
                    locator: p.locator,
                    requirement_id: p.requirement_id,
                })),
                message: req.message,
                ...(req.taxonomy ? { taxonomy: req.taxonomy } : {}),
            })),
            failures: gf.failures,
        })),
    };

    // Stable stringify (sort keys)
    const serialized = stableStringify(canonical);

    return crypto.createHash('sha256').update(serialized, 'utf-8').digest('hex');
}

/**
 * Stable JSON stringify with sorted keys
 */
function stableStringify(obj: any): string {
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) {
        return '[' + obj.map(stableStringify).join(',') + ']';
    }

    const keys = Object.keys(obj).sort();
    const pairs = keys.map(k => `"${k}":${stableStringify(obj[k])}`);
    return '{' + pairs.join(',') + '}';
}

// Run CLI
main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
