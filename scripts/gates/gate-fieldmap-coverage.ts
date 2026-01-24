import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const PROJECT_ROOT = process.cwd();
const CORE_ELEMENTS_PATH = path.join(PROJECT_ROOT, 'governance/mappings/core-evidence-elements.yaml');
const FIELDMAP_DIR = path.join(PROJECT_ROOT, 'governance/mappings/fieldmap');

async function main() {
    console.log('🛡️  Running VLAB-GATE-09: Fieldmap Coverage...');
    let failures = 0;

    const coreElements: any = yaml.load(fs.readFileSync(CORE_ELEMENTS_PATH, 'utf-8'));
    // We expect a list of pointers in the markdown/yaml hybrid or a specific section.
    // For MVP, we use hardcoded critical pointers from our SSOT.
    const mandatoryPointers = [
        '/manifest.run_id',
        '/manifest.scenario_id',
        '/manifest.ruleset_version',
        '/manifest.substrate',
        '/timeline.events[*]',
        '/timeline.events[*].event_type',
        '/timeline.events[*].actor',
        '/artifacts/plan.json',
        '/artifacts/trace.json',
        '/verdict.json',
        '/verdict.json.status'
    ];

    const maps = fs.readdirSync(FIELDMAP_DIR).filter(f => f.endsWith('.yaml'));

    for (const mapFile of maps) {
        const substrateId = mapFile.replace('.yaml', '');
        const mapContent = fs.readFileSync(path.join(FIELDMAP_DIR, mapFile), 'utf-8');

        console.log(`📋 Checking coverage for: ${substrateId}`);

        for (const pointer of mandatoryPointers) {
            if (!mapContent.includes(pointer)) {
                console.error(`❌ Substrate ${substrateId} fieldmap is missing mandatory target: ${pointer}`);
                failures++;
            }
        }
    }

    if (failures > 0) {
        process.exit(1);
    } else {
        console.log('🟢 Gate PASS: All fieldmaps cover core evidence requirements.');
        process.exit(0);
    }
}

main();
