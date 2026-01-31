import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
 
const yaml = require('js-yaml');

function main() {
    const rootDir = process.cwd();
    const baselinePath = join(rootDir, '../governance/global-alignment-baseline.yaml');

    try {
        const baselineYaml = readFileSync(baselinePath, 'utf-8');
        const baseline = yaml.load(baselineYaml);

        const outputDir = join(rootDir, 'public/_meta');
        mkdirSync(outputDir, { recursive: true });

        const outputPath = join(outputDir, 'global-alignment.json');
        writeFileSync(outputPath, JSON.stringify(baseline, null, 2));

        console.log(`✅ Exported Global Alignment SSOT to ${outputPath}`);
    } catch (error) {
        console.error('❌ Failed to export global alignment:', error);
        process.exit(1);
    }
}

main();
