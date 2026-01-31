/**
 * SSOT for all site hosts
 * 
 * CRITICAL: This is the ONLY file that may define host URLs.
 * All other code must import from this file.
 * 
 * Enforced by: GATE-V2-HOST-ALLOW-01
 */

export const HOSTS = {
    /** V2 Lab (this site) */
    LAB: 'https://lab.mplp.io',

    /** MPLP Website */
    WEBSITE: 'https://www.mplp.io',

    /** MPLP Documentation */
    DOCS: 'https://docs.mplp.io',
} as const;

/**
 * Canonical host for this application
 * Used for canonical URLs and sitemap generation
 */
export const CANONICAL_HOST = HOSTS.LAB;

/**
 * Type-safe host keys
 */
export type HostKey = keyof typeof HOSTS;

/**
 * Type-safe host values
 */
export type HostValue = typeof HOSTS[HostKey];
