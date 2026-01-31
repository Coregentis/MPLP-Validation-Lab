# Field Mapping Matrix V2 Pointer Specification

## Overview

This document defines how the Field Mapping Matrix (FMM) uses **JSON Pointers** to create verifiable mappings between substrate-specific fields and MPLP Protocol schema fields.

## JSON Pointer Format

All pointers use [RFC 6901 JSON Pointer](https://tools.ietf.org/html/rfc6901) syntax.

## FMM Mapping Structure

Each mapping in the FMM must follow this structure:

```json
{
  "substrate_id": "mcp",
  "substrate_field_path": "tool.definition",
  "mplp_schema_file": "mplp-tool-use.schema.json",
  "mplp_json_pointer": "/properties/tool_definition",
  "mapping_proof": [
    {
      "run_id": "pass-basic-01",
      "indexability_status": "INDEXABLE_REAL",
      "evidence_file": "artifacts/trace.json",
      "observed_pointer": "/tool_invocations/0/definition",
      "normalized_pointer": "/tool_definition",
      "hash_ref": "a1b2c3d4..."
    }
  ],
  "mapping_status": "verified",
  "last_verified": "2026-01-26T09:46:42Z"
}
```

### Field Definitions

#### substrate_id (REQUIRED)

**Type**: `string`

**Source**: Must match a substrate in `producers/_registry/substrates.v2.yaml`

**Example**: `"mcp"`

#### substrate_field_path (REQUIRED)

**Type**: `string`

**Format**: Substrate-specific dot notation or pointer

**Example**: `"tool.definition"`

**Purpose**: Describes how the substrate natively exposes this field

#### mplp_schema_file (REQUIRED)

**Type**: `string`

**Format**: Filename only (not full path)

**Source**: Must exist in `MPLP-Protocol/schemas/v2/`

**Example**: `"mplp-tool-use.schema.json"`

**Purpose**: Links mapping to authoritative protocol schema

#### mplp_json_pointer (REQUIRED)

**Type**: `string (JSON Pointer)`

**Format**: RFC 6901 JSON Pointer starting with `/`

**Example**: `"/properties/tool_definition"`

**Purpose**: Identifies specific field in MPLP Protocol schema

#### mapping_proof[] (REQUIRED)

**Type**: `Array<MappingProof>`

**Minimum Length**: 1

**Purpose**: Provides verifiable evidence that this mapping is observed in real runs

Each proof object must contain:

##### run_id (REQUIRED)

**Type**: `string`

**Source**: Must match a run in curated index

**Example**: `"pass-basic-01"`

##### indexability_status (REQUIRED)

**Type**: `string (enum)`

**Allowed values**: `"INDEXABLE_REAL"` | `"INDEXABLE_SYNTHETIC"`

**Example**: `"INDEXABLE_REAL"`

**Purpose**: Distinguishes real vs synthetic evidence

##### evidence_file (REQUIRED)

**Type**: `string`

**Format**: Relative path from evidence pack root

**Example**: `"artifacts/trace.json"`

**Purpose**: Specifies which file contains the observed field

##### observed_pointer (REQUIRED)

**Type**: `string (JSON Pointer)`

**Format**: RFC 6901 JSON Pointer starting with `/`

**Example**: `"/tool_invocations/0/definition"`

**Purpose**: Shows where the field actually appears in substrate evidence

##### normalized_pointer (REQUIRED)

**Type**: `string (JSON Pointer)`

**Format**: RFC 6901 JSON Pointer starting with `/`

**Example**: `"/tool_definition"`

**Purpose**: Shows how the field maps to MPLP Protocol structure

##### hash_ref (REQUIRED)

**Type**: `string`

**Format**: SHA-256 hash (64 hex characters)

**Example**: `"a1b2c3d4e5f6..."`

**Purpose**: Hash of the observed value for verification

#### mapping_status (REQUIRED)

**Type**: `string (enum)`

**Allowed values**:
- `"verified"`: Mapping has at least one INDEXABLE_REAL proof
- `"synthetic_only"`: Mapping only has INDEXABLE_SYNTHETIC proofs
- `"deprecated"`: Mapping no longer valid

**Example**: `"verified"`

#### last_verified (REQUIRED)

**Type**: `string (ISO 8601 timestamp)`

**Format**: UTC timestamp

**Example**: `"2026-01-26T09:46:42Z"`

## Complete FMM Entry Example

```json
{
  "substrate_id": "langchain",
  "substrate_field_path": "agent.tools[].name",
  "mplp_schema_file": "mplp-tool-use.schema.json",
  "mplp_json_pointer": "/properties/tool_definition/properties/name",
  "mapping_proof": [
    {
      "run_id": "pass-complex-01",
      "indexability_status": "INDEXABLE_REAL",
      "evidence_file": "artifacts/trace.json",
      "observed_pointer": "/chain_executions/0/tools/calculator/name",
      "normalized_pointer": "/tool_definition/name",
      "hash_ref": "e8f3a1c2d4b5..."
    },
    {
      "run_id": "pass-basic-01",
      "indexability_status": "INDEXABLE_REAL",
      "evidence_file": "artifacts/trace.json",
      "observed_pointer": "/chain_executions/0/tools/search/name",
      "normalized_pointer": "/tool_definition/name",
      "hash_ref": "f9g4b2d3e5c6..."
    }
  ],
  "mapping_status": "verified",
  "last_verified": "2026-01-26T10:15:22Z"
}
```

## Display Rules

### For REAL Mappings

Display normally with proof count:

```
LangChain agent.tools[].name → MPLP tool_definition.name
  ✓ Verified with 2 real runs
```

### For SYNTHETIC-Only Mappings

Display with warning badge:

```
AutoGen tool_schema.name → MPLP tool_definition.name
  ⚠️ SYNTHETIC ONLY (ruleset test) - Not verified with real substrate execution
```

## Validation Process

1. **Schema Resolution**: Resolve `mplp_schema_file` to full schema from MPLP Protocol
2. **Pointer Validation**: Validate `mplp_json_pointer` exists in resolved schema
3. **Proof Validation**: For each proof:
   - Validate `run_id` exists in curated index
   - Validate `evidence_file` exists in run pack
   - Validate `observed_pointer` resolves in evidence file
   - Validate extracted value matches protocol schema at `mplp_json_pointer`
4. **Hash Verification**: Verify `hash_ref` matches hash of extracted value

## Gate Enforcement

This pointer format is enforced by:

- **GATE-V2-FMM-POINTER-01**: Validates all mappings use correct pointer format
- **GATE-V2-FMM-SCHEMA-LINK-01**: Validates `mplp_schema_file` exists in MPLP Protocol
- **GATE-V2-FMM-PROOF-01**: Validates all proofs are verifiable
- **GATE-V2-FMM-SYNTHETIC-LABEL-01**: Validates synthetic-only mappings are properly labeled

## Benefits

1. **Proof-Backed**: Every mapping has verifiable evidence from real runs
2. **Schema-First**: All mappings trace to MPLP Protocol schemas
3. **Auditable**: Users can verify mappings by examining linked runs
4. **Honest**: Synthetic-only mappings are clearly distinguished
5. **Maintainable**: Broken mappings detected automatically when runs change

## Migration from V1

V1 FMM entries using descriptive paths must be rewritten to include:
1. Exact schema file reference
2. JSON Pointer to schema field
3. Proof array with run references
4. Hash verification

No automated migration is possible.
