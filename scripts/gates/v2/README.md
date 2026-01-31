# V2 Gates Framework

## Overview

Gates are automated verification scripts that enforce V2 architectural discipline. All gates must pass before Phase 5 seal.

## Gate Naming Convention

`GATE-V2-<CATEGORY>-<NUMBER>`

## Gate Categories

- **NO-LEGACY**: No V1 content
- **SSOT**: Single Source of Truth enforcement
- **DET**: Determinism proof requirements
- **PROJ**: Projection-only data access
- **HOST**: Host allowlist enforcement
- **CROSSLINK**: Cross-site link governance
- **CANONICAL**: Canonical URL enforcement
- **PACK**: Evidence pack structure
- **SUBSTRATE**: Substrate registry enforcement
- **RULESET**: Ruleset pointer format
- **FMM**: FMM pointer format

## Exit Codes

- **0**: PASS
- **1**: FAIL (blocking)
- **2**: WARN (non-blocking, for now)

## Gates List

### GATE-V2-NO-LEGACY-01: No V1 Legacy Content

**Purpose**: Ensure zero V1 terminology, paths, or identifiers in V2 codebase

**Scope**: All files in `Validation_Lab_V2/`

**Allowlist**: Can reference "V1" in migration documentation only

**Failure Conditions**:
- V1-specific paths found
- V1-specific file names found
- V1-specific function names found (outside allowlist)

**Command**: `npm run gate:no-legacy`

---

### GATE-V2-SSOT-00: Protocol Reference Mandatory

**Purpose**: All indexable runs must reference MPLP Protocol schemas

**Scope**: All runs in curated index

**Checks**:
- `protocol_ref` exists in manifest
- `protocol_ref.commit_sha` is valid Git SHA
- `protocol_ref.schema_bundle_version` is semantic version

**Failure Conditions**:
- Any indexable run missing `protocol_ref`
- Invalid commit SHA format
- Bundle SHA-256 mismatch

**Command**: `npm run gate:ssot-00`

---

### GATE-V2-SSOT-01: Real Provenance Complete

**Purpose**: All INDEXABLE_REAL runs have complete provenance chain

**Scope**: All runs with `indexability_status: "INDEXABLE_REAL"`

**Checks**:
- `substrate_ref` complete (repo, tag, commit_sha)
- `lock_ref` complete (path, sha256)
- `env_ref` complete (runner_type + container_digest OR os/arch/runtime)
- All referenced files exist

**Failure Conditions**:
- Any required provenance field missing
- Referenced lockfile missing or hash mismatch
- Container digest not found in runner logs

**Command**: `npm run gate:ssot-01`

---

### GATE-V2-DET-01: Determinism Proof Required

**Purpose**: All INDEXABLE_REAL runs have determinism proof

**Scope**: All runs with `indexability_status: "INDEXABLE_REAL"`

**Checks**:
- `determinism_proof` exists
- `determinism_proof.runs >= 2`
- All `pack_root_hashes` match
- `match: true`

**Failure Conditions**:
- Missing determinism proof
- Hash divergence
- Insufficient runs (<2)

**Command**: `npm run gate:det-01`

---

### GATE-V2-PROJ-01: UI Projection-Only

**Purpose**: UI components only access data through projection registry

**Scope**: All files in `app/`

**Checks**:
- No direct imports from `data/runs/`
- All data access via `app/_registry/data-registry.ts`
- No `fs.readFile` in components (except registry)

**Failure Conditions**:
- Direct import of `data/runs/` found
- Filesystem read in component
- Hardcoded projection paths

**Command**: `npm run gate:proj-01`

---

### GATE-V2-HOST-ALLOW-01: Host Allowlist Only

**Purpose**: Only allowed hosts appear in codebase

**Scope**: All files

**Allowed Hosts**:
- `lab.mplp.io`
- `www.mplp.io`
- `docs.mplp.io`
- `example.com` (tests only)

**Forbidden Hosts**:
- `localhost` (except in dev config marked with exemption comment)
- `127.0.0.1`
- `*.vercel.app`
- `*.ngrok.io`
- `*.trycloudflare.com`
- Any preview/staging domains

**Special Rule**: `https://` strings default to FAIL unless in SSOT files

**Failure Conditions**:
- Forbidden host found
- `https://` string found outside allowlisted SSOT files

**Command**: `npm run gate:host-allow-01`

---

### GATE-V2-CROSSLINK-SSOT-01: Cross-Site Link SSOT

**Purpose**: All cross-site links use hosts.ts + linkmap

**Scope**: All component files in `app/`

**Checks**:
- All cross-site links use `HOSTS` from `hosts.ts`
- All cross-site link definitions come from `linkmap.v2.yaml` projection
- No hardcoded cross-site URLs

**Failure Conditions**:
- Hardcoded cross-site URL found
- Cross-site link not in linkmap projection

**Command**: `npm run gate:crosslink-ssot-01`

---

### GATE-V2-CANONICAL-01: Canonical URL from CANONICAL_HOST

**Purpose**: All canonical URLs use CANONICAL_HOST

**Scope**: All files

**Checks**:
- `metadataBase` uses `CANONICAL_HOST`
- Sitemap uses `CANONICAL_HOST`
- No hardcoded canonical URLs

**Failure Conditions**:
- Canonical URL doesn't match `CANONICAL_HOST`
- Hardcoded canonical URL found

**Command**: `npm run gate:canonical-01`

---

### GATE-V2-PACK-STRUCTURE-01: Evidence Pack Structure

**Purpose**: All evidence packs follow v2 directory structure

**Scope**: All runs in `data/runs/v2/`

**Checks**:
- `manifest.json` exists
- `pack_layout_version: "2"` in manifest
- All required directories exist (artifacts/, timeline/, reports/, integrity/)
- All required files exist per `paths` in manifest

**Failure Conditions**:
- Missing required files
- Wrong pack_layout_version
- Invalid directory structure

**Command**: `npm run gate:pack-structure-01`

---

### GATE-V2-SUBSTRATE-REGISTRY-01: Substrate Registry Match

**Purpose**: All substrate refs match registry

**Scope**: All runs in curated index

**Checks**:
- `substrate_id` exists in `substrates.v2.yaml`
- `upstream_repo` matches registry
- `runner_id` matches registry

**Failure Conditions**:
- Unknown substrate_id
- Mismatched upstream repo
- Unknown runner

**Command**: `npm run gate:substrate-registry-01`

---

### GATE-V2-RULESET-POINTER-01: Ruleset Pointer Format

**Purpose**: All ruleset rules use JSON Pointer format

**Scope**: All rulesets in `rulesets/`

**Checks**:
- All rules have `required[]` array
- Each requirement has `protocol_schema_file`
- Each requirement has `protocol_pointer` (valid JSON Pointer)
- Each requirement has `evidence_file`
- Each requirement has `evidence_pointer` or `evidence_selector`

**Failure Conditions**:
- Missing required pointer fields
- Invalid JSON Pointer format
- Schema file doesn't exist in MPLP Protocol

**Command**: `npm run gate:ruleset-pointer-01`

---

### GATE-V2-FMM-POINTER-01: FMM Pointer Format

**Purpose**: All FMM mappings use JSON Pointer format

**Scope**: FMM projection data

**Checks**:
- All mappings have `mplp_schema_file`
- All mappings have `mplp_json_pointer` (valid JSON Pointer)
- All mappings have `mapping_proof[]` with at least one entry
- All proofs reference valid runs

**Failure Conditions**:
- Missing required pointer fields
- Invalid JSON Pointer format
- Empty proof array
- Proof references non-existent run

**Command**: `npm run gate:fmm-pointer-01`

---

### GATE-V2-FMM-SYNTHETIC-LABEL-01: FMM Synthetic Labels

**Purpose**: Synthetic-only mappings are properly labeled in UI

**Scope**: FMM UI components

**Checks**:
- Mappings with only INDEXABLE_SYNTHETIC proofs show warning badge
- Warning text matches specification
- Real mappings don't show synthetic warning

**Failure Conditions**:
- Synthetic-only mapping displayed as verified
- Missing warning badge on synthetic mapping

**Command**: `npm run gate:fmm-synthetic-label-01`

---

## Running All Gates

```bash
npm run gate:all
```

This runs all gates in sequence and reports:
- Total gates: X
- Passed: Y
- Failed: Z
- Warnings: W

Exit code:
- 0: All gates passed
- 1: One or more gates failed

## Gate Implementation Template

```typescript
#!/usr/bin/env tsx

/**
 * GATE-V2-<CATEGORY>-<NUMBER>: <Name>
 * 
 * Purpose: <purpose>
 * Scope: <scope>
 */

async function main() {
  console.log('Running GATE-V2-<CATEGORY>-<NUMBER>...');
  
  let failed = false;
  
  // Check logic here
  
  if (failed) {
    console.error('❌ GATE-V2-<CATEGORY>-<NUMBER> FAILED');
    process.exit(1);
  }
  
  console.log('✅ GATE-V2-<CATEGORY>-<NUMBER> PASSED');
  process.exit(0);
}

main();
```
