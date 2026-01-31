import React from 'react';
import Link from 'next/link';
import { MappingResolver, AnchorKey } from '@/lib/ssot/mapping-resolver';

interface SmartLinkProps {
    anchor: AnchorKey;
    id?: string;
    children: React.ReactNode;
    className?: string;
    showExternalIcon?: boolean;
}

/**
 * SmartLink: Navigation component bound to manifest anchors.
 * 
 * Ensures that all links are derived from the versioned Publication Contract.
 */
export const SmartLink: React.FC<SmartLinkProps> = ({
    anchor,
    id,
    children,
    className,
    showExternalIcon = false
}) => {
    const href = MappingResolver.resolve(anchor, id);
    const isExternal = href.startsWith('http');

    if (isExternal) {
        return (
            <a
                href={href}
                className={className}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
                {showExternalIcon && <span className="ml-1 opacity-60 text-[0.8em]">↗</span>}
            </a>
        );
    }

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
};
