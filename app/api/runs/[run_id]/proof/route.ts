/**
 * Adjudication Proof API
 * 
 * GET /api/runs/{run_id}/proof
 * 
 * Returns a portable adjudication proof for the specified run.
 * The proof contains integrity hashes for offline verification.
 * 
 * CRITICAL: This is NOT certification. The proof represents
 * "verdict under ruleset X" with deterministic reproducibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateProof } from '@/lib/proof/generateProof';

interface RouteParams {
    params: Promise<{ run_id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { run_id } = await params;

    // Generate proof
    const result = generateProof(run_id);

    if (!result.success || !result.proof) {
        return NextResponse.json(
            { error: result.error || 'Failed to generate proof' },
            { status: result.error?.includes('not found') ? 404 : 400 }
        );
    }

    // Return proof JSON
    const proofJson = JSON.stringify(result.proof, null, 2);
    const filename = `${run_id}_adjudication.proof.json`;

    return new NextResponse(proofJson, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'private, no-cache',
        },
    });
}
