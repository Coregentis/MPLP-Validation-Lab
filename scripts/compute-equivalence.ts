import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * compute-equivalence.ts
 * Implements v0.10.2.2: Cross-substrate equivalence computation
 * 
 * Reads: equivalence-criteria.yaml, normalized packs
 * Outputs: cross-verified report + diff files
 */

const PROJECT_ROOT = process.cwd();
const GOVERNANCE_DIR = path.join(PROJECT_ROOT, 'governance/mappings');
const DERIVED_DIR = path.join(PROJECT_ROOT, 'data/derived/normalized');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/_data/cross-verified');

// Load SSOTs
const equivCriteria = yaml.load(fs.readFileSync(path.join(GOVERNANCE_DIR, 'equivalence-criteria.yaml'), 'utf8')) as any;
const normSpec = yaml.load(fs.readFileSync(path.join(GOVERNANCE_DIR, 'normalization-spec.yaml'), 'utf8')) as any;
const hashScope = yaml.load(fs.readFileSync(path.join(GOVERNANCE_DIR, 'hash-scope.yaml'), 'utf8')) as any;

interface NormalizedEntry {
    run_id: string;
    substrate: string;
    scenario_family: string;
    normalized_hash: string;
    verdict_status: string;
    admission_status: string;
}

interface EquivalencePair {
    left_run_id: string;
    right_run_id: string;
    equivalent: boolean;
    diff_ref?: string;
}

interface DiffFile {
    scenario_family: string;
    pair: [string, string];
    differences: Array<{
        note_code: string;
        params: Record<string, any>;
    }>;
    disclaimer: string;
}

function main() {
    console.log('🔍 Computing cross-substrate equivalence...');

    // Ensure output directories exist
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.mkdirSync(path.join(OUTPUT_DIR, 'diffs'), { recursive: true });

    // Load normalized summary
    const summaryPath = path.join(DERIVED_DIR, '_normalization_summary.json');
    if (!fs.existsSync(summaryPath)) {
        console.error('❌ Normalization summary not found. Run normalize-pack.ts first.');
        process.exit(1);
    }

    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

    // Build entries with full metadata
    const entries: NormalizedEntry[] = summary.results.map((r: any) => {
        const evidencePath = path.join(DERIVED_DIR, r.run_id, 'normalized_evidence.json');
        const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

        return {
            run_id: r.run_id,
            substrate: evidence.manifest.substrate || extractSubstrate(r.run_id),
            scenario_family: r.scenario_family,
            normalized_hash: r.hash,
            verdict_status: evidence.verdict.status || 'unknown',
            admission_status: evidence.verdict.admission?.status || 'unknown'
        };
    });

    // Group by scenario_family
    const familyGroups: Record<string, NormalizedEntry[]> = {};
    for (const entry of entries) {
        if (!familyGroups[entry.scenario_family]) {
            familyGroups[entry.scenario_family] = [];
        }
        familyGroups[entry.scenario_family].push(entry);
    }

    // Compute pairwise equivalence within each family
    const equivalenceMatrix: EquivalencePair[] = [];
    const scenarioFamilies: string[] = Object.keys(familyGroups);

    for (const family of scenarioFamilies) {
        const group = familyGroups[family];
        console.log(`📋 ${family}: ${group.length} runs`);

        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const left = group[i];
                const right = group[j];

                const eq = computeEquivalence(left, right, family);
                equivalenceMatrix.push(eq);
            }
        }
    }

    // Generate report
    const report = {
        report_version: '1.0.0',
        ruleset_version: 'ruleset-1.1',  // From sample set alignment
        normalization_spec_version: normSpec.version,
        hash_scope_version: hashScope.version,
        core_elements_version: '1.1.0',  // From core-evidence-elements.yaml
        generated_at: new Date().toISOString(),
        scenario_families: scenarioFamilies,
        entries,
        equivalence_matrix: equivalenceMatrix,
        disclaimer: equivCriteria.disclaimer.text
    };

    // Write report
    const reportPath = path.join(OUTPUT_DIR, 'v0.10.2-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Report written to ${reportPath}`);

    // Summary stats
    const eqCount = equivalenceMatrix.filter(e => e.equivalent).length;
    const neqCount = equivalenceMatrix.filter(e => !e.equivalent).length;
    console.log(`\n📊 Equivalence Summary:`);
    console.log(`   Equivalent pairs: ${eqCount}`);
    console.log(`   Non-equivalent pairs: ${neqCount}`);
}

function extractSubstrate(runId: string): string {
    // Extract substrate from run_id pattern: v05-d1-langgraph-pass-budget-allow
    const parts = runId.split('-');
    if (parts.length >= 3) {
        return parts[2];
    }
    return 'unknown';
}

function computeEquivalence(left: NormalizedEntry, right: NormalizedEntry, family: string): EquivalencePair {
    const differences: Array<{ note_code: string; params: Record<string, any> }> = [];

    // Check scenario_family match
    if (left.scenario_family !== right.scenario_family) {
        differences.push({
            note_code: 'SCENARIO_FAMILY_MISMATCH',
            params: { left_family: left.scenario_family, right_family: right.scenario_family }
        });
    }

    // Check admissibility (HP-10.2-06)
    const admissibleValues = equivCriteria.admissibility.admissible_values;
    const leftAdmissible = admissibleValues.includes(left.admission_status);
    const rightAdmissible = admissibleValues.includes(right.admission_status);

    if (!leftAdmissible) {
        differences.push({
            note_code: 'MISSING_ADMISSIBILITY_EVIDENCE',
            params: { run_id: left.run_id }
        });
    }
    if (!rightAdmissible) {
        differences.push({
            note_code: 'MISSING_ADMISSIBILITY_EVIDENCE',
            params: { run_id: right.run_id }
        });
    }

    // Check hash match
    if (left.normalized_hash !== right.normalized_hash) {
        differences.push({
            note_code: 'VALUE_HASH_MISMATCH',
            params: {
                pointer: '/normalized_hash',
                left_hash: left.normalized_hash.substring(0, 16),
                right_hash: right.normalized_hash.substring(0, 16)
            }
        });
    }

    const equivalent = differences.length === 0;

    // If not equivalent, generate diff file
    let diffRef: string | undefined;
    if (!equivalent) {
        const diffFileName = `${left.run_id}__${right.run_id}.json`;
        diffRef = `diffs/${family}/${diffFileName}`;

        const diffDir = path.join(OUTPUT_DIR, 'diffs', family);
        fs.mkdirSync(diffDir, { recursive: true });

        const diffFile: DiffFile = {
            scenario_family: family,
            pair: [left.run_id, right.run_id],
            differences,
            disclaimer: equivCriteria.disclaimer.text
        };

        fs.writeFileSync(path.join(OUTPUT_DIR, diffRef), JSON.stringify(diffFile, null, 2));
    }

    return {
        left_run_id: left.run_id,
        right_run_id: right.run_id,
        equivalent,
        diff_ref: diffRef
    };
}

main();
