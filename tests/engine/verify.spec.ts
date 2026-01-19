/**
 * Engine Verify Tests
 * 
 * Tests the pack verification functionality.
 * Covers the admission decision path (ADMISSIBLE vs NOT_ADMISSIBLE).
 */

import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { ingest } from '../../lib/engine/ingest';
import { verify } from '../../lib/engine/verify';

const FIXTURES = resolve(__dirname, '../../fixtures/packs');

describe('engine/verify', () => {
    describe('minimal-pass pack', () => {
        it('returns ADMISSIBLE status', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            const report = await verify(pack);
            expect(report.admission_status).toBe('ADMISSIBLE');
        });

        it('has non-empty checks array', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            const report = await verify(pack);
            expect(Array.isArray(report.checks)).toBe(true);
            expect(report.checks.length).toBeGreaterThan(0);
        });

        it('all admission checks pass', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            const report = await verify(pack);

            // All checks with A- prefix should pass (admission checks)
            const admissionChecks = report.checks.filter(
                c => c.check_id.startsWith('A-')
            );

            for (const check of admissionChecks) {
                expect(check.status).toBe('PASS');
            }
        });

        it('reports have identifiable check_id', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            const report = await verify(pack);

            // Each check should have an identifiable ID (for debugging)
            for (const check of report.checks) {
                expect(check.check_id).toBeTruthy();
            }
        });
    });

    describe('broken-admission pack', () => {
        it('returns NOT_ADMISSIBLE status', async () => {
            const pack = await ingest(resolve(FIXTURES, 'broken-admission'));
            const report = await verify(pack);
            expect(report.admission_status).not.toBe('ADMISSIBLE');
        });

        it('has at least one FAIL check', async () => {
            const pack = await ingest(resolve(FIXTURES, 'broken-admission'));
            const report = await verify(pack);

            const failedChecks = report.checks.filter(c => c.status === 'FAIL');
            expect(failedChecks.length).toBeGreaterThan(0);
        });

        it('failed checks have diagnostic messages', async () => {
            const pack = await ingest(resolve(FIXTURES, 'broken-admission'));
            const report = await verify(pack);

            const failedChecks = report.checks.filter(c => c.status === 'FAIL');
            for (const check of failedChecks) {
                // Should have a message for debugging
                expect(check.message).toBeTruthy();
            }
        });
    });

    describe('report structure', () => {
        it('has admission_status field', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            const report = await verify(pack);

            // admission_status should always be defined
            expect(report.admission_status).toBeDefined();
            expect(['ADMISSIBLE', 'NOT_ADMISSIBLE', 'PARTIALLY_ADMISSIBLE']).toContain(report.admission_status);
        });

        it('has checks array with consistent structure', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            const report = await verify(pack);

            expect(Array.isArray(report.checks)).toBe(true);
            // Each check should have check_id and status
            for (const check of report.checks) {
                expect(check.check_id).toBeTruthy();
                expect(['PASS', 'FAIL', 'SKIP', 'WARN']).toContain(check.status);
            }
        });
    });
});
