import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * GLOB-GATE-01: Anchor & Version Alignment
 * 
 * Ensures all entries have consistent protocol_version and schema_bundle_version
 * matching the global-alignment-baseline.yaml canonical_versions.
 */

const PROJECT_ROOT = path.resolve(process.cwd(), '..');
const BASELINE_PATH = path.join(PROJECT_ROOT, 'governance/global-alignment-baseline.yaml');

interface Baseline {
    canonical_versions: {
        protocol: string;
        schema_bundle: string;
        lab_series: string;
    };
    entries: Record<string, { manifest_path: string; required_fields: string[] }>;
}

function runGate01() {
    console.log('🛡️  Running GLOB-GATE-01: Anchor & Version Alignment...');

    // Load baseline
    if (!fs.existsSync(BASELINE_PATH)) {
        console.error('❌ global-alignment-baseline.yaml not found');
        process.exit(1);
    }

    const baseline = yaml.load(fs.readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
    const canonical = baseline.canonical_versions;

    console.log(`📋 Canonical versions: protocol=${canonical.protocol}, schema=${canonical.schema_bundle}, lab=${canonical.lab_series}`);

    const failures: string[] = [];

    // Check each entry's manifest
    for (const [entryName, entryDef] of Object.entries(baseline.entries)) {
        const manifestPath = path.join(PROJECT_ROOT, entryDef.manifest_path);

        if (!fs.existsSync(manifestPath)) {
            failures.push(`${entryName}: manifest not found at ${entryDef.manifest_path}`);
            continue;
        }

        let manifest: any;
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {
            failures.push(`${entryName}: manifest is not valid JSON`);
            continue;
        }

        // Check protocol_version if present
        if (manifest.protocol_version && manifest.protocol_version !== canonical.protocol) {
            failures.push(`${entryName}: protocol_version mismatch (${manifest.protocol_version} != ${canonical.protocol})`);
        }

        // Check schema_bundle_version if present
        if (manifest.schema_bundle_version && manifest.schema_bundle_version !== canonical.schema_bundle) {
            failures.push(`${entryName}: schema_bundle_version mismatch (${manifest.schema_bundle_version} != ${canonical.schema_bundle})`);
        }

        // Check lab_series for lab entry
        if (entryName === 'lab' && manifest.lab_series !== canonical.lab_series) {
            failures.push(`lab: lab_series mismatch (${manifest.lab_series} != ${canonical.lab_series})`);
        }

        console.log(`✅ ${entryName}: versions aligned`);
    }

    if (failures.length > 0) {
        console.error(`\n❌ Gate FAIL: ${failures.length} alignment issues:`);
        for (const fail of failures) {
            console.error(`   - ${fail}`);
        }
        process.exit(1);
    }

    console.log('\n🟢 Gate PASS: All entries have aligned versions.');
}

runGate01();
