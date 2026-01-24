# UI-FACETS-REPROPACK-SEAL v0.9.1

> **Seal ID**: UI-FACETS-REPROPACK-SEAL.v0.9.1  
> **Date**: 2026-01-24  
> **Status**: SEALED  
> **Builds On**: DIFF-ENHANCEMENT-SEAL.v0.9.0  
> **Scope**: MUST-3 UI Facets + Repro Pack (rp-1)

---

## Summary

This seal formalizes the completion of **v0.9.1 UI Facets + Repro Pack** for MUST-3 ruleset diff reports. The enhancement adds:
- Server-side facets (domain/change_type filtering with query params)
- Deterministic Repro Pack generation (rp-1 profile)
- Reproduction commands and hash verification in UI

All changes maintain vendor-neutral, non-endorsement boundaries.

---

## Non-Endorsement / Non-Certification Boundary

**Critical**: This seal documents UI and reproducibility enhancements only. It MUST NOT be interpreted as:
- Certification, endorsement, or ranking of any framework/vendor/substrate
- Quality assessment of rulesets or frameworks
- Production readiness or compliance approval

Repro packs provide **deterministic reproduction steps and hashes only**.

---

## Evidence Chain (Unbroken)

```
PROJECTION-SEAL.v0.7.2
    ↓
CAPABILITY-SEAL.v0.8.0
    ↓
DIFF-ENHANCEMENT-SEAL.v0.9.0
    ↓
UI-FACETS-REPROPACK-SEAL.v0.9.1 (this seal)
```

---

## v0.8 Frozen Integrity (UNCHANGED)

```
export/ruleset-diff/index.json:
  e40c28e3d4a38986e5d4c083b00a0ee7eecf26e05a971d7c571291792b116d94 ✅

export/ruleset-diff/ruleset-1.0_to_ruleset-1.1/diff.json:
  2c57a6e80cd4481ef9d3b8fe7f06d1a9b07bf727b73430f2536f3d33b4e25c18 ✅

export/ruleset-diff/ruleset-1.1_to_ruleset-1.2/diff.json:
  273f91b78efe6bc898f4cecf5149323963f15d04ec174fea9aee708d6c817694 ✅

export/ruleset-diff/ruleset-1.0_to_ruleset-1.2/diff.json:
  6bd6537d5c036ae44b0d977b8a8a914fb2e13156ad9b32f5be6d9c6735ef774f ✅
```

---

## Repro Pack Artifacts (NEW)

### Per-Diff Repro Packs

```
export/ruleset-diff/ruleset-1.0_to_ruleset-1.1/repro-pack.json:
  50e469193593df1ca599b3847abab8770375abe651801b985d49217fb8b35c14

export/ruleset-diff/ruleset-1.0_to_ruleset-1.2/repro-pack.json:
  892ea9120431a868cf2c46fac8b60f9a422dd8ec3601b19f19e0cb62b0c68f5a

export/ruleset-diff/ruleset-1.1_to_ruleset-1.2/repro-pack.json:
  53d5f04b456f1a98c64d1955ce0140118c7e83b714ab001065b2af673b0b4688
```

### Repro Index

```
export/ruleset-diff/index.repro.json:
  2997f525c5ae433b5326fdd4280bf6a0e5a291bfe26a12790fa3c437487a7076
```

### repro-pack.json Structure (rp-1)

```json
{
  "repro_pack_version": "rp-1",
  "diff_id": "ruleset-1.0_to_ruleset-1.1",
  "from": "ruleset-1.0",
  "to": "ruleset-1.1",
  "inputs": { "from_manifest_sha256": "...", "to_manifest_sha256": "..." },
  "artifacts": {
    "v0_8_frozen": { "index_json_sha256": "...", "diff_json_sha256": "..." },
    "v0_9_enhanced": { "index_enhanced_json_sha256": "...", "diff_enhanced_json_sha256": "..." }
  },
  "commands": {
    "verify_inputs": ["shasum -a 256 ..."],
    "generate_enhanced_diff": ["node scripts/ruleset/... --enhanced ..."],
    "generate_repro_pack": ["node scripts/ruleset/... --repro-pack ..."],
    "verify_exports": ["shasum -a 256 ..."]
  },
  "boundary": {
    "non_endorsement": "Repro packs provide deterministic reproduction steps and hashes only. They do not certify or rank frameworks, vendors, or substrates."
  }
}
```

---

## UI Facets Implementation

### Detail Page (`/rulesets/diff/[diff_id]`)

**Features**:
- Facets Panel (domain filter, change_type filter)
- Query param support (`?domain=D1&type=THRESHOLD_CHANGE`)
- Repro Pack display section with commands and hashes
- Graceful degradation for v0.8 mode (facets hidden)

**Boundary Text**:
- "Filters help navigate ruleset changes. They do not indicate framework/vendor/substrate quality."
- "Commands and hashes are provided for reproducibility only. This is not certification or endorsement."

### List Page (`/rulesets/diff`)

**Features**:
- Repro indicator badge ("Repro") for each diff with repro-pack.json
- Links to detail page with #reproduction anchor

---

## Code Changes

```
scripts/ruleset/generate-ruleset-diff.mjs:
  d15856ccd63abba0041d416b33ed336910389368b0caa22997e95a21597e2c6c

app/rulesets/diff/page.tsx:
  20f6e731318ace03addbfdcdb006cf5410b8bfeba66f0ea13f130edea44966e8

app/rulesets/diff/[diff_id]/page.tsx:
  6d749190534d4cdf17d56154461b946d081d1b130ba212f78f707ff2a6e1259c
```

---

## Gate Evidence (ALL PASSING)

### Projection Map Gate
```
Status: ✅ PASS
Mapped Routes: 24
Registered Artifacts: 22
```

### No-SSOT-Duplication Gate
```
Status: ✅ PASS
Errors: 0
Warnings: 2 (non-blocking)
```

### Build Gate
```
Status: ✅ PASS
Platform: Next.js 15.0.0
```

---

## Reproducibility

### Generate Repro Packs

```bash
node scripts/ruleset/generate-ruleset-diff.mjs --repro-pack --repro-profile rp-1 --from ruleset-1.0 --to ruleset-1.1
node scripts/ruleset/generate-ruleset-diff.mjs --repro-pack --repro-profile rp-1 --from ruleset-1.1 --to ruleset-1.2
node scripts/ruleset/generate-ruleset-diff.mjs --repro-pack --repro-profile rp-1 --from ruleset-1.0 --to ruleset-1.2
```

### Verify Frozen Integrity

```bash
shasum -a 256 export/ruleset-diff/index.json
shasum -a 256 export/ruleset-diff/*/diff.json
# All hashes MUST match v0.8 seal values
```

---

## Boundaries Enforced

### UI Text Boundaries
1. No evaluative language (certified, endorsed, ranked, compliant, etc.)
2. Explicit "do not indicate quality" disclaimers
3. "This is not certification or endorsement" statements

### Repro Pack Boundaries
1. Contains only commands + hashes (facts)
2. Non-endorsement boundary in every repro-pack.json
3. No interpretation or quality assessment

### Technical Boundaries
1. Freeze Guard prevents v0.8 modification
2. Facets only affect display, not data
3. Server-side filtering (no client state complexity)

---

## Related Documents

### Task Completion Report
`governance/reports/task-completion/P4-2-V0-9-2-UI-FACETS-REPROPACK.md`

### Parent Seals
- `governance/seals/DIFF-ENHANCEMENT-SEAL.v0.9.0.md` (immediate parent)
- `governance/seals/CAPABILITY-SEAL.v0.8.0.md` (frozen baseline)

---

## Seal Closure Checklist

- [x] v0.8 frozen hashes verified UNCHANGED
- [x] Repro pack artifacts generated (3 packs + 1 index)
- [x] Repro pack hashes documented
- [x] UI facets implemented (domain + change_type)
- [x] Repro Pack display section implemented
- [x] Graceful degradation for v0.8 mode
- [x] Query params for facets
- [x] All gates PASSING
- [x] Banned word scan: 0 hits
- [x] Non-endorsement boundaries in UI text
- [x] Documentation updated

---

**Seal Authority**: VLAB Governance Delegate  
**Seal Date**: 2026-01-24  
**Status**: SEALED  
**Evidence Chain**: PROJECTION-SEAL.v0.7.2 → CAPABILITY-SEAL.v0.8.0 → DIFF-ENHANCEMENT-SEAL.v0.9.0 → UI-FACETS-REPROPACK-SEAL.v0.9.1
