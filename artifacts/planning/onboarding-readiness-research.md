# Fourth Entry Onboarding Readiness Research

## 0. Unified Vocabulary Baseline (Cross-Site Consistency)

Before any page changes, these terms MUST be identical across all 4 sites:

| Term | Canonical Form | Usage |
|:---|:---|:---|
| **Lab Definition** | Evidence Verdict Gateway / Evidence & Conformance Laboratory | Title/Hero |
| **Red Line 1** | Non-certifying / Non-endorsement | Boundary statement |
| **Red Line 2** | Non-normative | Boundary statement |
| **Red Line 3** | No execution hosting | Boundary statement |
| **Strength Rule** | Narrative strength = ruleset strength | Strength Policy |
| **Authority Chain** | Repo → Docs → Website → Lab | Authority Map |

### Current State Audit

| Site | Red Lines Present | Authority Map | Notes |
|:---|:---:|:---:|:---|
| **Lab Home** | ✅ 3/3 | ❌ Missing | Only footer statement |
| **Lab About** | ✅ 4/4 (Four Boundaries) | ❌ Missing | Complete but no cross-links |
| **Lab Guarantees** | ✅ 3 lines | ❌ Missing | Has ruleset strength block |
| **Lab Contract** | ✅ via disclaimer | ✅ Present | Links to all 4 entries |
| **Lab Strength** | ✅ Anti-drift rule | ✅ Present | Links to all 4 entries |
| **Website /validation-lab** | ✅ 3/3 | ✅ Present | Complete |
| **Docs Home** | ❌ No Lab mention | ❌ N/A | No Lab reference |

---

## 1. Index Surface Map (What Should Be Indexed)

### Website (Discovery Entry)

| Page | Should Index | Rationale |
|:---|:---:|:---|
| `/validation-lab` | ✅ YES | Discovery entry to Lab |
| All other pages | Per FREEZE | Follow existing policy |

**Current State**: `/validation-lab` in sitemap.ts (priority 0.88) ✅

---

### Docs (Specification Entry)

| Page | Should Index | Rationale |
|:---|:---:|:---|
| All spec pages | ✅ YES | Per existing policy |
| No Lab content | N/A | Docs doesn't host Lab content |

**Required Change**: Add Lab link to navbar/footer (external link only)

---

### Lab (Evidence Entry)

| Page | Should Index | Rationale |
|:---|:---:|:---|
| `/` | ✅ YES | Main entry |
| `/about` | ✅ YES | Governance statement |
| `/guarantees` | ✅ YES | GF overview |
| `/policies/contract` | ✅ YES | Governance anchor |
| `/policies/strength` | ✅ YES | Governance anchor |
| `/rulesets` | ✅ YES | Ruleset registry |
| `/rulesets/[version]` | ⚠️ MAYBE | Only if stable |
| `/builder` | ✅ YES | Builder guide |
| `/runs` | ❌ NO | Index page of evidence |
| `/runs/[run_id]` | ❌ NO (curated exception) | Evidence content |
| `/runs/[run_id]/evidence` | ❌ NO | Raw evidence |

**Current State**:
- `/runs/*` has curation-based noindex ✅
- `/runs/*/evidence` has forced noindex ✅
- Static pages have NO explicit robots metadata ⚠️

**Gap**: Static pages rely on default (index,follow) - need explicit confirmation

---

### Repo (Truth Source)

| Content | Should Index | Rationale |
|:---|:---:|:---|
| GitHub renders | ✅ YES | GitHub controls |
| schemas/ | ✅ YES | Source of truth |

**No action required** - Repo indexing controlled by GitHub

---

## 2. Canonical/Sitemap/Robots Audit

### Website

| Check | Status | Evidence |
|:---|:---:|:---|
| `/validation-lab` in sitemap | ✅ | `sitemap.ts` L21, priority 0.88 |
| canonical tag | ✅ | metadata.alternates.canonical in page.tsx |
| robots.txt allows | ✅ | `robots.ts` allows "/" |

---

### Docs

| Check | Status | Evidence |
|:---|:---:|:---|
| sitemap.xml exists | ✅ | docusaurus.config.ts L56-60 |
| Lab link exists | ❌ | No navbar/footer link to Lab |

---

### Lab

| Check | Status | Evidence |
|:---|:---:|:---|
| sitemap.xml exists | ❌ | No sitemap file found |
| robots.txt exists | ❌ | No robots file found |
| Page-level robots | ⚠️ PARTIAL | Only runs/* has metadata |

**Gaps to Fix**:
1. Add `app/sitemap.ts` for indexable pages
2. Add `app/robots.ts` to disallow `/runs/*` explicitly
3. Add metadata to static pages (`/`, `/about`, `/guarantees`, etc.)

---

## 3. Cross-Site Link Governance

### Website → Lab Links

| Source | Target | Type | Status |
|:---|:---|:---|:---:|
| `/validation-lab` CTA | `lab.mplp.io` | External | ⚠️ Uses hardcoded URL |
| Footer | `/validation-lab` | Internal | ✅ |

**Required**: Create `LAB_URLS` constant in site-config.ts

---

### Docs → Lab Links

| Source | Target | Status |
|:---|:---|:---:|
| Navbar | lab.mplp.io | ❌ Missing |
| Footer Protocol column | lab.mplp.io | ❌ Missing |

**Required**: Add to docusaurus.config.ts navbar + footer

---

### Lab → Website/Docs Links

| Source | Target | Status |
|:---|:---|:---:|
| Nav.tsx | Website | ❌ Missing |
| Nav.tsx | Docs | ❌ Missing |
| Contract/Strength pages | All 4 entries | ✅ Present |

**Required**: Add Protocol/Docs backlinks to Nav.tsx

---

## 4. Implementation Priorities (Ordered)

### P0: Index Surface Fixes (Lab)

1. **Add `app/robots.ts`** - Explicit Disallow for `/runs/*`
2. **Add `app/sitemap.ts`** - List indexable pages only
3. **Add metadata to static pages** - Explicit robots: index,follow

### P1: Cross-Site Link Constants

1. **Website**: Add `LAB_URLS` to site-config.ts
2. **Website**: Replace hardcoded labUrl with LAB_URLS
3. **Lab**: Add backlinks to Nav.tsx

### P2: Docs Integration

1. **docusaurus.config.ts**: Add navbar link
2. **docusaurus.config.ts**: Add footer link

### P3: Governance Documentation

1. **ROUTING_TABLE v2.0**: Add Lab as 4th entry
2. **Lab**: Add Authority Map to Home page

---

## 5. Open Questions (Require User Decision)

1. **Lab Domain**: Use `lab.mplp.io` or temporary cloudflare URL?
   - If DNS not ready: Use placeholder with "Preview" badge
   - If DNS ready: Point all links to stable domain immediately

2. **Curated Runs Allowlist**: Which runs should be indexed?
   - Current: `sample-pass` in curation.yaml
   - Recommendation: Keep minimal for v1.0

3. **Static Page Metadata**: Should Lab static pages have JSON-LD?
   - Recommendation: NO - keep minimal WebPage metadata only
