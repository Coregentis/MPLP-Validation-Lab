import React from 'react';
import { MappingResolver, GovernanceTermKey } from '@/lib/ssot/mapping-resolver';

interface BoundTextProps {
    term: GovernanceTermKey;
    showVersion?: boolean;
    className?: string;
}

/**
 * BoundText: Renders a governance term strictly from the lab-manifest.json.
 */
export const BoundText: React.FC<BoundTextProps> = ({ term, showVersion = false, className }) => {
    const text = MappingResolver.getTerm(term);
    const version = MappingResolver.getTermVersion(term);

    return (
        <span className={className}>
            {text}
            {showVersion && (
                <span className="ml-2 text-[8px] font-mono opacity-40">[{version}]</span>
            )}
        </span>
    );
};
