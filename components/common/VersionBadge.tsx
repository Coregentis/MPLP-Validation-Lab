/**
 * VersionBadge Component
 * 
 * Unified version display across the Lab.
 * Always reads from SSOT, always displays "Sealed" (never "Frozen").
 * 
 * P2-1: Prevents version drift and terminology inconsistency
 */

import { getLabSeries, getProtocolVersion, getSchemaBundleVersion } from '@/lib/ssot/load-lab-manifest';

export type VersionVariant = 'lab' | 'protocol' | 'schema';

interface VersionBadgeProps {
    /** Which version to display */
    variant?: VersionVariant;
    /** Additional CSS classes */
    className?: string;
    /** Show the "Sealed" suffix */
    showSealed?: boolean;
}

const variantStyles: Record<VersionVariant, string> = {
    lab: 'bg-mplp-blue-soft/10 text-mplp-blue-soft border-mplp-blue-soft/20',
    protocol: 'bg-mplp-emerald/10 text-mplp-emerald border-mplp-emerald/20',
    schema: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const variantLabels: Record<VersionVariant, string> = {
    lab: 'Lab',
    protocol: 'Protocol',
    schema: 'Schema',
};

export function VersionBadge({
    variant = 'lab',
    className = '',
    showSealed = true
}: VersionBadgeProps) {
    // Get version from SSOT
    const version = (() => {
        switch (variant) {
            case 'lab': return getLabSeries();
            case 'protocol': return `v${getProtocolVersion()}`;
            case 'schema': return `v${getSchemaBundleVersion()}`;
        }
    })();

    const suffix = showSealed ? ' Sealed' : '';
    const style = variantStyles[variant];

    return (
        <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${style} ${className}`}
            title={`${variantLabels[variant]} version: ${version}`}
        >
            {version}{suffix}
        </span>
    );
}

/**
 * Inline version text (no badge styling)
 * For use in sentences or footers
 */
export function VersionText({
    variant = 'lab',
    showSealed = true,
    className = ''
}: VersionBadgeProps) {
    const version = (() => {
        switch (variant) {
            case 'lab': return getLabSeries();
            case 'protocol': return getProtocolVersion();
            case 'schema': return getSchemaBundleVersion();
        }
    })();

    const suffix = showSealed ? ' Sealed' : '';

    return (
        <span className={className}>
            {version}{suffix}
        </span>
    );
}
