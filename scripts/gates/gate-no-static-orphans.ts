import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-21: No Static Orphan Pages
 * 
 * Ensures all static (non-dynamic) pages are discoverable from
 * Navbar or Footer entry points.
 * 
 * Dynamic routes (containing [...]) are excluded from orphan checks
 * as they are discovered through their parent index pages.
 * 
 * Requires: reports/navigation/nav-depth-report.json
 * Run: npx tsx scripts/audit/nav-depth-audit.ts first
 */

const PROJECT_ROOT = process.cwd();
const REPORT_PATH = path.join(PROJECT_ROOT, 'reports/navigation/nav-depth-report.json');

interface DepthEntry {
    path: string;
    min_depth: number | null;
    class: 'L1' | 'L2' | 'L3' | 'orphan';
    path_example: string[];
    entry_type: string;
}

interface DepthReport {
    generated_at: string;
    summary: {
        total: number;
        L1: number;
        L2: number;
        L3: number;
        orphan: number;
    };
    pages: DepthEntry[];
}

function isDynamicRoute(pagePath: string): boolean {
    return pagePath.includes('[');
}

async function runGate21() {
    console.log('🛡️  Running VLAB-GATE-21: No Static Orphan Pages...');

    // Check if report exists
    if (!fs.existsSync(REPORT_PATH)) {
        console.error('\n❌ Gate ERROR: nav-depth-report.json not found');
        console.error('   Run: npx tsx scripts/audit/nav-depth-audit.ts first');
        process.exit(1);
    }

    const report: DepthReport = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));

    // Find static orphans (orphan pages without dynamic route segments)
    const orphanPages = report.pages.filter(p => p.class === 'orphan');
    const staticOrphans = orphanPages.filter(p => !isDynamicRoute(p.path));
    const dynamicOrphans = orphanPages.filter(p => isDynamicRoute(p.path));

    console.log(`\n📊 Report from: ${report.generated_at}`);
    console.log(`📋 Total pages: ${report.summary.total}`);
    console.log(`📋 Total orphans: ${orphanPages.length}`);
    console.log(`   - Static orphans: ${staticOrphans.length}`);
    console.log(`   - Dynamic orphans: ${dynamicOrphans.length} (expected, excluded)`);

    if (staticOrphans.length > 0) {
        console.error(`\n❌ Gate FAIL: ${staticOrphans.length} static orphan page(s) found:`);
        for (const p of staticOrphans) {
            console.error(`   - ${p.path}`);
        }
        console.error('\n💡 Fix: Add these pages to Footer or create index entry');
        process.exit(1);
    }

    console.log('\n🟢 Gate PASS: No static orphan pages.');

    if (dynamicOrphans.length > 0) {
        console.log(`\n📝 Note: ${dynamicOrphans.length} dynamic route(s) correctly excluded:`);
        for (const p of dynamicOrphans) {
            console.log(`   - ${p.path}`);
        }
    }
}

runGate21();
