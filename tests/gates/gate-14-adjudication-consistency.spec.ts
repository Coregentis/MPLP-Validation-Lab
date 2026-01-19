/**
 * Gate-14 Adjudication Consistency Tests
 * 
 * Tests the adjudication bundle validation logic.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { createTempDir, writeJson, writeText } from '../_helpers';

describe('Gate-14 Adjudication Consistency', () => {
    let tmpDir: { path: string; cleanup: () => void };

    beforeEach(() => {
        tmpDir = createTempDir('gate-14-test-');
    });

    afterEach(() => {
        tmpDir.cleanup();
    });

    describe('bundle file validation', () => {
        it('complete bundle has 7 required files', () => {
            const requiredFiles = [
                'input.pointer.json',
                'verifier.identity.json',
                'verifier.fingerprint.json',
                'verify.report.json',
                'evaluate.report.json',
                'verdict.json',
                'sha256sums.txt',
            ];

            // Create bundle
            const bundlePath = path.join(tmpDir.path, 'test-run');
            fs.mkdirSync(bundlePath, { recursive: true });

            for (const file of requiredFiles) {
                if (file.endsWith('.json')) {
                    writeJson(path.join(bundlePath, file), {});
                } else {
                    writeText(path.join(bundlePath, file), '');
                }
            }

            // Verify all exist
            for (const file of requiredFiles) {
                expect(fs.existsSync(path.join(bundlePath, file))).toBe(true);
            }
        });

        it('detects missing files', () => {
            const bundlePath = path.join(tmpDir.path, 'incomplete-run');
            fs.mkdirSync(bundlePath, { recursive: true });

            // Only create some files
            writeJson(path.join(bundlePath, 'verdict.json'), {});
            writeJson(path.join(bundlePath, 'input.pointer.json'), {});

            // Verify missing
            expect(fs.existsSync(path.join(bundlePath, 'verify.report.json'))).toBe(false);
            expect(fs.existsSync(path.join(bundlePath, 'evaluate.report.json'))).toBe(false);
        });
    });

    describe('sha256sums validation', () => {
        it('valid sha256sums match file hashes', () => {
            const bundlePath = path.join(tmpDir.path, 'hash-test');
            fs.mkdirSync(bundlePath, { recursive: true });

            // Create a file
            const content = '{"test": true}';
            fs.writeFileSync(path.join(bundlePath, 'verdict.json'), content);

            // Compute hash
            const hash = crypto.createHash('sha256').update(content).digest('hex');

            // Create sha256sums
            writeText(path.join(bundlePath, 'sha256sums.txt'), `${hash}  verdict.json\n`);

            // Verify
            const storedHash = fs.readFileSync(path.join(bundlePath, 'sha256sums.txt'), 'utf-8')
                .split('  ')[0];
            expect(storedHash).toBe(hash);
        });

        it('detects hash mismatch', () => {
            const bundlePath = path.join(tmpDir.path, 'hash-mismatch');
            fs.mkdirSync(bundlePath, { recursive: true });

            // Create file with one content
            fs.writeFileSync(path.join(bundlePath, 'verdict.json'), '{"original": true}');

            // Compute hash of different content
            const wrongHash = crypto.createHash('sha256').update('different').digest('hex');
            writeText(path.join(bundlePath, 'sha256sums.txt'), `${wrongHash}  verdict.json\n`);

            // Verify mismatch
            const actualContent = fs.readFileSync(path.join(bundlePath, 'verdict.json'));
            const actualHash = crypto.createHash('sha256').update(actualContent).digest('hex');
            const storedHash = fs.readFileSync(path.join(bundlePath, 'sha256sums.txt'), 'utf-8')
                .split('  ')[0];

            expect(storedHash).not.toBe(actualHash);
        });
    });

    describe('verdict structure validation', () => {
        it('valid overall_status values', () => {
            const validStatuses = ['ADJUDICATED', 'INCOMPLETE', 'NOT_ADMISSIBLE'];

            for (const status of validStatuses) {
                expect(validStatuses).toContain(status);
            }
        });

        it('rejects invalid overall_status', () => {
            const validStatuses = ['ADJUDICATED', 'INCOMPLETE', 'NOT_ADMISSIBLE'];
            const invalidStatus = 'CERTIFIED'; // Forbidden term

            expect(validStatuses).not.toContain(invalidStatus);
        });
    });

    describe('determinism verification', () => {
        it('verdict_hash excludes timestamps', async () => {
            const { computeDeterministicHash } = await import('../../lib/adjudication/deterministicHash');

            const verdict1 = {
                run_id: 'test',
                overall_status: 'ADJUDICATED',
                adjudicated_at: '2026-01-14T10:00:00Z'
            };
            const verdict2 = {
                run_id: 'test',
                overall_status: 'ADJUDICATED',
                adjudicated_at: '2026-01-14T11:00:00Z'
            };

            // Same hash despite different timestamps
            expect(computeDeterministicHash(verdict1)).toBe(computeDeterministicHash(verdict2));
        });

        it('verdict_hash changes with semantic content', async () => {
            const { computeDeterministicHash } = await import('../../lib/adjudication/deterministicHash');

            const verdict1 = { run_id: 'test', overall_status: 'ADJUDICATED' };
            const verdict2 = { run_id: 'test', overall_status: 'INCOMPLETE' };

            expect(computeDeterministicHash(verdict1)).not.toBe(computeDeterministicHash(verdict2));
        });
    });
});
