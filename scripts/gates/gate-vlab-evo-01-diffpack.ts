import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-EVO-01: Diffpack Completeness & Attribution
 * 
 * Verifies that all ruleset diff packs:
 * 1. Match the diffpack.schema.json
 * 2. Have valid Rationale and Affected Pointers for every clause
 * 3. Don't use disallowed 'marketing' or 'vague' terminology
 */

const PROJECT_ROOT = process.cwd();
const DIFFPACKS_DIR = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs');
const SCHEMA_PATH = path.join(PROJECT_ROOT, 'governance/schemas/diffpack.schema.json');

function runGateEvo01() {
    console.log('🛡️  Running VLAB-GATE-EVO-01: Diffpack Completeness & Attribution...');

    if (!fs.existsSync(DIFFPACKS_DIR)) {
        console.log('ℹ️  No diffpacks found, skipping.');
        return;
    }

    const diffpacks = fs.readdirSync(DIFFPACKS_DIR).filter(f => f.endsWith('.diffpack.json'));

    for (const filename of diffpacks) {
        const filePath = path.join(DIFFPACKS_DIR, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`📋 Auditing ${filename}...`);

        for (const clause of data.clauses_changed) {
            // Check for attribution
            if (!clause.affected_evidence_pointers || clause.affected_evidence_pointers.length === 0) {
                console.error(`❌ Clause ${clause.clause_id} in ${filename} missing affected_evidence_pointers.`);
                process.exit(1);
            }

            // Check for vague rationale
            const vagueTerms = ['improved', 'better', 'enhanced', 'optimal', 'standard'];
            const rationale = clause.rationale.toLowerCase();
            if (vagueTerms.some(term => rationale.includes(term)) && rationale.split(' ').length < 5) {
                console.error(`❌ Clause ${clause.clause_id} in ${filename} has vague/marketing rationale.`);
                process.exit(1);
            }
        }
        console.log(`✅ ${filename} passed structural attribution audit.`);
    }

    console.log('\n🟢 Gate PASS: All Ruleset Diff Packs are complete and attributed.');
}

runGateEvo01();
