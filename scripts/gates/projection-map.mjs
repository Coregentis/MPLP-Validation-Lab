#!/usr/bin/env node
/**
 * Gate: Projection Map Coverage (P0-2)
 * 
 * Verifies that all Lab routes are registered in the projection map.
 * Ensures no unmapped routes exist that could cause projection drift.
 * 
 * Usage: npm run gate:projection-map
 * Exit: 0 = PASS, 1 = FAIL
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// =============================================================================
// Configuration
// =============================================================================

const PROJECTION_MAP_PATH = path.join(PROJECT_ROOT, 'export/projection-map.json');
const ROUTES_REGISTRY_PATH = path.join(PROJECT_ROOT, 'governance/registry/ROUTES.yaml');

// =============================================================================
// Main
// =============================================================================

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Projection Map Gate (P0-2)');
    console.log('═══════════════════════════════════════════════════════════\n');

    try {
        // Load projection map
        if (!fs.existsSync(PROJECTION_MAP_PATH)) {
            console.error(`❌ Projection map not found: ${PROJECTION_MAP_PATH}`);
            process.exit(1);
        }

        const projectionMap = JSON.parse(fs.readFileSync(PROJECTION_MAP_PATH, 'utf-8'));
        console.log(`✓ Loaded projection map v${projectionMap.map_version}`);
        console.log(`  Artifacts registered: ${projectionMap.artifacts.length}\n`);

        // Extract all routes from projection map
        const mappedRoutes = new Set();
        for (const artifact of projectionMap.artifacts) {
            for (const route of artifact.routes || []) {
                mappedRoutes.add(route);
            }
        }

        console.log(`📋 Mapped routes: ${mappedRoutes.size}`);
        console.log(`   ${Array.from(mappedRoutes).sort().join(', ')}\n`);

        // Load route registry
        let registeredRoutes = [];
        if (fs.existsSync(ROUTES_REGISTRY_PATH)) {
            // Parse YAML (simple extraction for route paths)
            const routesYaml = fs.readFileSync(ROUTES_REGISTRY_PATH, 'utf-8');
            const routeMatches = routesYaml.matchAll(/route:\s+"([^"]+)"/g);
            registeredRoutes = Array.from(routeMatches, m => m[1]);
            console.log(`✓ Loaded route registry: ${registeredRoutes.length} routes\n`);
        }

        // Check for unmapped routes
        const unmappedRoutes = [];
        for (const route of registeredRoutes) {
            if (!mappedRoutes.has(route)) {
                unmappedRoutes.push(route);
            }
        }

        // Check for extra mapped routes (warnings only)
        const extraMappedRoutes = [];
        for (const route of mappedRoutes) {
            if (registeredRoutes.length > 0 && !registeredRoutes.includes(route)) {
                extraMappedRoutes.push(route);
            }
        }

        // Report
        console.log('🔍 Verification Results:\n');

        if (unmappedRoutes.length > 0) {
            console.error(`❌ UNMAPPED ROUTES FOUND (${unmappedRoutes.length}):`);
            for (const route of unmappedRoutes) {
                console.error(`   - ${route}`);
            }
            console.error('\n💡 Add these routes to projection-map.json under appropriate artifacts.\n');
            process.exit(1);
        }

        console.log(`✅ All registered routes are mapped in projection-map.json`);

        if (extraMappedRoutes.length > 0) {
            console.log(`\n⚠️  EXTRA MAPPED ROUTES (${extraMappedRoutes.length}) - not in route registry:`);
            for (const route of extraMappedRoutes) {
                console.log(`   - ${route}`);
            }
            console.log('\n   This is acceptable for future routes or non-Next.js paths.');
        }

        // Validate structure
        console.log('\n🔍 Validating projection map structure...');

        // Check required fields
        const requiredSurfaces = ['lab', 'website', 'docs'];
        for (const surface of requiredSurfaces) {
            if (!projectionMap.surfaces[surface]) {
                console.error(`❌ Missing required surface: ${surface}`);
                process.exit(1);
            }
        }
        console.log('   ✓ All required surfaces present');

        // Check artifact structure
        for (const artifact of projectionMap.artifacts) {
            if (!artifact.artifact_id) {
                console.error(`❌ Artifact missing artifact_id: ${JSON.stringify(artifact, null, 2)}`);
                process.exit(1);
            }
            if (!artifact.truth_source) {
                console.error(`❌ Artifact ${artifact.artifact_id} missing truth_source`);
                process.exit(1);
            }
            if (!artifact.projection_targets || artifact.projection_targets.length === 0) {
                console.error(`❌ Artifact ${artifact.artifact_id} missing projection_targets`);
                process.exit(1);
            }
            // Validate projection targets
            for (const target of artifact.projection_targets) {
                if (!requiredSurfaces.includes(target)) {
                    console.error(`❌ Invalid projection_target "${target}" in artifact ${artifact.artifact_id}`);
                    process.exit(1);
                }
            }
        }
        console.log('   ✓ All artifacts have required fields');

        // Check forbidden categories
        if (!projectionMap.forbidden || !projectionMap.forbidden.website || !projectionMap.forbidden.docs) {
            console.error('❌ Missing forbidden projection categories');
            process.exit(1);
        }
        console.log('   ✓ Forbidden projection categories defined');

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('  Gate Status: ✅ PASS');
        console.log(`  Mapped Routes: ${mappedRoutes.size}`);
        console.log(`  Registered Artifacts: ${projectionMap.artifacts.length}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        process.exit(0);

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
