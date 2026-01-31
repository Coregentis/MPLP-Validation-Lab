
/**
 * SSOT-Driven Navigation Adapter
 * Derived from ux.generated.ts to ensure compliance with Court IA.
 */
import { JOURNEYS, SHELVES } from './ux.generated';
import { HOSTS } from '../_registry/hosts';

import { TOKENS } from './ux.generated';

export const NAV_ITEMS: { label: string; href: string; special?: boolean }[] = [
    { label: TOKENS['LIT_NAV_DOCKET'], href: '/' },
    { label: TOKENS['LIT_NAV_START'], href: '/start' },
    { label: TOKENS['LIT_NAV_CASES'], href: '/cases' },
    { label: TOKENS['LIT_NAV_LAWS'], href: '/laws' },
    { label: TOKENS['LIT_NAV_COMPLIANCE'], href: '/policies/reg-mapping' }
];

export const FOOTER_LINKS = [
    { label: 'Regulatory Mapping', href: '/policies/reg-mapping' },
    { label: 'Disclaimer', href: `${HOSTS.DOCS}/governance/disclaimer`, external: true }
];
