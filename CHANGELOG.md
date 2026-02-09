---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-013"
---

# MPLP Validation Lab — Changelog

All notable changes to the MPLP Validation Lab (lab.mplp.io).

---
 
 ## [v1.0.1+layout] — 2026-02-09
 
 ### 🏗️ Strategy A: Layout Unification (SSOT)
 
 - **Single Source of Truth**: All layout elements (Nav, VersionStrip, Background, 7xl containers) are now exclusively managed by `AppShell.tsx`.
 - **Refactored Pages**: `/runs`, `/runsets`, `/rulesets`, `/releases`, `/policies`, `/coverage` now use raw content only (no nested shells).
 - **Performance**: Reduced DOM depth and eliminated double-rendering of `VersionStrip`.
 
 ### 🔍 SEO & Audit Remediation
 
 - **Navigation Audit**: Confirmed < 3-click depth for all content.
 - **Crawler Logic**: Validated `sitemap.xml` (added `/governance`) and `robots.txt`.
 - **Terminology**: Unified "Pending" -> "NOT EVALUATED" to clarify ruleset scope.
 - **Utilities**: Added direct audit links to Governance Hub.
 
 ---

## [perf-v1.0] — 2026-01-21

### 🚀 Comprehensive Performance Configuration

#### Performance
- Added full `next.config.ts` with image optimization (avif/webp)
- Added security headers (HSTS, X-Frame-Options, CSP)
- Added Cache-Control headers for static assets (1yr immutable)
- Enabled `compiler.removeConsole` in production
- Added `experimental.optimizePackageImports` for lucide-react

#### UI Components
- Updated Nav/Footer for four-entry ecosystem
- Added VerdictHashPill component

#### Run Packs
- Added v0.4 arbitration run packs with evidence pointers
- Added evaluation and verify reports for all runs
- Added curated run scenarios for D1-D4 duties

#### Build
- First Load JS: ~102kB
- 27 run pages

---

## [v0.3-launch] — 2026-01-17

### 🎯 Initial Public Launch

- GoldenFlow packs with curated runs
- Ruleset-1.0 adjudicator integration
- Replay page for evidence viewing
- Non-certification disclaimer banner
