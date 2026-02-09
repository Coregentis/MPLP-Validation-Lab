# Validation Lab Navigation & Sitemap Audit

## 1. Executive Summary
- **Overall Status**: Healthy 🟢
- **Link Integrity**: 100% Pass (739 links checked, 0 broken)
- **Navigation Structure**: Clear hierarchy (Home -> Hubs -> Details)
- **Sitemap**: Static and Incomplete (Missing dynamic run/ruleset pages)

## 2. Navigation Topology
The application follows a strict hierarchical flow:
1.  **Level 0 (Root)**: Landing Page (`/`)
2.  **Level 1 (Hubs)**:
    - Evidence Hub (`/runs`)
    - Ruleset Hub (`/rulesets`)
    - Validation Hub (`/validation`)
    - Release Hub (`/releases`)
3.  **Level 2 (Details)**:
    - Run Details (`/runs/[id]`)
    - Ruleset Details (`/rulesets/[id]`)
    - Diff Views (`/rulesets/evolution/diff/[id]`)

## 3. Link Integrity Audit
Executed `npm run audit:links` on production build.
- **Scanned**: 739 internal links
- **Broken**: 0
- **Redirects**: 0 unexpected
- **External**: Checked for format, not reachability (standard policy)

## 4. Functionality & Logic
- **"Start Here"** -> Correctly leads to `/runsets` for onboarding.
- **"Audit Trail"** -> Correctly leads to `/releases` for seal verification.
- **Cross-Verified** -> Correctly links to policy page `/policies/cross-verified`.

## 5. Sitemap Analysis
- **Current State**: Static list of ~20 pages.
- **Missing**:
    - All Curated Runs (~50+ pages)
    - All Ruleset Versions (active/deprecated)
    - All Release Tags
- **Risk**: SEO visibility for specific evidence packs is low.

## 6. Recommendations (Revised)
1.  **Indexability-aware Sitemap**: 
    -   **Hubs**: All core hubs and governance pages.
    -   **Releases**: Only SEALED/RC builds.
    -   **Rulesets**: Stable versions only.
    -   **Runs**: Top 50 "Reproduced/Dispute Ready" runs only.
    -   **Exclusions**: No diffs, evidence files, or simulations.
2.  **Gates**: Add `GATE-SITEMAP-CANONICAL-HOST-01` and `GATE-SITEMAP-INDEXABILITY-01`.
3.  **Host**: Enforce `https://lab.mplp.io` as canonical.
