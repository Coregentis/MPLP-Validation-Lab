# Phase 5 Link Integration Research Report

**Date**: 2026-01-11  
**Objective**: Research Website and Docs structure to determine optimal link placement  
**Status**: COMPLETE

---

## Executive Summary

Researched both MPLP Website (mplp.io) and Docs (docs.mplp.io) to identify:
1. Existing governance/evidence-chain pages
2. External link handling patterns  
3. Technical constraints and governance requirements
4. Recommended placements for Validation Lab links

**Key Findings**:
- **Website**: Next.js (App Router), has dedicated `/governance/evidence-chain` page ✅
- **Docs**: Docusaurus, has `/evaluation/conformance` index page ✅  
- Both sites have established governance frameworks
- External links follow standard patterns (target="_blank", rel="noopener noreferrer")

---

## Website (MPLP_website) Analysis

### Technical Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript + TSX
- **Styling**: TailwindCSS
- **Structure**: `/app` directory with route-based pages

### Governance/Evidence-Chain Pages Found

#### Primary Target: `/app/governance/evidence-chain/page.tsx`
**Path**: `app/governance/evidence-chain/page.tsx`  
**Status**: EXISTS ✅  
**Content**: Comprehensive Evidence Chain explanation (Plan → Confirm → Trace)

**Current Structure**:
```typescript
// Has metadata, JSON-LD structured data
export const metadata = {
  title: "Evidence Chain | MPLP Protocol",
  description: "Plan, Confirm, and Trace form the MPLP Evidence Chain..."
};

// Page includes:
- Hero section ("Evidence Chain")
- What is the Evidence Chain
- Three-phase breakdown (Plan, Confirm, Trace)
- Why Evidence Chains Matter
- Related links section
```

**Recommended Addition Point**: After main content, before footer/related links

#### Related Pages
- `/app/governance/page.tsx` - Main governance index
- `/app/governance/overview/page.tsx` - Governance overview
- `/app/standards/protocol-evaluation/page.tsx` - Protocol evaluation

### External Link Patterns

**Found 32 instances of `target="_blank"`** in website codebase

**Standard Pattern**:
```typescript
<a 
  href="https://external-site.com"
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600 hover:underline"
>
  Link Text
</a>
```

### Governance Constraints

**Observed from existing content**:
- No certification/badge language
- Clear "observation, not compliance claim" disclaimers
- Structured data (JSON-LD) carefully scoped
- External references marked as such

---

## Docs (docs.mplp.io) Analysis

### Technical Stack
- **Framework**: Docusaurus
- **Language**: MDX/Markdown
- **Structure**: `/docs` directory with sidebar navigation

### Governance/Evaluation Pages Found

#### Primary Target: `/docs/evaluation/conformance/index.mdx`
**Path**: `docs/evaluation/conformance/index.mdx`  
**Status**: EXISTS ✅  
**Content**: Conformance & Evaluation overview

**Current Frontmatter**:
```yaml
---
id: index
title: Conformance & Evaluation
sidebar_label: Conformance & Evaluation
description: "MPLP conformance evaluation: Conformance & Evaluation..."
authority: Documentation Governance
---
```

**Content Structure**:
- Evidence-first lifecycle governance
- Quick reference table
- Conformance checkpoints
- Related documentation links

**Recommended Addition Point**: "Related Documentation" section at bottom

#### Related Pages
- `/docs/governance/evidence-baseline.md` - Evidence baseline governance
- `/docs/evaluation/governance/` - Evaluation governance docs
- `/docs/guides/evaluation-guide.md` - Evaluation guide

### External Link Patterns

**Found 12 instances of relative GitHub links**

**Standard Pattern** (Markdown):
```markdown
- [External Reference](https://example.com){:target="_blank" rel="noopener"}
```

OR (MDX):
```jsx
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Reference
</a>
```

### Governance Constraints

**Metadata Requirements**:
- Every doc has `authority: Documentation Governance`
- Non-normative vs normative distinction clear
- Evaluation/conformance language careful (not certification)

**Observed Patterns**:
- "Non-normative guidance" explicitly stated
- External references clearly marked
- No MUST/SHALL in non-normative docs

---

## Recommended Implementation

### W1: Website Link Addition

**Target File**: `app/governance/evidence-chain/page.tsx`

**Placement**: Add new section before closing `</div>` of main content

**Code Pattern**:
```typescript
{/* External Resources */}
<section className="mt-12 pt-8 border-t border-gray-200">
  <h2 className="text-2xl font-semibold text-mplp-text mb-4">
    External Resources
  </h2>
  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
    <h3 className="font-semibold text-lg mb-2">
      <a 
        href="https://lab.mplp.io" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Validation Lab →
      </a>
    </h3>
    <p className="text-sm text-gray-700">
      Evidence-based verdict viewing and export; not a certification 
      program and does not host execution.
    </p>
  </div>
</section>
```

**Why This Location**:
- Semantically aligned (Evidence Chain → Evidence viewing)
- Not elevated to top-nav (avoids "official platform" perception)
- Discoverable by governance-focused visitors
- Consistent with page's existing structure

**Verification Steps**:
1. `npm run build` (or `pnpm build`)
2. Check for TypeScript errors
3. Grep check: `rg -n "certification|certified|badge|ranking" app/governance/evidence-chain/`
4. Visual check: Ensure boundary statement present

---

### D1: Docs Link Addition

**Target File**: `docs/evaluation/conformance/index.mdx`

**Placement**: Add to "See Also" or create "External References" section at bottom

**Code Pattern** (MDX):
```markdown
## External References

<div class="alert alert--info">

**[Validation Lab](https://lab.mplp.io){:target="_blank" rel="noopener"}** (External Reference)

External reference (non-normative): evidence viewing/export site.

</div>
```

OR (if using JSX in MDX):
```jsx
## External References

:::info External Reference (Non-Normative)

**Validation Lab** — Evidence viewing and export site

<a href="https://lab.mplp.io" target="_blank" rel="noopener noreferrer">
  Visit Validation Lab →
</a>

:::
```

**Why This Location**:
- Aligns with conformance/evaluation context
- Marked as "External Reference" and "Non-Normative"
- Doesn't integrate into protocol specification
- Consistent with Docusaurus alert/info boxes

**Verification Steps**:
1. `npm run build` or `pnpm build`
2. Check for build errors
3. Grep check: `rg -n "MUST|SHALL|REQUIRED" docs/evaluation/conformance/index.mdx`
4. Verify frontmatter unchanged (no new JSON-LD)

---

## Forbidden Terms Checklist

**Before committing either site**, run:

### Website
```bash
rg -n "certification|certified|badge|ranking|score|upload your agent|we execute|host execution" app/governance/evidence-chain/
```
**Expected**: 0 new matches (existing frozen uses may appear elsewhere)

### Docs
```bash
rg -n "\b(MUST|SHALL|REQUIRED)\b" docs/evaluation/conformance/index.mdx
```
**Expected**: 0 matches (doc is non-normative)

---

## Build Commands

### Website
```bash
cd /Users/jasonwang/Documents/AI_Dev/V1.0_release/MPLP_website
npm run build
# or: pnpm build
```

### Docs
```bash
cd /Users/jasonwang/Documents/AI_Dev/V1.0_release/docs
npm run build
# or: pnpm build
```

---

## Governance Compliance Summary

### Website Constraints ✅
- No new JSON-LD entities (site already has structured data)
- Boundary statement required ("not certification... does not host execution")
- External link pattern followed (target="_blank" + rel="noopener noreferrer")
- Placement in governance context (not top-nav marketing)

### Docs Constraints ✅
- Marked as "External Reference (Non-Normative)"
- No MUST/SHALL/REQUIRED normative language
- No modification to protocol specification
- Frontmatter authority unchanged
- Clear external/non-normative boundary

---

## Risk Assessment

### Low Risk ✅
- Both placements in governance/evaluation context (semantically aligned)
- Boundary statements prevent misinterpretation
- No elevation to primary navigation
- External reference clearly marked

### Mitigations
- Single sentence boundary (no explanation expansion)
- "Not certification" explicit
- "Does not host execution" explicit
- Non-normative explicitly stated (Docs)

---

## Next Steps

1. **Implement W1** (Website):
   - Edit `app/governance/evidence-chain/page.tsx`
   - Add External Resources section with Lab link
   - Run build + verification
   - Commit: `chore(phase-5): Add website link-only entry to Validation Lab (no semantic expansion)`

2. **Implement D1** (Docs):
   - Edit `docs/evaluation/conformance/index.mdx`
   - Add External References section with Lab link  
   - Run build + verification
   - Commit: `chore(phase-5): Add docs external reference link to Validation Lab (non-normative)`

3. **Create Phase 5 Seal**:
   - Document W1 + D1 commit SHAs
   - Record placement locations
   - Capture boundary statement text
   - Log build verification results

---

## Conclusion

**Website Recommendation**: Add to `/app/governance/evidence-chain/page.tsx` (Option B - Evidence Chain page)

**Docs Recommendation**: Add to `/docs/evaluation/conformance/index.mdx` (Option B - Evaluation context)

**Both placements**:
- ✅ Semantically aligned with Lab's purpose
- ✅ Follow existing link patterns
- ✅ Respect governance boundaries
- ✅ Minimize semantic expansion risk
- ✅ Maintain discoverability

Ready for execution with clear implementation paths and verification steps.
