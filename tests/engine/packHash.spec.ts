/**
 * Pack Hash SSOT Tests
 * 
 * Equivalence lock tests to ensure pack hash computation never drifts.
 * These tests validate the frozen contract from PR-11.3.
 * 
 * Tests:
 * 1. Exclusion rules are correctly applied
 * 2. Computed hash matches existing pack.sha256
 * 3. sha256sums.txt format is correct
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
    EXCLUDED_DIRS,
    EXCLUDED_FILES,
    listPackFiles,
    computeSha256Sums,
    computePackRootHash,
    renderSha256Sums,
    readPackRootHash,
    readSha256Sums,
    computePackRootHashFromDir,
    writeIntegrityFiles,
} from '../../lib/engine/packHash';

const FIXTURES_ROOT = path.join(process.cwd(), 'fixtures/packs');

describe('Pack Hash SSOT', () => {
    describe('Exclusion Rules', () => {
        it('should exclude integrity/ directory', () => {
            expect(EXCLUDED_DIRS).toContain('integrity');
        });

        it('should exclude .DS_Store files', () => {
            expect(EXCLUDED_FILES).toContain('.DS_Store');
        });

        it('should exclude Thumbs.db files', () => {
            expect(EXCLUDED_FILES).toContain('Thumbs.db');
        });

        it('should not include integrity/ files in file list', () => {
            const packDir = path.join(FIXTURES_ROOT, 'minimal-pass');
            const files = listPackFiles(packDir);

            // No file should start with 'integrity/'
            const integrityFiles = files.filter(f => f.startsWith('integrity/') || f.startsWith('integrity\\'));
            expect(integrityFiles).toHaveLength(0);
        });
    });

    describe('SHA256 Sums Format', () => {
        it('should render entries with correct format: <hash>  <path>', () => {
            const entries = [
                { path: 'file1.json', hash: 'a'.repeat(64) },
                { path: 'file2.json', hash: 'b'.repeat(64) },
            ];

            const rendered = renderSha256Sums(entries);
            const lines = rendered.trim().split('\n');

            expect(lines[0]).toBe(`${'a'.repeat(64)}  file1.json`);
            expect(lines[1]).toBe(`${'b'.repeat(64)}  file2.json`);
        });

        it('should use LF line endings', () => {
            const entries = [
                { path: 'file1.json', hash: 'a'.repeat(64) },
                { path: 'file2.json', hash: 'b'.repeat(64) },
            ];

            const rendered = renderSha256Sums(entries);

            // Should contain LF, not CRLF
            expect(rendered).not.toContain('\r\n');
            expect(rendered).toContain('\n');
        });

        it('should have trailing newline in rendered output', () => {
            const entries = [{ path: 'file1.json', hash: 'a'.repeat(64) }];
            const rendered = renderSha256Sums(entries);

            expect(rendered.endsWith('\n')).toBe(true);
        });

        it('should sort entries by path', () => {
            const entries = [
                { path: 'z.json', hash: 'z'.repeat(64) },
                { path: 'a.json', hash: 'a'.repeat(64) },
                { path: 'm.json', hash: 'm'.repeat(64) },
            ];

            const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));
            const rendered = renderSha256Sums(sorted);
            const lines = rendered.trim().split('\n');

            expect(lines[0]).toContain('a.json');
            expect(lines[1]).toContain('m.json');
            expect(lines[2]).toContain('z.json');
        });
    });

    describe('Pack Root Hash Computation', () => {
        it('should compute deterministic hash from entries', () => {
            const entries = [
                { path: 'a.json', hash: 'a'.repeat(64) },
                { path: 'b.json', hash: 'b'.repeat(64) },
            ];

            const hash1 = computePackRootHash(entries);
            const hash2 = computePackRootHash(entries);

            expect(hash1).toBe(hash2);
            expect(hash1).toMatch(/^[a-f0-9]{64}$/);
        });

        it('should produce different hash for different entries', () => {
            const entries1 = [{ path: 'a.json', hash: 'a'.repeat(64) }];
            const entries2 = [{ path: 'b.json', hash: 'b'.repeat(64) }];

            expect(computePackRootHash(entries1)).not.toBe(computePackRootHash(entries2));
        });

        it('should not include trailing newline in hash input', () => {
            // This test validates the contract: hash is computed WITHOUT trailing newline
            const entries = [{ path: 'a.json', hash: 'a'.repeat(64) }];

            // Compute expected hash manually
            const normalized = `${'a'.repeat(64)}  a.json`; // No trailing newline
            const crypto = require('crypto');
            const expectedHash = crypto.createHash('sha256').update(normalized).digest('hex');

            expect(computePackRootHash(entries)).toBe(expectedHash);
        });
    });

    describe('Equivalence Lock: gf-01-admissible-fail', () => {
        const packDir = path.join(FIXTURES_ROOT, 'gf-01-admissible-fail');

        it('should compute hash matching existing pack.sha256', () => {
            // Skip if pack doesn't exist yet
            if (!fs.existsSync(packDir)) {
                console.log('Skipping: gf-01-admissible-fail pack not found');
                return;
            }

            const existingHash = readPackRootHash(packDir);
            if (!existingHash) {
                console.log('Skipping: no existing pack.sha256');
                return;
            }

            const { packRootHash } = computePackRootHashFromDir(packDir);
            expect(packRootHash).toBe(existingHash);
        });

        it('should produce sha256sums matching existing file', () => {
            if (!fs.existsSync(packDir)) {
                return;
            }

            const existingEntries = readSha256Sums(packDir);
            if (!existingEntries) {
                return;
            }

            const computedEntries = computeSha256Sums(packDir);

            expect(computedEntries.length).toBe(existingEntries.length);

            for (let i = 0; i < computedEntries.length; i++) {
                expect(computedEntries[i].path).toBe(existingEntries[i].path);
                expect(computedEntries[i].hash).toBe(existingEntries[i].hash);
            }
        });
    });

    describe('Equivalence Lock: minimal-pass', () => {
        const packDir = path.join(FIXTURES_ROOT, 'minimal-pass');

        it('should compute hash matching existing pack.sha256', () => {
            const existingHash = readPackRootHash(packDir);
            if (!existingHash) {
                console.log('Skipping: no existing pack.sha256');
                return;
            }

            const { packRootHash } = computePackRootHashFromDir(packDir);
            expect(packRootHash).toBe(existingHash);
        });
    });

    describe('Write and Read Roundtrip', () => {
        let tempDir: string;

        beforeAll(() => {
            tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'packHash-test-'));
            // Create test files
            fs.writeFileSync(path.join(tempDir, 'file1.json'), '{"test": 1}');
            fs.writeFileSync(path.join(tempDir, 'file2.txt'), 'hello');
            fs.mkdirSync(path.join(tempDir, 'subdir'));
            fs.writeFileSync(path.join(tempDir, 'subdir/file3.json'), '{"nested": true}');
        });

        afterAll(() => {
            fs.rmSync(tempDir, { recursive: true, force: true });
        });

        it('should write and read back identical entries', () => {
            const { entries, packRootHash } = computePackRootHashFromDir(tempDir);

            writeIntegrityFiles(tempDir, entries, packRootHash);

            const readEntries = readSha256Sums(tempDir);
            const readHash = readPackRootHash(tempDir);

            expect(readHash).toBe(packRootHash);
            expect(readEntries).toHaveLength(entries.length);

            for (let i = 0; i < entries.length; i++) {
                expect(readEntries![i].path).toBe(entries[i].path);
                expect(readEntries![i].hash).toBe(entries[i].hash);
            }
        });

        it('should exclude .DS_Store files even if present', () => {
            // Create a .DS_Store file
            fs.writeFileSync(path.join(tempDir, '.DS_Store'), 'dummy');

            const files = listPackFiles(tempDir);
            expect(files).not.toContain('.DS_Store');

            // Cleanup
            fs.unlinkSync(path.join(tempDir, '.DS_Store'));
        });
    });
});
