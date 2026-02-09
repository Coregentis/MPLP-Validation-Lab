import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Allowlist for security (No traversal, no secret files)
// R2: Audited against releases/unified/* contents
const ALLOWED_FILES = new Set([
    'seal.md',
    'gate-report.log',
    'audit-report.log',
    'lint-audit.json',
    'manifest.json',
    'build-policy.md'
]);

// Helper to convert Node stream to Web stream
function nodeStreamToWebStream(nodeStream: Readable): ReadableStream {
    return new ReadableStream({
        start(controller) {
            nodeStream.on('data', chunk => controller.enqueue(chunk));
            nodeStream.on('end', () => controller.close());
            nodeStream.on('error', err => controller.error(err));
        }
    });
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ build_id: string; filename: string }> }
) {
    const params = await props.params;
    let { build_id, filename } = params;

    // Decode URL components to ensure we check the real characters
    build_id = decodeURIComponent(build_id);
    filename = decodeURIComponent(filename);

    console.log(`[API] Evidence Request: ${build_id}/${filename}`);

    // 1. Security Check - Allowlist
    if (!ALLOWED_FILES.has(filename)) {
        console.warn(`[API] Blocked allowlist: ${filename}`);
        return NextResponse.json({
            error: 'File type not allowed',
            code: 'ALLOWLIST_VIOLATION',
            requested: filename,
            allowed: Array.from(ALLOWED_FILES)
        }, { status: 403 });
    }

    // 2. Path Validation - No traversal
    if (build_id.includes('..') || filename.includes('..') ||
        build_id.includes('/') || filename.includes('/') ||
        build_id.includes('\\') || filename.includes('\\')) {
        console.warn(`[API] Blocked traversal: ${build_id}/${filename}`);
        return NextResponse.json({
            error: 'Invalid path - traversal attempt detected',
            code: 'PATH_TRAVERSAL',
            build_id,
            filename
        }, { status: 400 });
    }

    const releasesRoot = path.join(process.cwd(), 'releases/unified');
    const filePath = path.join(releasesRoot, build_id, filename);
    const resolvedPath = path.resolve(filePath);

    // Ensure resolved path is still inside releases root
    if (!resolvedPath.startsWith(releasesRoot)) {
        console.warn(`[API] Path escape attempt: ${resolvedPath}`);
        return NextResponse.json({
            error: 'Invalid path - outside releases directory',
            code: 'PATH_ESCAPE',
            build_id,
            filename
        }, { status: 403 });
    }

    // 3. File Existence Check
    if (!fs.existsSync(filePath)) {
        console.warn(`[API] 404 Not Found: ${filePath}`);
        return NextResponse.json({
            error: 'File not found',
            code: 'NOT_FOUND',
            build_id,
            filename,
            probe_path: filePath.replace(process.cwd(), '.')
        }, { status: 404 });
    }

    // 4. Serve File
    try {
        const stats = fs.statSync(filePath);
        const stream = fs.createReadStream(filePath);
        const webStream = nodeStreamToWebStream(stream);

        return new NextResponse(webStream, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': stats.size.toString(),
                'X-Evidence-Build': build_id,
                'X-Evidence-File': filename
            }
        });
    } catch (e) {
        console.error(`[API] Stream error for ${filePath}:`, e);
        return NextResponse.json({
            error: 'Failed to read file',
            code: 'STREAM_ERROR',
            build_id,
            filename,
            message: e instanceof Error ? e.message : String(e)
        }, { status: 500 });
    }
}
