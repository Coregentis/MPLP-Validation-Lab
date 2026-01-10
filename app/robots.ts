/**
 * Lab Robots.txt Configuration
 * 
 * GATE-06 Compliance: Explicit crawl policy for Validation Lab.
 * 
 * Index Surface:
 * - Allow: Static pages (/, /about, /builder, /guarantees, /policies/*, /rulesets)
 * - Disallow: /runs/* (evidence pages, privacy-sensitive)
 * - Disallow: /api/* (internal endpoints)
 */

import { MetadataRoute } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/about',
                    '/builder',
                    '/guarantees',
                    '/policies/',
                    '/rulesets',
                ],
                disallow: [
                    '/runs/',
                    '/api/',
                ],
            },
        ],
        sitemap: `${LAB_CANONICAL_HOST}/sitemap.xml`,
    };
}
