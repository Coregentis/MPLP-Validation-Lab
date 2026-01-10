/**
 * Run Artifact Download API
 * 
 * GET /api/runs/{run_id}/download?file=<filename>
 * 
 * Security:
 * - run_id pattern validation
 * - File allowlist enforcement
 * - Path containment check
 * - Size limit
 * 
 * Returns file with Content-Disposition: attachment
 */

import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import {
    isValidRunId,
    isAllowedFile,
    safeJoinPath,
    readFileWithLimit,
    getContentType,
    MAX_DOWNLOAD_SIZE,
} from '@/lib/security/allowlist';

const RUNS_ROOT = path.join(process.cwd(), 'data', 'runs');

interface RouteParams {
    params: Promise<{ run_id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { run_id } = await params;
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    // Validate run_id
    if (!isValidRunId(run_id)) {
        return NextResponse.json(
            { error: 'Invalid run_id' },
            { status: 400 }
        );
    }

    // Validate file parameter
    if (!file) {
        return NextResponse.json(
            { error: 'Missing file parameter' },
            { status: 400 }
        );
    }

    // Check file allowlist
    if (!isAllowedFile(file)) {
        return NextResponse.json(
            { error: 'File not in allowlist' },
            { status: 403 }
        );
    }

    // Build safe path
    const filePath = safeJoinPath(RUNS_ROOT, run_id, file);
    if (!filePath) {
        return NextResponse.json(
            { error: 'Invalid path' },
            { status: 400 }
        );
    }

    // Read file with size limit
    const content = readFileWithLimit(filePath, MAX_DOWNLOAD_SIZE);
    if (!content) {
        return NextResponse.json(
            { error: 'File not found or too large' },
            { status: 404 }
        );
    }

    // Return file download
    const contentType = getContentType(file);
    const filename = `${run_id}_${file}`;

    return new NextResponse(new Uint8Array(content), {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': content.length.toString(),
            'Cache-Control': 'private, no-cache',
        },
    });
}
