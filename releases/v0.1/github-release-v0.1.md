# MPLP Validation Lab v0.1

**Release Date**: January 11, 2026  
**Type**: Initial Public Release  
**Status**: Evidence Viewing & Export (Non-Certification)

---

## What's New

### 🔍 Evidence Viewing

- **Curated Runs Index** (`/runs`): Browse 3 evidence-based verdict displays with claim levels (Reproduced ✓ / Declared), hash verification, and scenario context
- **Run Detail Pages** (`/runs/[run_id]`): Complete run summaries with verification panels, evidence pack browsers (7 files), and governance context
- **SSOT Provenance**: All data sourced from `allowlist.yaml` with generation metadata

### 🔒 Secure API Routes (Read-Only)

- **File Viewing** (`/api/runs/[run_id]/files/[...path]`): Inline viewing with 5-layer security
- **File Download** (`/api/runs/[run_id]/download/[...path]`): Evidence downloads as attachments
- **7 Whitelisted Files**: manifest.json, integrity files, timeline, artifacts (context/plan/trace)
- **Security**: Whitelist validation + input validation + path containment + symlink defense + no path leakage

### 🌐 Cross-Site Integration

- **Website** ([mplp.io/governance/evidence-chain](https://mplp.io/governance/evidence-chain)): External Resources link with boundary statement
- **Docs** ([docs.mplp.io/evaluation/conformance](https://docs.mplp.io/evaluation/conformance)): External Reference (non-normative)

---

## ⚠️ What It Is NOT

This Lab does **NOT** provide:

- ❌ **Certification Programs**: No badges, rankings, scores, or official endorsements
- ❌ **Execution Hosting**: Does not run agent code or provide runtime environments
- ❌ **Compliance Determination**: Not legal advice or regulatory certification
- ❌ **Semantic Validation**: ruleset-1.0 is presence-level only (GF-02~05 PASS = artifacts present, not semantically correct)

---

## ✅ Verification

### Third-Party Recompute

Anyone can independently verify verdicts:

```bash
npx @mplp/recompute data/runs/[run_id] --ruleset 1.0
```

Expected outputs match displayed hashes (`verdict_hash`, `pack_root_hash`).

### Reproduced Runs

Runs with "Reproduced ✓" claim level include full reproduction steps.

---

## 📋 Governance Context

### Scenario Focus: GF-01

v0.1 validates **GF-01: Single Agent Lifecycle**.

**Important**: ruleset-1.0 checks GF-02~05 at **presence-level only**:
- ✅ **GF-02~05 PASS** = Required artifacts exist
- ❌ **NOT** = Semantic correctness for those flows

### Ruleset: 1.0 (Presence-Level)

- Verifies artifact **presence**, not semantic validity
- Checks file existence and basic structure
- Does NOT validate flow logic or business rules

---

## 🛠️ Technical Summary

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Data Flow**: `allowlist.yaml` (SSOT) → `curated-runs.json` (generated) → UI (read-only)
- **Gates**: ALL PASS (04-10) — Non-endorsement, no execution hosting, robots policy, PII/path leak prevention, SSOT projection guard, curated invariants

---

## 📚 Documentation

- **Full Release Notes**: [release-notes-v0.1.md](https://github.com/Coregentis/MPLP-Protocol/blob/main/releases/v0.1/release-notes-v0.1.md)
- **Evidence Manifest**: [master-evidence-manifest.v0.1.json](https://github.com/Coregentis/MPLP-Protocol/blob/main/releases/v0.1/master-evidence-manifest.v0.1.json)
- **Phase Seals**: [Phase 3](https://github.com/Coregentis/MPLP-Protocol/blob/main/releases/v0.1/phase-3-seal.md) | [Phase 4](https://github.com/Coregentis/MPLP-Protocol/blob/main/releases/v0.1/phase-4-seal.md) | [Phase 5](https://github.com/Coregentis/MPLP-Protocol/blob/main/releases/v0.1/phase-5-seal.md) | [Phase 6](https://github.com/Coregentis/MPLP-Protocol/blob/main/releases/v0.1/phase-6-final-acceptance.md)

---

## 🚀 Get Started

**Entry Point**: https://lab.mplp.io

**Browse Evidence**:
1. Visit `/runs` to see curated runs
2. Click any run for details
3. Use evidence pack browser to view files
4. Download via API for offline verification

**Verify Independently**:
- Use `@mplp/recompute` CLI to verify displayed verdicts
- Review governance context for semantic boundaries
- Understand presence-level validation scope

---

## 🔬 Known Scope (v0.1)

- **3 curated runs**: Sample set for initial release
- **GF-01 focus**: Other golden flows not semantically validated
- **Presence-level ruleset**: Deep conformance validation not included
- **Static evidence only**: No runtime inspection

---

## 📞 Support

- **Documentation**: https://docs.mplp.io
- **Repository**: https://github.com/Coregentis/MPLP-Protocol
- **Issues**: Via repository issue tracker

---

**License**: [License Type]  
**Contributors**: MPLP Protocol Governance Committee  
**Acceptance**: Phase 6 Final Acceptance (ACCEPTED ✅)
