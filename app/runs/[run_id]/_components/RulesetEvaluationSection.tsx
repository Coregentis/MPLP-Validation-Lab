/**
 * Ruleset Evaluation Section (Server Component)
 * 
 * Loads RunBundle and performs dynamic adjudication using the REGISTRY.
 * Returns generic RulesetEvalResult to the panel - NO adapter needed.
 * 
 * Architecture:
 * - Must use registry.adjudicatorFn (plugin entry point)
 * - Applicability logic comes from SSOT (applicability.ts)
 * - UI receives RulesetEvalResult, not ruleset-specific types
 */

import { loadRunBundle } from '@/lib/bundles/load_run_bundle';
import { getRuleset } from '@/lib/rulesets/registry';
import type { RulesetEvalResult } from '@/lib/rulesets/registry';
import { isArbitrationPack } from '@/lib/rulesets/ruleset-1.1/applicability';
import { RulesetEvaluationPanel } from './RulesetEvaluationPanel';

// Force Node.js runtime (required for fs-based loaders)
export const runtime = 'nodejs';

interface RulesetEvaluationSectionProps {
    runId: string;
}

export async function RulesetEvaluationSection({ runId }: RulesetEvaluationSectionProps) {
    try {
        // Load the bundle
        const bundle = loadRunBundle(runId);

        // Determine effective ruleset reference
        // Priority: bundle.manifest.ruleset_ref > arb-* prefix inference
        const rulesetRef = bundle.bundle_manifest?.ruleset_ref;
        const isArb = isArbitrationPack(runId);
        const effectiveRulesetRef = rulesetRef || (isArb ? 'ruleset-1.1' : null);

        if (!effectiveRulesetRef) {
            // No ruleset reference - cannot evaluate
            return (
                <RulesetEvaluationPanel evaluation={null} />
            );
        }

        // Get the ruleset from registry (the ONLY entry point)
        const ruleset = await getRuleset(effectiveRulesetRef);
        if (!ruleset) {
            return (
                <RulesetEvaluationPanel
                    evaluation={null}
                    error={`Ruleset not found: ${effectiveRulesetRef}`}
                />
            );
        }

        // Check if adjudicator is available
        if (!ruleset.adjudicator) {
            return (
                <RulesetEvaluationPanel
                    evaluation={null}
                    error={`Adjudicator not implemented for ${effectiveRulesetRef}`}
                />
            );
        }

        // Perform adjudication through REGISTRY (not direct call)
        // The adjudicator handles applicability detection internally
        // and returns generic RulesetEvalResult - NO ADAPTER NEEDED
        const evaluation: RulesetEvalResult = await ruleset.adjudicator(bundle);

        return <RulesetEvaluationPanel evaluation={evaluation} />;

    } catch (error) {
        return (
            <RulesetEvaluationPanel
                evaluation={null}
                error={error instanceof Error ? error.message : 'Unknown error during evaluation'}
            />
        );
    }
}
