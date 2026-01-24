---
seal_id: PROJECTION-SEAL-v0.7.2
status: SEALED
release: v0.7.2
type: projection-stable
date: 2026-01-23
authority:
  - VLAB-DGB-01
  - export/projection-map.json (SSOT)
scope:
  three_entry_model:
    - lab.mplp.io (SSOT projection surface)
    - mplp.io (pointer-only)
    - docs.mplp.io (non-normative pointer)
non_normative: true
---

# PROJECTION SEAL — v0.7.2 (Projection-Stable)

## 0. Statement

This seal attests that **projection governance is computably enforced** across the three-entry model (Lab, Website, Docs).

**Non-Negotiable Boundaries**:
- This seal does NOT certify, endorse, or rank any framework, vendor, or implementation
- MPLP does NOT host execution or provide compliance badges
- Lab adjudicates evidence packs against versioned rulesets only
- Website and Docs are pointer-only surfaces; Lab is the sole SSOT for adjudication artifacts

## 1. Commit Anchors (Cross-Repo)

| Repository | Commit SHA | Purpose |
|:---|:---|:---|
| **Validation Lab** | `072feec5ac3ba9f04fd266cdd0a08a3d32c6f617` | SSOT for projection governance |
| **Website** (mplp.io) | `6428d8563ef180c8dbe91f017d1a161b7165fbce` | Pointer-only discovery surface |
| **Docs** (docs.mplp.io) | `d00cb8d6cc5af76e8feaaa66a69f1905f8913be9` | Non-normative reference documentation |

## 2. SSOT Hash Anchors

### 2.1 Projection Map (Single Source of Truth)
```
File: export/projection-map.json
SHA256: ff3fe6915b355ed945e4d5d18b58e9e89aa8ba0fcd06aaedfc55cf6fb98a009f
Summary: 24 routes mapped, 21 artifacts registered
Version: 1.0.0
```

**Artifact Categories**:
- Lab static pages (4): home, about, statement, builder
- Policy surfaces (4): admission criteria, evidence pack contract, ruleset contract, pointer contract
- Adjudication surfaces (5): runs index, run detail, evidence view, replay, dispute benchmark
- Governance surfaces (4): registry, page truth map, projection seal, development baseline
- Data exports (4): curated runs, substrate index, coverage matrix, proof sets

## 3. Gate Evidence (All MUST PASS)

### 3.1 Lab — gate:projection-map
```
Command: npm run gate:projection-map
Result: ✅ PASS
Evidence:
  - 24 routes validated (17 registered + 7 planned)
  - 21 artifacts structurally validated
  - All required surfaces present (lab, website, docs)
  - Forbidden projection categories defined
Report: Terminal output (gate validation logic embedded)
```

### 3.2 Lab — gate:no-ssot-duplication
```
Command: npm run gate:no-ssot-duplication
Result: ✅ PASS
Summary:
  - 0 errors (41 violations remediated in P0-3)
  - 2 warnings (non-blocking observational findings)
  - 332 files scanned (Website: 126, Docs: 206)
Report: export/gate-reports/no-ssot-duplication.report.json
Report SHA256: fe88c560541411295f986176ec096c57221cd9d2cd2311caafb42d423ee9ee7d
```

### 3.3 Website — gate:website-pointer-only
```
Command: npm run gate:website-pointer-only
Result: ✅ PASS
Scan scope: 49 files (app/, src/, content/)
Enforcement:
  - No forbidden terms (Certified, Ranked, Endorsed, Compliant, PASS/FAIL)
  - No data mirroring (substrate counts, run counts, coverage %)
  - Lab link integrity verified
Report: Terminal output (pattern-based validation)
```

### 3.4 Docs — gate:docs-nonnormative-pointer-only
```
Command: npm run gate:docs-nonnormative-pointer-only
Result: ✅ PASS
Scan scope: 1 file (docs/validation-lab/)
Enforcement:
  - Non-normative disclaimer present
  - No data mirroring (PASSED/FAILED counts, coverage %)
  - Lab link required and verified
Report: Terminal output (Lab-specific docs validation)
```

## 4. Projection Stability Claim

Given the SSOT hash anchors and the passing gate suite above, the system is **Projection-Stable** as of 2026-01-23:

✅ **Lab** remains the only SSOT surface for adjudication artifacts  
✅ **Website** remains pointer-only (no substrate enumeration, no verdicts, no coverage tables)  
✅ **Docs** remain non-normative pointers (no ruleset requirements, no adjudication details, no coverage matrices)

### Remediation Summary (P0-3)
- **41 violations eliminated**: 35 substrate_enumeration, 3 verdict_status, 2 coverage_numbers, 1 coverage_matrix
- **10 files modified**: Website (7), Docs (2), Lab (1)
- **Allowlists configured**: governance/, blog/, CHANGELOG, specification/

## 5. Notes / Warnings (Non-blocking)

### 5.1 no-ssot-duplication Warnings (2)
These are observational findings that do not violate projection boundaries:
1. Adjudication methodology references in context (WARN severity)
2. Verdict computation patterns in allowed governance docs (WARN severity)

Full details in: `export/gate-reports/no-ssot-duplication.report.json`

### 5.2 Planned Routes (7)
The following routes are mapped but not yet registered in ROUTES.yaml:
- `/governance/projection-seal`
- `/adjudication/dispute-benchmark-fail-01`
- `/adjudication/proof-sets`
- `/rulesets/diff`
- `/governance/development-baseline`
- `/governance/registry`
- `/governance/page-truth-map`

These represent future capabilities (P1/P2 work) and do not affect projection stability.

## 6. Reproduction Instructions

To independently verify this seal:

1. **Checkout commit anchors**:
   ```bash
   cd Validation_Lab && git checkout 072feec5ac3ba9f04fd266cdd0a08a3d32c6f617
   cd ../MPLP_website && git checkout 6428d8563ef180c8dbe91f017d1a161b7165fbce
   cd ../docs && git checkout d00cb8d6cc5af76e8feaaa66a69f1905f8913be9
   ```

2. **Verify projection map hash**:
   ```bash
   cd Validation_Lab
   shasum -a 256 export/projection-map.json
   # Expected: ff3fe6915b355ed945e4d5d18b58e9e89aa8ba0fcd06aaedfc55cf6fb98a009f
   ```

3. **Re-run gate suite**:
   ```bash
   # Lab gates
   npm run gate:projection-map              # Must PASS
   npm run gate:no-ssot-duplication         # Must PASS (0 errors)
   
   # Website gate
   cd ../MPLP_website
   npm run gate:website-pointer-only        # Must PASS
   
   # Docs gate
   cd ../docs
   npm run gate:docs-nonnormative-pointer-only  # Must PASS
   ```

4. **Verify report hash** (where applicable):
   ```bash
   cd ../Validation_Lab
   shasum -a 256 export/gate-reports/no-ssot-duplication.report.json
   # Expected: fe88c560541411295f986176ec096c57221cd9d2cd2311caafb42d423ee9ee7d
   ```

## 7. Next Steps

With projection stability established, the system is ready for:
- **P1**: Evidence capability formalization (MUST-1 Same-Ruler Proof Set, MUST-3 Ruleset Diff Reports)
- **P2**: Lab website projection updates (ruleset diff UI)
- **v0.8**: Capability seal (MUST-1, MUST-2, MUST-3 complete)

---

**END OF SEAL**

**Approved By**: MPGC Governance Delegate  
**Seal Date**: 2026-01-23  
**Seal Status**: ✅ PROJECTION-STABLE
