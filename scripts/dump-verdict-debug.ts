/**
 * Debug script: Dump verdict hash computation details
 * Usage: npx tsx scripts/dump-verdict-debug.ts <pack_path> <output_dir>
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { ingest } from '../lib/engine/ingest';
import { verify } from '../lib/engine/verify';
import { evaluate } from '../lib/evaluate/evaluate';
import { canonicalizeForVerdictHash, stableStringify } from '../lib/verdict/canonicalize';

async function main() {
    const packPath = process.argv[2];
    const outputDir = process.argv[3] || '/tmp/lab';

    if (!packPath) {
        console.error('Usage: npx tsx scripts/dump-verdict-debug.ts <pack_path> [output_dir]');
        process.exit(1);
    }

    console.log(`Pack: ${packPath}`);
    console.log(`Output: ${outputDir}\n`);

    // Ingest + Verify + Evaluate
    const pack = await ingest(packPath);
    const verifyReport = await verify(pack);

    if (verifyReport.admission_status !== 'ADMISSIBLE') {
        console.error('❌ Pack not admissible');
        process.exit(1);
    }

    const evalReport = await evaluate(pack, verifyReport, {
        ruleset_version: 'ruleset-1.0',
    });

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // 1. Dump full evaluation report
    await fs.writeFile(
        path.join(outputDir, 'evaluation.report.json'),
        JSON.stringify(evalReport, null, 2),
        'utf-8'
    );

    // 2. Dump canonicalized verdict input
    const canonical = canonicalizeForVerdictHash(evalReport);
    const verdictInput = stableStringify(canonical);

    await fs.writeFile(
        path.join(outputDir, 'verdict_hash_input.json'),
        verdictInput,
        'utf-8'
    );

    // 3. Dump verdict hash
    await fs.writeFile(
        path.join(outputDir, 'verdict_hash.txt'),
        evalReport.verdict_hash,
        'utf-8'
    );

    console.log(`✅ Dumped to ${outputDir}/`);
    console.log(`  - evaluation.report.json (${JSON.stringify(evalReport).length} bytes)`);
    console.log(`  - verdict_hash_input.json (${verdictInput.length} bytes)`);
    console.log(`  - verdict_hash.txt`);
    console.log(`\nVerdict Hash: ${evalReport.verdict_hash}`);
}

main().catch(console.error);
