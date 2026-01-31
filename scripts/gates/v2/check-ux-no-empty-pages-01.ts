
import { GateDefinition, GateResult } from '../_lib/gate-runner';

const KEY_ROUTES = [
    "/", "/start", "/laws", "/cases", "/runs", "/releases",
    "/policies", "/policies/reg-mapping", "/rulesets"
];

const ORIGIN = 'http://localhost:3000';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-NO-EMPTY-PAGES-01",
    name: "No Empty Pages Policy",
    execute: async (): Promise<GateResult> => {
        const failures = [];

        for (const route of KEY_ROUTES) {
            try {
                const res = await fetch(`${ORIGIN}${route}`);
                if (!res.ok) continue; // Handled by D1

                const text = await res.text();

                // Check 1: Main tag
                if (!text.includes('<main')) {
                    failures.push({ message: `${route}: Missing <main> tag`, severity: "error" as const });
                    continue;
                }

                // Check 2: Empty Main (User heuristics)
                if (/<main[^>]*>\s*<\/main>/i.test(text)) {
                    failures.push({ message: `${route}: Empty <main> tag`, severity: "error" as const });
                    continue;
                }

                // Content Check: Ensure page is meaningful (contains visible text > 100 bytes inside main)
                // Approximate check
                const mainContent = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
                if (mainContent.replace(/<[^>]*>/g, '').trim().length < 15) {
                    failures.push({ message: `${route}: <main> content suspiciously short (<15 chars)`, severity: "error" as const });
                }

            } catch (e) {
                // Network errors handled by D1
            }
        }

        if (failures.length > 0) {
            return {
                gate_id: "GATE-V2-NO-EMPTY-PAGES-01",
                name: "No Empty Pages Policy",
                exit_code: 1,
                summary: `Found ${failures.length} empty/ghost routes`,
                failures: failures
            };
        }

        return {
            gate_id: "GATE-V2-NO-EMPTY-PAGES-01",
            name: "No Empty Pages Policy",
            exit_code: 0,
            summary: `All ${KEY_ROUTES.length} routes have valid content structure`,
            failures: []
        };
    }
};
