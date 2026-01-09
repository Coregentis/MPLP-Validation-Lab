# Ruleset Contract v1.0

**Contract ID**: VLAB-RSC-01  
**Version**: 1.0.0  
**Status**: GOVERNANCE-FROZEN  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## 1. Purpose

This contract defines the **structure and semantics** of Validation Lab rulesets.

A Ruleset is a **versioned, deterministic set of requirements** used to evaluate evidence packs. It is NOT an implementation—it is a specification.

### Key Principle

> **Ruleset = Law. Evaluator = Judge.**
>
> The ruleset defines requirements; the evaluator applies them.
> Same evidence + same ruleset = same verdict.

---

## 2. Directory Layout

```
data/rulesets/<ruleset-version>/
├── manifest.yaml           # Ruleset metadata
└── requirements/           # GF requirement definitions
    ├── gf-01.yaml
    ├── gf-02.yaml
    ├── gf-03.yaml
    ├── gf-04.yaml
    └── gf-05.yaml
```

---

## 3. manifest.yaml

### Required Fields

```yaml
id: ruleset-1.0
version: "1.0.0"
name: MPLP Validation Lab Ruleset
status: active

protocol:
  version: "1.0.0"
  schemas_bundle_sha256: "<from SYNC_REPORT>"
  invariants_bundle_sha256: "<from SYNC_REPORT>"

compatibility:
  evidence_pack_contract: "1.0"
  min_pack_version: "1.0"
  max_pack_version: "1.x"

golden_flows:
  - gf-01
  - gf-02
  - gf-03
  - gf-04
  - gf-05

created_at: "2026-01-09T00:00:00Z"
```

---

## 4. Requirement Model

Each requirement file (`gf-XX.yaml`) defines requirements for a Golden Flow.

### Requirement Structure

```yaml
gf_id: GF-01
title: Single Agent Lifecycle
description: Validates the core context → plan → confirm → trace chain.

requirements:
  - id: GF-01.R1
    text: Evidence pack MUST include valid context with context_id.
    severity: blocking
    sources:
      - schema: mplp-context.schema.json#/properties/context_id
      - invariant: context.yaml#context_id_must_be_uuid

  - id: GF-01.R2
    text: Plan MUST reference the context_id.
    severity: blocking
    sources:
      - schema: mplp-plan.schema.json#/properties/context_ref
```

### Requirement Fields

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `id` | string | ✅ | Unique requirement ID (GF-XX.RY format) |
| `text` | string | ✅ | Human-readable requirement description |
| `severity` | enum | ✅ | `blocking` or `advisory` |
| `sources` | array | ✅ | Traceable sources (schema/invariant refs) |

### Sources Field (CRITICAL)

Every requirement MUST have `sources` that trace to:
- `schema`: JSON Schema file (with optional JSON Pointer)
- `invariant`: Invariant file (with optional rule ID)

#### Source Reference Levels

| Level | Format | Required | Description |
|:---|:---|:---:|:---|
| **Level 1** | `schema: <file>` / `invariant: <file>` | ✅ | File-level reference (always valid) |
| **Level 2** | `schema: <file>#<jsonptr>` / `invariant: <file>#<rule-id>` | Optional | Fragment-level reference (when file supports stable IDs) |

> **Note**: VLAB-GATE-01 validates Level 1 (file existence). Level 2 validation is evaluator responsibility.
>
> Phase C evaluators MAY implement Level 2 resolution when invariant files declare stable rule-ids.

---

## 5. Determinism Pledge

### Guarantee

Given:
- Evidence Pack P (with hash H_P)
- Ruleset R (version V_R)

The verdict is **deterministic**:
```
Verdict(P, R) = Verdict(P, R)  ∀ executions
```

### Enforcement

- VLAB-GATE-03 enforces determinism
- Non-deterministic evaluators forbidden

---

## 6. Compatibility Declaration

### Evidence Pack Compatibility

```yaml
compatibility:
  min_pack_version: "1.0"
  max_pack_version: "1.x"
```

- `1.x` means any 1.* version is compatible
- Major version change = breaking

### Protocol Version Binding

Ruleset is bound to a specific MPLP protocol version via:
- `protocol.version`
- `protocol.schemas_bundle_sha256`
- `protocol.invariants_bundle_sha256`

---

## 7. Change Policy

### Non-Breaking Changes

- Adding new requirements (existing packs unaffected)
- Clarifying requirement text (no semantic change)
- Adding advisory requirements

→ MINOR version bump (1.0 → 1.1)

### Breaking Changes

- Removing requirements
- Changing requirement semantics
- Changing severity from advisory to blocking
- Changing sources that alter evaluability

→ MAJOR version bump (1.0 → 2.0)

### Historical Verdict Policy

Old verdicts remain valid against the ruleset version used.
New ruleset versions do NOT retroactively invalidate old verdicts.

---

## 8. Ruleset Versioning

### Version Format

```
ruleset-<major>.<minor>
```

Examples:
- `ruleset-1.0` (initial release)
- `ruleset-1.1` (non-breaking additions)
- `ruleset-2.0` (breaking changes)

### Version Selection

Lab evaluates against the ruleset version specified in:
1. Evidence pack `manifest.json.compatibility`
2. Or explicit evaluator configuration

---

## 9. Amendment Process

Changes to this contract require:
1. VLAB-DGB-01 governance review
2. Version bump
3. Impact assessment on existing rulesets

---

**Document Status**: Contract (Frozen)  
**Version**: 1.0.0
