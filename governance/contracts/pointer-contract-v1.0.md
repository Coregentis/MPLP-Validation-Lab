---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-018"
---

# Pointer Contract v1.0

**Contract ID**: VLAB-PTC-01  
**Version**: 1.0.0  
**Status**: GOVERNANCE-FROZEN  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## 1. Purpose

This contract defines the **Evidence Pointer** structure—the mechanism by which verdicts reference specific evidence within a pack.

A Pointer is a **locator**, not an explanation. It enables:
- Precise evidence location
- Reproducible verification
- Audit trail integrity

---

## 2. EvidencePointer Structure

Aligned with `lib/verdict/types.ts`:

```typescript
interface EvidencePointer {
  artifact_path: string;      // Path within evidence pack
  content_hash: string;       // SHA-256 of referenced content
  locator: string;            // Grammar-specified locator
  requirement_id: string;     // Requirement this supports
  note?: string;              // Optional human note
}
```

---

## 3. Field Semantics

### artifact_path

Relative path from pack root to the artifact file.

Examples:
- `artifacts/context.json`
- `timeline/events.ndjson`
- `snapshots/diffs/snap-001.json`

### content_hash

SHA-256 hash of the referenced content.

For file-level pointers: hash of entire file.
For fragment-level pointers: hash of extracted fragment.

### locator

Grammar-specified locator string (see Section 4).

### requirement_id

The requirement ID this pointer supports (e.g., `GF-01.R1`).

### note

Optional human-readable note for audit clarity.

---

## 4. Locator Grammar

### JSON Pointer (`jsonptr:`)

For JSON files, use RFC 6901 JSON Pointer:

```
jsonptr:<file>#<pointer>
```

Examples:
- `jsonptr:artifacts/context.json#/context_id`
- `jsonptr:artifacts/plan.json#/steps/0/action`

### NDJSON Index (`ndjson:`)

For NDJSON files, use line index:

```
ndjson:<file>#<line-index>
```

Examples:
- `ndjson:timeline/events.ndjson#0` (first event)
- `ndjson:timeline/events.ndjson#42` (43rd event)

### Line Range (`lines:`)

For text files, use line range:

```
lines:<file>#L<start>-L<end>
```

Examples:
- `lines:integrity/sha256sums.txt#L1-L5`

### Snapshot (`snapshot:`)

For snapshot content files (per EPC §2.2 `snapshots/<snapshot_id>.json`):

```
snapshot:<snapshot_id>#<jsonptr>
```

Resolution:
1. Locate `snapshots/<snapshot_id>.json` in pack
2. Apply JSON Pointer to content

Examples:
- `snapshot:snap-001#/context/status`
- `snapshot:snap-002#/plan/steps/0`

> **Note**: If `snapshots/<snapshot_id>.json` does not exist, pointer resolves to `POINTER_UNRESOLVABLE`. Evaluator should fall back to diff-based resolution or mark GF-04 as `NOT_EVALUATED`.

### Snapshot Index (`snapshot-index:`)

For snapshot index entries:

```
snapshot-index:snapshots/index.json#<snapshot_id>
```

Examples:
- `snapshot-index:snapshots/index.json#snap-001`

---

## 5. Hash Semantics

### File-Level Hash

When `locator` points to a file:
```
content_hash = SHA-256(file_content)
```

### Fragment-Level Hash

When `locator` points to a fragment:
```
content_hash = SHA-256(canonical_json(fragment))
```

Canonical JSON: sorted keys, no extra whitespace.

---

## 6. Resolvability Rule

### Requirement

Every pointer MUST be resolvable within the evidence pack.

### Resolution Algorithm

1. Parse `locator` grammar
2. Locate `artifact_path` in pack
3. Extract content per grammar
4. Compute hash
5. Compare with `content_hash`

### Failure Handling

If resolution fails:
- Taxonomy: `POINTER_UNRESOLVABLE`
- Requirement: `FAIL` (if blocking) or flagged (if advisory)

---

## 7. Pointer Collection

A verdict contains a collection of pointers:

```typescript
interface RequirementCoverage {
  requirement_id: string;
  status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  pointers: EvidencePointer[];
  failure_taxonomy?: FailureTaxonomy;
}
```

### Minimum Pointers

Each passing requirement SHOULD have at least one pointer.
Each failing requirement MUST have a pointer to the failure location.

---

## 8. Canonical Serialization

For deterministic verdicts, pointers are serialized:
1. Sorted by `requirement_id`
2. Within requirement, sorted by `artifact_path`
3. JSON with sorted keys

---

## 9. Amendment Process

Changes to this contract require:
1. VLAB-DGB-01 governance review
2. Version bump
3. Grammar changes require MAJOR bump

---

**Document Status**: Contract (Frozen)  
**Version**: 1.0.0
