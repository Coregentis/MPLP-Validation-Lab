/**
 * Adjudication Pipeline
 * 
 * Core adjudication function that:
 * 1. Loads run pointer
 * 2. Ingests evidence pack
 * 3. Verifies (admission + integrity)
 * 4. Evaluates (GF verdicts)
 * 5. Generates adjudication bundle
 * 
 * IMPORTANT: This is pure verification logic.
 * No execution hosting, no endorsement, no ranking.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ingest } from '../engine/ingest';
import { verify } from '../engine/verify';
import { computeDeterministicHash, hashFile } from './deterministicHash';

// =============================================================================
// Types
// =============================================================================

interface RunPointer {
    pack_path: string;
    pack_layout?: string;
    notes?: string;
}

interface GoldenFlowResult {
    gf_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    evidence_refs: string[];
    message?: string;
}

interface EvaluateReport {
    evaluate_version: string;
    run_id: string;
    evaluated_at: string;
    ruleset_version: string;
    golden_flows: GoldenFlowResult[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        not_evaluated: number;
    };
}

interface AdjudicationVerdict {
    adjudication_version: string;
    run_id: string;
    adjudicated_at: string;

    verifier: {
        id: string;
        version: string;
    };

    ruleset_version: string;
    protocol_pin: string;

    admission_status: string;

    golden_flow_results: GoldenFlowResult[];

    overall_status: 'ADJUDICATED' | 'INCOMPLETE' | 'NOT_ADMISSIBLE';

    verdict_hash: string;

    _meta?: {
        generated_by: string;
        notes?: string;
    };
}

interface AdjudicationResult {
    run_id: string;
    bundle_path: string;
    verdict: AdjudicationVerdict;
}

// =============================================================================
// Helpers
// =============================================================================

const VLAB_ROOT = path.resolve(__dirname, '../..');

function loadJson(filePath: string): unknown {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyFile(src: string, dest: string): void {
    fs.copyFileSync(src, dest);
}

// =============================================================================
// Evaluation Logic
// =============================================================================

/**
 * Evaluate golden flows based on evidence pack structure.
 * 
 * This is a minimal implementation that checks for evidence presence.
 * More sophisticated ruleset-based evaluation can be added later.
 */
function evaluateGoldenFlows(
    packPath: string,
    fileInventory: string[],
    rulesetVersion: string
): EvaluateReport {
    const goldenFlows: GoldenFlowResult[] = [];

    // GF-01: Model Routing Evidence
    // FAIL if any artifact contains __INVALID_MARKER__ file (indicates corrupt evidence)
    const invalidMarker = fileInventory.find(f => f.includes('__INVALID_MARKER__'));
    const gf01Evidence = fileInventory.filter(f =>
        f.includes('model') || f.includes('routing') || f.includes('artifacts/')
    );

    let gf01Status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    let gf01Message: string;

    if (invalidMarker) {
        gf01Status = 'FAIL';
        gf01Message = 'Evidence contains INVALID_MARKER flag - evidence integrity compromised';
    } else if (gf01Evidence.length > 0) {
        gf01Status = 'PASS';
        gf01Message = 'Evidence artifacts present';
    } else {
        gf01Status = 'NOT_EVALUATED';
        gf01Message = 'No model routing evidence found';
    }

    goldenFlows.push({
        gf_id: 'GF-01',
        status: gf01Status,
        evidence_refs: invalidMarker ? [invalidMarker] : gf01Evidence.slice(0, 5),
        message: gf01Message,
    });

    // GF-02: Prompt Fidelity
    const gf02Evidence = fileInventory.filter(f =>
        f.includes('prompt') || f.includes('input') || f.includes('timeline/')
    );
    goldenFlows.push({
        gf_id: 'GF-02',
        status: gf02Evidence.length > 0 ? 'PASS' : 'NOT_EVALUATED',
        evidence_refs: gf02Evidence.slice(0, 5),
        message: gf02Evidence.length > 0 ? 'Prompt evidence present' : 'No prompt fidelity evidence found',
    });

    // GF-03: Output Integrity
    const gf03Evidence = fileInventory.filter(f =>
        f.includes('output') || f.includes('response') || f.includes('integrity/')
    );
    goldenFlows.push({
        gf_id: 'GF-03',
        status: gf03Evidence.length > 0 ? 'PASS' : 'NOT_EVALUATED',
        evidence_refs: gf03Evidence.slice(0, 5),
        message: gf03Evidence.length > 0 ? 'Output integrity evidence present' : 'No output evidence found',
    });

    // GF-04: Timeline Ordering
    const gf04Evidence = fileInventory.filter(f =>
        f.includes('timeline') || f.includes('sequence') || f.includes('order')
    );
    goldenFlows.push({
        gf_id: 'GF-04',
        status: gf04Evidence.length > 0 ? 'PASS' : 'NOT_EVALUATED',
        evidence_refs: gf04Evidence.slice(0, 5),
        message: gf04Evidence.length > 0 ? 'Timeline evidence present' : 'No timeline evidence found',
    });

    // GF-05: Cryptographic Binding
    const gf05Evidence = fileInventory.filter(f =>
        f.includes('sha256') || f.includes('hash') || f.includes('signature') || f.includes('integrity/')
    );
    goldenFlows.push({
        gf_id: 'GF-05',
        status: gf05Evidence.length > 0 ? 'PASS' : 'NOT_EVALUATED',
        evidence_refs: gf05Evidence.slice(0, 5),
        message: gf05Evidence.length > 0 ? 'Cryptographic binding present' : 'No crypto evidence found',
    });

    const summary = {
        total: goldenFlows.length,
        passed: goldenFlows.filter(g => g.status === 'PASS').length,
        failed: goldenFlows.filter(g => g.status === 'FAIL').length,
        not_evaluated: goldenFlows.filter(g => g.status === 'NOT_EVALUATED').length,
    };

    return {
        evaluate_version: '1.0',
        run_id: '', // Set by caller
        evaluated_at: new Date().toISOString(),
        ruleset_version: rulesetVersion,
        golden_flows: goldenFlows,
        summary,
    };
}

// =============================================================================
// Main Adjudication Function
// =============================================================================

/**
 * Adjudicate a run.
 * 
 * @param runId The run identifier (e.g., 'gf-01-smoke')
 * @returns Adjudication result with bundle path and verdict
 */
export async function adjudicate(runId: string): Promise<AdjudicationResult> {
    console.log(`\n⚖️  Adjudicating: ${runId}\n`);

    // Paths
    const runDir = path.join(VLAB_ROOT, 'data/runs', runId);
    const pointerPath = path.join(runDir, 'input.pointer.json');
    const bundleDir = path.join(VLAB_ROOT, 'adjudication', runId);
    const identityPath = path.join(VLAB_ROOT, 'verifier/VERIFIER_IDENTITY.json');

    // Step 1: Load run pointer
    console.log('[1/7] Loading run pointer...');
    if (!fs.existsSync(pointerPath)) {
        throw new Error(`Run pointer not found: ${pointerPath}`);
    }
    const pointer = loadJson(pointerPath) as RunPointer;
    const packPath = path.isAbsolute(pointer.pack_path)
        ? pointer.pack_path
        : path.join(VLAB_ROOT, pointer.pack_path);
    console.log(`   📦 Pack: ${pointer.pack_path}`);

    // Step 2: Ingest pack
    console.log('[2/7] Ingesting evidence pack...');
    const pack = await ingest(packPath);
    console.log(`   ✅ ${pack.file_inventory.length} files indexed`);

    // Step 3: Verify (admission + integrity)
    console.log('[3/7] Running verification...');
    const verifyReport = await verify(pack);
    console.log(`   ✅ Admission: ${verifyReport.admission_status}`);

    // Step 4: Evaluate (GF verdicts)
    console.log('[4/7] Evaluating golden flows...');
    const rulesetVersion = '1.0'; // From VERIFIER_IDENTITY
    const evaluateReport = evaluateGoldenFlows(packPath, pack.file_inventory, rulesetVersion);
    evaluateReport.run_id = runId;
    console.log(`   ✅ GF: ${evaluateReport.summary.passed}/${evaluateReport.summary.total} passed`);

    // Step 5: Load verifier identity
    console.log('[5/7] Loading verifier identity...');
    const identity = loadJson(identityPath) as {
        verifier_id: string;
        version: string;
        upstream_pin?: { version?: string };
    };

    // Step 6: Generate bundle
    console.log('[6/7] Generating adjudication bundle...');
    ensureDir(bundleDir);

    // 6a: Copy input pointer
    copyFile(pointerPath, path.join(bundleDir, 'input.pointer.json'));

    // 6b: Snapshot verifier identity
    copyFile(identityPath, path.join(bundleDir, 'verifier.identity.json'));

    // 6c: Compute fingerprint
    const fingerprint = {
        fingerprint_version: '1.0',
        computed_at: new Date().toISOString(),
        engine_hash: hashFile(path.join(VLAB_ROOT, 'lib/engine/verify.ts')).slice(0, 16),
        ingest_hash: hashFile(path.join(VLAB_ROOT, 'lib/engine/ingest.ts')).slice(0, 16),
        ruleset_version: rulesetVersion,
    };
    writeJson(path.join(bundleDir, 'verifier.fingerprint.json'), fingerprint);

    // 6d: Write verify report
    writeJson(path.join(bundleDir, 'verify.report.json'), verifyReport);

    // 6e: Write evaluate report
    writeJson(path.join(bundleDir, 'evaluate.report.json'), evaluateReport);

    // 6f: Build verdict
    const overallStatus: 'ADJUDICATED' | 'INCOMPLETE' | 'NOT_ADMISSIBLE' =
        verifyReport.admission_status !== 'ADMISSIBLE'
            ? 'NOT_ADMISSIBLE'
            : evaluateReport.summary.not_evaluated === evaluateReport.summary.total
                ? 'INCOMPLETE'
                : 'ADJUDICATED';

    // Build verdict without hash first
    const verdictBase = {
        adjudication_version: '1.0',
        run_id: runId,
        adjudicated_at: new Date().toISOString(),
        verifier: {
            id: identity.verifier_id,
            version: identity.version,
        },
        ruleset_version: rulesetVersion,
        protocol_pin: identity.upstream_pin?.version || 'unknown',
        admission_status: verifyReport.admission_status,
        golden_flow_results: evaluateReport.golden_flows,
        overall_status: overallStatus,
        // verdict_hash computed below
    };

    // Compute deterministic hash (excludes adjudicated_at)
    const verdictHash = computeDeterministicHash(verdictBase);

    const verdict: AdjudicationVerdict = {
        ...verdictBase,
        verdict_hash: verdictHash,
        _meta: {
            generated_by: 'vlab-adjudicate',
        },
    };

    writeJson(path.join(bundleDir, 'verdict.json'), verdict);

    // Step 7: Generate sha256sums
    console.log('[7/7] Generating sha256sums.txt...');
    const bundleFiles = [
        'input.pointer.json',
        'verifier.identity.json',
        'verifier.fingerprint.json',
        'verify.report.json',
        'evaluate.report.json',
        'verdict.json',
    ];

    const sums: string[] = [];
    for (const file of bundleFiles) {
        const filePath = path.join(bundleDir, file);
        if (fs.existsSync(filePath)) {
            const hash = hashFile(filePath);
            sums.push(`${hash}  ${file}`);
        }
    }
    fs.writeFileSync(path.join(bundleDir, 'sha256sums.txt'), sums.join('\n') + '\n');

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Adjudication complete: ${runId}`);
    console.log('═'.repeat(60));
    console.log(`   Bundle: adjudication/${runId}/`);
    console.log(`   Admission: ${verifyReport.admission_status}`);
    console.log(`   GF Results: ${evaluateReport.summary.passed}/${evaluateReport.summary.total}`);
    console.log(`   Overall: ${verdict.overall_status}`);
    console.log(`   Verdict Hash: ${verdictHash.slice(0, 16)}...`);

    return {
        run_id: runId,
        bundle_path: bundleDir,
        verdict,
    };
}
