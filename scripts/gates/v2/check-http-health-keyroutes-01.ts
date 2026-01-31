
import { GateDefinition, GateResult } from '../_lib/gate-runner';

const KEY_ROUTES = [
    "/", "/start", "/laws", "/cases", "/runs", "/releases",
    "/policies", "/policies/reg-mapping", "/rulesets"
];

const ORIGIN = 'http://localhost:3000'; // Default to localhost

export const gate: GateDefinition = {
    gate_id: "GATE-V2-HTTP-HEALTH-KEYROUTES-01",
    name: "HTTP Health Check for Key Routes",
    execute: async (): Promise<GateResult> => {
        const failures = [];

        for (const route of KEY_ROUTES) {
            try {
                const res = await fetch(`${ORIGIN}${route}`);
                if (!res.ok) {
                    failures.push({ message: `Route ${route} returned ${res.status}`, severity: "error" as const });
                    continue;
                }

                // Content Check (Simple 500 detection avoiding CSS)
                const text = await res.text();
                // Avoid "text-gray-500" false positive by looking for typical Next.js error digest or explicit text
                if (text.includes("Internal Server Error") || text.includes("Application error: a client-side exception has occurred")) {
                    failures.push({ message: `Route ${route} contains error text (Internal Server Error)`, severity: "error" as const });
                }
            } catch (e) {
                failures.push({ message: `Route ${route} fetch failed: ${(e as Error).message}`, severity: "error" as const });
            }
        }

        if (failures.length > 0) {
            return {
                gate_id: "GATE-V2-HTTP-HEALTH-KEYROUTES-01",
                name: "HTTP Health Check for Key Routes",
                exit_code: 1,
                summary: `Found ${failures.length} unhealthy routes`,
                failures: failures
            };
        }

        return {
            gate_id: "GATE-V2-HTTP-HEALTH-KEYROUTES-01",
            name: "HTTP Health Check for Key Routes",
            exit_code: 0,
            summary: `All ${KEY_ROUTES.length} key routes returned 200 OK`,
            failures: []
        };
    }
};
