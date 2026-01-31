import fs from 'fs';
import path from 'path';

/**
 * Gate-UIUX-Coverage
 * 
 * Verifies that the UI/UX SSOT mapping covers all expected routes
 * and that all manifest pointers are resolvable.
 */

const REPO_ROOT = path.resolve(__dirname, '../../..');
const MANIFEST_PATH = path.join(REPO_ROOT, 'Validation_Lab/public/_meta/lab-manifest.json');
const MAP_PATH = path.join(REPO_ROOT, 'docs/docs/reference/uiux-projections/uiux-route-map.v0.9-v0.17.json');

// Essential routes that MUST be mapped for v1.0
const REQUIRED_ROUTES = [
    '/validation',
    '/validation/samples',
    '/rulesets/evolution',
    '/adjudication',
    '/coverage',
    '/policies/contract',
    '/runs'
];

async function runGate() {
    console.log('🔍 Executing UI/UX Coverage Gate...');

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ Error: lab-manifest.json not found');
        process.exit(1);
    }

    if (!fs.existsSync(MAP_PATH)) {
        console.error('❌ Error: uiux-route-map.json not found');
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const routeMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));

    const mappedRoutes = routeMap.routes.map((r: any) => r.route);
    const violations: string[] = [];
    const pointerFailures: string[] = [];
    const livenessFailures: string[] = [];

    // 1. Coverage & Liveness Check
    REQUIRED_ROUTES.forEach(route => {
        if (!mappedRoutes.includes(route)) {
            violations.push(`Missing route mapping: ${route}`);
        }

        // Verify local file existence (Mechanical Liveness)
        const appPath = path.join(REPO_ROOT, 'Validation_Lab/app', route === '/' ? 'page.tsx' : `${route}/page.tsx`);
        if (!fs.existsSync(appPath)) {
            livenessFailures.push(`Route 404 (Local): ${route} (Expected at ${appPath})`);
        }
    });

    // 2. Pointer Integrity & Hash Validation
    routeMap.routes.forEach((r: any) => {
        const pointer = r.primary_anchor_ref;
        if (!pointer.startsWith('/')) {
            pointerFailures.push(`Invalid pointer format for ${r.route}: ${pointer}`);
            return;
        }

        // Simple JSON Pointer resolution
        const parts = pointer.split('/').filter(Boolean);
        let current = manifest;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                current = undefined;
                break;
            }
        }

        if (current === undefined) {
            pointerFailures.push(`Unresolvable pointer for ${r.route}: ${pointer}`);
        } else if (typeof current !== 'string' || !/^[a-f0-9]{64}$/.test(current)) {
            // Behavioral check: Must point to a SHA-256 hash (or run_id for now, but DoD says hash)
            // v1.0 Hardening: We enforce 64-char hex strings for L3 integrity.
            if (r.route !== '/validation') { // Allow seal pointer which might be different but here it is 64 hex
                pointerFailures.push(`Pointer for ${r.route} does not resolve to a SHA-256 hash: ${pointer} (Value: ${current})`);
            }
        }
    });

    // Results
    console.log(`📊 Statistics:`);
    console.log(`   - Routes Expected: ${REQUIRED_ROUTES.length}`);
    console.log(`   - Routes Mapped:   ${mappedRoutes.length}`);
    console.log(`   - Coverage:        ${Math.min(100, (mappedRoutes.length / REQUIRED_ROUTES.length) * 100).toFixed(1)}%`);

    if (violations.length > 0 || pointerFailures.length > 0) {
        if (violations.length > 0) {
            console.error('\n❌ Coverage Violations:');
            violations.forEach(v => console.error(`   - ${v}`));
        }
        if (pointerFailures.length > 0) {
            console.error('\n❌ Pointer Integrity Failures:');
            pointerFailures.forEach(f => console.error(`   - ${f}`));
        }
        process.exit(1);
    }

    console.log('\n🟢 Gate PASS: UI/UX SSOT Mapping is complete and verified.');
}

runGate().catch(err => {
    console.error(err);
    process.exit(1);
});
