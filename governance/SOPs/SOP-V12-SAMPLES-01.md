# SOP-V12-EVO-01: Ruleset Evolution & Shadow Locking

**Purpose**: Formalize the ruleset evolution pipeline to ensure logic shifts are documented, quantified, and cryptographically anchored.

> [!IMPORTANT]
> **v0.12 Series Lock**: For the v0.12.0 series, the ONLY authorized evolution exercise is `ruleset-1.1 → ruleset-1.2`. Any other evolution tracks are deferred to v0.13+.

## 1. Evolution Triggercification
New runs MUST adhere to the **Evidence Pack Contract**:
- `/manifest.json`: Metadata, substrate fingerprint, and scenario binding.
- `/timeline/events.ndjson`: Normalized event capture.
- `/snapshots/`: Visual/state evidence.
- **SSOT Projection Path**: `public/data/runs/<run_id>/`.
  > [!NOTE]
  > This is the canonical projection for UI and audit review. The producer MUST output to this directory to ensure gate pass.

## 2. Hardening Workflow
1. **Physical Placement**: Deploy the evidence pack to the authorized directory.
2. **SSOT Registration**:
   - Append the `run_id` and metadata to `public/_data/curated-runs.json`.
   - Update `generated_at` timestamp.
3. **Hash Anchor**:
   - Compute `sha256` of the updated `curated-runs.json`.
   - Register the hash in `public/_meta/lab-manifest.json` under `sample_set_manifest_sha256`.
4. **Derivation**:
   - Run `npm run derive:cross-verified`.
   - Verify that the total run count in the generated report matches the SSOT.

## 3. Governance Closure
- Run `npm run gate:v12-sop`.
- The gate MUST verify that the manifest anchor matches the physical file hash.
- Any discrepancy results in an automatic **FAIL** state for the release series.
