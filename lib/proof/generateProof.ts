/**
 * Generate Adjudication Proof
 * 
 * Creates a portable, verifiable proof from run artifacts.
 * The proof enables offline verification and audit archival.
 * 
 * SECURITY: Only generates proofs for existing run data.
 * No new data is created; proof is a summary with integrity hashes.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AdjudicationProof, PROOF_DISCLAIMER } from './types';
import { safeJoinPath, safeGetFileStats } from '@/lib/security/allowlist';

const RUNS_ROOT = path.join(process.cwd(), 'data', 'runs');

/**
 * Calculate SHA256 hash of file content
 */
function hashFile(filePath: string): string | null {
    try {
        const content = fs.readFileSync(filePath);
        return crypto.createHash('sha256').update(content).digest('hex');
    } catch {
        return null;
    }
}

/**
 * Read JSON file safely
 */
function readJson<T>(filePath: string): T | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as T;
    } catch {
        return null;
    }
}

export interface GenerateProofResult {
    success: boolean;
    proof?: AdjudicationProof;
    error?: string;
}

/**
 * Generate an adjudication proof for a run
 */
export function generateProof(runId: string): GenerateProofResult {
    // Validate run_id
    if (!runId || !/^[a-z0-9][a-z0-9._-]*$/i.test(runId)) {
        return { success: false, error: 'Invalid run_id' };
    }

    const runPath = safeJoinPath(RUNS_ROOT, runId);
    if (!runPath) {
        return { success: false, error: 'Invalid path' };
    }

    // Check run directory exists
    if (!fs.existsSync(runPath)) {
        return { success: false, error: 'Run not found' };
    }

    // Load verify report (required)
    const verifyPath = path.join(runPath, 'verify.report.json');
    if (!safeGetFileStats(verifyPath)) {
        return { success: false, error: 'verify.report.json not found' };
    }

    const verifyReport = readJson<{
        admission_status: string;
        blocking_failures?: { code: string }[];
        pack_root_hash?: string;
    }>(verifyPath);

    if (!verifyReport) {
        return { success: false, error: 'Failed to parse verify.report.json' };
    }

    // Load manifest
    const manifestJsonPath = path.join(runPath, 'manifest.json');
    const manifestYamlPath = path.join(runPath, 'manifest.yaml');
    const manifestPath = safeGetFileStats(manifestJsonPath) ? manifestJsonPath :
        safeGetFileStats(manifestYamlPath) ? manifestYamlPath : null;

    const manifest = manifestPath ? readJson<{
        pack_id?: string;
        protocol_version?: string;
    }>(manifestPath) : null;

    // Load evaluation report (optional, only for ADMISSIBLE)
    const evalPath = path.join(runPath, 'evaluation.report.json');
    const evalReport = safeGetFileStats(evalPath) ? readJson<{
        verdict_hash?: string;
        gf_verdicts?: { status: string }[];
        ruleset_version?: string;
    }>(evalPath) : null;

    // Calculate integrity hashes
    const verifyHash = hashFile(verifyPath);
    const evalHash = evalReport ? hashFile(evalPath) : undefined;
    const manifestHash = manifestPath ? hashFile(manifestPath) : null;
    const checksumsPath = path.join(runPath, 'sha256sums.txt');
    const checksumsHash = safeGetFileStats(checksumsPath) ? hashFile(checksumsPath) : undefined;

    if (!verifyHash || !manifestHash) {
        return { success: false, error: 'Failed to calculate integrity hashes' };
    }

    // Build GF summary if evaluation exists
    let evaluation: AdjudicationProof['evaluation'] | undefined;
    if (evalReport?.gf_verdicts && evalReport.verdict_hash) {
        const gfs = evalReport.gf_verdicts;
        evaluation = {
            verdict_hash: evalReport.verdict_hash,
            gf_summary: {
                total: gfs.length,
                pass: gfs.filter(g => g.status === 'PASS').length,
                fail: gfs.filter(g => g.status === 'FAIL').length,
                skip: gfs.filter(g => g.status !== 'PASS' && g.status !== 'FAIL').length,
            },
        };
    }

    // Build proof
    const proof: AdjudicationProof = {
        proof_version: '1.0',
        run_id: runId,
        generated_at: new Date().toISOString(),
        pack: {
            pack_id: manifest?.pack_id || 'unknown',
            protocol_version: manifest?.protocol_version || 'unknown',
        },
        ruleset: {
            version: evalReport?.ruleset_version || 'ruleset-1.0',
        },
        admission: {
            status: verifyReport.admission_status as AdjudicationProof['admission']['status'],
            blocking_failures_count: verifyReport.blocking_failures?.length || 0,
        },
        evaluation,
        integrity: {
            verify_report_hash: verifyHash,
            evaluation_report_hash: evalHash ?? undefined,
            manifest_hash: manifestHash,
            checksums_hash: checksumsHash ?? undefined,
        },
        disclaimer: PROOF_DISCLAIMER,
    };

    return { success: true, proof };
}
