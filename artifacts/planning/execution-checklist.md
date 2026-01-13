# Cross-Vendor Evidence Spine Sprint v0.1 — Execution Checklist

**Repository**: MPLP-Validation-Lab  
**Sprint Goal**: 把 MPLP vendor-neutral 主张变成可复现、可引用、可第三方复算的事实证据  
**Status**: READY FOR EXECUTION  
**Absolute Red Lines**: 不得修改任何 FROZEN artifact (ruleset-1.0 / contract v1.0 / strength / website anchors)

---

## Critical Implementation Constraints (MUST ENFORCE)

### Constraint 1: Scenario Metadata Ownership
**RULE**: Evidence pack (contract v1.0 container) 不承载 `scenario_id` / `target_gf`

- ✅ scenario_id / target_gf / claim_level / repro_ref → **只属于 curated allowlist**
- ❌ 不得写入 pack manifest.json (避免触碰 frozen contract)

### Constraint 2: PF-4 Test Pack Structure
**RULE**: PF-4 pack 必须完全遵循 contract v1.0 目录结构

- ✅ `manifest.json + integrity/ + timeline/ + artifacts/` 全套
- ❌ 不得偷懒只放 artifacts

### Constraint 3: Canonical Host Normalization
**RULE**: Canonical host 判断必须规范化 host (去 port) 并允许 127.0.0.1

```typescript
// REQUIRED normalization:
const normalizedHost = host.split(':')[0].toLowerCase();
const CANONICAL_HOSTS = ['lab.mplp.io', 'localhost', '127.0.0.1'];
```

- `lab.mplp.io` → production only
- `localhost` / `127.0.0.1` → dev only (标注在 preflight record)

### Constraint 4: Recompute Distribution Strategy
**RULE**: `npx @mplp/recompute` 隐含发布/分发策略

Phase 6 must include:
- Version strategy (e.g., 0.1.0)
- Pre-publish check (bin entry, license, bundled ruleset)
- OR: document as "repo-external via npm pack artifact" (if not publishing to npm)

### Constraint 5: GATE-08 Repro_ref Machine-Checkable Rules
**RULE**: When `substrate_claim_level: reproduced`:

1. `repro_ref` 必填
2. `repro_ref` 指向文件必须存在 (repo-relative path)
3. `repro_ref` 必须包含 `#repro-steps` anchor
4. README 至少包含 4 个标题 (string check): `Prerequisites`, `Execution`, `Expected Artifacts`, `Verification`

### Constraint 6: P0.7 UI Wording
**RULE**: Scenario-Aware Projection 必须防止"偷换裁决主体"

Page must state:
> "Scenario Scope Verdict is a filtered view of the Full Evaluation, not a substitute verdict."

- Full Evaluation Report 始终展示且可下载 proof/evidence

---

## 0) Pre-Execution: Frozen & Baseline Check (GATE-00 Manual)

- [ ] **Confirm current branch & baseline commit**
  ```bash
  git status
  git rev-parse --abbrev-ref HEAD
  git log -1 --oneline
  ```
  Expected: Clean working directory or only Sprint changes

- [ ] **Confirm FROZEN file list (read-only)**
  ```bash
  # Must NOT appear in git diff later:
  ls -la data/rulesets/ruleset-1.0/
  ls -la app/policies/contract/
  ls -la app/policies/strength/
  ```

---

## Phase 0.5) Preflight (PF-4: Pack Strategy Decision) — BLOCKING

> PF-1/2/3 complete. Only PF-4 remains.

### PF-4.1 Generate GF-01-only test pack (contract v1.0 complete structure)

- [ ] **Create test pack directory**
  ```bash
  mkdir -p data/runs/test-gf01-only/{artifacts,integrity,timeline}
  ```
  
  **Deliverable**: `data/runs/test-gf01-only/`
  - `manifest.json`
  - `integrity/sha256sums.txt`
  - `timeline/events.ndjson`
  - `artifacts/context.json`
  - `artifacts/plan.json`
  - `artifacts/trace.json`

  Expected: Directory structure fully compliant with contract v1.0

### PF-4.2 Run evaluation and record GF-02~05 behavior

- [ ] **Run evaluation**
  ```bash
  npx tsx scripts/test-evaluate.ts data/runs/test-gf01-only
  ```
  
  Expected output (must record in report):
  - GF-01 status (expected PASS)
  - GF-02~05 actual status (FAIL / NOT_EVALUATED / SKIP)
  - Overall presentation: does it cause "curated run looks like overall FAIL"?

### PF-4.3 Freeze pack strategy (A or B) and document

- [ ] **Generate PF-4 decision file (BLOCKING)**
  
  **Deliverable**: `governance/preflight/ruleset-1.0-pack-strategy.md`
  
  Must contain:
  - Selected Strategy: A (GF-01-only) or B (Minimal-Complete)
  - Rationale (citing PF-4.2 output)
  - Pack file manifest (line by line)
  - UI requirement: Scenario-Aware Projection mandatory (usually yes)

- [ ] **Blocking rule**
  
  If PF-4 incomplete: **BLOCK Phase 3 (curated packs)**

---

## Phase 1) Truth Sources (Scenario Registry + Curated Schema + GATE-08)

### T1.1 Scenario Registry (only references ruleset, no reverse modification)

- [ ] **Add Scenario Registry**
  
  **Deliverable**: `data/scenarios/gf-01-spine.yaml`
  
  Required fields:
  ```yaml
  scenario_id: gf-01-single-agent-lifecycle
  version: "1.0"
  target_gf: gf-01
  ruleset_version: ruleset-1.0
  strength: presence-level
  substrates: [a2a, langchain, mcp]
  description: "Cross-substrate evidence spine for GF-01"
  ```
  
  Expected: File exists, `data/rulesets/ruleset-1.0/**` NOT modified

### T1.2 Curated Runs Schema (with anti-interrogation fields)

- [ ] **Add curated schema**
  
  **Deliverable**: `governance/schemas/curated-run.schema.yaml`
  
  Required fields:
  - `scenario_id`, `substrate`, `substrate_claim_level`, `repro_ref`
  - `pack_root_hash`, `verdict_hash`, `verify_report_hash`, `evaluation_report_hash`
  - `created_at`, `indexable`, `status`
  
  Constraints:
  - `substrate_claim_level ∈ {declared, reproduced}`
  - `status ∈ {frozen, deprecated}`

### T1.3 Implement GATE-08 (immutability + schema completeness)

- [ ] **Add gate implementation**
  
  **Deliverable**: `lib/gates/gate-08-curated-immutability.ts`
  
  Must validate:
  1. `pack_root_hash` recomputed per contract v1.0 L185-194 matches
  2. `verdict_hash` recomputed from evaluation.report.json matches
  3. Integrity hashes match file contents
  4. Allowlist entry fields complete (including claim_level + repro_ref)
  5. `scenario_id` exists in `data/scenarios/**`
  6. If `substrate_claim_level=reproduced`:
     - `repro_ref` filled
     - `repro_ref` target file exists
     - `repro_ref` contains `#repro-steps`
     - README contains 4 section headers: Prerequisites / Execution / Expected Artifacts / Verification

- [ ] **Run gate suite**
  ```bash
  pnpm gate:08  # or pnpm gates
  ```
  Expected: GATE-08 PASS (empty set PASS acceptable if no curated entries yet)

---

## Phase 2) Recompute Kit (Repo-external, Bundled ruleset-1.0)

### T2.1 Add standalone package packages/recompute (no monorepo imports)

- [ ] **Create recompute package structure**
  
  **Deliverables**:
  - `packages/recompute/package.json` (with bin)
  - `packages/recompute/src/index.ts`
  - `packages/recompute/src/rulesets/ruleset-1.0.json` (bundled)
  - `packages/recompute/README.md`

- [ ] **CLI behavior frozen to Strategy A (bundled)**
  ```bash
  npx @mplp/recompute <pack_path> --ruleset 1.0
  ```
  
  Expected output (JSON):
  ```json
  {
    "ruleset_source": "bundled",
    "ruleset_version": "1.0",
    "verdict_hash": "<hex>",
    "match": true
  }
  ```

- [ ] **Local verification**
  ```bash
  pnpm -C packages/recompute build
  node packages/recompute/dist/index.js data/runs/sample-pass --ruleset 1.0
  ```
  Expected: Stable, reproducible output

### T2.2 Third-party Verification documentation (Lab owns it)

- [ ] **Add documentation**
  
  **Deliverable**: `Validation_Lab/docs/third-party-verification.md`
  
  Must contain:
  - Explicit: `ruleset_source=bundled` (offline runnable)
  - Input set: pack_path + ruleset version
  - Output: verdict_hash + curated verdict comparison
  - Minimal dependencies: Node.js

- [ ] **Doc commands copy-paste runnable**
  
  Expected: Tool agent can execute per docs and get consistent hash

---

## Phase 3) Evidence Producers + Curated Packs (per PF-4 strategy)

> Order: spec/templates → generate packs → update allowlist → run gates

### T3.1 Evidence Producer Spec (unofficial, non-endorsement)

- [ ] **Add spec**
  
  **Deliverable**: `docs/evidence-producer-spec.md`
  
  Must include disclaimers:
  - NOT official SDKs
  - NOT endorsement
  - Substrate = execution substrate, not verdict authority
  - Lab does not host execution

### T3.2 Producer Templates (each must have #repro-steps)

- [ ] **Add 3 template READMEs**
  
  **Deliverables**:
  - `examples/evidence-producers/a2a/README.md`
  - `examples/evidence-producers/langchain/README.md`
  - `examples/evidence-producers/mcp/README.md`
  
  Required sections (for GATE-08 validation):
  - `# repro-steps` (anchor exists)
  - Prerequisites (with versions)
  - Execution (copy-paste command)
  - Expected Artifacts (directory tree)
  - Verification (GATE-07/08 + recompute)

### T3.3 Contract v1.1 Addendum (additive only, no v1.0 modification)

- [ ] **Add v1.1 addendum**
  
  **Deliverable**: `governance/contracts/evidence-pack-contract-v1.1.md`
  
  Must contain:
  - `manifest.substrate` optional
  - Absence policy: not_declared, not a failure

### T3.4 Generate 3 curated packs (per PF-4 choice A or B)

- [ ] **Create 3 runs**
  
  **Deliverables** (directories):
  - `data/runs/gf-01-a2a-pass/`
  - `data/runs/gf-01-langchain-pass/`
  - `data/runs/gf-01-mcp-pass/`
  
  Pack content requirements:
  - Follow PF-4 strategy file manifest
  - `manifest.json` may include `substrate` (v1.1 optional)
  - `integrity/sha256sums.txt` must comply with pack_root_hash normalization

- [ ] **For each pack: run evaluation + generate report**
  ```bash
  npx tsx scripts/test-evaluate.ts data/runs/gf-01-langchain-pass
  ```
  Expected: Produces `evaluation.report.json` with recomputable verdict_hash

- [ ] **Update curated allowlist (add anti-interrogation fields)**
  
  **Modify**: `data/curated-runs/allowlist.yaml`
  
  Each entry must contain:
  - `run_id`
  - `scenario_id: gf-01-single-agent-lifecycle`
  - `ruleset_version: ruleset-1.0`
  - `substrate`
  - `substrate_claim_level: declared|reproduced`
  - `repro_ref: examples/evidence-producers/<x>/README.md#repro-steps`
  - `exporter_version`
  - `pack_root_hash`
  - `verdict_hash`
  - `verify_report_hash`
  - `evaluation_report_hash`
  - `status: frozen`
  - `indexable: true`
  - `created_at` (UTC ISO8601)

- [ ] **Run gates (including GATE-08)**
  ```bash
  pnpm gates
  ```
  Expected: GATE-07 PASS, GATE-08 PASS, GATE-03 determinism intact

---

## Phase 4) Canonical Host Enforcement + Scenario-Aware Projection + Lab UI

### T4.1 Canonical Hosts SSOT (port-normalized)

- [ ] **Add SSOT file**
  
  **Deliverable**: `lib/config/canonical-hosts.ts`
  
  Must contain:
  ```typescript
  export const CANONICAL_HOSTS = ['lab.mplp.io', 'localhost', '127.0.0.1'];
  export function normalizeHost(host: string) {
    return host.split(':')[0].toLowerCase();
  }
  export function isCanonicalHost(normalizedHost: string) {
    return CANONICAL_HOSTS.includes(normalizedHost);
  }
  ```

- [ ] **Update preflight record (if needed)**
  
  **Check**: `governance/preflight/canonical-hosts-v0.1.md` (already exists; append only)

### T4.2 middleware.ts (REQUIRED: force noindex header)

- [ ] **Add middleware**
  
  **Deliverable**: `middleware.ts`
  
  Behavior (mandatory):
  - Non-canonical: set `X-Robots-Tag: noindex, nofollow`
  - Canonical: normal response

- [ ] **Integration test/script verification (must have one)**
  ```bash
  # Example: simulate Host header
  curl -I -H "Host: preview.example.com" http://localhost:3000/ | grep -i x-robots-tag
  ```
  Expected: Returns `X-Robots-Tag: noindex, nofollow`

### T4.3 GATE-09 (validate canonical host gate exists and works)

- [ ] **Add gate file**
  
  **Deliverable**: `lib/gates/gate-09-canonical-host.ts`
  
  Validation points:
  - Middleware exists
  - Non-canonical host response header policy verifiable (integration test or mock)

- [ ] **Run gates**
  ```bash
  pnpm gate:09  # or pnpm gates
  ```
  Expected: GATE-09 PASS

### T4.4 P0.7 Scenario-Aware Projection (dual-layer verdict display)

- [ ] **Modify run detail page**
  
  **Modify**: `app/runs/[run_id]/page.tsx`
  
  Must implement:
  - If run has `scenario_id/target_gf` (from allowlist/registry, NOT in pack):
    - Top: "Scenario Scope Verdict"
    - Below: Transparent "Full Evaluation Report"
    - For GF-02~05: show "OUT OF SCOPE for this scenario" (view layer only)
  
  **Required wording** (per Constraint 6):
  > "Scenario Scope Verdict is a filtered view of the Full Evaluation, not a substitute verdict."

- [ ] **Acceptance**
  
  Action: Open a GF-01 spine curated run detail page
  
  Expected:
  - Top shows scenario view, target_gf=gf-01
  - Full report visible, evidence/proof downloadable

### T4.5 Lab Home & Guarantees projection (Spine Evidence block)

- [ ] **Modify home & guarantees**
  
  **Modify**:
  - `app/page.tsx`
  - `app/guarantees/page.tsx`
  
  Expected:
  - "Evidence Spine" block exists
  - Links to 3 curated runs (indexable)
  - Wording: strictly presence-level (no interoperability endorsement)

---

## Phase 5) Website / Docs Minimal Mention (Link-only, no content hosting)

### T5.1 Website: /validation-lab page 1 paragraph + link

- [ ] **Modify website page**
  
  **Repository**: `MPLP_website`
  **Modify**: `app/validation-lab/page.tsx`
  
  Expected:
  - Add 1 paragraph: "Cross-substrate evidence packs published in Lab..." + link to `lab.mplp.io`
  - No content duplication, no new anchors, no semantic upgrade

### T5.2 Docs: golden-flows.md add "Evidence → Lab" block (Link-only)

- [ ] **Modify Docs page**
  
  **Repository**: `docs`
  **Modify**: `docs/docs/evaluation/golden-flows.md`
  
  Expected:
  - Only 1 block, external link to Lab
  - No JSON-LD, no evidence body

---

## Phase 6) Final Acceptance + Release Note (Seal)

### T6.1 Full validation (gates + builds + recompute)

- [ ] **Lab: all gates PASS**
  ```bash
  pnpm gates
  ```
  Expected: GATE-03~09 all green (including 08/09)

- [ ] **Lab: build success**
  ```bash
  pnpm build
  ```
  Expected: Build success, no route/type errors

- [ ] **Third-party recompute: all 3 curated packs match**
  ```bash
  npx @mplp/recompute data/runs/gf-01-a2a-pass --ruleset 1.0
  npx @mplp/recompute data/runs/gf-01-langchain-pass --ruleset 1.0
  npx @mplp/recompute data/runs/gf-01-mcp-pass --ruleset 1.0
  ```
  Expected (each):
  - `ruleset_source: bundled`
  - `match: true`

### T6.2 Frozen Safety (git diff proof)

- [ ] **Prove no FROZEN artifact modification**
  ```bash
  git diff --name-only
  git diff --name-only | grep -E "data/rulesets/ruleset-1.0|app/policies/contract|app/policies/strength" || true
  ```
  Expected: grep no output

### T6.3 Release Note (v0.1 Spine seal document)

- [ ] **Add release document**
  
  **Deliverable**: `RELEASE_SPINE_v0.1.md`
  
  Required sections:
  - Scope (per PF-4 strategy, GF-01 spine only)
  - Strength (presence-level)
  - SA/MAP (future versioned ruleset only)
  - Curated runs list (with claim_level + repro_ref)
  - Recompute command (bundled ruleset)
  - Non-certification statement
  - File change summary (new/modified/frozen untouched)

---

## Delivery Package (Tool Agent Final Report Template)

Tool agent must provide auditable summary:

1. **PF-4 Strategy**: A/B (attach `ruleset-1.0-pack-strategy.md` conclusion)
2. **Curated runs**: 3 entries (run_id + pack_root_hash + verdict_hash + claim_level)
3. **Gates**: 03~09 all PASS (paste command output summary)
4. **Recompute**: 3× match=true (paste JSON output)
5. **Canonical enforcement**: Non-canonical host `X-Robots-Tag: noindex, nofollow` evidence
6. **Frozen safety**: grep proof 0 modifications
7. **Release note**: RELEASE_SPINE_v0.1.md generated

---

**Document Status**: EXECUTION READY  
**Authority**: MPLP Validation Lab Governance  
**Version**: 1.0.0
