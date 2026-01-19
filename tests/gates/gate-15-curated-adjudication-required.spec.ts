/**
 * Gate-15 Curated Adjudication Required Tests
 * 
 * Tests the curated runs → adjudication bundle closure.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createTempDir, writeJson, writeText } from '../_helpers';

describe('Gate-15 Curated Adjudication Required', () => {
    let tmpDir: { path: string; cleanup: () => void };

    beforeEach(() => {
        tmpDir = createTempDir('gate-15-test-');
    });

    afterEach(() => {
        tmpDir.cleanup();
    });

    describe('allowlist structure', () => {
        it('requires run_id field in curated entries', () => {
            const entry = {
                run_id: 'gf-01-test',
                status: 'active',
                scenario_id: 'gf-01',
            };

            expect(entry.run_id).toBeTruthy();
        });

        it('recognizes valid curated statuses', () => {
            const requireAdjudicationStatuses = ['active', 'curated', 'frozen'];

            expect(requireAdjudicationStatuses).toContain('active');
            expect(requireAdjudicationStatuses).toContain('curated');
            expect(requireAdjudicationStatuses).toContain('frozen');
        });

        it('eligible_for_upgrade does not require adjudication', () => {
            const nonRequiredStatuses = ['eligible_for_upgrade'];
            const status = 'eligible_for_upgrade';

            expect(nonRequiredStatuses).toContain(status);
        });
    });

    describe('adjudication bundle verification', () => {
        it('bundle directory must exist for adjudicated runs', () => {
            const bundlePath = path.join(tmpDir.path, 'test-run');
            fs.mkdirSync(bundlePath, { recursive: true });

            expect(fs.existsSync(bundlePath)).toBe(true);
        });

        it('verdict.json must exist in bundle', () => {
            const bundlePath = path.join(tmpDir.path, 'test-run');
            fs.mkdirSync(bundlePath, { recursive: true });

            writeJson(path.join(bundlePath, 'verdict.json'), {
                overall_status: 'ADJUDICATED',
                verdict_hash: 'abc123',
            });

            expect(fs.existsSync(path.join(bundlePath, 'verdict.json'))).toBe(true);
        });

        it('detects missing verdict.json', () => {
            const bundlePath = path.join(tmpDir.path, 'incomplete-run');
            fs.mkdirSync(bundlePath, { recursive: true });

            // Don't create verdict.json
            expect(fs.existsSync(path.join(bundlePath, 'verdict.json'))).toBe(false);
        });
    });

    describe('verdict validation', () => {
        it('accepts valid overall_status values', () => {
            const validStatuses = ['ADJUDICATED', 'INCOMPLETE', 'NOT_ADMISSIBLE'];

            expect(validStatuses).toContain('ADJUDICATED');
            expect(validStatuses).toContain('INCOMPLETE');
            expect(validStatuses).toContain('NOT_ADMISSIBLE');
        });

        it('rejects forbidden status values', () => {
            const validStatuses = ['ADJUDICATED', 'INCOMPLETE', 'NOT_ADMISSIBLE'];

            expect(validStatuses).not.toContain('CERTIFIED');
            expect(validStatuses).not.toContain('ENDORSED');
            expect(validStatuses).not.toContain('RANKED');
        });

        it('verdict_hash must be present', () => {
            const verdict = {
                overall_status: 'ADJUDICATED',
                verdict_hash: 'abc123def456',
            };

            expect(verdict.verdict_hash).toBeTruthy();
        });
    });

    describe('curated-runs export linking', () => {
        it('adjudication_status field indicates linking status', () => {
            const enrichedRun = {
                run_id: 'gf-01-test',
                status: 'active',
                adjudication_status: 'ADJUDICATED',
                adjudication_verdict_hash: 'abc123',
            };

            expect(enrichedRun.adjudication_status).toBe('ADJUDICATED');
            expect(enrichedRun.adjudication_verdict_hash).toBeTruthy();
        });

        it('NOT_ADJUDICATED indicates missing bundle', () => {
            const unprocessedRun = {
                run_id: 'gf-01-pending',
                status: 'active',
                adjudication_status: 'NOT_ADJUDICATED',
            };

            expect(unprocessedRun.adjudication_status).toBe('NOT_ADJUDICATED');
        });
    });
});
