import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const PROJECT_ROOT = process.cwd();
const GOVERNANCE_DIR = path.join(PROJECT_ROOT, 'governance');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'public/_data/fmm.json');

/**
 * Field Mapping Matrix (FMM) Derivation Script
 * Derives public/_data/fmm.json from governance SSOTs.
 */

function generateFmm() {
    console.log('🏗️  Generating Field Mapping Matrix (FMM)...');

    const coreEvidence = yaml.load(fs.readFileSync(path.join(GOVERNANCE_DIR, 'mappings/core-evidence-elements.yaml'), 'utf8'));
    const fieldmapDir = path.join(GOVERNANCE_DIR, 'mappings/fieldmap');
    const fieldmaps = fs.readdirSync(fieldmapDir).filter(f => f.endsWith('.yaml'));

    const matrix = {
        version: "1.0.0",
        generated_at: new Date().toISOString(),
        core_elements: coreEvidence.mandatory_elements,
        substrates: {}
    };

    for (const file of fieldmaps) {
        const content = fs.readFileSync(path.join(fieldmapDir, file), 'utf8');
        const lines = content.split('\n');

        // Simple extraction logic for markdown tables in YAML
        const mappings = [];
        let inTable = false;
        for (const line of lines) {
            if (line.includes('|:---|')) {
                inTable = true;
                continue;
            }
            if (inTable && line.trim().startsWith('|')) {
                const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
                if (parts.length >= 2) {
                    mappings.push({
                        source: parts[0],
                        target: parts[1],
                        rule: parts[2] || 'direct'
                    });
                }
            } else if (line.trim() === '' && inTable) {
                // Keep looking, tables might have breaks or we reached end
            }
        }

        const substrateId = file.replace('.yaml', '');
        matrix.substrates[substrateId] = {
            mappings: mappings
        };
    }

    if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
        fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(matrix, null, 2));
    console.log(`✅ FMM exported to ${OUTPUT_FILE}`);
}

generateFmm();
