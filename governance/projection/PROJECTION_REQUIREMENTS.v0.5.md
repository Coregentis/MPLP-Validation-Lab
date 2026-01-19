# Projection Requirements - v0.5

> **Document ID**: VLAB-PROJ-01  
> **Status**: ACTIVE  
> **Effective Date**: 2026-01-19  
> **Governed By**: VLAB-DGB-01

---

## Purpose

This document defines **what each route must display** and **from which SSOT the data must come**.

PTM (Page Truth Map) answers: "Which sources determine page semantics?"  
Projection Requirements answer: "What must the page actually render from those sources?"

---

## Projection Modes

| Mode | Description | Verification |
|------|-------------|--------------|
| **Index** | List/count of assets | Count matches SSOT |
| **Detail** | Asset-specific fields | Fields traceable to manifest/pack |
| **Policy** | Static governance text | Language gate compliance |

---

## Route × Projection Requirements (18 routes)

### Home & Static (Policy Mode)

| Route | SSOT | Must Display | Gate |
|-------|------|--------------|------|
| `/` | ts.identity, ts.dgb | "Validation Lab", "Non-Endorsement" | gate:04, gate:05 |
| `/about` | ts.identity | Verifier identity info | gate:key-policy |
| `/statement` | ts.dgb | Non-endorsement boundary text | gate:04, gate:05 |

---

### Runs (Index + Detail Mode)

| Route | SSOT | Must Display | Gate |
|-------|------|--------------|------|
| `/runs` | ts.runsets, ts.curated_json | **Index**: curated runs ≥23, v0.2/v0.3/v0.4 sections | gate:09, gate:curated-runs |
| `/runs/[run_id]` | ts.run_bundles | **Detail**: verdict badge, domain, reason_code (if FAIL) | gate:shadow-parity, gate:10 |
| `/runs/[run_id]/replay` | ts.run_bundles | Timeline events from events.ndjson | gate:terminology |
| `/runs/[run_id]/evidence` | ts.run_bundles | Evidence pointers, artifact links | gate:terminology |

#### /runs Detail Fields

| Field | Source | Required |
|-------|--------|----------|
| Verdict (PASS/FAIL) | verdict.json | ✅ |
| Domain (D1/D2/D3/D4) | manifest.yaml | ✅ |
| Ruleset Version | manifest.yaml | ✅ |
| Reason Code | verdict.json (if FAIL) | ✅ for FAIL |
| Verdict Hash | verdict.json | Optional |
| Evidence Refs | verdict.json | ✅ for Detail pages |

---

### Guarantees (Policy Mode)

| Route | SSOT | Must Display | Gate |
|-------|------|--------------|------|
| `/guarantees` | ts.terminology | LG-01~05 list, **NOT** GF-xx | gate:terminology |

#### Required Fields

| Field | Source | Notes |
|-------|--------|-------|
| LG-01: Single Agent Lifecycle | TERMINOLOGY_MAPPING.md | Use "LG" not "GF" |
| LG-02: Multi-Agent Collaboration | TERMINOLOGY_MAPPING.md | |
| LG-03: Human-in-the-Loop | TERMINOLOGY_MAPPING.md | |
| LG-04: Drift Detection | TERMINOLOGY_MAPPING.md | |
| LG-05: External Tool Integration | TERMINOLOGY_MAPPING.md | |

---

### Rulesets (Index + Detail Mode)

| Route | SSOT | Must Display | Gate |
|-------|------|--------------|------|
| `/rulesets` | ts.registry, ts.ruleset_manifests | **Index**: ruleset-1.0, 1.1, 1.2 visible | gate:registry |
| `/rulesets/[version]` | ts.ruleset_manifests | **Detail**: clauses, manifest metadata | gate:registry |

#### /rulesets Index Fields

| Field | Source | Required |
|-------|--------|----------|
| Ruleset ID | registry.ts | ✅ |
| Version | manifest.yaml | ✅ |
| Clause Count | manifest.yaml | ✅ |

#### /rulesets/[version] Detail Fields

| Field | Source | Required |
|-------|--------|----------|
| Ruleset ID | manifest.yaml | ✅ |
| Clauses List | manifest.yaml | ✅ |
| Adjudicator Status | registry.ts | ✅ (loadable/not) |

---

### Adjudication (Index + Detail Mode)

| Route | SSOT | Must Display | Gate |
|-------|------|--------------|------|
| `/adjudication` | ts.registry, ts.runsets | Entry page, link to runs | Exempted |
| `/adjudication/[run_id]` | ts.run_bundles | Adjudication details | gate:14 |

---

### Policies (Policy Mode)

| Route | SSOT | Must Display | Gate |
|-------|------|--------------|------|
| `/policies/contract` | ts.contracts | Evidence pack contract summary | Exempted |
| `/policies/strength` | ts.strength | E-A/E-B/E-S strength definitions | Exempted |

---

### Tools (Index Mode)

| Route | SSOT | Must Display | Gate |
|-------|------|--------------|------|
| `/builder` | ts.pack_schema | Pack builder form | Exempted |
| `/coverage` | ts.runsets, ts.test_vectors_allowlist | **Index**: D1/D2/D3/D4 coverage (5+5 each) | gate:test-vectors-coverage |

#### /coverage Required Fields

| Field | Source | Required |
|-------|--------|----------|
| Domain Coverage Matrix | allowlist-v0.5.yaml | ✅ |
| PASS vectors per domain | allowlist-v0.5.yaml | ≥5 |
| FAIL vectors per domain | allowlist-v0.5.yaml | ≥5 |

---

### Examples - Cross-Substrate (Index + Detail Mode)

| Route | SSOT | Must Display | Gate |
|-------|------|--------------|------|
| `/examples/evidence-producers/[substrate]` | ts.producer_manifests, ts.producer_packs | **Index**: pack list for substrate | gate:cross-substrate |

#### Required Fields

| Field | Source | Required |
|-------|--------|----------|
| Substrate Name | producer manifest | ✅ |
| Pack Count | producer packs dir | ✅ (8 per substrate) |
| Scenario List | producer manifest | ✅ |

---

## Summary

| Mode | Routes | Gates Required |
|------|--------|----------------|
| Index | 5 | gate:09, gate:registry, gate:test-vectors-coverage, gate:cross-substrate |
| Detail | 7 | gate:shadow-parity, gate:10, gate:14 |
| Policy | 6 | gate:04, gate:05, gate:terminology, gate:key-policy |

---

## Verification Plan

### gate:projection-sanity (Future)

A future gate can verify:

1. `/runs` displays ≥23 curated runs
2. `/rulesets` displays ruleset-1.0, 1.1, 1.2
3. `/coverage` displays D1/D2/D3/D4 coverage
4. `/examples/evidence-producers/*` displays 3 substrates

### Manual Verification (Current)

1. Open each Index route, count items vs runsets.yaml
2. Open sample Detail routes, verify fields match pack manifest
3. Open Policy routes, verify LG terminology (not GF)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19
