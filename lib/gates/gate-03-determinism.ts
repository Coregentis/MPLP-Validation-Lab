/**
 * Phase D: GATE-03 Determinism Gate
 * 
 * Verifies that evaluation produces deterministic results.
 * Same pack + same ruleset → same verdict_hash.
 */

import { PackHandle, VerificationReport } from '../engine/types';
import { evaluate } from '../evaluate/evaluate';
import { EvaluateOptions, EvaluationReport } from '../evaluate/types';
import { runGate02, Gate02Options } from './gate-02-admission';

// =============================================================================
// Types
// =============================================================================

export interface Gate03Result {
    passed: boolean;
    verdict_hash_1: string;
    verdict_hash_2: string;
    message: string;
    reports?: [EvaluationReport, EvaluationReport];
}

export interface Gate03Options {
    /** GATE-02 options for admission */
    gate02: Gate02Options;

    /** Evaluate options */
    evaluate: EvaluateOptions;
}

// =============================================================================
// GATE-03: Determinism Gate
// =============================================================================

/**
 * GATE-03: Run evaluation twice and verify verdict_hash is identical.
 * This ensures deterministic output across runs.
 */
export async function runGate03(options: Gate03Options): Promise<Gate03Result> {
    // Step 1: Run GATE-02
    const gate02Result = await runGate02(options.gate02);

    if (!gate02Result.passed || !gate02Result.pack) {
        return {
            passed: false,
            verdict_hash_1: '',
            verdict_hash_2: '',
            message: `GATE-02 failed: ${gate02Result.message}`,
        };
    }

    const pack = gate02Result.pack;
    const verifyReport = gate02Result.report;

    // Step 2: Run evaluation twice
    const report1 = await evaluate(pack, verifyReport, options.evaluate);
    const report2 = await evaluate(pack, verifyReport, options.evaluate);

    // Step 3: Compare verdict hashes
    const hash1 = report1.verdict_hash;
    const hash2 = report2.verdict_hash;

    if (hash1 !== hash2) {
        return {
            passed: false,
            verdict_hash_1: hash1,
            verdict_hash_2: hash2,
            message: `Determinism failed: verdict_hash mismatch`,
            reports: [report1, report2],
        };
    }

    return {
        passed: true,
        verdict_hash_1: hash1,
        verdict_hash_2: hash2,
        message: `Determinism verified: ${hash1.slice(0, 16)}...`,
        reports: [report1, report2],
    };
}

// =============================================================================
// Standalone Determinism Check
// =============================================================================

/**
 * Check determinism for an already-admitted pack.
 */
export async function checkDeterminism(
    pack: PackHandle,
    verifyReport: VerificationReport,
    options: EvaluateOptions
): Promise<Gate03Result> {
    const report1 = await evaluate(pack, verifyReport, options);
    const report2 = await evaluate(pack, verifyReport, options);

    const hash1 = report1.verdict_hash;
    const hash2 = report2.verdict_hash;

    return {
        passed: hash1 === hash2,
        verdict_hash_1: hash1,
        verdict_hash_2: hash2,
        message: hash1 === hash2
            ? `Determinism verified: ${hash1.slice(0, 16)}...`
            : 'Determinism failed: verdict_hash mismatch',
        reports: [report1, report2],
    };
}
