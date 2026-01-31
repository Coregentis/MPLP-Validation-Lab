# Ruleset V2 Pointer Specification

## Overview

This document defines how ruleset rules reference protocol schemas and evidence using **JSON Pointers**. This ensures all rule requirements are machine-verifiable and traceable to MPLP Protocol schemas.

## JSON Pointer Format

All pointers use [RFC 6901 JSON Pointer](https://tools.ietf.org/html/rfc6901) syntax.

**Example**:
```
/properties/plan/required
```

## Rule Evidence Requirements

Each rule in a ruleset must declare its evidence requirements using the following structure:

```json
{
  "rule_id": "R001",
  "domain": "planning",
  "clause": "Must declare planning phase",
  "required": [
    {
      "protocol_schema_file": "mplp-plan.schema.json",
      "protocol_pointer": "/properties/plan/required",
      "evidence_file": "artifacts/plan.json",
      "evidence_pointer": "/plan",
      "validation": "schema_conformance"
    }
  ],
  "adjudication_logic": "all_required_present"
}
```

### Field Definitions

#### protocol_schema_file (REQUIRED)

**Type**: `string`

**Format**: Filename only (not full path)

**Source**: Must exist in `MPLP-Protocol/schemas/v2/`

**Example**: `"mplp-plan.schema.json"`

**Purpose**: Links rule requirement to authoritative protocol schema

#### protocol_pointer (REQUIRED)

**Type**: `string (JSON Pointer)`

**Format**: RFC 6901 JSON Pointer starting with `/`

**Example**: `"/properties/plan/required"`

**Purpose**: Identifies specific field/structure within the protocol schema

#### evidence_file (REQUIRED)

**Type**: `string`

**Format**: Relative path from evidence pack root

**Example**: `"artifacts/plan.json"`

**Purpose**: Specifies which file in the evidence pack contains the required data

#### evidence_pointer (REQUIRED)

**Type**: `string (JSON Pointer)`

**Format**: RFC 6901 JSON Pointer starting with `/`

**Example**: `"/plan"`

**Purpose**: Identifies specific field/structure within the evidence file

#### validation (REQUIRED)

**Type**: `string (enum)`

**Allowed values**:
- `"schema_conformance"`: Evidence must conform to protocol schema
- `"presence"`: Evidence field must exist
- `"value_match"`: Evidence value must match expected value
- `"custom"`: Custom validation logic (must reference validation function)

**Example**: `"schema_conformance"`

## Timeline Event Pointers

For evidence in `timeline/events.ndjson`, use event filtering syntax:

```json
{
  "protocol_schema_file": "mplp-tool-use.schema.json",
  "protocol_pointer": "/properties/tool_definition/required",
  "evidence_file": "timeline/events.ndjson",
  "evidence_selector": {
    "event_type": "tool_invoked",
    "pointer": "/data/tool_definition"
  },
  "validation": "schema_conformance"
}
```

The `evidence_selector` filters events by type, then applies the pointer to the matched event's data.

## Complete Rule Example

```json
{
  "rule_id": "R042",
  "domain": "tool_use",
  "clause": "Tool invocations must include valid tool definitions",
  "required": [
    {
      "protocol_schema_file": "mplp-tool-use.schema.json",
      "protocol_pointer": "/properties/tool_definition",
      "evidence_file": "timeline/events.ndjson",
      "evidence_selector": {
        "event_type": "tool_invoked",
        "pointer": "/data/tool_definition"
      },
      "validation": "schema_conformance"
    },
    {
      "protocol_schema_file": "mplp-tool-use.schema.json",
      "protocol_pointer": "/properties/tool_result",
      "evidence_file": "timeline/events.ndjson",
      "evidence_selector": {
        "event_type": "tool_completed",
        "pointer": "/data/tool_result"
      },
      "validation": "schema_conformance"
    }
  ],
  "adjudication_logic": "all_required_present"
}
```

## Validation Process

1. **Schema Resolution**: Resolve `protocol_schema_file` to full schema from MPLP Protocol
2. **Pointer Validation**: Validate `protocol_pointer` exists in resolved schema
3. **Evidence Location**: Locate `evidence_file` in evidence pack
4. **Evidence Extraction**: Apply `evidence_pointer` or `evidence_selector` to extract data
5. **Schema Validation**: Validate extracted data against protocol schema using specified `validation` method

## Gate Enforcement

This pointer format is enforced by:

- **GATE-V2-RULESET-POINTER-01**: Validates all rules use correct pointer format
- **GATE-V2-RULESET-SCHEMA-LINK-01**: Validates `protocol_schema_file` exists in MPLP Protocol
- **GATE-V2-RULESET-POINTER-RESOLVE-01**: Validates all pointers resolve correctly

## Benefits

1. **Machine-Verifiable**: All rule requirements can be automatically validated
2. **Schema-First**: Enforces alignment with MPLP Protocol schemas
3. **Traceable**: Clear provenance from rule → protocol schema → evidence
4. **Refactor-Safe**: Changes to evidence structure require explicit rule updates
5. **Audit-Ready**: Every adjudication decision has a verifiable evidence trail

## Migration from V1

V1 rulesets using string-based evidence references must be rewritten to this pointer format. No automated migration is possible; each rule must be manually converted and validated.
