import fs from 'fs';
import path from 'path';

/**
 * Gate-DISCOVERY-SEAL: Mechanical verification of v1.0 discovery infrastructure.
 * Hardened Version: No absolute paths, unified logic, canonicalized URL comparison.
 */

// Resolve paths relative to the project root
const ROOT_DIR = path.resolve(__dirname, '../../../');
const WEBSITE_MANIFEST_PATH = path.join(ROOT_DIR, 'MPLP_website/public/website-seo-manifest.json');
const DOCS_MANIFEST_PATH = path.join(ROOT_DIR, 'docs/static/meta/docs-seo-manifest.json');

/**
 * Robustly determines if a page is intended for indexing.
 */
function isIndexable(robots: any): boolean {
    if (!robots) return false;
    // Handle string or array-like formats
    const robotsStr = (Array.isArray(robots) ? robots.join(',') : String(robots)).toLowerCase();
    const directives = robotsStr.split(',').map(d => d.trim());

    const hasIndex = directives.includes('index');
    const hasNoIndex = directives.includes('noindex');

    return hasIndex && !hasNoIndex;
}

/**
 * Canonicalizes a URL for comparison (removes trailing slash, ensures lowercase protocol).
 */
function canonicalizeUrl(url: string | null): string {
    if (!url) return '';
    try {
        const u = new URL(url);
        let cleaned = `${u.protocol}//${u.host}${u.pathname}`;
        if (cleaned.endsWith('/') && cleaned.length > (u.protocol.length + 3 + u.host.length + 1)) {
            cleaned = cleaned.slice(0, -1);
        }
        return cleaned.toLowerCase();
    } catch (e) {
        return url.toLowerCase().replace(/\/$/, '');
    }
}

async function executeGate() {
    console.log('🔍 Executing Hardened Discovery Seal Gate (v1.0)...');
    console.log(`   - Root: ${ROOT_DIR}`);

    if (!fs.existsSync(WEBSITE_MANIFEST_PATH) || !fs.existsSync(DOCS_MANIFEST_PATH)) {
        console.error('❌ Error: SEO manifests missing.');
        console.error(`     Checked: ${WEBSITE_MANIFEST_PATH}`);
        console.error(`     Checked: ${DOCS_MANIFEST_PATH}`);
        process.exit(1);
    }

    const websiteManifest = JSON.parse(fs.readFileSync(WEBSITE_MANIFEST_PATH, 'utf-8'));
    const docsManifest = JSON.parse(fs.readFileSync(DOCS_MANIFEST_PATH, 'utf-8'));

    const failures: string[] = [];

    // 1. Website Canonical & Disclaimer Audit
    websiteManifest.pages.forEach((page: any) => {
        if (isIndexable(page.robots)) {
            if (!page.canonical) {
                failures.push(`[P0] Website: Page ${page.path} is indexable but has null canonical.`);
            }
        }
        if (page.requires_disclaimer && !page.disclaimer_present) {
            failures.push(`[P0] Website: Page ${page.path} requires disclaimer but present=false.`);
        }
    });

    // 2. Summary Sync Audit
    const summary = websiteManifest.summary.disclaimer_coverage;
    if (summary.present !== summary.required) {
        failures.push(`[P0] Website: Disclaimer summary mismatch. Required:${summary.required}, Present:${summary.present}`);
    }

    // 3. Protocol Version Audit
    if (websiteManifest.protocol_version !== '1.0.0' || docsManifest.protocol_version !== '1.0.0') {
        failures.push(`[P0] Version: Protocol version is not 1.0.0.`);
    }

    // 4. Tripod Alignment Audit
    const expectedAnchor = canonicalizeUrl('https://www.mplp.io/definition');
    const actualAnchor = canonicalizeUrl(docsManifest.tripod.website_anchor);
    if (actualAnchor !== expectedAnchor) {
        failures.push(`[P1] Tripod: Docs website_anchor (${docsManifest.tripod.website_anchor}) does not align with canonical ${expectedAnchor}.`);
    }

    // Report Results
    if (failures.length > 0) {
        console.log('\n❌ Discovery Seal Gate FAILED:');
        failures.forEach(f => console.log(`   - ${f}`));
        process.exit(1);
    } else {
        const indexableCount = websiteManifest.pages.filter((p: any) => isIndexable(p.robots)).length;
        console.log('\n🟢 Discovery Seal Gate PASS: All v1.0 discovery requirements met (Environment Agnostic).');
        console.log(`   - Website Indexable Pages: ${indexableCount}`);
        console.log(`   - Disclaimer Coverage: 100% (${summary.present}/${summary.required})`);
        console.log(`   - Tripod Anchor (Verified): ${docsManifest.tripod.website_anchor}`);
        process.exit(0);
    }
}

executeGate();
