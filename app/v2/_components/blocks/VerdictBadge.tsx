
import React from 'react';

interface VerdictBadgeProps {
    data: string;
    tokens: Record<string, string>;
    policy?: {
        allowedLiterals: string[];
    };
}

export function VerdictBadge({ data, tokens, policy }: VerdictBadgeProps) {
    // Policy Enforcement
    let verdict = data;

    // If missing or not in allowlist, treat as UNKNOWN -> NOT_AVAILABLE
    if (!verdict || (policy?.allowedLiterals && !policy.allowedLiterals.includes(verdict))) {
        verdict = 'NOT_AVAILABLE';
    }

    // Visual mapping
    const styles = {
        'PASS': 'bg-green-100 text-green-800 border-green-200',
        'FAIL': 'bg-red-100 text-red-800 border-red-200',
        'REJECTED': 'bg-gray-100 text-gray-800 border-gray-200',
        'NOT_AVAILABLE': 'bg-gray-50 text-gray-500 border-gray-200 border-dashed italic'
    }[verdict] || 'bg-yellow-100 text-yellow-800 border-yellow-200';

    // Display Text
    const displayText = verdict === 'NOT_AVAILABLE' ? (tokens['LIT_NOT_AVAILABLE']) : verdict;

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles}`}
            data-verdict={verdict}
        >
            {displayText}
        </span>
    );
}
