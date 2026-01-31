import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Yardstick Run Sealer (v0.15.0)
 * 
 * Hardens the 8 yardstick runs to satisfy ABMC admission & integrity.
 * 1. Generates sha256sums.txt and pack.sha256.
 * 2. Ensures manifest.json and layout exist.
 * 3. Updates input.pointer.json.
 */

const PROJECT_ROOT = process.cwd();
const RUNS_DIR = path.join(PROJECT_ROOT, 'public/data/runs');
const DATA_RUNS_DIR = path.join(PROJECT_ROOT, 'data/runs');

const TARGET_RUNS = [
    'mcp-d1-budget-pass-01',
    'mcp-d1-budget-pass-02',
    'mcp-d1-budget-fail-01',
    'mcp-d1-budget-fail-02',
    'pydantic-ai-d1-budget-pass-01',
    'pydantic-ai-d1-budget-pass-02',
    'pydantic-ai-d1-budget-fail-01',
    'pydantic-ai-d1-budget-fail-02'
];

function hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function hashString(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
}

function seal() {
    console.log('🛡️  Sealing Yardstick Runs...');

    for (const runId of TARGET_RUNS) {
        const runDir = path.join(RUNS_DIR, runId);
        if (!fs.existsSync(runDir)) {
            console.error(`❌ Run not found: ${runId}`);
            continue;
        }

        // Determine pack root (prefer pack/ subdirectory if it exists)
        let packPath = runDir;
        let relativePackPath = `public/data/runs/${runId}`;

        if (fs.existsSync(path.join(runDir, 'pack'))) {
            packPath = path.join(runDir, 'pack');
            relativePackPath = `public/data/runs/${runId}/pack`;
        }

        console.log(`\n  📦 Sealing: ${runId} (at ${relativePackPath})`);

        // Ensure directories
        const integrityDir = path.join(packPath, 'integrity');
        const artifactsDir = path.join(packPath, 'artifacts');
        const timelineDir = path.join(packPath, 'timeline');

        if (!fs.existsSync(integrityDir)) fs.mkdirSync(integrityDir, { recursive: true });
        if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
        if (!fs.existsSync(timelineDir)) fs.mkdirSync(timelineDir, { recursive: true });

        // Ensure manifest.json
        const manifestPath = path.join(packPath, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            const manifest = {
                pack_version: '1.0',
                pack_id: runId,
                created_at: new Date().toISOString(),
                protocol_version: '1.0',
                substrate: runId.startsWith('mcp') ? 'mcp' : 'pydantic-ai',
                scenario_id: 'd1-budget'
            };
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            console.log('    ✅ Created manifest.json');
        }

        // Generate sha256sums.txt
        const fileInventory: string[] = [];
        function walk(dir: string, baseRelative: string) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const rel = baseRelative ? `${baseRelative}/${entry.name}` : entry.name;
                if (entry.isDirectory()) {
                    if (entry.name !== 'integrity') { // Skip integrity folder itself
                        walk(path.join(dir, entry.name), rel);
                    }
                } else {
                    fileInventory.push(rel);
                }
            }
        }
        walk(packPath, '');

        const sums: string[] = [];
        for (const file of fileInventory.sort()) {
            const abs = path.join(packPath, file);
            sums.push(`${hashFile(abs)}  ${file}`);
        }

        const sumsContent = sums.join('\n');
        fs.writeFileSync(path.join(integrityDir, 'sha256sums.txt'), sumsContent + '\n');
        console.log(`    ✅ Generated sha256sums.txt (${fileInventory.length} files)`);

        // Generate pack.sha256
        const packHash = hashString(sumsContent);
        fs.writeFileSync(path.join(integrityDir, 'pack.sha256'), packHash);
        console.log(`    ✅ Generated pack.sha256: ${packHash.substring(0, 16)}...`);

        // Update input.pointer.json
        const dataRunPointerPath = path.join(DATA_RUNS_DIR, runId, 'input.pointer.json');
        if (fs.existsSync(dataRunPointerPath)) {
            const pointer = JSON.parse(fs.readFileSync(dataRunPointerPath, 'utf-8'));
            pointer.pack_path = relativePackPath;
            pointer.pack_layout = '1.0';
            fs.writeFileSync(dataRunPointerPath, JSON.stringify(pointer, null, 2));
            console.log(`    ✅ Updated input.pointer.json → ${relativePackPath}`);
        }

        // Fix evidence_pointers.json paths
        const pointersPath = path.join(runDir, 'evidence_pointers.json');
        if (fs.existsSync(pointersPath)) {
            const data = JSON.parse(fs.readFileSync(pointersPath, 'utf-8'));
            let fixed = false;
            if (data.pointers && Array.isArray(data.pointers)) {
                for (const p of data.pointers) {
                    if (p.artifact_path && p.artifact_path.startsWith('pack/')) {
                        p.artifact_path = p.artifact_path.substring(5);
                        fixed = true;
                    }
                }
            }
            if (fixed) {
                fs.writeFileSync(pointersPath, JSON.stringify(data, null, 2));
                console.log('    ✅ Fixed evidence_pointers.json paths (stripped pack/ prefix)');
            }

            // Sync to data/runs for loader compatibility
            const dataRunDir = path.join(DATA_RUNS_DIR, runId);
            if (fs.existsSync(dataRunDir)) {
                fs.copyFileSync(pointersPath, path.join(dataRunDir, 'evidence_pointers.json'));
                console.log('    ✅ Synced evidence_pointers.json to data/runs');
            }
        }

        const bundleManifestPath = path.join(runDir, 'bundle.manifest.json');
        if (fs.existsSync(bundleManifestPath)) {
            const data = JSON.parse(fs.readFileSync(bundleManifestPath, 'utf-8'));
            // Use relative escape to get from data/runs/id to public/data/runs/id/pack
            // Need 3 levels to get out of data/runs/id to project root
            const escapedPackPath = `../../../${relativePackPath}`;
            data.pack_root = escapedPackPath;
            fs.writeFileSync(bundleManifestPath, JSON.stringify(data, null, 2));
            console.log(`    ✅ Updated bundle.manifest.json pack_root → ${escapedPackPath}`);

            const dataRunDir = path.join(DATA_RUNS_DIR, runId);
            if (fs.existsSync(dataRunDir)) {
                fs.copyFileSync(bundleManifestPath, path.join(dataRunDir, 'bundle.manifest.json'));
                console.log('    ✅ Synced bundle.manifest.json to data/runs');
            }
        }
    }

    console.log('\n✅ All Yardstick Runs Sealed.');
}

seal();
