import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

// Enforce NodeJS runtime for FS access
export const runtime = 'nodejs';

// Helper to determine runs directory
const RUNS_DIR = path.join(process.cwd(), 'data/runs');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ run_id: string }> }
) {
    const { run_id } = await params;
    const runDir = path.join(RUNS_DIR, run_id);

    // 1. Validate run existence
    if (!fs.existsSync(runDir)) {
        return NextResponse.json(
            { error: 'RUN_NOT_FOUND', run_id },
            { status: 404 }
        );
    }

    try {
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Transform the stream into a Response
        const stream = new ReadableStream({
            start(controller) {
                archive.on('data', (chunk) => controller.enqueue(chunk));
                archive.on('end', () => controller.close());
                archive.on('error', (err) => controller.error(err));
            }
        });

        // Add the entire run directory to the archive
        // Using false ensures the files are at the root of the zip, or we can put them in a folder
        // The V2 implementation puts them at root. Let's match that.
        archive.directory(runDir, false);

        // Finalize (trigger stream)
        archive.finalize();

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${run_id}-evidence-pack.zip"`
            }
        });

    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json(
            { error: 'ZIP_GENERATION_FAILED', message },
            { status: 500 }
        );
    }
}
