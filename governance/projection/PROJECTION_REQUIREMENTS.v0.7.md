# Projection Requirements v0.7 — Provable Baseline

v0.7 elevates the projection governance from "functional closure" to "provable auditability."

## New Requirements

### PR-MAN-01: Projection Manifest
The release surface must carry an `export/projection-manifest.json` containing:
- **Proof of Input**: SHA256 hashes for 100% of registered truth sources.
- **Proof of State**: Repository commit SHAs for the Triple-entry repositories (Lab, Website, Docs).
- **Integrity**: A hierarchical `combined_sha256` that is deterministic and reproducible.

### PR-SAN-01: Projection Sanity
The UI projection must demonstrate consistency with SSOT via `gate:projection-sanity`:
- **Run Set Parity**: 1:1 match of `run_id` between SSOT export and UI data.
- **Substrate Parity**: 1:1 match of substrate coverage between surfaces.
- **Ruleset Parity**: Parity between registry definitions and actual data manifests.

## Enforcement
- `gate:projection-manifest`: REQUIRED PASS (strict mode).
- `gate:projection-sanity`: REQUIRED PASS.
- `gate:ptm`: Mapping v0.7 PASS.
