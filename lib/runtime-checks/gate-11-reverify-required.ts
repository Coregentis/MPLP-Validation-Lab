/**
 * Gate 11: Reverification Required
 * 
 * Ensures all curated runs (from allowlist) have corresponding
 * reverification bundles with valid verdicts.
 * 
 * GOVERNANCE: This gate enforces that historical releases are
 * verified by the canonical Validation Lab verifier.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { selectCanonicalBundle } from '../reverification/selectCanonicalBundle';

// =============================================================================
// Types
// =============================================================================

interface AllowlistEntry {
    id: string;
    release?: string;
    status?: string;
}

interface GateResult {
    gate_id: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message: string;
    details?: unknown;
}

// =============================================================================
// Main Gate Logic
// =============================================================================

async function runGate11(): Promise<GateResult> {
    const VLAB_ROOT = join(__dirname, '../..');
    const ALLOWLIST_PATH = join(VLAB_ROOT, 'data/curated-runs/allowlist.yaml');
    const REVERIFICATION_DIR = join(VLAB_ROOT, 'reverification');

    // Check if allowlist exists
    if (!existsSync(ALLOWLIST_PATH)) {
        return {
            gate_id: 'gate-11-reverify-required',
            status: 'SKIP',
            message: 'allowlist.yaml not found, skipping gate-11',
        };
    }

    // Load allowlist
    const allowlistContent = readFileSync(ALLOWLIST_PATH, 'utf-8');
    const allowlist = yaml.load(allowlistContent) as { runs?: AllowlistEntry[] };

    if (!allowlist.runs || allowlist.runs.length === 0) {
        return {
            gate_id: 'gate-11-reverify-required',
            status: 'PASS',
            message: 'No curated runs in allowlist, gate-11 passess vacuously',
        };
    }

    // Collect unique releases referenced by curated runs
    const releasesReferenced = new Set<string>();
    for (const run of allowlist.runs) {
        if (run.release) {
            releasesReferenced.add(run.release);
        }
    }

    // Check each referenced release has reverification
    const missing: string[] = [];
    const verified: string[] = [];

    for (const release of releasesReferenced) {
        // Use SSOT canonical bundle selection
        const canonical = selectCanonicalBundle(REVERIFICATION_DIR, release);

        if (!canonical) {
            missing.push(`${release} (no reverification bundle)`);
            continue;
        }

        // Read verdict from canonical bundle
        const verdictPath = join(canonical.bundlePath, 'verdict.json');

        try {
            const verdict = JSON.parse(readFileSync(verdictPath, 'utf-8'));
            if (verdict.overall_status === 'REVERIFIED') {
                verified.push(`${release} (${canonical.bundleName})`);
            } else {
                missing.push(`${release} (${canonical.bundleName}: ${verdict.overall_status})`);
            }
        } catch {
            missing.push(`${release} (invalid verdict.json in ${canonical.bundleName})`);
        }
    }

    if (missing.length > 0) {
        return {
            gate_id: 'gate-11-reverify-required',
            status: 'FAIL',
            message: `${missing.length} release(s) missing reverification`,
            details: {
                missing,
                verified,
                total_releases: releasesReferenced.size,
            },
        };
    }

    return {
        gate_id: 'gate-11-reverify-required',
        status: 'PASS',
        message: `All ${verified.length} referenced release(s) have valid reverification`,
        details: {
            verified,
            total_releases: releasesReferenced.size,
        },
    };
}

// =============================================================================
// Entry Point
// =============================================================================

export default async function gate11(): Promise<void> {
    console.log('\n🚪 Gate 11: Reverification Required\n');

    const result = await runGate11();

    if (result.status === 'PASS') {
        console.log(`✅ PASS: ${result.message}`);
    } else if (result.status === 'SKIP') {
        console.log(`⏭️  SKIP: ${result.message}`);
    } else {
        console.log(`❌ FAIL: ${result.message}`);
        if (result.details) {
            console.log('   Details:', JSON.stringify(result.details, null, 2));
        }
        throw new Error(`Gate 11 FAILED: ${result.message}`);
    }
}

export { runGate11 };
