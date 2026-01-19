# PR-8 Seal — Curated Runs to Adjudication Mapping

**Sealed**: 2026-01-14T18:40:00Z  
**Status**: SCOPE LOCKED ✅

---

## Curated Runs Schema Extension

### New Fields in curated-runs.json (export v1.2)

```typescript
interface CuratedRun {
    // Existing fields
    run_id: string;
    scenario_id?: string;
    status?: string;
    
    // NEW: PR-8 Adjudication linking
    adjudication_status: string;        // ADJUDICATED | INCOMPLETE | NOT_ADMISSIBLE | NOT_ADJUDICATED
    adjudication_verdict_hash?: string; // From bundle
    adjudication_ruleset?: string;      // Ruleset version
    adjudication_protocol_pin?: string; // Protocol pin
}
```

### adjudication_status Values

| Value | Meaning |
|:---|:---|
| `ADJUDICATED` | Bundle exists, all checks passed |
| `INCOMPLETE` | Bundle exists, GF evaluation incomplete |
| `NOT_ADMISSIBLE` | Bundle exists, admission failed |
| `NOT_ADJUDICATED` | No adjudication bundle yet |
| `PARSE_ERROR` | Bundle exists but verdict.json invalid |

---

## Export Contract v1.2

### Changes from v1.1

| Field | v1.1 | v1.2 |
|:---|:---|:---|
| `export_version` | 1.1 | 1.2 |
| curated_runs.adjudication_status | - | NEW |
| curated_runs.adjudication_verdict_hash | - | NEW |
| curated_runs.adjudication_ruleset | - | NEW |
| curated_runs.adjudication_protocol_pin | - | NEW |

### Backward Compatibility

> [!IMPORTANT]
> v1.1 consumers that do not read adjudication fields will continue to work.

---

## Gate-15: Curated Runs Adjudication Required

### Purpose

Enforces curated → adjudication closure. Validates that curated runs have corresponding adjudication bundles when required.

### Checks

1. allowlist.yaml entries have `run_id` field
2. For `status ∈ {active, curated, frozen}`: bundle should exist
3. verdict.json has valid `overall_status`
4. verdict_hash matches between bundle and export index

### Soft Pass Rule

Entries without bundles get soft pass (NOT_ADJUDICATED). This allows gradual migration.

---

## Test Coverage

| File | Tests |
|:---|:---|
| `tests/gates/gate-15-curated-adjudication-required.spec.ts` | 11 |
| **Total (PR-8)** | 11 |
| **Total (all)** | 61 |

---

## Scope Lock Declaration

> [!CAUTION]
> The following changes are PROHIBITED without a new PR:

### Prohibited

1. Remove adjudication fields from curated-runs.json
2. Change adjudication_status enum values
3. Break curated → adjudication linking logic
4. Modify Gate-15 closure requirements without version bump

### Allowed

- Add new optional fields to CuratedRun
- Add new runs to allowlist
- Create adjudication bundles for existing curated entries

---

## Verification Commands

```bash
npm run test                    # 61/61 ✓
npm run gate:15                 # Curated closure ✓
npm run vlab:export             # Export v1.2 ✓
cat export/manifest.json | jq '.export_version'  # "1.2"
```

---

**Sealed by**: Validation Lab Governance  
**Prerequisite**: PR-7 (Gate-14) completed  
**Next phase**: Main Repo De-Adjudication / Curated Set Expansion
