import fs from 'fs';
import path from 'path';

export interface EvidencePackEntry {
    filename: string;
    path: string;
}

export interface EvidencePackResolution {
    runId: string;
    dir: string;
    exists: boolean;
    files: EvidencePackEntry[];
    mainFile: string | null;
}

const V2_DATA_DIR = path.join(process.cwd(), 'public/_data/v2/runs');

/**
 * Resolves all evidence files for a given run ID from the flat V2 store.
 * Model A: V2 data is flat:
 * - [run_id].json
 * - [run_id].evidence.json
 */
export function resolveEvidencePackFiles(runId: string): EvidencePackResolution {
    const resolution: EvidencePackResolution = {
        runId,
        dir: V2_DATA_DIR,
        exists: false,
        files: [],
        mainFile: null
    };

    if (!fs.existsSync(V2_DATA_DIR)) {
        return resolution;
    }

    // 0. Security Check
    if (runId.includes('..') || runId.includes('/') || runId.includes('\\')) {
        return resolution; // Treat as not found
    }

    // 1. Check for Main JSON ([run_id].json)
    const mainPath = path.join(V2_DATA_DIR, `${runId}.json`);
    if (fs.existsSync(mainPath)) {
        resolution.exists = true;
        resolution.mainFile = mainPath;
        resolution.files.push({
            filename: `${runId}.json`,
            path: mainPath
        });
    }

    // 2. Check for Evidence JSON ([run_id].evidence.json)
    const evidencePath = path.join(V2_DATA_DIR, `${runId}.evidence.json`);
    if (fs.existsSync(evidencePath)) {
        resolution.files.push({
            filename: `${runId}.evidence.json`,
            path: evidencePath
        });
    }

    return resolution;
}
