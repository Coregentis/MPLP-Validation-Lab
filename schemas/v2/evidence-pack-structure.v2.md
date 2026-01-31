# Evidence Pack V2 Directory Structure

## Overview

This document defines the **mandatory file structure** for all V2 evidence packs. This is the "minimal closure" that ensures:

1. Deterministic hash computation
2. Consistent projection generation
3. Reproducible verification

## Version

**Pack Layout Version**: `2`

All evidence packs must declare `"pack_layout_version": "2"` in their `manifest.json`.

## Mandatory Directory Structure

```
data/runs/v2/{real|synthetic}/{substrate_id}/{run_id}/
├── manifest.json                    # REQUIRED: Pack metadata with provenance chain
├── artifacts/                       # REQUIRED: Protocol-aligned evidence files
│   ├── context.json                 # Context establishment
│   ├── plan.json                    # Planning phase
│   ├── confirm.json                 # Confirmation phase
│   └── trace.json                   # Execution trace
├── timeline/                        # REQUIRED: Temporal event log
│   └── events.ndjson                # Newline-delimited JSON events
├── snapshots/                       # OPTIONAL: State snapshots
│   └── index.json                   # Snapshot index
├── reports/                         # REQUIRED: Verification and evaluation
│   ├── verify.report.json           # Verification report (hash checks, reproducibility)
│   └── evaluation.report.json       # OPTIONAL: Evaluation against ruleset
└── integrity/                       # REQUIRED: Hash manifest
    └── sha256sums.txt               # SHA-256 hashes of all files
```

## File Requirements

### manifest.json (REQUIRED)

Must conform to `schemas/evidence-pack.v2.schema.json` and include:

```json
{
  "pack_id": "string",
  "pack_layout_version": "2",
  "indexability_status": "INDEXABLE_REAL|INDEXABLE_SYNTHETIC|NON_INDEXABLE",
  "protocol_ref": { ... },
  "substrate_ref": { ... },
  "lock_ref": { ... },
  "env_ref": { ... },
  "lab_ref": { ... },
  "producer_ref": { ... },
  "canonicalization_ref": { ... },
  "hashes": { ... },
  "repro": { ... },
  "paths": {
    "manifest": "manifest.json",
    "artifacts_dir": "artifacts/",
    "timeline": "timeline/events.ndjson",
    "verify_report": "reports/verify.report.json",
    "integrity": "integrity/sha256sums.txt"
  }
}
```

The `paths` object **must** list all critical files for gate validation.

### artifacts/ (REQUIRED)

Contains protocol-aligned evidence files per MPLP `schemas/v2`:

- **context.json**: Context establishment evidence
- **plan.json**: Planning phase evidence
- **confirm.json**: Confirmation phase evidence
- **trace.json**: Execution trace evidence

Each file must be valid against its corresponding schema in `MPLP-Protocol/schemas/v2/`.

### timeline/events.ndjson (REQUIRED)

Newline-delimited JSON event log with temporal ordering:

```ndjson
{"timestamp":"2026-01-26T09:46:32Z","event":"context_established","data":{...}}
{"timestamp":"2026-01-26T09:46:33Z","event":"plan_created","data":{...}}
{"timestamp":"2026-01-26T09:46:35Z","event":"plan_confirmed","data":{...}}
```

Each line must be a valid JSON object with at minimum:
- `timestamp`: ISO 8601 UTC
- `event`: Event type
- `data`: Event payload

### reports/verify.report.json (REQUIRED)

Verification report documenting:

```json
{
  "verification_version": "2.0.0",
  "verified_at": "2026-01-26T09:46:40Z",
  "pack_id": "pass-basic-01",
  "checks": [
    {
      "check_id": "hash_integrity",
      "status": "PASS|FAIL",
      "details": { ... }
    },
    {
      "check_id": "schema_validation",
      "status": "PASS|FAIL",
      "details": { ... }
    },
    {
      "check_id": "provenance_chain",
      "status": "PASS|FAIL",
      "details": { ... }
    }
  ],
  "overall_status": "VERIFIED|FAILED",
  "hash_verification": {
    "expected_pack_root_hash": "abc123...",
    "computed_pack_root_hash": "abc123...",
    "match": true
  }
}
```

**CRITICAL**: This report is used by UI to display "VERIFIED" or "FAILED" status.

### integrity/sha256sums.txt (REQUIRED)

Standard SHA-256 checksum format:

```
a1b2c3d4...  manifest.json
e5f6g7h8...  artifacts/context.json
i9j0k1l2...  artifacts/plan.json
m3n4o5p6...  artifacts/confirm.json
q7r8s9t0...  artifacts/trace.json
u1v2w3x4...  timeline/events.ndjson
y5z6a7b8...  reports/verify.report.json
```

Used for independent hash verification.

## Optional Components

### snapshots/ (OPTIONAL)

If state snapshots are captured:

```
snapshots/
├── index.json              # Snapshot metadata
├── snapshot-001.json       # State at T1
├── snapshot-002.json       # State at T2
└── ...
```

### reports/evaluation.report.json (OPTIONAL)

If evaluated against a ruleset:

```json
{
  "evaluation_version": "2.0.0",
  "evaluated_at": "2026-01-26T09:46:41Z",
  "pack_id": "pass-basic-01",
  "ruleset_id": "ruleset-v2.0",
  "verdict": "PASS|FAIL",
  "clauses_triggered": [...],
  "score": 1.0
}
```

## Determinism Requirements

For `INDEXABLE_REAL` packs, the following must be deterministic across runs:

1. **manifest.json** (after canonicalization)
2. **artifacts/*.json** (after canonicalization)
3. **timeline/events.ndjson** (after canonicalization)
4. **integrity/sha256sums.txt** (order-independent comparison)

The `pack_root_hash` is computed from the deterministic hash of these files.

## Gate Enforcement

This structure is enforced by:

- **GATE-V2-PACK-STRUCTURE-01**: Validates all REQUIRED files exist
- **GATE-V2-PACK-LAYOUT-01**: Validates `pack_layout_version: "2"` in manifest
- **GATE-V2-PACK-PATHS-01**: Validates `paths` object in manifest matches actual files

## Migration from V1

V1 evidence packs **cannot** be imported into V2. All evidence must be regenerated with V2 structure and provenance chains.
