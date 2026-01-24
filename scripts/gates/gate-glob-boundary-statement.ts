import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * GLOB-GATE-03: Boundary Statement Presence (ID-based)
 * 
 * Ensures each entry declares required boundary IDs in their manifest.
 * Does NOT do text matching - only checks for boundary ID presence.
 */

const PROJECT_ROOT = path.resolve(process.cwd(), '..');
const BASELINE_PATH = path.join(PROJECT_ROOT, 'governance/global-alignment-baseline.yaml');

interface BoundaryDef {
    id: string;
    applies_to: string[];
}

interface Baseline {
    required_boundaries: BoundaryDef[];
    entries: Record<string, { manifest_path: string }>;
}

function runGate03() {
    console.log('🛡️  Running GLOB-GATE-03: Boundary Statement Presence...');

    // Load baseline
    if (!fs.existsSync(BASELINE_PATH)) {
        console.error('❌ global-alignment-baseline.yaml not found');
        process.exit(1);
    }

    const baseline = yaml.load(fs.readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
    const requiredBoundaries = baseline.required_boundaries;

    let failures: string[] = [];

    // Check each entry
    for (const [entryName, entryDef] of Object.entries(baseline.entries)) {
        const manifestPath = path.join(PROJECT_ROOT, entryDef.manifest_path);

        if (!fs.existsSync(manifestPath)) {
            continue;
        }

        let manifest: any;
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {
            continue;
        }

        // Get boundaries applicable to this entry
        const applicableBoundaries = requiredBoundaries.filter(b =>
            b.applies_to.includes(entryName)
        );

        if (applicableBoundaries.length === 0) {
            console.log(`✅ ${entryName}: no boundaries required`);
            continue;
        }

        // Check if manifest declares boundaries
        const declaredBoundaries: string[] = manifest.boundaries || [];

        for (const boundary of applicableBoundaries) {
            if (!declaredBoundaries.includes(boundary.id)) {
                failures.push(`${entryName}: missing boundary "${boundary.id}"`);
            }
        }

        if (!failures.some(f => f.startsWith(entryName))) {
            console.log(`✅ ${entryName}: all ${applicableBoundaries.length} boundaries declared`);
        }
    }

    if (failures.length > 0) {
        console.error(`\n❌ Gate FAIL: ${failures.length} missing boundaries:`);
        for (const fail of failures) {
            console.error(`   - ${fail}`);
        }
        process.exit(1);
    }

    console.log('\n🟢 Gate PASS: All required boundaries are declared.');
}

runGate03();
