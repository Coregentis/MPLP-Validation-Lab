import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const LAB_ROOT = process.cwd();
const INVENTORY_FILE = path.join(LAB_ROOT, 'inventory/asset-inventory.json');
const RUNSETS_FILE = path.join(LAB_ROOT, 'governance/runsets.yaml');
const SUBSTRATE_INDEX_FILE = path.join(LAB_ROOT, 'data/curated-runs/substrate-index.yaml');
const ALLOWLIST_FILE = path.join(LAB_ROOT, 'data/curated-runs/allowlist.yaml');
const REPORT_FILE = path.join(LAB_ROOT, 'inventory/reconciliation-report.json');

async function run() {
    console.log('⚖️ Reconciling inventory with SSOT...');

    if (!fs.existsSync(INVENTORY_FILE)) {
        console.error('Inventory file missing. Run inventory-assets.ts first.');
        return;
    }

    const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
    const runsets: any = yaml.load(fs.readFileSync(RUNSETS_FILE, 'utf-8'));
    const substrateIndex: any = yaml.load(fs.readFileSync(SUBSTRATE_INDEX_FILE, 'utf-8'));
    const allowlist: any = yaml.load(fs.readFileSync(ALLOWLIST_FILE, 'utf-8'));

    const report: any = {
        reconciled_at: new Date().toISOString(),
        missing_assets_from_ssot: [],
        unregistered_assets_in_repo: [],
        hash_mismatches: [],
        orphaned_runs: [],
        unknown_substrates: [],
        deprecated_paths: []
    };

    const physicalPackMap = new Map();
    inventory.packs.forEach((p: any) => physicalPackMap.set(p.run_id, p));

    // 1. SSOT -> Physical
    allowlist.runs.forEach((run: any) => {
        const physical = physicalPackMap.get(run.run_id);
        if (!physical) {
            report.missing_assets_from_ssot.push({ run_id: run.run_id, expected_path: `data/runs/${run.run_id}` });
        } else {
            if (run.pack_root_hash !== physical.pack_root_hash && run.pack_root_hash !== '00'.repeat(32)) {
                report.hash_mismatches.push({
                    run_id: run.run_id,
                    ssot_hash: run.pack_root_hash,
                    physical_hash: physical.pack_root_hash
                });
            }
        }
    });

    // 2. Physical -> SSOT
    const allowlistedRunIds = new Set(allowlist.runs.map((r: any) => r.run_id));
    inventory.packs.forEach((p: any) => {
        if (!allowlistedRunIds.has(p.run_id)) {
            // Check if it should be registered
            if (p.pack_path.startsWith('data/runs')) {
                report.unregistered_assets_in_repo.push({ run_id: p.run_id, path: p.pack_path });
            }
        }
    });

    // 3. Substrate Index check
    const registeredSubstrates = new Set(substrateIndex.substrates.map((s: any) => s.id));
    const usedSubstrates = new Set();
    allowlist.runs.forEach((r: any) => usedSubstrates.add(r.substrate));

    usedSubstrates.forEach(s => {
        if (!registeredSubstrates.has(s)) {
            report.unknown_substrates.push({ substrate_id: s });
        }
    });

    // 4. Runsets consistency
    const allRunsetIds = new Set();
    Object.values(runsets.sets).forEach((set: any) => {
        if (set.includes) set.includes.forEach((id: string) => allRunsetIds.add(id));
    });

    allowlistedRunIds.forEach(id => {
        if (!allRunsetIds.has(id)) {
            report.orphaned_runs.push({ run_id: id, reason: 'Not referenced in runsets.yaml' });
        }
    });

    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    console.log(`✅ Reconciliation report saved to ${REPORT_FILE}`);
}

run();
