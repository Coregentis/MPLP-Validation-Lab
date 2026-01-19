/**
 * Gate-11 Reverify Required Tests
 * 
 * Tests the canonical bundle selection logic.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    findBundlesForRelease,
    extractRevision,
    selectCanonicalBundle
} from '../../lib/reverification/selectCanonicalBundle';
import { createTempDir, createMockReverificationBundle } from '../_helpers';

describe('selectCanonicalBundle', () => {
    let tmpDir: { path: string; cleanup: () => void };
    let reverificationDir: string;

    beforeEach(() => {
        tmpDir = createTempDir('gate-11-test-');
        reverificationDir = `${tmpDir.path}/reverification`;
    });

    afterEach(() => {
        tmpDir.cleanup();
    });

    describe('extractRevision', () => {
        it('returns 0 for base bundle (no +revN)', () => {
            expect(extractRevision('v0.7.2')).toBe(0);
            expect(extractRevision('v1.0.0')).toBe(0);
        });

        it('returns N for +revN bundles', () => {
            expect(extractRevision('v0.7.2+rev2')).toBe(2);
            expect(extractRevision('v0.7.2+rev6')).toBe(6);
            expect(extractRevision('v1.0.0+rev10')).toBe(10);
        });
    });

    describe('findBundlesForRelease', () => {
        it('returns empty array when no bundles exist', () => {
            const result = findBundlesForRelease(reverificationDir, 'v0.7.2');
            expect(result).toEqual([]);
        });

        it('finds base bundle only', () => {
            createMockReverificationBundle(reverificationDir, 'v0.7.2', { overall_status: 'REVERIFIED' });

            const result = findBundlesForRelease(reverificationDir, 'v0.7.2');
            expect(result).toEqual(['v0.7.2']);
        });

        it('finds multiple bundles sorted by revision', () => {
            createMockReverificationBundle(reverificationDir, 'v0.7.2', { overall_status: 'INCOMPLETE' });
            createMockReverificationBundle(reverificationDir, 'v0.7.2+rev6', { overall_status: 'REVERIFIED' });
            createMockReverificationBundle(reverificationDir, 'v0.7.2+rev2', { overall_status: 'INCOMPLETE' });

            const result = findBundlesForRelease(reverificationDir, 'v0.7.2');
            expect(result).toEqual(['v0.7.2', 'v0.7.2+rev2', 'v0.7.2+rev6']);
        });

        it('does not include other releases', () => {
            createMockReverificationBundle(reverificationDir, 'v0.7.2', { overall_status: 'REVERIFIED' });
            createMockReverificationBundle(reverificationDir, 'v0.7.3', { overall_status: 'REVERIFIED' });

            const result = findBundlesForRelease(reverificationDir, 'v0.7.2');
            expect(result).toEqual(['v0.7.2']);
        });
    });

    describe('selectCanonicalBundle', () => {
        it('returns null when no bundles exist', () => {
            const result = selectCanonicalBundle(reverificationDir, 'v0.7.2');
            expect(result).toBeNull();
        });

        it('selects base bundle when only base exists', () => {
            createMockReverificationBundle(reverificationDir, 'v0.7.2', { overall_status: 'REVERIFIED' });

            const result = selectCanonicalBundle(reverificationDir, 'v0.7.2');
            expect(result).not.toBeNull();
            expect(result!.bundleName).toBe('v0.7.2');
            expect(result!.revision).toBe(0);
        });

        it('selects highest +revN when multiple exist', () => {
            createMockReverificationBundle(reverificationDir, 'v0.7.2', { overall_status: 'INCOMPLETE' });
            createMockReverificationBundle(reverificationDir, 'v0.7.2+rev2', { overall_status: 'INCOMPLETE' });
            createMockReverificationBundle(reverificationDir, 'v0.7.2+rev6', { overall_status: 'REVERIFIED' });

            const result = selectCanonicalBundle(reverificationDir, 'v0.7.2');
            expect(result).not.toBeNull();
            expect(result!.bundleName).toBe('v0.7.2+rev6');
            expect(result!.revision).toBe(6);
        });

        it('handles non-sequential revisions correctly', () => {
            createMockReverificationBundle(reverificationDir, 'v0.7.2+rev2', { overall_status: 'INCOMPLETE' });
            createMockReverificationBundle(reverificationDir, 'v0.7.2+rev10', { overall_status: 'REVERIFIED' });
            createMockReverificationBundle(reverificationDir, 'v0.7.2+rev5', { overall_status: 'INCOMPLETE' });

            const result = selectCanonicalBundle(reverificationDir, 'v0.7.2');
            expect(result!.bundleName).toBe('v0.7.2+rev10');
        });

        it('returns correct bundlePath', () => {
            createMockReverificationBundle(reverificationDir, 'v0.7.2+rev3', { overall_status: 'REVERIFIED' });

            const result = selectCanonicalBundle(reverificationDir, 'v0.7.2');
            expect(result!.bundlePath).toContain('v0.7.2+rev3');
        });
    });
});
