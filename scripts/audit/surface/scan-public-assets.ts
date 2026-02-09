#!/usr/bin/env tsx
/**
 * Surface Coverage Auditor - Public Assets Scanner
 * 
 * Scans public/ directory to create an inventory of static assets.
 * Used to explain runtime paths that aren't Next.js routes.
 * 
 * Output: audit/surface/assets.public.json
 * 
 * Usage: npx tsx scripts/audit/surface/scan-public-assets.ts
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface PublicAsset {
    public_path: string;    // URL path (e.g., /brand/logo.png)
    file_path: string;      // File path (e.g., public/brand/logo.png)
    kind: 'image' | 'icon' | 'font' | 'data' | 'document' | 'other';
    extension: string;
    size_bytes: number;
}

interface PublicAssetsInventory {
    generated_at: string;
    total_assets: number;
    by_kind: Record<string, number>;
    assets: PublicAsset[];
}

const PUBLIC_ROOT = path.join(process.cwd(), 'public');

function classifyAsset(ext: string): PublicAsset['kind'] {
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'];
    const iconExts = ['.ico'];
    const fontExts = ['.woff', '.woff2', '.ttf', '.eot', '.otf'];
    const dataExts = ['.json', '.xml', '.yaml', '.yml', '.ndjson'];
    const docExts = ['.txt', '.md', '.pdf', '.html'];

    if (imageExts.includes(ext)) return 'image';
    if (iconExts.includes(ext)) return 'icon';
    if (fontExts.includes(ext)) return 'font';
    if (dataExts.includes(ext)) return 'data';
    if (docExts.includes(ext)) return 'document';
    return 'other';
}

async function scanPublicAssets(): Promise<PublicAssetsInventory> {
    const assets: PublicAsset[] = [];

    if (!fs.existsSync(PUBLIC_ROOT)) {
        console.log('⚠️  public/ directory not found');
        return {
            generated_at: new Date().toISOString(),
            total_assets: 0,
            by_kind: {},
            assets: [],
        };
    }

    // Scan all files in public/
    const files = await glob('**/*', {
        cwd: PUBLIC_ROOT,
        nodir: true,
        ignore: ['_data/**', '_meta/**'] // These are data, not static assets
    });

    for (const file of files) {
        const filePath = path.join('public', file);
        const publicPath = '/' + file;
        const ext = path.extname(file).toLowerCase();

        let size = 0;
        try {
            const stat = fs.statSync(path.join(PUBLIC_ROOT, file));
            size = stat.size;
        } catch { }

        assets.push({
            public_path: publicPath,
            file_path: filePath,
            kind: classifyAsset(ext),
            extension: ext,
            size_bytes: size,
        });
    }

    // Sort by path
    assets.sort((a, b) => a.public_path.localeCompare(b.public_path));

    // Count by kind
    const byKind: Record<string, number> = {};
    for (const asset of assets) {
        byKind[asset.kind] = (byKind[asset.kind] || 0) + 1;
    }

    return {
        generated_at: new Date().toISOString(),
        total_assets: assets.length,
        by_kind: byKind,
        assets,
    };
}

async function main() {
    console.log('🔍 Surface Coverage Auditor - Public Assets Scanner');
    console.log('====================================================\n');

    const inventory = await scanPublicAssets();

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'audit/surface');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'assets.public.json');
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

    console.log(`📊 Total Public Assets: ${inventory.total_assets}`);
    console.log('');
    console.log('📁 By Kind:');
    for (const [kind, count] of Object.entries(inventory.by_kind).sort()) {
        console.log(`   ${kind}: ${count}`);
    }

    // List brand assets specifically
    const brandAssets = inventory.assets.filter(a => a.public_path.startsWith('/brand/'));
    if (brandAssets.length > 0) {
        console.log('\n🏷️  Brand Assets:');
        for (const asset of brandAssets) {
            console.log(`   ${asset.public_path} (${asset.kind})`);
        }
    }

    console.log(`\n✅ Output: ${outputPath}`);
}

main().catch(console.error);
