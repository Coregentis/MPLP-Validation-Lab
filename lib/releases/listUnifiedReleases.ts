import fs from 'fs';
import path from 'path';

export interface UnifiedRelease {
    id: string; // rc-timestamp
    build_id: string;
    date: string;
    status: 'VALID' | 'INVALID' | 'UNKNOWN';
    basis: string;
    artifacts: {
        seal: string;
        gate_report: string;
        audit_report: string;
    };
    targets_verified: number;
}

const RELEASES_ROOT = path.join(process.cwd(), 'releases/unified');

export function listUnifiedReleases(): UnifiedRelease[] {
    if (!fs.existsSync(RELEASES_ROOT)) return [];

    const dirs = fs.readdirSync(RELEASES_ROOT).sort().reverse();
    const results: UnifiedRelease[] = [];

    for (const id of dirs) {
        const dirPath = path.join(RELEASES_ROOT, id);
        if (!fs.statSync(dirPath).isDirectory()) continue;

        const sealPath = path.join(dirPath, 'seal.md');
        let status: UnifiedRelease['status'] = 'UNKNOWN';
        let basis = 'Unknown';
        let targets = 0;

        if (fs.existsSync(sealPath)) {
            const content = fs.readFileSync(sealPath, 'utf8');
            status = content.includes('Status: PASS') ? 'VALID' : 'INVALID';

            const basisMatch = content.match(/\*\*Basis\*\*: (.*)/);
            if (basisMatch) basis = basisMatch[1];

            const targetsMatch = content.match(/targets: (\d+)/);
            if (targetsMatch) targets = parseInt(targetsMatch[1]);
        }

        results.push({
            id,
            build_id: id,
            date: extractDateFromId(id),
            status,
            basis,
            targets_verified: targets,
            artifacts: {
                seal: `/releases/unified/${id}/seal.md`,
                gate_report: `/releases/unified/${id}/gate-report.log`,
                audit_report: `/releases/unified/${id}/audit-report.log`
            }
        });
    }

    return results;
}

function extractDateFromId(id: string): string {
    // rc-20260131151110 -> 2026-01-31 15:11:10
    const ts = id.replace('rc-', '');
    if (ts.length !== 14) return id;
    return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)} ${ts.slice(8, 10)}:${ts.slice(10, 12)}`;
}
