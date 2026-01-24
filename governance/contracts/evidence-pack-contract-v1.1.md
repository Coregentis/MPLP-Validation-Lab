---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-022"
---

# Evidence Pack Contract v1.1 Addendum

**Date**: 2026-01-10  
**Status**: Active  
**Parent**: Evidence Pack Contract v1.0

---

## Purpose

This addendum extends Evidence Pack Contract v1.0 to support optional substrate metadata without breaking existing packs.

> [!IMPORTANT]
> Contract v1.0 remains FROZEN. This is an additive-only extension.

---

## Changes from v1.0

### 1. Optional `manifest.substrate` Field

Packs MAY include a `substrate` object in `manifest.json`:

```json
{
  "pack_id": "example-001",
  "protocol_version": "1.0.0",
  "created_at": "2026-01-10T00:00:00Z",
  "substrate": {
    "type": "langchain",
    "version": "0.1.0"
  }
}
```

**Field Specification**:

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `substrate.type` | string | No | Substrate identifier (e.g., "a2a", "langchain", "mcp") |
| `substrate.version` | string | No | Substrate version |
| `substrate.*` | any | No | Additional substrate-specific metadata |

**Validation Rules**:

1. **Absence is not a failure**: If `substrate` is missing, verification MUST NOT fail
2. **Status**: `not_declared` (not `FAIL`)
3. **No semantic validation**: Lab does NOT validate substrate claims
4. **Informational only**: Substrate metadata is for documentation, not verdict determination

---

## Compatibility

### Contract v1.0 Packs

All v1.0-compliant packs remain valid under v1.1. No migration required.

### GATE-02 Behavior

`substrate` field absence:
- **Does NOT** trigger `NOT_ADMISSIBLE`
- **Does NOT** count as a check failure
- May be noted in verification report as `not_declared`

---

## Implementation Guidance

### For Evidence Producers

```typescript
// Optional: Add substrate metadata
const manifest = {
  pack_id: "my-pack-001",
  mplp_protocol_version: "1.0.0",
  created_at: new Date().toISOString(),
  // v1.1: Optional substrate
  substrate: {
    type: "langchain",
    version: "0.1.0",
    python_version: "3.9+"
  }
};
```

### For Verification Tools

```typescript
// v1.1-aware verification
const substrate = manifest.substrate;
if (!substrate) {
  // NOT an error - just note as not_declared
  report.substrate_status = "not_declared";
} else {
  // Informational only - do not validate semantics
  report.substrate_status = "declared";
  report.substrate_type = substrate.type;
}
```

---

## Curated Allowlist Integration

The `substrate` field in packs is **separate** from the `substrate` field in curated allowlist entries:

- **Pack `manifest.substrate`**: Optional, self-declared by producer
- **Allowlist `substrate`**: Required for curated entries, assigned by Lab

These MAY differ. The allowlist value is authoritative for curated runs.

---

## Non-Goals

This addendum does NOT:
- Define substrate-specific validation rules
- Endorse or cert

ify any substrate
- Require Lab to verify substrate claims
- Change verdict computation logic

---

## Versioning

- **Contract v1.0**: FROZEN (no changes)
- **Contract v1.1**: Additive only (backward compatible)
- **Future v1.x**: May add more optional fields (always additive)

---

## License

MIT
