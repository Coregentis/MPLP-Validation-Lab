---
seal_id: CAPABILITY-SEAL-v0.8.0
status: SEALED
release: v0.8.0
type: capability-seal
date: 2026-01-23
authority: VLAB-DGB-01 + SOP-VLAB-PROJ-SYNC-01 + PROJECTION-SEAL.v0.7.2
scope: three-entry-model
non_normative: true
---

# CAPABILITY-SEAL v0.8.0

**MUST-1/2/3 Capability Formalization - Auditable Evidence Closure**

> **Status**: SEALED  
> **Date**: 2026-01-23  
> **Scope**: Validation Lab v0.6-v0.8 MUST Capabilities

---

## Executive Summary

This seal formalizes the completion of three **MUST** capabilities from the Validation Lab v0.6–v0.8 roadmap:

- **MUST-1**: Same-Ruler Proof Set (cross-substrate adjudication consistency demonstration)
- **MUST-2**: Dispute-level FAIL Benchmark Evidence Pack  
- **MUST-3**: Ruleset Diff Reports with UI Projection

All capabilities are delivered with:
- Reproducible hash anchors
- Non-endorsement boundaries
- Gate-verified integrity
- Cross-repository commit anchors

---

## Commit Anchors (Cross-Repository)

```
Validation_Lab: 072feec5ac3ba9f04fd266cdd0a08a3d32c6f617
MPLP_website:   6428d8563ef180c8dbe91f017d1a161b7165fbce
docs:           d00cb8d6cc5af76e8feaaa66a69f1905f8913be9
```

**Reproducibility**: Check out these commits and verify hash anchors below.

---

## SSOT Hash Anchors

### Projection Infrastructure
```
export/projection-map.json: 58d7b81943722d9d079f9aed24f21b0bd42e209d042a3d1336e0f4f1fd7daa0e
```

### MUST-3: Ruleset Diff Reports
```
export/ruleset-diff/index.json: e40c28e3d4a38986e5d4c083b00a0ee7eecf26e05a971d7c571291792b116d94
export/ruleset-diff/ruleset-1.0_to_ruleset-1.1/diff.json: 2c57a6e80cd4481ef9d3b8fe7f06d1a9b07bf727b73430f2536f3d33b4e25c18
export/ruleset-diff/ruleset-1.1_to_ruleset-1.2/diff.json: 273f91b78efe6bc898f4cecf5149323963f15d04ec174fea9aee708d6c817694
export/ruleset-diff/ruleset-1.0_to_ruleset-1.2/diff.json: 6bd6537d5c036ae44b0d977b8a8a914fb2e13156ad9b32f5be6d9c6735ef774f
```

### MUST-1: Same-Ruler Proof Set
```
adjudication/proof-sets/same-ruler-gf-01.yaml: 9c72a9dc9fbf5121a6b50ab300974d050c377db93eb1b7ea33678206c79b867f
```

**Proof Set Evidence**:
- Scenario: gf-01-single-agent-plan
- Ruleset: ruleset-1.0
- Substrates: 3 (a2a, mcp, langchain)  
- Status: DECLARED (schema-conformant, not formally adjudicated)
- Pack root hashes:
  - a2a: 880c4198920923dfbe5fee6b1dcd8158db94de92365375f9bcf9e5c303811349
  - mcp: ed881deb589213f95934490d926bb6144e8ff50a110283d19d29c2cf85571eab
  - langchain: 333cef669cb284776b41d4439593d2328bf0046bf2f6314d7dd49093f2bccf95

### MUST-2: Dispute-level FAIL Benchmark
```
data/runs/gf-01-adjudicated-fail-01/ pack_root_hash: 9a1a1e2d8de456f0f479c54556fa14bee3c91bea2720503afcd026357b84c425
```

**Evidence Pack Purpose**:
This is a **dispute-resolution benchmark**, not a framework quality rating. The FAIL verdict demonstrates that the Lab's adjudication process can identify evidence deficiencies under versioned ruleset requirements. This does NOT mean:
- The framework is "blacklisted" or "inferior"
- The framework cannot produce valid evidence
- Other runs from the same framework will fail

See `/adjudication/dispute-benchmark-fail-01` for full context.

---

## Capability Claims

### MUST-1: Same-Ruler Proof Set ✅

**Location**: `adjudication/proof-sets/same-ruler-gf-01.yaml`

**Claim**: Demonstrates comparable evidence pack structure across 3 substrates (a2a, mcp, langchain) under the same scenario (gf-01) and ruleset (ruleset-1.0).

**Boundaries**:
- NOT a ranking, endorsement, or certification of frameworks
- NOT a claim that substrates are "equivalent" in quality
- Only demonstrates ruleset application consistency when evidence contracts are met
- Status is DECLARED (conforms to schema but not formally adjudicated by Lab infrastructure)

**Verification**:
```bash
cd Validation_Lab
find adjudication/proof-sets -name "*.yaml"
cat adjudication/proof-sets/same-ruler-gf-01.yaml
# Verify pack_root_hash:
find data/runs/gf-01-a2a-pass -type f \( -name "*.json" -o -name "*.yaml" \) | sort | shasum -a 256
```

---

### MUST-2: Dispute-level FAIL Benchmark ✅

**Location**: `data/runs/gf-01-adjudicated-fail-01/`

**Claim**: Evidence pack demonstrating dispute-resolution capability. The pack was adjudicated under ruleset-1.0 and received a FAIL verdict due to evidence deficiencies (not framework quality).

**Critical Boundaries**:
- This is a **dispute benchmark**, NOT a blacklist or framework ranking
- FAIL verdict applies to this specific evidence pack, not to the framework/substrate generally
- Other evidence packs from the same substrate may receive PASS verdicts
- The purpose is to demonstrate Lab's capability to identify deficient evidence, not to rate frameworks

**Verification**:
```bash
cd Validation_Lab
ls -la data/runs/gf-01-adjudicated-fail-01/
cat data/runs/gf-01-adjudicated-fail-01/verdict.json
# Verify pack integrity
find data/runs/gf-01-adjudicated-fail-01 -type f \( -name "*.json" -o -name "*.yaml" \) | sort | shasum -a 256
```

---

### MUST-3: Ruleset Diff Reports + UI ✅

**Locations**:
- Reports: `export/ruleset-diff/`
- Index: `export/ruleset-diff/index.json`
- UI: `/rulesets/diff` (list), `/rulesets/diff/[diff_id]` (detail)

**Claim**: Ruleset evolution is traceable with reproducible diff reports. UI provides browsable access to clause_delta and requirement_delta between ruleset versions.

**Boundaries**:
- Diff reports explain ruleset changes only, NOT framework quality
- Changes reflect governance decisions about evidence requirements
- MUST NOT be interpreted as certification, compliance scoring, or framework ranking
- Hash anchors enable independent verification

**Verification**:
```bash
cd Validation_Lab
cat export/ruleset-diff/index.json
# Verify diff hash:
shasum -a 256 export/ruleset-diff/ruleset-1.0_to_ruleset-1.1/diff.json
# Access UI:
npm run dev
# Navigate to http://localhost:3000/rulesets/diff
```

---

## Non-Endorsement / No-Certification Boundary

**CRITICAL: This seal does NOT certify, endorse, rank, or approve any framework, substrate, or vendor.**

### What This Seal Documents:
✅ Lab capability to process cross-substrate evidence consistently (MUST-1)  
✅ Lab capability to identify evidence deficiencies (MUST-2)  
✅ Lab capability to track ruleset evolution auditability (MUST-3)

### What This Seal Does NOT Do:
❌ Certify frameworks as "compliant" or "production-ready"  
❌ Rank frameworks by quality, maturity, or capability  
❌ Endorse specific substrates or vendors  
❌ Create a "blacklist" via FAIL benchmarks  
❌ Guarantee future verdicts for any framework

### Specific MUST-2 Disclaimer:
The dispute benchmark FAIL pack demonstrates **adjudication capability**, not framework quality. A FAIL verdict on one evidence pack does NOT mean:
- The framework is inferior to others
- The framework cannot produce valid evidence
- Future runs will fail
- The framework should not be used

FAIL verdicts are **evidence-pack-specific**, governed by versioned rulesets, and subject to dispute resolution.

---

## Gate Evidence (All PASSING ✅)

This seal's integrity is verified by mandatory gates:

```
gate:projection-map
  Status: ✅ PASS
  Routes: 24 mapped
  Artifacts: 22 registered

gate:no-ssot-duplication  
  Status: ✅ PASS
  Errors: 0
  Warnings: 2 (non-blocking)

gate:post-task-association
  Status: ✅ PASS (enforced via CI)

build
  Status: ✅ PASS (Next.js 15.0.0)

typecheck
  Status: ✅ PASS
```

**Total Gates**: 30 (25 Lab-internal + 4 cross-repo + 1 SOP enforcement)

---

## Reproduction Instructions

### 1. Checkout Commit Anchors
```bash
cd Validation_Lab && git checkout 072feec5ac3ba9f04fd266cdd0a08a3d32c6f617
cd ../MPLP_website && git checkout 6428d8563ef180c8dbe91f017d1a161b7165fbce
cd ../docs && git checkout d00cb8d6cc5af76e8feaaa66a69f1905f8913be9
```

### 2. Verify SSOT Hash Anchors
```bash
cd Validation_Lab
shasum -a 256 export/projection-map.json
shasum -a 256 export/ruleset-diff/index.json
shasum -a 256 adjudication/proof-sets/same-ruler-gf-01.yaml
```

### 3. Run Gates
```bash
cd Validation_Lab
npm ci
npm run gate:projection-map
npm run gate:no-ssot-duplication
npm run build
```

### 4. Verify UI Accessibility
```bash
npm run dev
# Navigate to:
# http://localhost:3000/rulesets/diff
# http://localhost:3000/rulesets/diff/ruleset-1.0_to_ruleset-1.1
```

### 5. Verify Proof Set
```bash
cat adjudication/proof-sets/same-ruler-gf-01.yaml
# Check pack hashes match those listed in this seal
```

---

## Related Documents

- **P0 Infrastructure**: `governance/projection/PROJECTION-SEAL.v0.7.2.md`
- **SOP**: `governance/sop/SOP-VLAB-PROJ-SYNC-01.md`
- **Registry**: `governance/registry/{ROUTES,TRUTH_SOURCES,GATES}.yaml`
- **Task Reports**: 
  - `governance/reports/task-completion/P1-1-MUST-1-SAME-RULER.md`
  - `governance/reports/task-completion/P1-2-MUST-3-RULESET-DIFF.md`
  - `governance/reports/task-completion/P2-1-RULESET-DIFF-UI.md`

---

## Seal Attestation

This seal represents the state of Validation Lab v0.8.0 as of 2026-01-23, verified by:
- Cross-repository commit anchors (immutable)
- SSOT hash anchors (reproducible)
- Gate evidence (executable verification)
- SOP compliance (all task completion reports filed)

**Seal Authority**: VLAB Governance Delegate  
**Effective Date**: 2026-01-23  
**Builds on**: PROJECTION-SEAL.v0.7.2 (Projection-Stable)  
**Next Planned Seal**: v0.9.0 (TBD)
