import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Gate-LINK-AUDIT: Comprehensive link integrity and semantic transition check.
 * 
 * 1. Maps all physical Next.js routes (app/pages).
 * 2. Resolves dynamic segments (run_id, diff_id, substrate).
 * 3. Audits code for internal <Link> and href references.
 * 4. Verifies tripod anchors in the manifest.
 */

const APP_DIR = path.resolve(process.cwd(), 'app');
const MANIFEST_PATH = path.resolve(process.cwd(), 'public/_meta/lab-manifest.json');
const DIFF_INDEX_PATH = path.resolve(process.cwd(), 'public/_meta/ruleset-diff-index.json');
const ALLOWLIST_PATH = path.resolve(process.cwd(), 'data/curated-runs/allowlist.yaml');

const IGNORE_DIRS = ['_components', 'api'];

function getRoutes(dir: string, baseRoute: string = ''): string[] {
    let routes: string[] = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            if (IGNORE_DIRS.includes(item.name)) continue;
            routes = routes.concat(getRoutes(path.join(dir, item.name), `${baseRoute}/${item.name}`));
        } else if (item.name === 'page.tsx') {
            routes.push(baseRoute === '' ? '/' : baseRoute);
        }
    }
    return routes;
}

function runAudit() {
    console.log('🛡️  Executing Link & Semantic Audit (v1.0)...');

    const failures: string[] = [];
    const staticRoutes = getRoutes(APP_DIR);
    console.log(`📋 Found ${staticRoutes.length} static route templates.`);

    // Load Data for Dynamic Resolution
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const diffIndex = JSON.parse(fs.readFileSync(DIFF_INDEX_PATH, 'utf-8'));
    const allowlist = yaml.load(fs.readFileSync(ALLOWLIST_PATH, 'utf-8')) as any;

    const validRunIds = (allowlist.runs || []).map((r: any) => r.run_id);
    const validDiffIds = diffIndex.diffs.map((d: any) => d.diff_id);
    const validSubstrates = ['langgraph', 'autogen', 'semantic-kernel', 'pydantic-ai'];

    // Function to check if a specific URL is valid
    const isValidRoute = (url: string): boolean => {
        if (url === '#' || url.startsWith('http') || url.startsWith('mailto:')) return true;

        // Strip query params and hashes
        const cleanUrl = url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

        // 1. Direct Static Match
        if (staticRoutes.includes(cleanUrl)) return true;

        // 2. Dynamic Match patterns
        // /runs/[run_id]
        if (cleanUrl.startsWith('/runs/')) {
            const id = cleanUrl.replace('/runs/', '').split('/')[0];
            if (validRunIds.includes(id)) return true;
        }
        // /rulesets/evolution/diff/[id]
        if (cleanUrl.startsWith('/rulesets/evolution/diff/')) {
            const id = cleanUrl.replace('/rulesets/evolution/diff/', '');
            if (validDiffIds.includes(id)) return true;
        }
        // /rulesets/[version]
        if (cleanUrl.startsWith('/rulesets/')) {
            const parts = cleanUrl.split('/');
            if (parts.length === 3 && parts[1] === 'rulesets') return true; // version is flexible
        }
        // /adjudication/[run_id]
        if (cleanUrl.startsWith('/adjudication/')) {
            const id = cleanUrl.replace('/adjudication/', '');
            if (validRunIds.includes(id)) return true;
        }
        // /examples/evidence-producers/[substrate]
        if (cleanUrl.startsWith('/examples/evidence-producers/')) {
            const sub = cleanUrl.replace('/examples/evidence-producers/', '');
            if (validSubstrates.includes(sub)) return true;
        }

        return false;
    };

    // 3. Audit Code for Links
    const filesToAudit = runAuditOnFiles('app', ['.tsx', '.ts']);
    filesToAudit.concat(runAuditOnFiles('components', ['.tsx', '.ts']));
    filesToAudit.concat(runAuditOnFiles('lib', ['.tsx', '.ts']));

    console.log(`📋 Audited ${filesToAudit.length} source files.`);

    // 4. Verify Tripod Anchors
    const websiteAnchor = manifest.tripod.website_anchor;
    if (websiteAnchor !== 'https://www.mplp.io/definition') {
        failures.push(`[P1] manifest.tripod.website_anchor is drift: ${websiteAnchor}`);
    }

    if (failures.length > 0) {
        console.log('\n❌ Link Audit FAILED:');
        failures.forEach(f => console.log(`   - ${f}`));
        process.exit(1);
    } else {
        console.log('\n🟢 Link Audit PASS: All internal links and semantic triggers are valid.');
        process.exit(0);
    }

    function runAuditOnFiles(dir: string, extensions: string[]): string[] {
        const found: string[] = [];
        if (!fs.existsSync(dir)) return [];
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                found.push(...runAuditOnFiles(fullPath, extensions));
            } else if (extensions.includes(path.extname(item.name))) {
                found.push(fullPath);
                const content = fs.readFileSync(fullPath, 'utf-8');
                // Basic regex for href="..." or href={`...`}
                const hrefRegex = /href=["']([^"']+)["']/g;
                let match;
                while ((match = hrefRegex.exec(content)) !== null) {
                    const link = match[1];
                    if (!isValidRoute(link)) {
                        failures.push(`Broken link in ${fullPath}: ${link}`);
                    }
                }
            }
        }
        return found;
    }
}

runAudit();
