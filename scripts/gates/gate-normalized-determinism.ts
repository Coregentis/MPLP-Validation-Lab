import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * VLAB-GATE-11: Normalized Projection Determinism
 * Ensures: same input → same hash (repeated runs produce identical output)
 */

const PROJECT_ROOT = process.cwd();
const DERIVED_DIR = path.join(PROJECT_ROOT, 'data/derived/normalized');

function runGate11() {
    console.log('🛡️  Running VLAB-GATE-11: Normalized Projection Determinism...');

    // Get list of normalized packs
    if (!fs.existsSync(DERIVED_DIR)) {
        console.error('❌ No normalized packs found. Run normalize-pack.ts first.');
        process.exit(1);
    }

    const packs = fs.readdirSync(DERIVED_DIR).filter(d =>
        d !== '_normalization_summary.json' &&
        fs.statSync(path.join(DERIVED_DIR, d)).isDirectory()
    );

    if (packs.length === 0) {
        console.error('❌ No normalized packs found.');
        process.exit(1);
    }

    console.log(`📋 Testing determinism for ${packs.length} packs...`);

    // Store original hashes
    const originalHashes: Record<string, string> = {};
    for (const pack of packs) {
        const hashPath = path.join(DERIVED_DIR, pack, 'normalized_hash.txt');
        if (fs.existsSync(hashPath)) {
            originalHashes[pack] = fs.readFileSync(hashPath, 'utf8').trim();
        }
    }

    // Re-run normalization
    console.log('🔄 Re-running normalization to verify determinism...');
    try {
        execSync('npx tsx scripts/normalize-pack.ts --sample-set', {
            cwd: PROJECT_ROOT,
            stdio: 'pipe'
        });
    } catch (e) {
        console.error('❌ Re-normalization failed');
        process.exit(1);
    }

    // Compare hashes
    let driftCount = 0;
    for (const pack of packs) {
        const hashPath = path.join(DERIVED_DIR, pack, 'normalized_hash.txt');
        if (fs.existsSync(hashPath)) {
            const newHash = fs.readFileSync(hashPath, 'utf8').trim();
            if (originalHashes[pack] && originalHashes[pack] !== newHash) {
                console.error(`❌ DRIFT: ${pack}`);
                console.error(`   Original: ${originalHashes[pack].substring(0, 16)}...`);
                console.error(`   New:      ${newHash.substring(0, 16)}...`);
                driftCount++;
            }
        }
    }

    if (driftCount > 0) {
        console.error(`\n❌ Gate FAIL: ${driftCount} packs have non-deterministic hashes.`);
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: All ${packs.length} packs are deterministic.`);
}

runGate11();
