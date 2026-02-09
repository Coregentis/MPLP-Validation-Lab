import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { resolveEvidencePackFiles } from '@/lib/v2/evidence/resolve-evidence-pack';

// Enforce NodeJS runtime for FS access
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ run_id: string }> }
) {
    const { run_id } = await params;
    const resolution = resolveEvidencePackFiles(run_id);

    if (!resolution.exists || !resolution.mainFile) {
        return NextResponse.json(
            { error: 'EVIDENCE_NOT_FOUND', run_id, tried_path: resolution.dir },
            { status: 404 }
        );
    }

    try {
        const content = fs.readFileSync(resolution.mainFile, 'utf-8');
        const json = JSON.parse(content);
        return NextResponse.json(json);
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json(
            { error: 'EVIDENCE_READ_ERROR', message },
            { status: 500 }
        );
    }
}
