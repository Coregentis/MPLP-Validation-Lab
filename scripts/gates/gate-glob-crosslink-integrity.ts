import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * GLOB-GATE-02: Cross-link Integrity
 * 
 * Ensures tripod anchors across entries are consistent and point to valid domains.
 * Does NOT make HTTP requests (offline validation only).
 */

const PROJECT_ROOT = path.resolve(process.cwd(), '..');
const BASELINE_PATH = path.join(PROJECT_ROOT, 'governance/global-alignment-baseline.yaml');

interface Baseline {
    canonical_anchors: Record<string, string>;
    allowed_domains: string[];
    entries: Record<string, { manifest_path: string }>;
}

function runGate02() {
    console.log('🛡️  Running GLOB-GATE-02: Cross-link Integrity...');

    // Load baseline
    if (!fs.existsSync(BASELINE_PATH)) {
        console.error('❌ global-alignment-baseline.yaml not found');
        process.exit(1);
    }

    const baseline = yaml.load(fs.readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
    const canonicalAnchors = baseline.canonical_anchors;
    const allowedDomains = baseline.allowed_domains;

    const failures: string[] = [];

    // Validate canonical anchors are valid URLs with allowed domains
    for (const [anchorName, anchorUrl] of Object.entries(canonicalAnchors)) {
        try {
            const url = new URL(anchorUrl);
            const domain = url.hostname;

            if (!allowedDomains.some(d => domain === d || domain.endsWith('.' + d))) {
                failures.push(`Canonical anchor ${anchorName}: domain ${domain} not in allowed list`);
            }
        } catch (e) {
            failures.push(`Canonical anchor ${anchorName}: invalid URL "${anchorUrl}"`);
        }
    }

    // Check each entry's tripod anchors
    for (const [entryName, entryDef] of Object.entries(baseline.entries)) {
        const manifestPath = path.join(PROJECT_ROOT, entryDef.manifest_path);

        if (!fs.existsSync(manifestPath)) {
            // Already reported in GATE-01
            continue;
        }

        let manifest: any;
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {
            continue;
        }

        // Check tripod if present
        if (manifest.tripod) {
            for (const [tripodKey, tripodUrl] of Object.entries(manifest.tripod)) {
                if (typeof tripodUrl !== 'string') continue;

                try {
                    const url = new URL(tripodUrl);
                    const domain = url.hostname;

                    if (!allowedDomains.some(d => domain === d || domain.endsWith('.' + d))) {
                        failures.push(`${entryName}.tripod.${tripodKey}: domain ${domain} not allowed`);
                    }
                } catch (e) {
                    failures.push(`${entryName}.tripod.${tripodKey}: invalid URL "${tripodUrl}"`);
                }
            }
            console.log(`✅ ${entryName}: tripod anchors valid`);
        }
    }

    // Cross-check: Lab tripod should match canonical anchors
    const labManifestPath = path.join(PROJECT_ROOT, baseline.entries.lab?.manifest_path || '');
    if (fs.existsSync(labManifestPath)) {
        const labManifest = JSON.parse(fs.readFileSync(labManifestPath, 'utf8'));

        if (labManifest.tripod?.website_anchor !== canonicalAnchors.website_definition) {
            failures.push(`lab.tripod.website_anchor mismatch with canonical`);
        }
        if (labManifest.tripod?.docs_anchor !== canonicalAnchors.docs_entrypoints) {
            failures.push(`lab.tripod.docs_anchor mismatch with canonical`);
        }
    }

    if (failures.length > 0) {
        console.error(`\n❌ Gate FAIL: ${failures.length} cross-link issues:`);
        for (const fail of failures) {
            console.error(`   - ${fail}`);
        }
        process.exit(1);
    }

    console.log('\n🟢 Gate PASS: All cross-links are valid.');
}

runGate02();
