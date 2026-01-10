/**
 * Lab Sitemap Configuration
 * 
 * GATE-06 Compliance: Only indexable pages in sitemap.
 * 
 * Included:
 * - Static governance pages (/, /about, /builder, /guarantees)
 * - Policy anchors (/policies/contract, /policies/strength)
 * - Ruleset registry (/rulesets) - NOT individual versions yet
 * 
 * Excluded:
 * - /runs/* (evidence content, noindex)
 * - /rulesets/[version] (defer until version strategy stable)
 */

import { MetadataRoute } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';
const LAST_MODIFIED = new Date('2026-01-10');

export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages = [
        { path: '', priority: 1.0 },           // Home
        { path: '/about', priority: 0.8 },
        { path: '/builder', priority: 0.7 },
        { path: '/guarantees', priority: 0.9 },
        { path: '/policies/contract', priority: 0.85 },
        { path: '/policies/strength', priority: 0.85 },
        { path: '/rulesets', priority: 0.8 },
    ];

    return staticPages.map(({ path, priority }) => ({
        url: `${LAB_CANONICAL_HOST}${path}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority,
    }));
}
