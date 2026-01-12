# Release Notes: Validation Lab v0.1

**Date**: 2026-01-11  
**Version**: v0.1  
**Type**: Initial Public Release

---

## What's New

### Evidence Viewing & Export

**Curated Runs Index** (`/runs`):
- Browse 3 evidence-based verdict displays
- View claim levels (Reproduced ✓ / Declared)
- Access hash-based verification information
- Scenario-aware banner explaining GF-01 focus and presence-level semantics

**Run Detail Pages** (`/runs/[run_id]`):
- Complete run summary with substrate, claim level, scenario, and ruleset
- Verification panel with third-party recompute instructions
- Evidence pack browser (7 files: manifest, integrity, timeline, artifacts)
- Governance panel explaining P0.7 compliance and presence-level validation
- SSOT provenance footer with generation metadata

### API Routes (Read-Only)

**File Viewing** (`/api/runs/[run_id]/files/[...path]`):
- Inline file viewing with appropriate content types
- 5-layer security (whitelist, input validation, path containment, symlink defense, no path leakage)
- Immutable cache headers

**File Download** (`/api/runs/[run_id]/download/[...path]`):
- Evidence file downloads as attachments
- Same security boundaries as file viewing

**Whitelisted Files** (7 total):
- `manifest.json`
- `integrity/sha256sums.txt`
- `integrity/pack.sha256`
- `timeline/events.ndjson`
- `artifacts/context.json`
- `artifacts/plan.json`
- `artifacts/trace.json`

### Cross-Site Integration

**Website** (mplp.io):
- External Resources link on `/governance/evidence-chain` page
- Boundary statement: "Evidence-based verdict viewing and export; not a certification program and does not host execution"

**Docs** (docs.mplp.io):
- External Reference on `/evaluation/conformance` page
- Marked as "non-normative" external reference

---

## What It Is NOT

This Lab does **NOT** provide:

❌ **Certification Programs**: No badges, rankings, scores, or official endorsements  
❌ **Execution Hosting**: Does not run agent code or provide runtime environments  
❌ **Compliance Determination**: Not legal advice or regulatory certification  
❌ **Semantic Validation**: ruleset-1.0 is presence-level only (GF-02~05 PASS = artifacts present, not semantically correct)

---

## Verification

### Third-Party Recompute

Anyone can independently verify verdicts using the recompute CLI:

```bash
npx @mplp/recompute data/runs/[run_id] --ruleset 1.0
```

Expected outputs match the displayed hashes:
- `verdict_hash`
- `pack_root_hash`

### Reproduced Runs

Runs with "Reproduced ✓" claim level include full reproduction steps accessible via the run detail page.

---

## Governance Context

### Scenario Focus: GF-01

v0.1 validates **GF-01: Single Agent Lifecycle**.

While ruleset-1.0 checks GF-02~05, these checks are **presence-level only**:
- **GF-02~05 PASS** = Required artifacts exist
- **NOT** = Semantic correctness for those flows

### Ruleset: 1.0 (Presence-Level)

ruleset-1.0 verifies artifact **presence**, not semantic validity:
- Checks file existence and basic structure
- Does NOT validate flow logic or business rules
- Designed for evidence availability, not deep conformance

### P0.7 Compliance

All UI pages include explicit context:
- Scenario focus (GF-01)
- Presence-level semantics
- No execution hosting

---

## Technical Details

### Architecture

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Data Source**: `allowlist.yaml` (SSOT) → `curated-runs.json` (generated artifact)
- **UI Projection**: Read-only consumption of generated artifact
- **API Layer**: Static file serving with hardened security boundaries

### Gates (Governance Automation)

All gates PASS:
- **GATE-04**: Non-endorsement language lint
- **GATE-05**: No execution hosting guard
- **GATE-06**: Robots/noindex policy
- **GATE-07**: PII/path leak lint
- **GATE-08**: Curated immutability
- **GATE-09**: SSOT projection guard (prevents hash hardcoding)
- **GATE-10**: Curated invariants (prevents SSOT/UI drift)

### Security Boundaries

**API Routes**:
1. Whitelist validation (7 files only)
2. Input validation (no `..`, `\`, empty segments)
3. Path containment (prefix check with `path.sep`)
4. Symlink defense (realpath validation)
5. No path leakage (safe error messages)

**SSOT Projection**:
- Single source: `allowlist.yaml`
- Generated artifact: `curated-runs.json`
- UI layer: Read-only
- No YAML parsing in UI (GATE-10 enforced)
- No hash hardcoding (GATE-09 enforced)

---

## Known Scope & Limitations

### v0.1 Constraints

1. **3 curated runs only**: Sample set for v0.1 (gf-01-langchain-pass, sample-pass, sample-not-admissible)
2. **GF-01 focus**: Other golden flows not semantically validated
3. **Presence-level ruleset**: Deep conformance validation not included
4. **Static evidence only**: No runtime inspection or live agent monitoring

### Not Included in v0.1

- Advanced search/filtering
- Evidence comparison tooling
- Automated recompute integration in UI
- Multi-ruleset support
- Historical version tracking

---

## Deployment

### Entry Points

- **Lab**: https://lab.mplp.io
- **Website**: https://mplp.io/governance/evidence-chain
- **Docs**: https://docs.mplp.io/evaluation/conformance

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection for external links

---

## Evidence Pack

### Complete Audit Trail

All implementation phases documented:
- **Phase 3**: Evidence chain implementation seal
- **Phase 4**: UI updates seal (6 commits)
- **Phase 5**: Cross-site integration seal (2 commits)
- **Phase 6**: Final acceptance report

### Reproducibility

- All commits tagged and traceable
- Log files archived in artifacts directory
- Master evidence manifest available (`master-evidence-manifest.v0.1.json`)

---

## Next Steps

**For Implementers**:
- Review curated runs structure via API
- Examine evidence pack browser implementation
- Study GATE-09/10 for SSOT projection patterns

**For Evaluators**:
- Use recompute CLI to verify displayed verdicts
- Review governance context documentation
- Understand presence-level semantics

**For Contributors**:
- See `CONTRIBUTING.md` (if available)
- Review governance gates implementation
- Submit evidence packs for curation consideration

---

## Support & Feedback

**Documentation**: https://docs.mplp.io  
**Repository**: https://github.com/Coregentis/MPLP-Protocol  
**Issues**: Via repository issue tracker

---

**Release Date**: 2026-01-11  
**Version**: v0.1  
**Status**: RELEASED  
**Type**: Evidence Viewing & Export (Non-Certification)
