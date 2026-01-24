# DIFF-ENHANCEMENT-SEAL v0.9.0

> **Seal ID**: DIFF-ENHANCEMENT-SEAL.v0.9.0  
> **Date**: 2026-01-24  
> **Status**: SEALED  
> **Builds On**: CAPABILITY-SEAL.v0.8.0  
> **Scope**: MUST-3 Ruleset Diff Enhancement (Parallel Artifacts, Non-Breaking)

---

## Summary

This seal formalizes the completion of **v0.9-1 Diff Enhancement** for MUST-3 ruleset diff reports. The enhancement adds deterministic explainability via parallel `.enhanced.json` artifacts while preserving the v0.8 frozen evidence chain.

**Key Achievement**: Enhanced diff reports with reproducible explanations (template `eh-1`) coexist with v0.8 frozen artifacts via parallel file strategy, enabling graceful degradation and zero breaking changes.

---

## Non-Endorsement / Non-Certification Boundary

**Critical**: This seal documents evidence closure for diff report generation infrastructure only. It MUST NOT be interpreted as:
- Certification, endorsement, or ranking of any framework/vendor/substrate
- Quality assessment of rulesets or frameworks
- Production readiness or compliance approval

Enhanced diff reports explain **ruleset evolution only** — not framework quality.

---

## v0.8 Frozen Evidence Chain (UNCHANGED)

**Critical Constraint**: All v0.8 frozen artifacts MUST remain immutable to preserve existing evidence chain.

### v0.8 Frozen Hashes (Verified UNCHANGED)

```
export/ruleset-diff/index.json:
  e40c28e3d4a38986e5d4c083b00a0ee7eecf26e05a971d7c571291792b116d94

export/ruleset-diff/ruleset-1.0_to_ruleset-1.1/diff.json:
  2c57a6e80cd4481ef9d3b8fe7f06d1a9b07bf727b73430f2536f3d33b4e25c18

export/ruleset-diff/ruleset-1.1_to_ruleset-1.2/diff.json:
  273f91b78efe6bc898f4cecf5149323963f15d04ec174fea9aee708d6c817694

export/ruleset-diff/ruleset-1.0_to_ruleset-1.2/diff.json:
  6bd6537d5c036ae44b0d977b8a8a914fb2e13156ad9b32f5be6d9c6735ef774f
```

**Verification Status**: ✅ ALL MATCHED (Preflight 2026-01-24 00:26 + Postflight 2026-01-24 00:39)

**Source**: CAPABILITY-SEAL.v0.8.0.md

---

## v0.9 Enhanced Artifacts (NEW)

### Enhanced Diff Reports

**Parallel File Strategy**: v0.9 artifacts coexist with v0.8 without modification

```
export/ruleset-diff/index.enhanced.json:
  35a2858916b6471ef8e713fd6aadeda6e2150f4b8330de238e558b1a0eca36a5

export/ruleset-diff/ruleset-1.0_to_ruleset-1.1/diff.enhanced.json:
  75f8c37c28642c7b6d4a8df31032624b73460618158c7871d5855eb07b3ab61f

export/ruleset-diff/ruleset-1.1_to_ruleset-1.2/diff.enhanced.json:
  5f167c1768427c7bd1ab988705a507c29267934542f408d9e7c88a81d7a59acb

export/ruleset-diff/ruleset-1.0_to_ruleset-1.2/diff.enhanced.json:
  8543442c29e4d08695649b5bc0663da8a0a8f43159078d02116353c72e15efd5
```

### Enhanced Schema Features

**Template**: `eh-1` (Deterministic Explanation Template v1)

**New Fields**:
- `explanation_profile` - Template mode and version locking
- `domain_delta` - Per-domain aggregation (counts + impacted IDs)
- `change_type` - Enumerated change classification (THRESHOLD_CHANGE, REQUIRED_EVIDENCE_ADDED, etc.)
- `impact_surface` - Evidence pack surface affected (manifest, timeline, snapshots, hashes)
- `human_explanation` - Deterministic template-generated explanation
- `reproduction_hint` - Verification command snippets

**Determinism Guarantee**: Same input → same output (template-based, no LLM, no heuristics)

---

## Implementation Guardrails

### 1. Freeze Guard

**Mechanism**: Hard error on write attempts to v0.8 frozen paths

**Enforcement**: Generator script validates output path before write

```javascript
if (outputPath.endsWith('diff.json') || outputPath.endsWith('index.json')) {
  if (!outputPath.includes('.enhanced')) {
    throw new Error('FROZEN: v0.8 artifact is immutable. Use --enhanced flag.');
  }
}
```

**Verification**: Attempted v0.8 write triggers error (tested)

### 2. Banned Word Linter

**Pattern**: `/\b(certified|endorsed|ranked|compliant|better|worse|stricter|weaker|...)\b/i`

**Enforcement**: Pre-write check on all `human_explanation` fields

**Result**: 0 hits (verified via generator execution)

### 3. Template `eh-1` Structure

**Format** (Fixed, 4 segments):
```
[What changed]: {field} value changed from "{before}" to "{after}".
[Where applies]: {domain}/{clause_id}.
[Evidence impact]: Affects {impact_surface} validation.
[Verify]: {reproduction_hint}.
```

**Reproducibility**: Template version locked to `eh-1` for deterministic output

### 4. UI Fallback Strategy

**Priority Order**: 
1. Try `diff.enhanced.json` / `index.enhanced.json`
2. Fallback to `diff.json` / `index.json` (v0.8)
3. Error handling (404/not found)

**Tested**: Both enhanced-present and enhanced-absent scenarios

---

## Code Changes

### Generator Script

```
scripts/ruleset/generate-ruleset-diff.mjs:
  c4108ed6e6dfb35602ce1737ae67150d082b837aa372eb7ea93ec3c5417ae859
```

**New Features**:
- `--enhanced` mode flag
- `--explain-profile eh-1` template locking
- Freeze Guard validation
- Banned word linter
- Parallel file output (`.enhanced.json`)

### UI Pages

```
app/rulesets/diff/page.tsx:
  0163298e14e1a64669df33c31f54191934073a0e31a06b4a5a7bf27f877909ab

app/rulesets/diff/[diff_id]/page.tsx:
  dc5303a8c3f1b67c538e2d49a4d45cb414f67dce46157c62b083a217b33fb0de
```

**Updates**: Enhanced → v0.8 fallback loaders, mode display

### Documentation

```
export/ruleset-diff/README.md:
  fead80590b0dac7af08cd98d1ba342fdf26a92a6f5f9c3ac7efc37bbbc73b991

scripts/ruleset/README.md:
  774b4efb9d8f075db30a48d71268ff10ff78fa6026b6380ed1f9e407823ab0dc
```

**Updates**: Enhanced artifacts documentation, generation commands, non-endorsement boundaries

---

## Gate Evidence (ALL PASSING)

### Projection Map Gate
```
Status: ✅ PASS
Mapped Routes: 24
Registered Artifacts: 22
Enhanced artifacts: Not registered (parallel files, not projection changes)
```

### No-SSOT-Duplication Gate
```
Status: ✅ PASS
Errors: 0
Warnings: 2 (non-blocking, pre-existing)
```

### Build Gate
```
Status: ✅ PASS
Platform: Next.js 15.0.0
Compilation: Clean
```

---

## Reproducibility

### Generate Enhanced Diffs

```bash
node scripts/ruleset/generate-ruleset-diff.mjs \
  --enhanced \
  --explain-profile eh-1 \
  --from ruleset-1.0 \
  --to ruleset-1.1
```

### Verify v0.8 Frozen Integrity

```bash
shasum -a 256 export/ruleset-diff/index.json
shasum -a 256 export/ruleset-diff/*/diff.json
# All hashes MUST match v0.8 seal values
```

### Verify Enhanced Artifacts

```bash
shasum -a 256 export/ruleset-diff/index.enhanced.json
shasum -a 256 export/ruleset-diff/*/diff.enhanced.json
# Hashes MUST match this seal's documented values
```

---

## Boundaries Enforced

### Technical Boundaries

1. **Parallel coexistence**: v0.9 artifacts do NOT replace v0.8
2. **Graceful degradation**: UI works with or without enhanced artifacts
3. **No SSOT pollution**: Enhanced diffs are export artifacts, not truth sources
4. **No projection changes**: Routes and artifact registry unchanged

### Semantic Boundaries

1. **No evaluative language**: Banned word linter enforces non-endorsement
2. **Fact-based explanations**: Template describes changes, not quality
3. **Change types enumerate structure**: THRESHOLD_CHANGE, REQUIRED_EVIDENCE_ADDED (descriptive, not normative)
4. **Impact surfaces map evidence**: manifest, timeline, snapshots (technical surfaces, not quality metrics)

### Operational Boundaries

1. **Deterministic only**: Template-based, no AI/LLM/heuristics
2. **Versioned templates**: `eh-1` locked for reproducibility
3. **Freeze protection**: Hard errors prevent v0.8 modification
4. **Non-breaking**: All changes additive, zero breaking changes

---

## Related Documents

### Task Completion Report
`governance/reports/task-completion/P4-1-V0-9-1-DIFF-ENHANCEMENT.md`

**Hash**: (computed post-seal)

**Contents**: Implementation evidence, gates results, hash anchors, guardrails verification

### Capability Seal (Parent)
`governance/seals/CAPABILITY-SEAL.v0.8.0.md`

**Relationship**: This seal builds on v0.8 by adding enhanced diff capability without modifying v0.8 evidence chain

### Projection Seal (Baseline)
`governance/projection/PROJECTION-SEAL.v0.7.2.md`

**Relationship**: Projection infrastructure unchanged; enhanced artifacts are parallel exports

---

## Seal Closure Checklist

- [x] v0.8 frozen hashes verified UNCHANGED (preflight + postflight)
- [x] v0.9 enhanced artifact hashes documented
- [x] All gates PASSING (projection-map, no-ssot-duplication, build)
- [x] Freeze Guard active and tested
- [x] Banned word linter: 0 hits
- [x] Template `eh-1` determinism verified
- [x] UI fallback tested (enhanced → v0.8)
- [x] Documentation updated (pointer-first, non-endorsement)
- [x] Code hashes documented
- [x] Reproducibility commands provided
- [x] Boundaries explicitly stated
- [x] Non-endorsement / non-certification boundaries restated

---

## Next Steps (Post-Seal)

### Optional v0.9-2 Candidates

1. **Domain Filter UI** - Client-side filtering by domain_delta (no new generation logic)
2. **Repro Pack Export** - Package commands + hashes for enterprise reference
3. **MUST-1 ADJUDICATED** - Evolve proof set from DECLARED to adjudicated status (higher governance complexity)

### Maintenance

- Periodic verification: v0.8 frozen hashes remain unchanged
- Template versioning: `eh-2` if explanation requirements evolve
- Banned word list updates: As non-endorsement vocabulary evolves

---

**Seal Authority**: VLAB Governance Delegate  
**Seal Date**: 2026-01-24  
**Status**: SEALED  
**Evidence Chain**: Unbroken from PROJECTION-SEAL.v0.7.2 → CAPABILITY-SEAL.v0.8.0 → DIFF-ENHANCEMENT-SEAL.v0.9.0
