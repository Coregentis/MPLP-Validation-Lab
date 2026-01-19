/**
 * Adjudication Pipeline Tests
 * 
 * Tests determinism and correctness of the adjudication pipeline.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createTempDir, writeJson } from '../_helpers';

// Note: We test the deterministic hash utility directly rather than running
// the full pipeline (which modifies the adjudication/ directory)

describe('adjudication/deterministicHash', () => {
    it('produces same hash for same input', async () => {
        const { computeDeterministicHash } = await import('../../lib/adjudication/deterministicHash');

        const input1 = { a: 1, b: 2, adjudicated_at: '2026-01-14T10:00:00Z' };
        const input2 = { a: 1, b: 2, adjudicated_at: '2026-01-14T11:00:00Z' };

        // adjudicated_at is excluded, so hashes should match
        expect(computeDeterministicHash(input1)).toBe(computeDeterministicHash(input2));
    });

    it('produces different hash for different semantic content', async () => {
        const { computeDeterministicHash } = await import('../../lib/adjudication/deterministicHash');

        const input1 = { a: 1, b: 2 };
        const input2 = { a: 1, b: 3 };

        expect(computeDeterministicHash(input1)).not.toBe(computeDeterministicHash(input2));
    });

    it('excludes _meta field from hash', async () => {
        const { computeDeterministicHash } = await import('../../lib/adjudication/deterministicHash');

        const input1 = { a: 1, _meta: { notes: 'test1' } };
        const input2 = { a: 1, _meta: { notes: 'test2' } };

        expect(computeDeterministicHash(input1)).toBe(computeDeterministicHash(input2));
    });

    it('is order-independent for object keys', async () => {
        const { computeDeterministicHash } = await import('../../lib/adjudication/deterministicHash');

        const input1 = { a: 1, b: 2, c: 3 };
        const input2 = { c: 3, a: 1, b: 2 };

        expect(computeDeterministicHash(input1)).toBe(computeDeterministicHash(input2));
    });
});

describe('adjudication bundle structure', () => {
    it('gf-01-smoke bundle has 7 files', () => {
        const bundlePath = path.resolve(__dirname, '../../adjudication/gf-01-smoke');

        // Skip if bundle doesn't exist (hasn't been run)
        if (!fs.existsSync(bundlePath)) {
            return;
        }

        const requiredFiles = [
            'input.pointer.json',
            'verifier.identity.json',
            'verifier.fingerprint.json',
            'verify.report.json',
            'evaluate.report.json',
            'verdict.json',
            'sha256sums.txt',
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(bundlePath, file);
            expect(fs.existsSync(filePath)).toBe(true);
        }
    });

    it('verdict.json has required fields', () => {
        const verdictPath = path.resolve(__dirname, '../../adjudication/gf-01-smoke/verdict.json');

        if (!fs.existsSync(verdictPath)) {
            return;
        }

        const verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf-8'));

        expect(verdict.adjudication_version).toBeDefined();
        expect(verdict.run_id).toBe('gf-01-smoke');
        expect(verdict.verifier).toBeDefined();
        expect(verdict.ruleset_version).toBeDefined();
        expect(verdict.admission_status).toBeDefined();
        expect(verdict.golden_flow_results).toBeDefined();
        expect(verdict.overall_status).toBeDefined();
        expect(verdict.verdict_hash).toBeDefined();

        // Verdict hash should be a 64-char hex string
        expect(verdict.verdict_hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('verdict.json has valid overall_status', () => {
        const verdictPath = path.resolve(__dirname, '../../adjudication/gf-01-smoke/verdict.json');

        if (!fs.existsSync(verdictPath)) {
            return;
        }

        const verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf-8'));

        expect(['ADJUDICATED', 'INCOMPLETE', 'NOT_ADMISSIBLE']).toContain(verdict.overall_status);
    });
});
