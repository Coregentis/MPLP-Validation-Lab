import { NextRequest, NextResponse } from 'next/server';
import { resolveEvidencePackFiles } from '@/lib/v2/evidence/resolve-evidence-pack';
import archiver from 'archiver';

// Enforce NodeJS runtime for FS access
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ run_id: string }> }
) {
    const { run_id } = await params;
    const resolution = resolveEvidencePackFiles(run_id);

    if (!resolution.exists || resolution.files.length === 0) {
        return NextResponse.json(
            { error: 'EVIDENCE_NOT_FOUND', run_id, tried_path: resolution.dir },
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

        // Add files
        resolution.files.forEach(file => {
            archive.file(file.path, { name: file.filename });
        });

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
