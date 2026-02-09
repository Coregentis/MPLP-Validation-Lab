
import React from 'react';
import Link from 'next/link';
import { ROLES, JOURNEYS } from '../../_ssot/ux.generated';

interface Role {
    id: string;
    title: string;
    intent: string;
}

interface RoleSelectorProps {
    data?: Role[]; // ssot.roles
    tokens: Record<string, string>;
}

export function RoleSelector({ data, tokens }: RoleSelectorProps) {
    // 1. Validate Data
    const roles = data || ROLES; // Fallback to SSOT if binding fails, but binding is "ssot.roles"

    // 2. Resolve Journey Entrypoints
    function getEntrypoint(roleId: string): string {
        const journey = JOURNEYS.find(j => j.role === roleId);
        if (!journey || journey.steps.length < 2) return '#';
        // Step 0 is usually /start, Step 1 is the first case
        // Logic: Return the route of the second step (index 1) as the target
        return journey.steps[1]?.route || '#';
    }

    if (!roles || roles.length === 0) {
        return <div className="p-4">{tokens['LIT_NOT_APPLICABLE']}</div>;
    }

    return (
        <div className="role-selector">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
                {tokens['LIT_CHOOSE_ROLE']}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((role: Role) => {
                    const href = getEntrypoint(role.id);
                    return (
                        <Link
                            key={role.id}
                            href={href}
                            className="block p-6 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-800 transition-all group"
                        >
                            <h3 className="text-xl font-semibold mb-2 text-cyan-400 group-hover:text-cyan-300">
                                {role.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">
                                {tokens[role.intent]}
                            </p>

                            <div className="flex items-center text-sm font-medium text-cyan-500 group-hover:text-cyan-400">
                                {tokens['LIT_START_JOURNEY']}
                                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                            </div>

                            {/* Optional: Show primary questions as bullets if space allows? Keep simple for now */}
                        </Link>
                    );
                })}
            </div>

            {tokens['DISCL_NOT_CERTIFICATION'] && (
                <p className="mt-8 text-center text-xs text-gray-500">
                    {tokens['DISCL_NOT_CERTIFICATION']}
                </p>
            )}
        </div>
    );
}
