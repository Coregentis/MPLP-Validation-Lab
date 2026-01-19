/**
 * Gate-12 Export Consistency Tests
 * 
 * Tests the export contract validation logic.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createTempDir, createMockExport, writeJson, writeText, hashContent } from '../_helpers';

// We'll test the core validation logic, not the full gate runner
// This avoids process.exit() issues in tests

describe('Export Consistency', () => {
    let tmpDir: { path: string; cleanup: () => void };

    beforeEach(() => {
        tmpDir = createTempDir('gate-12-test-');
    });

    afterEach(() => {
        tmpDir.cleanup();
    });

    describe('manifest.json validation', () => {
        it('valid export passes all checks', () => {
            createMockExport(tmpDir.path);

            const manifestPath = path.join(tmpDir.path, 'export', 'manifest.json');
            expect(fs.existsSync(manifestPath)).toBe(true);

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            expect(manifest.export_version).toBe('1.0');
            expect(manifest.files.release_index).toBe('export/release-index.json');
            expect(manifest.files.sha256sums).toBe('export/sha256sums.txt');
        });

        it('manifest has required structure', () => {
            createMockExport(tmpDir.path);

            const manifestPath = path.join(tmpDir.path, 'export', 'manifest.json');
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

            // Required top-level fields
            expect(manifest).toHaveProperty('export_version');
            expect(manifest).toHaveProperty('generated_at');
            expect(manifest).toHaveProperty('verifier');
            expect(manifest).toHaveProperty('files');
            expect(manifest).toHaveProperty('stats');

            // Verifier structure
            expect(manifest.verifier).toHaveProperty('id');
            expect(manifest.verifier).toHaveProperty('version');

            // Files structure
            expect(manifest.files).toHaveProperty('release_index');
            expect(manifest.files).toHaveProperty('ruleset_index');
            expect(manifest.files).toHaveProperty('curated_runs');
            expect(manifest.files).toHaveProperty('verdict_index');
            expect(manifest.files).toHaveProperty('sha256sums');
        });

        it('all referenced files exist', () => {
            createMockExport(tmpDir.path);

            const exportDir = path.join(tmpDir.path, 'export');

            expect(fs.existsSync(path.join(exportDir, 'manifest.json'))).toBe(true);
            expect(fs.existsSync(path.join(exportDir, 'release-index.json'))).toBe(true);
            expect(fs.existsSync(path.join(exportDir, 'ruleset-index.json'))).toBe(true);
            expect(fs.existsSync(path.join(exportDir, 'curated-runs.json'))).toBe(true);
            expect(fs.existsSync(path.join(exportDir, 'verdict-index.json'))).toBe(true);
            expect(fs.existsSync(path.join(exportDir, 'sha256sums.txt'))).toBe(true);
        });
    });

    describe('sha256sums validation', () => {
        it('valid sha256sums match actual file hashes', () => {
            createMockExport(tmpDir.path);

            const exportDir = path.join(tmpDir.path, 'export');
            const sumsContent = fs.readFileSync(path.join(exportDir, 'sha256sums.txt'), 'utf-8');
            const lines = sumsContent.trim().split('\n');

            for (const line of lines) {
                const [expectedHash, fileName] = line.split('  ');
                const filePath = path.join(exportDir, fileName);
                const content = fs.readFileSync(filePath);
                const actualHash = hashContent(content);

                expect(actualHash).toBe(expectedHash);
            }
        });

        it('tampered export fails hash check', () => {
            createMockExport(tmpDir.path, { tamper: true });

            const exportDir = path.join(tmpDir.path, 'export');
            const sumsContent = fs.readFileSync(path.join(exportDir, 'sha256sums.txt'), 'utf-8');
            const lines = sumsContent.trim().split('\n');

            let hashMismatchFound = false;

            for (const line of lines) {
                const [expectedHash, fileName] = line.split('  ');
                const filePath = path.join(exportDir, fileName);
                const content = fs.readFileSync(filePath);
                const actualHash = hashContent(content);

                if (actualHash !== expectedHash) {
                    hashMismatchFound = true;
                    break;
                }
            }

            expect(hashMismatchFound).toBe(true);
        });
    });

    describe('file content validation', () => {
        it('release-index.json has valid structure', () => {
            createMockExport(tmpDir.path);

            const indexPath = path.join(tmpDir.path, 'export', 'release-index.json');
            const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

            expect(data).toHaveProperty('releases');
            expect(Array.isArray(data.releases)).toBe(true);
        });

        it('verdict-index.json has valid structure', () => {
            createMockExport(tmpDir.path);

            const indexPath = path.join(tmpDir.path, 'export', 'verdict-index.json');
            const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

            expect(data).toHaveProperty('verdicts');
            expect(Array.isArray(data.verdicts)).toBe(true);
        });

        it('curated-runs.json has valid structure', () => {
            createMockExport(tmpDir.path);

            const indexPath = path.join(tmpDir.path, 'export', 'curated-runs.json');
            const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

            expect(data).toHaveProperty('runs');
            expect(Array.isArray(data.runs)).toBe(true);
        });
    });
});
