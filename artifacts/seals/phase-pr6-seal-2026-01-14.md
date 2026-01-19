# PR-6 Seal — Adjudication Export Interface

**Sealed**: 2026-01-14T18:27:00Z  
**Status**: SCOPE LOCKED ✅

---

## Export Contract v1.1

### New Fields Added (from v1.0)

```typescript
// manifest.files
files.adjudication_index: "export/adjudication-index.json"

// manifest.stats
stats.adjudications: number
stats.adjudicated_count: number
```

### adjudication-index.json Schema

```typescript
interface AdjudicationEntry {
    run_id: string;
    bundle_path: string;
    verdict_path: string;
    verdict_hash: string;       // Deterministic (excludes timestamps)
    ruleset_version: string;
    protocol_pin: string;
    admission_status: string;
    overall_status: string;     // ADJUDICATED | INCOMPLETE | NOT_ADMISSIBLE
    adjudicated_at: string;
}
```

---

## Compatibility Guarantee

> [!IMPORTANT]
> v1.0 consumers that do not read `adjudication_index` will continue to work.

| Field | v1.0 | v1.1 |
|:---|:---|:---|
| `files.release_index` | ✓ | ✓ |
| `files.ruleset_index` | ✓ | ✓ |
| `files.curated_runs` | ✓ | ✓ |
| `files.verdict_index` | ✓ | ✓ |
| `files.adjudication_index` | - | ✓ NEW |
| `files.sha256sums` | ✓ | ✓ |

---

## Hash Anchors

```
sha256sums.txt (export seal):
  manifest.json:            <computed at export time>
  adjudication-index.json:  <computed at export time>
```

---

## Scope Lock Declaration

> [!CAUTION]
> The following changes are PROHIBITED without a new PR:

### Prohibited

1. **Remove or rename** `adjudication_index` field in manifest
2. **Change field semantics** in adjudication-index.json (only append allowed)
3. **Modify verdict_hash** computation rules (determinism contract from PR-5)
4. **Remove entries** from adjudication-index without bundle deletion

### Allowed

- Add new optional fields to AdjudicationEntry
- Add new runs to adjudication-index
- Bump export_version for new fields (1.1 → 1.2 etc.)

---

## Dependencies

| Source | From |
|:---|:---|
| `lib/adjudication/adjudicate.ts` | PR-5 |
| `lib/adjudication/deterministicHash.ts` | PR-5 |
| `scripts/generate-export.ts` | PR-3, extended in PR-6 |

---

## Verification Commands

```bash
# Generate export
npm run vlab:export

# Verify adjudication-index exists
cat export/adjudication-index.json | jq '.adjudications | length'

# Verify manifest v1.1
cat export/manifest.json | jq '.export_version'
# Should be: "1.1"
```

---

**Sealed by**: Validation Lab Governance  
**Prerequisite**: PR-5 (Adjudication Pipeline) sealed  
**Next phase**: PR-7 (Gate-14 Adjudication Consistency)
