import manifest from '../../public/_meta/lab-manifest.json';

/**
 * MappingResolver: The SSOT Navigation Authority.
 * 
 * Enjoins all UI navigation to the lab-manifest.json Publication Contract.
 */

export type AnchorKey = keyof typeof manifest.anchors | keyof typeof manifest.tripod;
export type GovernanceTermKey = keyof typeof manifest.governance_terms;

export class MappingResolver {
    /**
     * Resolves an anchor key to a functional URL.
     * Enforces Internal (relative) vs Cross-Surface (absolute) rules.
     */
    static resolve(key: AnchorKey, id?: string): string {
        // 1. Check Tripod (Cross-Surface)
        if (key in manifest.tripod) {
            const url = (manifest.tripod as any)[key];
            return url;
        }

        // 2. Check Anchors (Internal)
        if (key in manifest.anchors) {
            let path = (manifest.anchors as any)[key];
            if (typeof path !== 'string') return '#';

            // Handle dynamic segments if ID provided
            if (id) {
                path = `${path}/${id}`;
            }

            // Enforce relative for internal
            return path.startsWith('/') ? path : `/${path}`;
        }

        return '#';
    }

    /**
     * Resolves a governance term from the SSOT.
     */
    static getTerm(key: GovernanceTermKey): string {
        const term = (manifest.governance_terms as any)[key];
        return term ? term.text : `[TERM_MISSING: ${key}]`;
    }

    /**
     * Resolves a version for a governance term.
     */
    static getTermVersion(key: GovernanceTermKey): string {
        const term = (manifest.governance_terms as any)[key];
        return term ? term.v : 'v0.0.0';
    }
}
