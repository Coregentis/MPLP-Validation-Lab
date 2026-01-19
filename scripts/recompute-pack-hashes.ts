/**
 * Recompute Pack Root Hash Script
 * 
 * I/O wrapper for pack hash computation.
 * All hash logic is imported from lib/engine/packHash.ts (SSOT).
 * 
 * Usage: 
 *   npm run vlab:recompute-pack-hashes <pack_path>           # Dry run (print only)
 *   npm run vlab:recompute-pack-hashes <pack_path> --write   # Write files
 * 
 * GOVERNANCE: This script does NOT implement hash logic.
 * It only handles I/O and delegates to packHash.ts SSOT.
 */

import * as path from 'path';
import {
    computePackRootHashFromDir,
    writeIntegrityFiles,
    readPackRootHash,
} from '../lib/engine/packHash';

function main(): void {
    const args = process.argv.slice(2);
    const packPath = args.find(a => !a.startsWith('--'));
    const writeMode = args.includes('--write');

    if (!packPath) {
        console.error('Usage: npm run vlab:recompute-pack-hashes <pack_path> [--write]');
        process.exit(1);
    }

    const absolutePackPath = path.isAbsolute(packPath)
        ? packPath
        : path.join(process.cwd(), packPath);

    console.log(`\n📦 Recomputing pack hashes for: ${packPath}\n`);

    // Compute using SSOT
    const { entries, packRootHash, sha256sumsText } = computePackRootHashFromDir(absolutePackPath);

    console.log(`   Found ${entries.length} files`);
    for (const entry of entries) {
        console.log(`   ${entry.hash.slice(0, 16)}... ${entry.path}`);
    }

    console.log(`\n📋 Pack Root Hash: ${packRootHash}`);

    // Check existing hash
    const existingHash = readPackRootHash(absolutePackPath);
    if (existingHash) {
        if (existingHash === packRootHash) {
            console.log(`✅ Matches existing integrity/pack.sha256`);
        } else {
            console.log(`⚠️  Current: ${existingHash.slice(0, 16)}...`);
            console.log(`   New:     ${packRootHash.slice(0, 16)}...`);
        }
    }

    if (writeMode) {
        // Write integrity files
        writeIntegrityFiles(absolutePackPath, entries, packRootHash);
        console.log(`\n✅ Written: integrity/sha256sums.txt`);
        console.log(`✅ Written: integrity/pack.sha256`);
    } else {
        console.log(`\n💡 Dry run mode. Add --write to update files.`);
        console.log(`\nsha256sums.txt would contain:`);
        console.log('---');
        console.log(sha256sumsText.trim());
        console.log('---');
    }

    console.log(`\n════════════════════════════════════════════════════════════`);
    console.log(`${writeMode ? '✅ Pack hash update complete' : '📋 Dry run complete'}`);
    console.log(`════════════════════════════════════════════════════════════\n`);
}

main();
