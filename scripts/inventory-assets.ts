import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const LAB_ROOT = process.cwd();
const INVENTORY_DIR = path.join(LAB_ROOT, 'inventory');
const OUTPUT_FILE = path.join(INVENTORY_DIR, 'asset-inventory.json');

const SEARCH_PATHS = [
    'data/runs',
    'fixtures/packs',
    'examples/evidence-producers',
    'producers',
    'export',
    'test-vectors',
    'releases/archive'
];

function sha256(content: Buffer | string) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function computePackRootHash(sha256sumsPath: string) {
    if (!fs.existsSync(sha256sumsPath)) return null;
    const content = fs.readFileSync(sha256sumsPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    const entries = lines.map(l => {
        const match = l.match(/^([0-9a-f]{64})\s+(.+)$/);
        if (!match) return null;
        return { hash: match[1], path: match[2] };
    }).filter(Boolean) as { hash: string, path: string }[];
    entries.sort((a, b) => a.path.localeCompare(b.path));
    const normalized = entries.map(e => `${e.hash}  ${e.path}`).join('\n');
    return sha256(normalized);
}

function getPackMetadata(dir: string) {
    const manifestPath = path.join(dir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return null;
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        return {
            pack_id: manifest.pack_id,
            protocol_version: manifest.protocol_version || manifest.mplp_protocol_version,
            ruleset_version: manifest.ruleset_version || manifest.compatibility?.min_ruleset_version,
            substrate: manifest.substrate
        };
    } catch (e) {
        return { error: 'Invalid manifest' };
    }
}

async function run() {
    console.log('📦 Starting physical asset inventory...');
    if (!fs.existsSync(INVENTORY_DIR)) fs.mkdirSync(INVENTORY_DIR);

    const inventory: any = {
        generated_at: new Date().toISOString(),
        git: {
            head: '', // To be filled if needed via execSync
            branch: 'main'
        },
        packs: [],
        vectors: [],
        producers: [],
        other_assets: []
    };

    for (const searchPath of SEARCH_PATHS) {
        const fullPath = path.join(LAB_ROOT, searchPath);
        if (!fs.existsSync(fullPath)) continue;

        const items = fs.readdirSync(fullPath, { withFileTypes: true });
        for (const item of items) {
            const itemPath = path.join(fullPath, item.name);
            if (item.isDirectory()) {
                const manifest = getPackMetadata(itemPath);
                if (manifest) {
                    const sumsPath = path.join(itemPath, 'integrity/sha256sums.txt');
                    const packRootHash = computePackRootHash(sumsPath);
                    inventory.packs.push({
                        run_id: item.name,
                        pack_path: path.relative(LAB_ROOT, itemPath),
                        pack_root_hash: packRootHash || '00'.repeat(32),
                        ...manifest
                    });
                } else if (searchPath === 'test-vectors') {
                    // Recurse a bit for test vectors if needed
                }
            }
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2));
    console.log(`✅ Inventory saved to ${OUTPUT_FILE}`);
}

run();
