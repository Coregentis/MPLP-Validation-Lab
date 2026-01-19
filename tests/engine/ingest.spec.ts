/**
 * Engine Ingest Tests
 * 
 * Tests the pack ingestion functionality.
 */

import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { ingest } from '../../lib/engine/ingest';

const FIXTURES = resolve(__dirname, '../../fixtures/packs');

describe('engine/ingest', () => {
    describe('minimal-pass pack', () => {
        it('ingests successfully', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            expect(pack).toBeTruthy();
        });

        it('has non-empty file inventory', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            expect(Array.isArray(pack.file_inventory)).toBe(true);
            expect(pack.file_inventory.length).toBeGreaterThan(0);
        });

        it('has absolute root path', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            expect(pack.root_path).toBeTruthy();
            expect(pack.root_path.startsWith('/')).toBe(true);
        });

        it('calculates total size', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            expect(pack.total_size_bytes).toBeGreaterThan(0);
        });

        it('detects layout version', async () => {
            const pack = await ingest(resolve(FIXTURES, 'minimal-pass'));
            // Should be '1.0' or 'unknown' - either is valid
            expect(['1.0', 'unknown']).toContain(pack.layout_version);
        });
    });

    describe('broken-admission pack', () => {
        it('ingests successfully (ingest does not validate)', async () => {
            // Ingest should succeed even for broken packs
            // (Validation happens in verify step)
            const pack = await ingest(resolve(FIXTURES, 'broken-admission'));
            expect(pack).toBeTruthy();
            expect(Array.isArray(pack.file_inventory)).toBe(true);
        });
    });

    describe('error handling', () => {
        it('throws for non-existent path', async () => {
            await expect(ingest('/non/existent/path'))
                .rejects.toThrow('Pack path does not exist');
        });
    });
});
