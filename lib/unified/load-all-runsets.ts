import path from 'path';
import fs from 'fs';

export interface RunsetManifest {
    id: string; // The URL-friendly ID (e.g. "v1-curated", "v2-index")
    title: string;
    source: 'v1' | 'v2';
    version: string;
    description: string;
    generated_at: string;
    run_count: number;
    href: string; // Internal link /runsets/[id]
}

const PROJECT_ROOT = process.cwd();

function readJson(relPath: string) {
    try {
        const fullPath = path.join(PROJECT_ROOT, relPath);
        if (fs.existsSync(fullPath)) {
            return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        }
    } catch { }
    return null;
}

export function loadAllRunsets(): RunsetManifest[] {
    const runsets: RunsetManifest[] = [];

    // 1. V1 Curated Runset
    const v1Data = readJson('public/_data/curated-runs.json');
    if (v1Data) {
        runsets.push({
            id: 'v1-curated',
            title: 'V1 Curated Runs',
            source: 'v1',
            version: v1Data.ssot?.generated_at ? '1.0.0' : 'unknown', // Implicit version
            description: 'Simulated evidence packs for protocol baseline verification.',
            generated_at: v1Data.ssot?.generated_at || new Date().toISOString(),
            run_count: v1Data.runs?.length || 0,
            href: '/runsets/v1-curated'
        });
    }

    // 2. V2 Index Runset
    const v2Data = readJson('public/_data/v2/runs/index.json');
    if (v2Data) {
        const indexVer = v2Data.source_version?.curated_index_version || '2.0.0';
        runsets.push({
            id: 'v2-index',
            title: 'V2 Unified Index',
            source: 'v2',
            version: indexVer,
            description: 'Reproduced and Declared evidence packs from real execution substrates.',
            generated_at: v2Data.generated_at,
            run_count: v2Data.data?.runs?.length || 0,
            href: '/runsets/v2-index'
        });
    }

    return runsets;
}

export function getRunset(id: string): RunsetManifest | null {
    const all = loadAllRunsets();
    return all.find(r => r.id === id) || null;
}
