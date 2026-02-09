import type { MetadataRoute } from "next";
import { loadAllRuns } from '@/lib/unified/load-all-runs';
import { loadAllRunsets } from '@/lib/unified/load-all-runsets';
import { listRegisteredRulesets } from '@/lib/rulesets/registry';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = "https://lab.mplp.io";
    const now = new Date().toISOString();

    // 1. Static Hubs (Level 0/1)
    const staticRoutes = [
        "",
        "/about",
        "/methodology",
        "/validation",
        "/runs",
        "/adjudication",
        "/rulesets",
        "/rulesets/evolution",
        "/guarantees",
        "/coverage",
        "/coverage/adjudication",
        "/policies/contract",
        "/policies/intake",
        "/policies/substrate-scope",
        "/policies/fmm",
        "/policies/cross-verified",
        "/releases",
        "/governance",
    ].map(route => ({
        url: `${base}${route}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: route === "" ? 1.0 : 0.8,
    }));

    // 2. Dynamic Rulesets (Stable/Latest)
    // Source: Ruleset Registry
    const rulesets = await listRegisteredRulesets();
    const rulesetRoutes = rulesets.map(r => ({
        url: `${base}/rulesets/${r.id}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    // 3. Dynamic Runsets (Collections)
    // Source: Unified Runset Loader
    const runsets = loadAllRunsets();
    const runsetRoutes = runsets.map(rs => ({
        url: `${base}${rs.href}`, // href includes /runsets prefix
        lastModified: rs.generated_at,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 4. Dynamic Runs (High Value Only)
    // Source: Unified Runs Loader -> Filter: Reproduced/Dispute Ready -> Cap: 50
    const allRuns = loadAllRuns();
    // Filter for Tier = REPRODUCED or DISPUTE_READY
    // This purposefully excludes SIMULATED (V1) and DECLARED runs to avoid SEO bloat
    const highValueRuns = allRuns.runs
        .filter(r => ['REPRODUCED', 'DISPUTE_READY'].includes(r.tier))
        .slice(0, 50);

    const runRoutes = highValueRuns.map(r => ({
        url: `${base}/runs/${r.id}`,
        lastModified: now, // Todo: use verification timestamp if available
        changeFrequency: 'never' as const, // Sealed evidence
        priority: 0.5,
    }));

    // 5. Sealed Releases
    // Source: governance/releases/release-index.yaml (Active + Archived)
    let releaseRoutes: MetadataRoute.Sitemap = [];
    try {
        const releaseIndexPath = path.join(process.cwd(), 'governance/releases/release-index.yaml');
        if (fs.existsSync(releaseIndexPath)) {
            const fileContents = fs.readFileSync(releaseIndexPath, 'utf8');
            const data = yaml.parse(fileContents);

            const active = data.active || [];
            const archived = data.archived || [];
            const allSeals = [...active, ...archived];

            releaseRoutes = allSeals.map((rel: { id: string, frozen_at?: string }) => ({
                url: `${base}/releases/${rel.id}`,
                lastModified: rel.frozen_at || now,
                changeFrequency: 'never' as const,
                priority: 0.6,
            }));
        }
    } catch (e) {
        console.error("Failed to load release index for sitemap:", e);
    }

    return [
        ...staticRoutes,
        ...runsetRoutes,
        ...rulesetRoutes,
        ...runRoutes,
        ...releaseRoutes,
    ];
}

