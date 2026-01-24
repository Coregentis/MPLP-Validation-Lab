import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-20: DisclaimerBox Required Presence & Type Alignment
 * 
 * Gate 20.1: Key pages must import and use <DisclaimerBox />.
 * Gate 20.2: Correct 'kind' must be used for specific pages (e.g. FMM -> projection_only).
 */

const PROJECT_ROOT = process.cwd();

const REQUIRED_DISCLAIMERS = [
    {
        file: 'app/policies/fmm/page.tsx',
        kind: 'projection_only',
        label: 'Field Mapping Matrix'
    },
    {
        file: 'app/policies/cross-verified/page.tsx',
        kind: 'equivalence',
        label: 'Cross-Verified'
    },
    {
        file: 'app/examples/evidence-producers/page.tsx',
        kind: 'non_endorsement',
        label: 'Evidence Producers'
    },
    {
        file: 'app/runs/_components/MappingProjectionPanel.tsx',
        kind: 'projection_only',
        label: 'Mapping Projection Panel'
    }
];

async function runGate20() {
    console.log('🛡️  Running VLAB-GATE-20: DisclaimerBox Presence & alignment...');
    let failCount = 0;

    for (const req of REQUIRED_DISCLAIMERS) {
        const filePath = path.join(PROJECT_ROOT, req.file);

        if (!fs.existsSync(filePath)) {
            console.warn(`   ⚠️  WARN: File not found (skipping): ${req.file}`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');

        // Check 20.1: Presence of DisclaimerBox usage
        const hasComponent = content.includes('<DisclaimerBox');
        const hasImport = content.includes('DisclaimerBox') && (content.includes('@/components/common/DisclaimerBox') || content.includes('../../components/common/DisclaimerBox'));

        if (!hasComponent || !hasImport) {
            console.error(`\n❌ Gate 20.1 FAIL: ${req.label} is missing DisclaimerBox component or import.`);
            console.error(`   File: ${req.file}`);
            failCount++;
            continue;
        }

        // Check 20.2: Correct 'kind'
        const kindRegex = new RegExp(`kind=["']${req.kind}["']`);
        if (!kindRegex.test(content)) {
            console.error(`\n❌ Gate 20.2 FAIL: ${req.label} is using wrong kind.`);
            console.error(`   Expected: kind="${req.kind}"`);
            console.error(`   File: ${req.file}`);
            failCount++;
        }
    }

    if (failCount > 0) {
        console.error(`\n❌ VLAB-GATE-20 FAILED with ${failCount} issue(s).`);
        process.exit(1);
    }

    console.log('\n🟢 VLAB-GATE-20 PASS: All key pages have correct DisclaimerBox usage.');
}

runGate20();
