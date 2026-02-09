
import fs from 'fs';
import path from 'path';

const SITEMAP_PATH = path.join(process.cwd(), '.next/server/app/sitemap.xml.body');
const EXPECTED_HOST = 'https://lab.mplp.io';

async function checkCanonicalHost() {
    if (!fs.existsSync(SITEMAP_PATH)) {
        console.error(`❌ Sitemap not found at ${SITEMAP_PATH}. Run 'npm run build' first.`);
        process.exit(1);
    }

    const content = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    const errors: string[] = [];
    let count = 0;

    while ((match = locRegex.exec(content)) !== null) {
        const url = match[1];
        count++;
        if (!url.startsWith(EXPECTED_HOST)) {
            errors.push(url);
        }
    }

    if (errors.length > 0) {
        console.error(`❌ Found ${errors.length} URLs with non-canonical host (expected ${EXPECTED_HOST}):`);
        errors.slice(0, 10).forEach(u => console.error(`   - ${u}`));
        if (errors.length > 10) console.error(`   ...and ${errors.length - 10} more.`);
        process.exit(1);
    }

    console.log(`✅ GATE-SITEMAP-CANONICAL-HOST-01 PASS: Checked ${count} URLs. All use ${EXPECTED_HOST}.`);
}

checkCanonicalHost();
