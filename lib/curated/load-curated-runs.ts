import fs from 'fs';
import path from 'path';
import type { CuratedRunsArtifact } from './types';

const ARTIFACT_PATH = 'public/_data/curated-runs.json';

export function getCuratedRuns(): CuratedRunsArtifact {
    const fullPath = path.join(process.cwd(), ARTIFACT_PATH);

    if (!fs.existsSync(fullPath)) {
        throw new Error(
            `Curated runs artifact not found. Run: npm run generate:curated`
        );
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as CuratedRunsArtifact;
}
