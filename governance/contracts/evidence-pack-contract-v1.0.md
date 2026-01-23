---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-020"
---

# Evidence Pack Contract v1.0

**Contract ID**: VLAB-EPC-01  
**Version**: 1.0.0  
**Status**: GOVERNANCE-FROZEN  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## 1. Purpose

This contract defines the **structure and requirements** for Evidence Packs submitted to the Validation Lab.

An Evidence Pack is a self-contained archive that enables deterministic evaluation against a versioned ruleset.

### Non-Goals

- ❌ This contract does NOT provide certification
- ❌ This contract does NOT determine regulatory compliance
- ❌ This contract does NOT host or execute user code

---

## 2. Pack Layout

```
evidence-pack/
├── manifest.json           # Required: Pack metadata
├── artifacts/              # Required: Protocol artifacts
│   ├── context.json        # Context module evidence
│   ├── plan.json           # Plan module evidence
│   ├── confirm.json        # Confirm module evidence (optional)
│   ├── trace.json          # Trace module evidence
│   └── ...                 # Additional module artifacts
├── timeline/               # Required: Event sequence
│   └── events.ndjson       # Newline-delimited JSON events
├── snapshots/              # Optional: State snapshots (GF-04)
│   ├── index.json          # Snapshot index
│   ├── <snapshot_id>.json  # Snapshot content (optional per-id files)
│   └── diffs/              # State diffs
│       └── <snapshot_id>.json
└── integrity/              # Required: Integrity proofs
    ├── sha256sums.txt      # File hashes
    └── pack.sha256         # Pack root hash
```

---

## 3. manifest.json

### Required Fields

| Field | Type | Source | Description |
|:---|:---|:---|:---|
| `pack_version` | string | This contract | Evidence pack contract version (e.g., "1.0") |
| `pack_id` | string | Generator | Unique identifier for this pack |
| `created_at` | ISO 8601 | Generator | Pack creation timestamp |
| `generator` | object | Generator | Generator metadata |
| `protocol_version` | string | `mplp-core.schema.json#/properties/version` | MPLP protocol version |
| `scenario_id` | string | Generator | Scenario/flow identifier |
| `artifacts_included` | string[] | This contract | List of included artifact types |

### Generator Object

```json
{
  "generator": {
    "name": "string",
    "version": "string",
    "fingerprint": "string (sha256)"
  }
}
```

### Compatibility Declaration

```json
{
  "compatibility": {
    "min_ruleset_version": "1.0",
    "max_ruleset_version": "1.x"
  }
}
```

---

## 4. artifacts/

Artifact files contain evidence of MPLP module states.

### Artifact Requirements

| Artifact | Source Schema | Required |
|:---|:---|:---:|
| `context.json` | `mplp-context.schema.json` | ✅ |
| `plan.json` | `mplp-plan.schema.json` | ✅ |
| `confirm.json` | `mplp-confirm.schema.json` | Conditional |
| `trace.json` | `mplp-trace.schema.json` | ✅ |
| `collab.json` | `mplp-collab.schema.json` | Conditional (GF-02) |
| `role.json` | `mplp-role.schema.json` | Conditional (GF-02) |

### Missing Artifacts

If an artifact is missing:
- For **required** artifacts → `NOT_ADMISSIBLE`
- For **conditional** artifacts → GF marked `NOT_EVALUATED`

---

## 5. timeline/events.ndjson

Event timeline in newline-delimited JSON format.

### Event Structure (per line)

Each event MUST conform to `events/mplp-event-core.schema.json`:

```json
{
  "event_id": "string",
  "event_type": "string",
  "timestamp": "ISO 8601",
  "source_module": "string",
  "payload": {}
}
```

### Ordering Constraint

Events MUST be ordered by:
1. **Primary**: `timestamp` (ascending, ISO 8601)
2. **Secondary (tie-breaker)**: `event_id` (lexicographic ascending)

> **Generator Requirement**: The generator MUST produce a total ordering. If timestamps are identical, `event_id` MUST be unique and deterministically orderable.

---

## 6. snapshots/

State snapshots for drift detection (GF-04).

### index.json Structure

```json
{
  "snapshots": [
    {
      "snapshot_id": "string",
      "timestamp": "ISO 8601",
      "modules_captured": ["context", "plan", "trace"],
      "diff_path": "diffs/<snapshot_id>.json"
    }
  ]
}
```

### Missing Snapshots

If snapshots are missing:
- GF-04 (Drift Detection) → `NOT_EVALUATED`

---

## 7. integrity/

### sha256sums.txt Format

```
<hash>  <relative-path>
```

Example:
```
a1b2c3d4...  artifacts/context.json
e5f6g7h8...  artifacts/plan.json
```

### pack.sha256

The pack root hash, computed as:

```
pack_root_hash = SHA-256( normalized(sha256sums.txt) )
```

**Normalization rules**:
- Entries sorted by path (lexicographic ascending)
- LF line endings (no CR)
- No trailing newline after last entry
- No BOM

This ensures cross-platform reproducibility without depending on archive format or file metadata.

### Verification Requirement

Before evaluation, Lab MUST:
1. Verify all files against `sha256sums.txt`
2. Recompute `pack_root_hash` from normalized `sha256sums.txt`
3. Verify computed hash matches `pack.sha256`
4. On mismatch → `NOT_ADMISSIBLE` with `INTEGRITY_HASH_MISMATCH`

---

## 8. Repro Instructions

To reproduce a Lab verdict:

1. **Download** the evidence pack
2. **Verify integrity** using `sha256sums.txt` and `pack.sha256`
3. **Load ruleset** matching `manifest.json.compatibility`
4. **Run evaluator** with deterministic settings
5. **Compare verdict** hash

Same pack + same ruleset = same verdict (VLAB-GATE-03 guarantee).

---

## 9. Security Constraints

Per `admission-criteria-v1.0.md`:

| Constraint | Value |
|:---|:---|
| Max pack size | 50 MB |
| Max files | 1000 |
| Allowed extensions | `.json`, `.ndjson`, `.yaml`, `.txt`, `.sha256` |
| Path traversal | Rejected (`../` patterns) |

---

## 10. Amendment Process

Changes to this contract require:
1. VLAB-DGB-01 governance review
2. Version bump (MAJOR for breaking, MINOR for additions)
3. Impact assessment on existing packs

---

**Document Status**: Contract (Frozen)  
**Version**: 1.0.0
