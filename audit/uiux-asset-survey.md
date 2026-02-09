# UI/UX Asset Survey — Auditable Evidence

> **Generated**: 2026-02-02T15:52:02+08:00  
> **Scope**: Complete Validation Lab repository asset inventory  
> **Purpose**: Establish authoritative sources before any remediation

---

## 1. Design System Assets

### 1.1 `app/globals.css` — MPLP Premium Design System v1.1

| Asset | Definition | Status |
|-------|------------|--------|
| `--mplp-blue` | `hsl(220 90% 55%)` | ✅ EXISTS |
| `--mplp-dark` | `hsl(222 47% 3%)` | ✅ EXISTS |
| `--mplp-dark-soft` | `hsl(222 47% 7%)` | ✅ EXISTS |
| `--mplp-border` | `hsl(217 33% 15%)` | ✅ EXISTS |
| `--mplp-text` | `hsl(210 40% 98%)` | ✅ EXISTS |
| `--mplp-text-muted` | `hsl(215 20% 65%)` | ✅ EXISTS |
| `bg-glass` | Glassmorphism utility (lines 110-121) | ✅ EXISTS |
| `bg-mesh` | Radial gradient spots (lines 123-129) | ✅ EXISTS |
| `bg-grid` | Dotted grid pattern (lines 131-134) | ✅ EXISTS |
| `mplp-card` | Card base (lines 136-141) | ✅ EXISTS |
| `mplp-card-hover` | Card hover glow (lines 143-149) | ✅ EXISTS |
| `.text-gradient` | Text gradient (lines 95-100) | ✅ EXISTS |

### 1.2 `tailwind.config.ts` — Theme Extensions

| Token | Value | Status |
|-------|-------|--------|
| `rounded-2xl` | `1rem` | ✅ Standard for main containers |
| `rounded-xl` | `0.75rem` | ✅ For sub-elements |
| `shadow-glow` | Blue glow | ✅ EXISTS |
| Font: Inter | `--font-inter` | ✅ EXISTS |
| Font: JetBrains Mono | `--font-jetbrains-mono` | ✅ EXISTS |

---

## 2. Component Library Inventory

### 2.1 `components/ui/` — Core UI Primitives

| File | Purpose | Key Exports |
|------|---------|-------------|
| `icons.tsx` (11KB) | SVG icons with gradients | `SvgDefs`, `IconPackage`, `IconScroll`, etc. |
| `logo.tsx` (977B) | Brand logo | `Logo` |
| `hash-display.tsx` (1.7KB) | Hash formatting | `HashDisplay` |
| `run-status-badge.tsx` (979B) | Run status pills | `RunStatusBadge` |

### 2.2 `components/common/` — Shared Components

| File | Purpose | Key Exports |
|------|---------|-------------|
| `SemanticStatusBadge.tsx` (1.7KB) | PASS/FAIL badges | `SemanticStatusBadge` |
| `DisclaimerBox.tsx` (4.7KB) | Governance disclaimers | `DisclaimerBox` |
| `VersionBadge.tsx` (2.4KB) | Version display | `VersionBadge`, `VersionText` |
| `SmartLink.tsx` (1.2KB) | Internal/external links | `SmartLink` |
| `BoundText.tsx` (741B) | Bound text display | `BoundText` |

### 2.3 `components/ssot/` — SSOT-Connected

| File | Purpose | Key Exports |
|------|---------|-------------|
| `LabStatusBadge.tsx` (1.2KB) | Lab operational status | `LabStatusBadge` |
| `GateSummaryPill.tsx` (1.3KB) | Gate summary | `GateSummaryPill` |
| `FeaturedRunLink.tsx` (740B) | Featured run link | `FeaturedRunLink` |

### 2.4 `components/layout/` — Layout

| File | Purpose | Key Exports |
|------|---------|-------------|
| `Footer.tsx` (10.9KB) | Site footer | `Footer` |
| `non-endorsement-banner.tsx` (1.5KB) | Top banner | `NonEndorsementBanner` |

### 2.5 Root Components

| File | Purpose | Key Exports |
|------|---------|-------------|
| `Nav.tsx` (4.9KB) | Main navigation | `Nav` |
| `VersionStrip.tsx` (2.7KB) | Top info strip | `VersionStrip` |
| `GovernanceBanner.tsx` (729B) | Governance notice | `GovernanceBanner` |

---

## 3. Reference Page Patterns (UI SSOT)

### Recommended Reference: `app/page.tsx` (homepage)

```tsx
// Card Pattern (lines 169-185):
<Link href="/validation" className="group block p-6 rounded-2xl border border-mplp-blue-soft/30 bg-mplp-dark-soft/40 hover:border-mplp-blue-soft/50 transition-all">
    <h3 className="text-sm font-bold text-mplp-text uppercase tracking-widest mb-3 group-hover:text-mplp-blue-soft transition-colors">Validation Hub</h3>
    <p className="text-xs text-mplp-text-muted leading-relaxed">...</p>
</Link>
```

### Secondary Reference: `app/runs/page.tsx`

```tsx
// Stats Card Pattern (lines 141-157):
<div className="bg-glass rounded-xl p-4 border border-mplp-border/30">
    <div className="text-2xl font-bold text-mplp-text">{data.metadata.total}</div>
    <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Total Runs</div>
</div>
```

---

## 4. Loader & API Analysis

### 4.1 `lib/rulesets/loadRuleset.ts` — CRITICAL

**Lines 132-246**: `loadRuleset()` function

**Issue Found**: NO fail-closed handling. If YAML parse fails or file is missing, function throws exception → **502 in edge environment**.

```typescript
// Line 203: Throws on parse error without catch
const m = loadYamlStrict<RulesetManifest>(manifestPath);
```

**Dual-Mode Logic** (lines 206-215):
- If `clauses` array exists → `kind='clauses'`
- Else if `golden_flows` exists → `kind='golden_flows'`
- Works correctly for 1.1 (golden_flows) and 1.2 (clauses)

### 4.2 `app/api/releases/[build_id]/[filename]/route.ts`

**Allowlist** (lines 7-14):
```typescript
const ALLOWED_FILES = new Set([
    'seal.md',
    'gate-report.log',
    'audit-report.log',
    'lint-audit.json',
    'manifest.json',
    'build-policy.md'
]);
```

---

## 5. Navigation Analysis

### 5.1 `Nav.tsx` (lines 12-19)

```typescript
const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/runs', label: 'Runs' },
    { href: '/runsets', label: 'Runsets' },  // <-- Single entry
    { href: '/rulesets', label: 'Rulesets' },
    { href: '/governance', label: 'Governance' },
    { href: '/releases', label: 'Releases' },
];
```

**Verdict**: ✅ NO DUPLICATE. Single "Runsets" entry.

### 5.2 `Footer.tsx` (lines 55-59)

```tsx
<Link href="/runsets" className="...">
    Runsets (Collections)  // <-- Labeled differently
</Link>
```

**Verdict**: ✅ NOT A DUPLICATE. Footer uses "(Collections)" suffix for disambiguation.

---

## 6. Data Asset Inventory

### 6.1 `data/rulesets/`

| Directory | Files | Format |
|-----------|-------|--------|
| `ruleset-1.0/` | 6 items | V1 (golden_flows) |
| `ruleset-1.1/` | manifest.yaml + requirements/ | V1 (golden_flows + four_domain_clauses) |
| `ruleset-1.2/` | manifest.yaml + subdirs | V1 (clauses - 12 clauses) |
| `ruleset-1.3/` | 2 items | Unknown |

### 6.2 `public/_data/v2/rulesets/`

| File | Purpose |
|------|---------|
| `index.json` | V2 ruleset index |
| `ruleset-v2.0.0.json` | V2.0.0 bundle |
| `ruleset-v2.0.1.json` | V2.0.1 bundle |

### 6.3 `releases/unified/`

- 20 release directories
- Each has 2-5 files

---

## 7. Root Cause Analysis

### 7.1 Ruleset 502 — **CONFIRMED**

**Cause**: `loadRuleset()` throws on parse error. No outer try-catch protects the page render.

### 7.2 Release Evidence 400 — **PARTIALLY CONFIRMED**

**Cause**: Allowlist may not cover all file types in release dirs.

---

## 8. Remediation Priority

| Priority | Issue | Fix |
|----------|-------|-----|
| **P0** | Ruleset 502 | Add fail-closed error handling |
| **P0** | Release API 400 | Audit allowlist vs actual files |
| **P2** | Nav confusion | Already labeled correctly |
| **P3** | Visual consistency | After P0 fixed |
