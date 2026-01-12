import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_FILES = new Set([
    'manifest.json',
    'integrity/sha256sums.txt',
    'integrity/pack.sha256',
    'timeline/events.ndjson',
    'artifacts/context.json',
    'artifacts/plan.json',
    'artifacts/trace.json',
]);

function isSafeRel(rel: string): boolean {
    if (!rel) return false;
    if (rel.includes('\\')) return false;
    if (rel.split('/').some(seg => seg === '' || seg === '.' || seg === '..')) return false;
    return true;
}

function safeJsonError(message: string, status: number): NextResponse {
    return NextResponse.json({ error: message }, { status });
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ run_id: string; path: string[] }> }
) {
    const { run_id, path: pathParam } = await params;
    const runId = run_id;
    const rel = pathParam.join('/');

    // 1) Whitelist check
    if (!ALLOWED_FILES.has(rel)) {
        return safeJsonError('File not allowed', 403);
    }

    // 2) Input validation (defense in depth)
    if (!isSafeRel(rel)) {
        return safeJsonError('Invalid path', 403);
    }

    const runDir = path.resolve(process.cwd(), 'data', 'runs', runId);
    const candidate = path.resolve(runDir, rel);

    // 3) Prefix containment check (with path.sep to prevent false positives)
    if (!candidate.startsWith(runDir + path.sep)) {
        return safeJsonError('Path escape detected', 403);
    }

    // 4) Symlink defense (realpath containment)
    try {
        const runDirReal = fs.realpathSync(runDir);
        const candidateReal = fs.realpathSync(candidate);
        if (!candidateReal.startsWith(runDirReal + path.sep)) {
            return safeJsonError('Path escape detected', 403);
        }
    } catch {
        // Don't leak filesystem paths
        return safeJsonError('File not found', 404);
    }

    // 5) Read & return as download
    try {
        const content = fs.readFileSync(candidate, 'utf-8');
        const filename = path.basename(rel);

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch {
        return safeJsonError('Download failed', 500);
    }
}
