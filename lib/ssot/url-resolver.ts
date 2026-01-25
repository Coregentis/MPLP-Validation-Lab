/**
 * url-resolver.ts
 * 
 * Unified utility to resolve evidence references and internal links.
 * Binds all UI navigation to lab-manifest.json anchors.
 */

import manifest from '../../public/_meta/lab-manifest.json';

export function resolveEvidenceRef(ref: string): string {
    if (!ref) return '#';

    // 1. Resolve run_id
    // Logic: If it looks like a run_id (e.g., v05-d1-...), link to /runs/<run_id>
    if (ref.startsWith('v05-') || ref.startsWith('gf-')) {
        return `${manifest.anchors.runs}/${ref}`;
    }

    // 2. Resolve diff_ref (diffs/...)
    if (ref.startsWith('diffs/')) {
        return `/${manifest.anchors.ruleset_diffs_root}${ref}`;
    }

    // 3. Fallback: return as is or hash
    return ref.startsWith('/') ? ref : `/${ref}`;
}

export function getEvolutionHubPath(): string {
    return manifest.anchors.ruleset_evolution_hub;
}

export function getRulesetDiffPath(id: string): string {
    return `${manifest.anchors.ruleset_evolution_hub}/diff/${id}`;
}

export function getShadowInputPath(): string {
    return `/${manifest.anchors.shadow_input}`;
}
