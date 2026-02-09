import fs from 'fs';
import path from 'path';
import { getLabStatusModel, LabStatusModel } from '../ssot/lab-status';
import { getGateSummaryModel, GateSummaryModel } from '../ssot/gate-summary';
import { getFeaturedRunModel, FeaturedRunModel } from '../ssot/featured-run';

export interface VersionStripModel {
    build_id: string; // from seal or package.json
    seal_status: 'VALID' | 'INVALID' | 'UNSEALED';
    lab: {
        status: LabStatusModel;
    };
    gates: {
        summary: GateSummaryModel;
    };
    featured: FeaturedRunModel;
    run_inventory: {
        total: number;
        v1_count: number;
        v1_version: string; // generated_at or hash
        v2_count: number;
        v2_version: string; // generated_at or hash
    };
    ruleset_inventory: {
        total: number;
        v1_active_count: number;
        v2_active_count: number;
        current_default: string;
    };
    snapshot_date: string;
}

const PROJECT_ROOT = process.cwd();

// Helper to safely read JSON
function readJson(relPath: string) {
    try {
        const fullPath = path.join(PROJECT_ROOT, relPath);
        if (fs.existsSync(fullPath)) {
            return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        }
    } catch (e) {
        console.warn(`Failed to read ${relPath}`, e);
    }
    return null;
}

// Helper to list directories (for V1 rulesets)
function countDirs(relPath: string) {
    try {
        const fullPath = path.join(PROJECT_ROOT, relPath);
        if (fs.existsSync(fullPath)) {
            return fs.readdirSync(fullPath).filter(f => fs.statSync(path.join(fullPath, f)).isDirectory()).length;
        }
    } catch { }
    return 0;
}

export async function getVersionStripModel(): Promise<VersionStripModel> {
    // 1. Build ID & Seal Status
    // Look for latest unified seal
    let build_id = 'DEV-BUILD';
    let seal_status: VersionStripModel['seal_status'] = 'UNSEALED';

    try {
        const unifiedReleasesDir = path.join(PROJECT_ROOT, 'releases/unified');
        if (fs.existsSync(unifiedReleasesDir)) {
            const releases = fs.readdirSync(unifiedReleasesDir).sort().reverse();
            if (releases.length > 0) {
                const latest = releases[0]; // e.g., rc-2026...
                const sealPath = path.join(unifiedReleasesDir, latest, 'seal.md');
                if (fs.existsSync(sealPath)) {
                    build_id = latest;
                    // rapid check content for "Status: PASS"
                    const content = fs.readFileSync(sealPath, 'utf8');
                    seal_status = content.includes('Status: PASS') ? 'VALID' : 'INVALID';
                }
            }
        }
    } catch { }

    // 2. Run Inventory
    // V1
    const v1Data = readJson('public/_data/curated-runs.json');
    const v1Count = v1Data?.runs?.length || 0;
    const v1Ver = v1Data?.ssot?.generated_at ? new Date(v1Data.ssot.generated_at).toISOString().split('T')[0] : 'N/A';

    // V2
    const v2Data = readJson('public/_data/v2/runs/index.json');
    const v2Count = v2Data?.data?.runs?.length || 0;
    const v2Ver = v2Data?.generated_at ? new Date(v2Data.generated_at).toISOString().split('T')[0] : 'N/A';

    // 3. Ruleset Inventory
    // V1: count folders in data/rulesets
    const v1RulesetCount = countDirs('data/rulesets');

    // V2: count from index
    const v2RulesetData = readJson('public/_data/v2/rulesets/index.json');
    const v2RulesetCount = v2RulesetData?.data?.rulesets?.length || 0;

    // 4. Governance/Snapshot
    const govIndex = readJson('public/_data/governance/index.json');
    const snapshotDate = govIndex?.generated_at || new Date().toISOString().split('T')[0];

    // 5. New SSOT Models
    const labStatus = getLabStatusModel();
    const gateSummary = getGateSummaryModel();
    const featuredRun = getFeaturedRunModel();

    return {
        build_id,
        seal_status,
        lab: { status: labStatus },
        gates: { summary: gateSummary },
        featured: featuredRun,
        run_inventory: {
            total: v1Count + v2Count,
            v1_count: v1Count,
            v1_version: v1Ver,
            v2_count: v2Count,
            v2_version: v2Ver
        },
        ruleset_inventory: {
            total: v1RulesetCount + v2RulesetCount,
            v1_active_count: v1RulesetCount, // simplified assumption
            v2_active_count: v2RulesetCount,
            current_default: 'ruleset-1.0' // hardcoded default for now until V2 flip
        },
        snapshot_date: snapshotDate
    };
}
