import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const RELEASES_ROOT = path.join(process.cwd(), 'releases/unified');

export interface ReleaseSummary {
    build_id: string; // Folder name (e.g. rc-2026...)
    date: string; // Extracted from seal or folder stat
    seal_status: 'VALID' | 'INVALID' | 'UNSEALED' | 'TOLERANT';
    evidence_count: number;
}

export interface ReleaseDetail extends ReleaseSummary {
    seal_content: string; // Raw Markdown
    seal_hash: string; // SHA-256 hash of seal.md content
    files: string[]; // List of available evidence files
    lint_policy?: 'strict' | 'tolerant';
}

/**
 * List all releases (reverse chronological)
 */
export function listUniqueReleases(): ReleaseSummary[] {
    if (!fs.existsSync(RELEASES_ROOT)) return [];

    try {
        const dirs = fs.readdirSync(RELEASES_ROOT)
            .filter(f => fs.statSync(path.join(RELEASES_ROOT, f)).isDirectory())
            .sort()
            .reverse();

        return dirs.map(build_id => {
            const dir = path.join(RELEASES_ROOT, build_id);
            const sealPath = path.join(dir, 'seal.md');
            let status: ReleaseSummary['seal_status'] = 'UNSEALED';
            let date = '';

            if (fs.existsSync(sealPath)) {
                try {
                    const content = fs.readFileSync(sealPath, 'utf8');
                    // P0-B: Fix regex to match markdown bold format: **Status**: PASS
                    if (/\*{0,2}Status\*{0,2}:\s*PASS/i.test(content)) {
                        status = 'VALID';
                        // Check for tolerant policy
                        if (/\*{0,2}(Build\s+)?Policy\*{0,2}:\s*tolerant/i.test(content) || fs.existsSync(path.join(dir, 'lint-audit.json'))) {
                            status = 'TOLERANT';
                        }
                    } else if (/\*{0,2}Status\*{0,2}:\s*FAIL/i.test(content)) {
                        status = 'INVALID';
                    }

                    // Date extraction with markdown-aware regex
                    const dateMatch = content.match(/\*{0,2}Date\*{0,2}:\s*(.+)/i);
                    if (dateMatch) date = dateMatch[1].trim();

                } catch { }
            }

            // Fallback date from FS
            if (!date) {
                const stat = fs.statSync(dir);
                date = stat.birthtime.toISOString().split('T')[0];
            }

            return {
                build_id,
                date,
                seal_status: status,
                evidence_count: fs.readdirSync(dir).length
            };
        });
    } catch (e) {
        console.error('Error listing releases', e);
        return [];
    }
}

/**
 * Get details for a specific release
 */
export function getRelease(build_id: string): ReleaseDetail | null {
    const dir = path.join(RELEASES_ROOT, build_id);
    if (!fs.existsSync(dir)) return null;

    try {
        const sealPath = path.join(dir, 'seal.md');
        const seal_content = fs.existsSync(sealPath) ? fs.readFileSync(sealPath, 'utf8') : '# Unsealed Release';
        const files = fs.readdirSync(dir).filter(f => !f.startsWith('.')); // visible files

        let status: ReleaseSummary['seal_status'] = 'UNSEALED';
        // P0-B: Fix regex to match markdown bold format: **Status**: PASS
        // Handles both plain `Status:` and bold `**Status**:` formats
        if (/\*{0,2}Status\*{0,2}:\s*PASS/i.test(seal_content)) status = 'VALID';

        let lint_policy: ReleaseDetail['lint_policy'] = 'strict';
        // P0-B: Fix regex for Policy detection
        if (/\*{0,2}(Build\s+)?Policy\*{0,2}:\s*tolerant/i.test(seal_content) || files.includes('lint-audit.json')) {
            lint_policy = 'tolerant';
            if (status === 'VALID') status = 'TOLERANT';
        }

        let date = '';
        // P0-B: Fix regex for Date extraction
        const dateMatch = seal_content.match(/\*{0,2}Date\*{0,2}:\s*(.+)/i);
        if (dateMatch) date = dateMatch[1].trim();
        if (!date) {
            date = fs.statSync(dir).birthtime.toISOString();
        }

        // Compute seal hash from content
        const seal_hash = crypto.createHash('sha256').update(seal_content).digest('hex');

        return {
            build_id,
            date,
            seal_status: status,
            evidence_count: files.length,
            seal_content,
            seal_hash,
            files,
            lint_policy
        };

    } catch (e) {
        console.error(`Error loading release ${build_id}`, e);
        return null;
    }
}
