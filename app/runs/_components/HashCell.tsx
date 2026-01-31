'use client';

import { HashDisplay } from '@/components/ui/hash-display';

export function HashCell({ hash, label }: { hash: string | null | undefined; label: string }) {
    // For legacy compatibility: if hash is null/undefined, don't render anything
    // This prevents "—" from being displayed
    if (!hash) {
        return null;
    }

    return (
        <HashDisplay
            hash={hash}
            mode="preview"
            label={label}
            copyable={true}
        />
    );
}
