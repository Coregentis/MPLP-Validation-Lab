import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-16: Lab Manifest Anchor Route Existence
 * 
 * Ensures all anchors in lab-manifest.json point to existing routes.
 * Prevents FIX-01 type regressions.
 * 
 * Note: Skips "_root" anchors which are directory references, not page routes.
 */

const PROJECT_ROOT = process.cwd();
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'public/_meta/lab-manifest.json');
const APP_DIR = path.join(PROJECT_ROOT, 'app');

// Anchors ending with _root are directory references, not page routes
const ROOT_ANCHOR_SUFFIX = '_root';

interface LabManifest {
    anchors: Record<string, string>;
}

function runGate16() {
    console.log('🛡️  Running VLAB-GATE-16: Manifest Anchor Route Existence...');

    // Load manifest
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ lab-manifest.json not found');
        process.exit(1);
    }

    const manifest: LabManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const anchors = manifest.anchors;

    if (!anchors) {
        console.log('⚠️  No anchors defined in manifest');
        process.exit(0);
    }

    const failures: string[] = [];
    let checked = 0;

    for (const [anchorName, anchorPath] of Object.entries(anchors)) {
        // Skip external URLs
        if (anchorPath.startsWith('http')) continue;

        // Skip root anchors (directory references)
        if (anchorName.endsWith(ROOT_ANCHOR_SUFFIX)) {
            console.log(`⏭️  ${anchorName}: skipped (directory reference)`);
            continue;
        }

        // Convert route to app directory path
        // /policies/fmm -> app/policies/fmm
        const routePath = anchorPath.replace(/^\//, '');
        const appRoutePath = path.join(APP_DIR, routePath);

        // Check if route directory exists with page.tsx
        const pageFile = path.join(appRoutePath, 'page.tsx');
        const altPageFile = path.join(appRoutePath, 'page.jsx');

        if (!fs.existsSync(pageFile) && !fs.existsSync(altPageFile)) {
            failures.push(`${anchorName}: route "${anchorPath}" not found (${pageFile})`);
        } else {
            console.log(`✅ ${anchorName}: ${anchorPath}`);
            checked++;
        }
    }

    if (failures.length > 0) {
        console.error(`\n❌ Gate FAIL: ${failures.length} missing anchor routes:`);
        for (const fail of failures) {
            console.error(`   - ${fail}`);
        }
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: All ${checked} page anchor routes exist.`);
}

runGate16();
