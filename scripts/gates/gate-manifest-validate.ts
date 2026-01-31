import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const ajv = new Ajv();

/**
 * Gate-MANIFEST-VALIDATE: Enforce structural finality of the Lab Manifest.
 */

const MANIFEST_PATH = path.resolve(process.cwd(), 'public/_meta/lab-manifest.json');
const SCHEMA_PATH = path.resolve(process.cwd(), 'public/_meta/lab-manifest.schema.json');
const BASELINE_PATH = path.resolve(process.cwd(), '../governance/global-alignment-baseline.yaml');

function runGate() {
    console.log('🛡️  Running Gate-MANIFEST-VALIDATE (v1.0)...');

    const failures: string[] = [];

    // 1. Schema Validation
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    const validate = ajv.compile(schema);
    const valid = validate(manifest);

    if (!valid) {
        failures.push(`Schema Error: ${JSON.stringify(validate.errors, null, 2)}`);
    }

    // 2. Cross-Surface Domain Validation (Hardened)
    const baseline = yaml.load(fs.readFileSync(BASELINE_PATH, 'utf-8')) as any;
    const allowedDomains = baseline.allowed_domains;

    for (const [key, url] of Object.entries(manifest.tripod)) {
        if (typeof url !== 'string') continue;
        try {
            const domain = new URL(url).hostname;
            if (!allowedDomains.some((d: string) => domain === d || domain.endsWith('.' + d))) {
                failures.push(`[P0] Tripod Anchor ${key} uses non-canonical domain: ${domain}`);
            }
        } catch (e) {
            failures.push(`[P0] Tripod Anchor ${key} is invalid URI: ${url}`);
        }
    }

    // 3. Anchor Hierarchy Validation (Internal vs Absolute)
    for (const [key, value] of Object.entries(manifest.anchors)) {
        if (typeof value === 'string') {
            if (value.startsWith('http')) {
                failures.push(`[P1] Internal Anchor ${key} must be relative path, found: ${value}`);
            }
        }
    }

    if (failures.length > 0) {
        console.log('\n❌ Manifest Validation FAILED:');
        failures.forEach(f => console.log(`   - ${f}`));
        process.exit(1);
    } else {
        console.log('\n🟢 Manifest Validation PASS: Publication contract is structurally sound.');
        process.exit(0);
    }
}

runGate();
