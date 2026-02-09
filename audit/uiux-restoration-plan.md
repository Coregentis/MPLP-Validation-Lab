# UI/UX Restoration Plan — Prioritized Execution Order

> **Generated**: 2026-02-02T15:52:02+08:00  
> **Prerequisite**: `audit/uiux-asset-survey.md` (asset evidence)  
> **Strategy**: Fix functional regressions first (502/400), then IA, then visual

---

## Execution Order

| Phase | Issue | Priority | Impact |
|-------|-------|----------|--------|
| **R1** | Ruleset Detail 502 | P0 | Core entity unreadable |
| **R2** | Release Evidence API 400 | P0 | Audit chain broken |
| **R3** | Navigation IA Clarity | P2 | User confusion |
| **R4** | Visual Consistency | P3 | Aesthetic |

---

## R1 — Ruleset 502 Recovery (P0)

### Root Cause

`lib/rulesets/loadRuleset.ts` line 203 calls `loadYamlStrict()` which throws on parse error. No fail-closed handling → page crashes → 502.

### Fix Strategy

1. **Wrap loader in try-catch** at page level
2. **Render error card** instead of crashing
3. **Add gate** to prevent regression

### Implementation

#### [MODIFY] `app/rulesets/[ruleset_id]/page.tsx`

Add fail-closed error handling:

```tsx
// After line 27
let loadError: string | null = null;
try {
    ruleset = getRuleset(ruleset_id);
} catch (e) {
    loadError = `Failed to load ruleset: ${e instanceof Error ? e.message : 'Unknown error'}`;
}

if (loadError) {
    return (
        <main className="min-h-screen bg-mplp-dark text-mplp-text">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">Ruleset Load Error</h1>
                    <p className="text-mplp-text-muted mb-4">{loadError}</p>
                    <p className="font-mono text-sm text-mplp-text-muted">ID: {ruleset_id}</p>
                    <Link href="/rulesets" className="text-mplp-blue-soft hover:underline mt-4 block">
                        ← Back to Rulesets
                    </Link>
                </div>
            </div>
        </main>
    );
}
```

#### [NEW] `scripts/gates/unified/gate-unified-ruleset-detail-no-502-01.ts`

```typescript
// Gate: Verify all ruleset detail pages return 200
const RULESETS = ['ruleset-1.0', 'ruleset-1.1', 'ruleset-1.2', 'ruleset-1.3'];
// For each: GET /rulesets/{id} → assert status !== 5xx
```

---

## R2 — Release Evidence API 400 Closure (P0)

### Root Cause

1. Allowlist may not cover all files in release dirs
2. Edge environment path handling may differ

### Fix Strategy

1. **Audit allowlist** against actual files in `releases/unified/`
2. **Add missing file types** to allowlist
3. **Return structured error JSON** for debugging

### Implementation

#### [MODIFY] `app/api/releases/[build_id]/[filename]/route.ts`

1. Expand allowlist based on actual release contents
2. Return JSON error body for 400/403/404

```typescript
// Update ALLOWED_FILES based on audit
const ALLOWED_FILES = new Set([
    'seal.md',
    'gate-report.log',
    'audit-report.log',
    'lint-audit.json',
    'manifest.json',
    'build-policy.md',
    // Add any missing file types found in releases/unified/
]);

// Return JSON errors
return NextResponse.json({ 
    error: 'File not in allowlist', 
    requested: filename,
    allowed: Array.from(ALLOWED_FILES)
}, { status: 403 });
```

#### [NEW] `scripts/gates/unified/gate-unified-release-evidence-200-01.ts`

```typescript
// Gate: For latest release, verify all evidence links return 200
// Probe: GET /api/releases/{build_id}/{file} for each file in allowlist
```

---

## R3 — Navigation IA Clarification (P2)

### Status

**NO CODE CHANGE NEEDED**.

- `Nav.tsx`: Single "Runsets" entry
- `Footer.tsx`: Uses "Runsets (Collections)" — intentional disambiguation

### Verification

Visual confirmation on preview site that:
- Top nav shows: Home | Runs | Runsets | Rulesets | Governance | Releases
- Footer shows: Runsets (Collections) under Governance section

---

## R4 — Visual Consistency (P3)

### When

Only after R1 and R2 pass.

### Scope

1. Remove "Action Panel" from `app/runsets/[runset_id]/page.tsx` (already done)
2. Standardize `rounded-xl` → `rounded-2xl` where appropriate
3. Use `text-gradient` class instead of inline gradients

### Gate (Optional)

`gate-unified-ui-design-token-01.ts`: Scan for non-token colors in main containers.

---

## Deliverables

| File | Type | Status |
|------|------|--------|
| `audit/uiux-asset-survey.md` | Audit | ✅ Created |
| `audit/uiux-restoration-plan.md` | Plan | ✅ This file |
| `app/rulesets/[ruleset_id]/page.tsx` | Fix R1 | 🔲 Pending |
| `app/api/releases/.../route.ts` | Fix R2 | 🔲 Pending |
| Gate: `gate-unified-ruleset-detail-no-502-01.ts` | R1 | 🔲 Pending |
| Gate: `gate-unified-release-evidence-200-01.ts` | R2 | 🔲 Pending |

---

## Verification

After all changes:

```bash
# Build verification
npm run build

# Run new gates
npx ts-node scripts/gates/unified/gate-unified-ruleset-detail-no-502-01.ts
npx ts-node scripts/gates/unified/gate-unified-release-evidence-200-01.ts

# Deploy preview
npm run start
cloudflared tunnel --url http://localhost:3000
```
