# Cross-Vendor Evidence Spine Sprint v0.1 (Final Execution Order)

**Sprint Goal**: 把 MPLP vendor-neutral 主张变成可复现、可引用、可第三方复算的事实证据。

**Status**: GO (可执行) — 包含 P0.7 anti-interrogation patch

---

## Critical Patches (Complete)

| # | Patch | Status | Purpose |
|:---|:---|:---:|:---|
| 1-4 | SSOT Gaps | ✅ | pack_root_hash/proof_hash/contract/preflight |
| 5-7 | Anti-Interrogation | ✅ | claim_level/CLI bundled/canonical hosts |
| **8** | **Scenario-Aware Projection (P0.7)** | ✅ | 防止 curated packs 显示 FAIL |
| **9** | **PF-4 Decision Gate** | ✅ | 冻结 pack 策略 (GF-01-only vs minimal-complete) |
| **10** | **Middleware Enforcement** | ✅ | Canonical host 强制 noindex header |
| **11** | **Repro_ref Constraints** | ✅ | Reproduced claim 可审计约束 |

---

## P0.7: Scenario-Aware Projection (NEW - CRITICAL)

### Problem

如果 v0.1 packs 只包含 GF-01 artifacts，但 ruleset-1.0 评估 GF-02~05 返回 FAIL：
- Curated run 在 Lab UI 显示整体 FAIL
- **破坏 vendor-neutral 证据链可信度**

### Solution: Dual-Layer Verdict Display

**不修改评估语义**，在 UI 增加 Scenario Scope View：

```typescript
// Run detail page显示两层verdict:

1. Scenario Scope Verdict (顶部高亮)
   - scenario_id: "gf-01-single-agent-lifecycle"
   - target_gf: "gf-01"
   - scenario_verdict: PASS (仅基于 GF-01)
   
2. Full Evaluation Report (下方透明呈现)
   - GF-01: PASS
   - GF-02~05: [actual status] + "OUT OF SCOPE for this scenario"
```

**Implementation**:
- Modify `app/runs/[run_id]/page.tsx`
- Add scenario metadata to run manifest or allowlist
- Display logic: if run has scenario_id → show scenario verdict first

---

## PF-4: Preflight Decision Gate (NEW - BLOCKING)

### Purpose

确定 v0.1 pack 策略，避免"边做边改"导致证据不一致。

### Decision Criteria

基于 PF-1 测试结果：

**Option A: GF-01-Only Packs** (if 符合条件)
- Condition: GF-02~05 缺失时返回 NOT_EVALUATED/SKIP，不影响整体可呈现性
- Pack content: context + plan + trace only
- UI: Scenario-Aware Projection 必做

**Option B: Minimal-Complete Packs** (if A 不满足)
- Condition: GF-02~05 缺失导致 overall FAIL 或强失败观感
- Pack content: 按 ruleset-1.0 presence-level 补齐必需文件
- Strength: 仍为 presence-level (不改评估语义)

### Deliverable

**New File**: `governance/preflight/ruleset-1.0-pack-strategy.md`
- 记录选择的策略 (A or B)
- 触发条件与理由
- Pack 内容清单
- UI 展示要求

**Blocking**: PF-4 未冻结 → Phase 3 无法开始

---

## Middleware Enforcement (NEW - RECOMMENDED)

### Problem

仅靠 layout metadata 不足以覆盖所有 route/asset/headers，可能被 preview 域收录。

### Solution

**New File**: `Validation_Lab/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CANONICAL_HOSTS } from './lib/config/canonical-hosts';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // Non-canonical hosts: force noindex
  if (!CANONICAL_HOSTS.some(ch => host.includes(ch))) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }
  
  return NextResponse.next();
}
```

**Acceptance**: Integration test 验证非 canonical host 返回 X-Robots-Tag

---

## Repro_ref Constraints (NEW)

### Problem

`substrate_claim_level: reproduced` 可能变成无审计声明。

### Solution: Repro_ref Content Requirements

当 `substrate_claim_level: reproduced` 时，`repro_ref` 指向的文档必须包含：

1. **Input Prerequisites**
   - Substrate version
   - Dependencies (with versions)
   - Environment requirements

2. **Execution Command**
   - Copy-paste runnable
   - Example: `npx tsx examples/evidence-producers/langchain/generate.ts`

3. **Expected Artifacts**
   - Directory tree output
   - Required files list

4. **Verification Steps**
   - How to verify pack validity
   - Minimum: GATE-07 + GATE-08 + recompute match

**Enforcement**: Document in `examples/evidence-producers/*/README.md` template

---

## Hard Red Lines (Non-Goals)

1. ❌ Lab 不托管执行
2. ❌ Lab 不认证/不背书
3. ❌ UI 不造新语义
4. ❌ 叙事强度 = ruleset 强度 (presence-level only)
5. ❌ 不修改任何 FROZEN artifact
6. ❌ SA/MAP NOT in scope
7. ❌ **GF-02~05 缺失导致整体 FAIL 时，不得发布 GF-01-only packs**

---

## Execution Order (STRICT - for Tool Agent)

### Phase 0.5: Preflight Verification (BLOCKING)

#### PF-1: GF Coverage Test ✅ DONE
- [x] `scripts/preflight/test-gf-coverage.ts`
- [x] Test output: `governance/preflight/test-output.log`

#### PF-2: GF Coverage Report ✅ DONE
- [x] `governance/preflight/ruleset-1.0-gf-coverage.md`

#### PF-3: Canonical Hosts ✅ DONE
- [x] `governance/preflight/canonical-hosts-v0.1.md`

#### PF-4: Pack Strategy Decision (NEW - BLOCKING)
**Task**: 创建测试包验证 GF-01-only 策略可行性

1. Create test pack: `data/runs/test-gf01-only/`
   - Include: `manifest.json`, `integrity/`, `timeline/`, `artifacts/context.json`, `artifacts/plan.json`, `artifacts/trace.json`
   - Exclude: GF-02~05 artifacts

2. Run evaluation: `npx tsx scripts/test-evaluate.ts data/runs/test-gf01-only`

3. Analyze results:
   - GF-01: PASS expected
   - GF-02~05: Check status (FAIL/NOT_EVALUATED/SKIP)
   - Overall: Check if "presentable" or "破坏可信度"

4. Generate **New File**: `governance/preflight/ruleset-1.0-pack-strategy.md`
   ```markdown
   # v0.1 Pack Strategy Decision
   
   ## Selected Strategy
   [A: GF-01-Only | B: Minimal-Complete]
   
   ## Rationale
   [Based on PF-1 + PF-4 test results]
   
   ## Pack Content Requirements
   [Exact file list]
   
   ## UI Requirements
   [Scenario-Aware Projection: YES/NO]
   ```

**Acceptance**:
- [ ] PF-4 report generated
- [ ] Strategy frozen (A or B)
- [ ] No "边做边改" allowed after this point

---

### Phase 1: Truth Sources

#### T1.1 Scenario Registry
**New File**: `data/scenarios/gf-01-spine.yaml`
```yaml
scenario_id: gf-01-single-agent-lifecycle
version: "1.0"
target_gf: gf-01
ruleset_version: ruleset-1.0
strength: presence-level
substrates: [a2a, langchain, mcp]
description: Cross-substrate evidence spine for GF-01 (Single Agent Lifecycle)
```

#### T1.2 Curated Runs Schema
**New File**: `governance/schemas/curated-run.schema.yaml`
```yaml
---
version: "1.0"
required:
  - run_id
  - scenario_id
  - ruleset_version
  - substrate
  - substrate_claim_level  # declared | reproduced
  - repro_ref              # path or URL
  - exporter_version
  - pack_root_hash
  - verdict_hash
  - verify_report_hash
  - evaluation_report_hash
  - status                 # frozen | deprecated
  - indexable
  - created_at

enums:
  substrate_claim_level: [declared, reproduced]
  status: [frozen, deprecated]
```

#### T1.3 GATE-08 Implementation
**New File**: `lib/gates/gate-08-curated-immutability.ts`

Validates:
1. pack_root_hash matches recomputed from sha256sums.txt
2. verdict_hash matches recomputed from evaluation.report.json
3. All report hashes match file contents
4. Allowlist schema completeness
5. scenario_id exists in scenarios registry

---

### Phase 2: Recompute Kit

#### T2.1 Standalone CLI
**New Package**: `packages/recompute/`

**Core Files**:
- `packages/recompute/package.json`
- `packages/recompute/src/index.ts`
- `packages/recompute/src/rulesets/ruleset-1.0.json` (bundled)

**CLI Signature**:
```bash
npx @mplp/recompute <pack_path> --ruleset 1.0
```

**Output**:
```json
{
  "ruleset_source": "bundled",
  "ruleset_version": "1.0",
  "pack_id": "...",
  "verdict_hash": "e11afbd...",
  "match": true,
  "curated_hash": "e11afbd..."
}
```

#### T2.2 Documentation
**New File**: `Validation_Lab/docs/third-party-verification.md`
- Strategy A (bundled) explicitly stated
- No network dependencies
-断网可运行

---

### Phase 3: Evidence Producers + Packs

#### T3.1 Evidence Producer Spec
**New File**: `docs/evidence-producer-spec.md`

**Disclaimers** (REQUIRED):
- NOT official SDKs
- NOT framework endorsement
- Substrate = execution substrate, not verdict authority

#### T3.2 Producer Templates
**New Files** (each with `#repro-steps`):
- `examples/evidence-producers/a2a/README.md`
- `examples/evidence-producers/langchain/README.md`
- `examples/evidence-producers/mcp/README.md`

**Template Requirements** (for reproduced claim):
1. Input Prerequisites (versions)
2. Execution Command (copy-paste)
3. Expected Artifacts (directory tree)
4. Verification Steps (GATE + recompute)

#### T3.3 Contract v1.1 Addendum
**New File**: `governance/contracts/evidence-pack-contract-v1.1.md`

Optional field: `manifest.substrate`
```json
{
  "substrate": {
    "id": "langchain",
    "exporter_version": "0.1.0"
  }
}
```

#### T3.4 Curated Packs (按 PF-4 策略)

**Strategy A (GF-01-Only)**:
- `data/runs/gf-01-a2a-pass/` (GF-01 artifacts only)
- `data/runs/gf-01-langchain-pass/`
- `data/runs/gf-01-mcp-pass/`

**Strategy B (Minimal-Complete)**:
- Include all ruleset-1.0 presence-level required files
- Still strength = presence-level

**Allowlist Entry Example**:
```yaml
- run_id: gf-01-langchain-pass
  scenario_id: gf-01-single-agent-lifecycle
  ruleset_version: ruleset-1.0
  substrate: langchain
  substrate_claim_level: reproduced
  repro_ref: "examples/evidence-producers/langchain/README.md#repro-steps"
  exporter_version: "0.1.0"
  pack_root_hash: "[computed]"
  verdict_hash: "[computed]"
  verify_report_hash: "[computed]"
  evaluation_report_hash: "[computed]"
  status: draft
  indexable: true
  created_at: "2026-01-10T00:00:00Z"
```

---

### Phase 4: Lab Projection Update

#### T4.1 Canonical Host Config
**New File**: `lib/config/canonical-hosts.ts`
```typescript
export const CANONICAL_HOSTS = [
  'lab.mplp.io',
  'localhost',
] as const;

export function isCanonicalHost(host: string): boolean {
  return CANONICAL_HOSTS.some(ch => host.includes(ch));
}
```

#### T4.2 Middleware (RECOMMENDED)
**New File**: `middleware.ts`
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CANONICAL_HOSTS } from './lib/config/canonical-hosts';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  if (!CANONICAL_HOSTS.some(ch => host.includes(ch))) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }
  
  return NextResponse.next();
}
```

#### T4.3 GATE-09 Implementation
**New File**: `lib/gates/gate-09-canonical-host.ts`
- Imports canonical-hosts.ts
- Validates enforcement

#### T4.4 Scenario-Aware Projection (P0.7 - CRITICAL)
**Modify**: `app/runs/[run_id]/page.tsx`

Add dual-layer verdict display:

```tsx
{/* Scenario Scope Verdict (if run has scenario_id) */}
{run.scenario_id && (
  <section className="...">
    <h2>Scenario Scope Verdict</h2>
    <dl>
      <dt>Scenario</dt>
      <dd>{run.scenario_id}</dd>
      <dt>Target GF</dt>
      <dd>{run.target_gf}</dd>
      <dt>Scenario Verdict</dt>
      <dd className={scenarioVerdict === 'PASS' ? 'text-green-400' : 'text-red-400'}>
        {scenarioVerdict}
      </dd>
    </dl>
    <p className="text-zinc-500">
      Other GFs shown below are out of scope for this scenario.
    </p>
  </section>
)}

{/* Full Evaluation Report (透明呈现) */}
<section>
  <h2>Full Evaluation Report</h2>
  {/* existing GF verdicts display */}
</section>
```

**Helper Function**:
```typescript
function computeScenarioVerdict(
  evalReport: EvaluationReport,
  targetGf: string
): 'PASS' | 'FAIL' | 'NOT_EVALUATED' {
  const gf = evalReport.gf_verdicts.find(v => v.gf_id === targetGf);
  return gf?.status || 'NOT_EVALUATED';
}
```

#### T4.5 Spine Evidence Section
**Modify**: `app/page.tsx` - Add Evidence Spine block
**Modify**: `app/guarantees/page.tsx` - Link curated runs

---

### Phase 5: Website/Docs Minimal Mention

#### T5.1 Website
**Modify**: `MPLP_website/app/validation-lab/page.tsx`
- Add 1 paragraph about cross-substrate evidence
- Link to Lab curated spine

#### T5.2 Docs
**Modify**: `docs/docs/evaluation/golden-flows.md`
- Add 1 block: "Evidence → Lab"
- Link only, no content duplication

---

### Phase 6: Final Acceptance

#### T6.1 Verification Checklist
- [ ] Phase 0.5: All preflight reports + PF-4 strategy frozen
- [ ] GATE-03 through GATE-09 all PASS
- [ ] Third-party recompute: `npx @mplp/recompute` matches all 3 curated packs
- [ ] Canonical host: Non-canonical returns X-Robots-Tag noindex
- [ ] Scenario-Aware Projection: UI shows dual-layer verdict
- [ ] No FROZEN artifacts modified (git diff proof)
- [ ] All UI text: presence-level only
- [ ] Website/Docs: link only, no content hosting

#### T6.2 Release Note
**New File**: `RELEASE_SPINE_v0.1.md`

Required sections:
- v0.1 Scope (GF-01 spine based on PF-4 strategy)
- Strength: presence-level
- SA/MAP: "may be evaluated only under a future versioned ruleset"
- Curated runs list (with claim_level + repro_ref)
- Recompute command
- Non-certification statement

---

## Path Boundary Summary (Updated)

### New Paths (22)
| Path | Purpose |
|:---|:---|
| `governance/preflight/ruleset-1.0-gf-coverage.md` | ✅ Preflight GF report |
| `governance/preflight/canonical-hosts-v0.1.md` | ✅ Canonical hosts |
| `governance/preflight/test-output.log` | ✅ Test output |
| `governance/preflight/ruleset-1.0-pack-strategy.md` | ⬜ PF-4 strategy decision |
| `scripts/preflight/test-gf-coverage.ts` | ✅ Preflight script |
| `data/scenarios/gf-01-spine.yaml` | ⬜ Scenario registry |
| `governance/schemas/curated-run.schema.yaml` | ⬜ Curated schema |
| `governance/contracts/evidence-pack-contract-v1.1.md` | ⬜ Contract addendum |
| `lib/config/canonical-hosts.ts` | ⬜ Canonical SSOT |
| `lib/gates/gate-08-curated-immutability.ts` | ⬜ Immutability gate |
| `lib/gates/gate-09-canonical-host.ts` | ⬜ Host enforcement |
| `middleware.ts` | ⬜ Canonical enforcement |
| `packages/recompute/` | ⬜ Standalone CLI |
| `docs/evidence-producer-spec.md` | ⬜ Producer spec |
| `examples/evidence-producers/a2a/` | ⬜ A2A template |
| `examples/evidence-producers/langchain/` | ⬜ LangChain template |
| `examples/evidence-producers/mcp/` | ⬜ MCP template |
| `data/runs/gf-01-a2a-pass/` | ⬜ Curated pack |
| `data/runs/gf-01-langchain-pass/` | ⬜ Curated pack |
| `data/runs/gf-01-mcp-pass/` | ⬜ Curated pack |
| `Validation_Lab/docs/third-party-verification.md` | ⬜ Recompute doc |
| `RELEASE_SPINE_v0.1.md` | ⬜ Release note |

### Modified Paths (6)
| Path | Change |
|:---|:---|
| `data/curated-runs/allowlist.yaml` | Add 3 runs + schema fields |
| `app/runs/[run_id]/page.tsx` | **Scenario-Aware Projection (P0.7)** |
| `app/page.tsx` | Add Spine section |
| `app/guarantees/page.tsx` | Link curated runs |
| `app/layout.tsx` | Canonical host gate |
| `MPLP_website/app/validation-lab/page.tsx` | 1 paragraph |

### NOT Modified (FROZEN)
- ❌ `data/rulesets/ruleset-1.0/manifest.yaml`
- ❌ `app/policies/contract/page.tsx`
- ❌ `app/policies/strength/page.tsx`

---

## Seal Acceptance Criteria (8 + 1)

| # | Criterion | Method |
|:---|:---|:---|
| 1 | Third-party recompute | `npx @mplp/recompute` matches |
| 2 | Cross-substrate packs | 3 packs pass + claim_level |
| 3 | GATE-08/09 PASS | `npm run gates` green |
| 4 | Frozen safety | Git diff = 0 FROZEN |
| 5 | Strength alignment | All text presence-level |
| 6 | Four-entry minimal | Link only |
| 7 | Preflight complete | All reports + PF-4 |
| 8 | CLI bundled | `ruleset_source: bundled` |
| **9** | **Scenario-Aware UI** | **Dual-layer verdict visible** |

---

**Status**: READY FOR EXECUTION  
**Blocking**: PF-4 must complete before Phase 3
