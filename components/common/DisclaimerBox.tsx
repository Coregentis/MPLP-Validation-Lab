/**
 * DisclaimerBox Component (Revised)
 * 
 * Centralized governance disclaimers aligned with Boundary IDs.
 * 
 * P2.1 Revision:
 * - Kinds aligned with Boundary IDs (NON-ENDORSEMENT, etc.)
 * - Added 'projection_only' for FMM and Mapping panels
 * - Mandatory wording for 'projection_only' and 'equivalence'
 * - Per-kind default policy links
 */

import React from 'react';
import Link from 'next/link';

export type DisclaimerKind =
    | 'non_endorsement'   // Boundary: NON-ENDORSEMENT
    | 'non_certification' // Boundary: NON-CERTIFICATION
    | 'vendor_neutral'     // Boundary: VENDOR-NEUTRAL
    | 'equivalence'       // For /policies/cross-verified
    | 'projection_only'   // For /policies/fmm & Mapping Projection Panel
    | 'supplement';       // For additional pointers only

export type DisclaimerStyle = 'amber' | 'blue' | 'zinc';

interface DisclaimerBoxProps {
    /** The type of disclaimer to show */
    kind: DisclaimerKind;
    /** Visual style */
    variant?: DisclaimerStyle;
    /** Optional title override */
    title?: string;
    /** Optional policy link override */
    policyHref?: string;
    /** Additional content or pointers (Supplementation ONLY) */
    children?: React.ReactNode;
    /** Whether it should stick to the top (used for page headers) */
    sticky?: boolean;
    /** Full-width display */
    fullWidth?: boolean;
    /** Custom CSS */
    className?: string;
}

const styles: Record<DisclaimerStyle, string> = {
    amber: 'bg-amber-950/30 border-amber-700/50 text-amber-200',
    blue: 'bg-blue-950/30 border-blue-700/50 text-blue-200',
    zinc: 'bg-zinc-900 border-zinc-800 text-zinc-300',
};

const defaultTitles: Record<DisclaimerKind, string> = {
    non_endorsement: 'Non-Endorsement Statement',
    non_certification: 'Non-Certification Boundary',
    vendor_neutral: 'Vendor-Neutral Notice',
    equivalence: 'Equivalence Disclaimer',
    projection_only: 'Projection-Only Disclaimer',
    supplement: 'Supplemental Governance Notice',
};

const defaultLinks: Record<DisclaimerKind, string> = {
    non_endorsement: '/about',
    non_certification: '/about',
    vendor_neutral: '/policies/contract',
    equivalence: '/policies/cross-verified',
    projection_only: '/policies/fmm',
    supplement: '/about',
};

const messages: Record<DisclaimerKind, string | React.ReactNode> = {
    non_endorsement: 'This project represents a reference implementation and does not imply endorsement by any commercial entity or maintainer of the underlying substrate frameworks.',
    non_certification: 'The Validation Lab is an evidence evaluation environment, not a certification program. Verdicts are deterministic outputs of specific rulesets, not official compliance marks.',
    vendor_neutral: 'All evaluation logic and data normalization processes are vendor-neutral and open-source under the MPLP Protocol governance.',
    equivalence: 'Cross-Verification results are based on semantic equivalence mapping. Minor implementation details that do not violate lifecycle invariants are normalized for comparison.',
    projection_only: 'Mappings describe evidence projection only; they do not describe framework capability.',
    supplement: null,
};

export function DisclaimerBox({
    kind,
    variant = 'amber',
    title,
    policyHref,
    children,
    sticky = false,
    fullWidth = false,
    className = '',
}: DisclaimerBoxProps) {
    const styleClass = styles[variant];
    const displayTitle = title || defaultTitles[kind];
    const message = messages[kind];
    const href = policyHref || defaultLinks[kind];

    return (
        <div className={`
            ${styleClass} 
            border rounded-lg p-4 
            ${sticky ? 'sticky top-[60px] z-40' : ''} 
            ${fullWidth ? 'w-full' : ''} 
            ${className}
        `}>
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                        {displayTitle}
                    </h3>
                    <Link href={href} className="text-[10px] underline opacity-60 hover:opacity-100 transition-opacity uppercase tracking-wider">
                        Learn More →
                    </Link>
                </div>
                <div className="text-sm leading-relaxed opacity-80 mt-1">
                    {message && <p className="font-medium">{message}</p>}
                    {children && <div className={message ? 'mt-3 pt-3 border-t border-current/10' : ''}>{children}</div>}
                </div>
            </div>
        </div>
    );
}
