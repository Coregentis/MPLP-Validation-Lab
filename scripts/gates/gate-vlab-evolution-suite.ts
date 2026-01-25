import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import Ajv from 'ajv';

/**
 * VLAB Evolution Gate Suite (v0.11)
 * 
 * EVO-01: Rationale Attribution (Anti-Vague)
 * EVO-02: Schema Structural Validation (AJV)
 * EVO-03: Evidence Pointer Closure (Harden)
 * EVO-04: Input Anchor Integrity
 */

const PROJECT_ROOT = process.cwd();
const DIFFPACKS_DIR = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs');
const CROSS_VERIFIED_DIR = path.join(PROJECT_ROOT, 'public/_data/cross-verified');
const SAMPLE_SET_PATH = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
const REPORT_PATH = path.join(PROJECT_ROOT, 'public/_data/cross-verified/v0.10.2-report.json');
const SHADOW_INPUT_PATH = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs/shadow-input.json');
const SCHEMA_PATH = path.join(PROJECT_ROOT, 'governance/schemas/diffpack.schema.json');

const ajv = new Ajv({ allErrors: true });

function getFileHash(filePath: string): string {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple canonical: remove whitespace for hash if needed, but here we expect the file to be stable
    return crypto.createHash('sha256').update(content).digest('hex');
}

function runEvolutionAudit() {
    console.log('🛡️  Running v0.11 Evolution Audit Suite...');

    // 0. Load Schema
    if (!fs.existsSync(SCHEMA_PATH)) {
        console.error('❌ Schema not found: ' + SCHEMA_PATH);
        process.exit(1);
    }
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    const validate = ajv.compile(schema);

    // 1. Gather Valid Run IDs
    const validRunIds = new Set();
    if (fs.existsSync(SAMPLE_SET_PATH)) {
        const sampleSet = JSON.parse(fs.readFileSync(SAMPLE_SET_PATH, 'utf8'));
        (sampleSet.runs || []).forEach((r: any) => validRunIds.add(r.run_id));
    }
    if (fs.existsSync(REPORT_PATH)) {
        const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
        (report.entries || []).forEach((r: any) => validRunIds.add(r.run_id));
    }

    // 2. Compute Shadow Input Hash for EVO-04
    if (!fs.existsSync(SHADOW_INPUT_PATH)) {
        console.error('❌ Shadow input not found: ' + SHADOW_INPUT_PATH);
        process.exit(1);
    }
    const currentShadowInputHash = getFileHash(SHADOW_INPUT_PATH);

    // 3. Audit Diffpacks
    if (!fs.existsSync(DIFFPACKS_DIR)) {
        console.log('ℹ️  No diffpacks found, skipping.');
        return;
    }

    const diffpackDirs = fs.readdirSync(DIFFPACKS_DIR).filter(d =>
        fs.statSync(path.join(DIFFPACKS_DIR, d)).isDirectory()
    );

    let foundDiffpacks = false;

    for (const dirName of diffpackDirs) {
        const diffId = dirName;
        const diffpackPath = path.join(DIFFPACKS_DIR, dirName, 'diffpack.json');

        if (!fs.existsSync(diffpackPath)) continue;
        foundDiffpacks = true;

        const data = JSON.parse(fs.readFileSync(diffpackPath, 'utf8'));

        console.log(`📋 Auditing ${diffId}...`);

        // EVO-02: AJV Validation
        const valid = validate(data);
        if (!valid) {
            console.error(`❌ EVO-02: ${diffId} failed schema validation:`);
            console.error(ajv.errorsText(validate.errors));
            process.exit(1);
        }

        // EVO-04: Input Anchor Integrity
        if (data.inputs.shadow_input_sha256 !== currentShadowInputHash) {
            console.error(`❌ EVO-04: ${diffId} shadow_input_sha256 mismatch!`);
            console.error(`   Expected: ${currentShadowInputHash}`);
            console.error(`   Actual:   ${data.inputs.shadow_input_sha256}`);
            process.exit(1);
        }

        // Clause-level Audit
        for (const clause of data.clauses_changed) {
            // EVO-01: Rationale Attribution
            const rationale = clause.rationale.toLowerCase();
            const vagueTerms = ['improved', 'better', 'enhanced', 'optimal', 'standard'];
            const quantifiers = ['reduce', 'increment', 'decrement', 'by', 'stable', 'variance', 'delta'];

            const isVague = vagueTerms.some(term => rationale.includes(term));
            const hasQuantifier = quantifiers.some(q => rationale.includes(q)) || rationale.includes('%');
            const hasValidRefs = clause.evidence_refs && clause.evidence_refs.length > 0;

            if (isVague && !hasQuantifier && !hasValidRefs) {
                console.error(`❌ EVO-01: Clause ${clause.clause_id} in ${diffId} has vague rationale without quantification or evidence.`);
                process.exit(1);
            }

            // EVO-03: Evidence Closure (Harden)
            for (const ref of clause.evidence_refs) {
                const isRunId = validRunIds.has(ref);

                // Diff Path hardening
                let isDiffPath = false;
                if (ref.startsWith('diffs/')) {
                    if (!ref.endsWith('.json')) {
                        console.error(`❌ EVO-03: Invalid evidence reference "${ref}" - diff path must end in .json`);
                        process.exit(1);
                    }
                    const fullDiffPath = path.join(CROSS_VERIFIED_DIR, ref);
                    const normalizedPath = path.normalize(fullDiffPath);
                    if (!normalizedPath.startsWith(CROSS_VERIFIED_DIR)) {
                        console.error(`❌ EVO-03: Invalid evidence reference "${ref}" - path traversal detected.`);
                        process.exit(1);
                    }
                    isDiffPath = fs.existsSync(fullDiffPath);
                }

                if (!isRunId && !isDiffPath) {
                    console.error(`❌ EVO-03: Invalid evidence reference "${ref}" in clause ${clause.clause_id}. Not a valid run_id or authorized diff path.`);
                    process.exit(1);
                }
            }
        }
        console.log(`✅ ${diffId} passed Evolution Audit (EVO-01/02/03/04).`);
    }

    if (!foundDiffpacks) {
        console.log('ℹ️  No diffpack.json files found in subdirectories of ' + DIFFPACKS_DIR);
    }

    console.log('\n🟢 Evolution Gate PASS: All Ruleset Diff Packs are complete, attributed, and anchored.');
}

runEvolutionAudit();
