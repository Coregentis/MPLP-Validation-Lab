# Validation Lab Artifacts Directory Structure

## Purpose

This directory contains all evidence, verification logs, and documentation for the MPLP Validation Lab project.

## Directory Structure

```
artifacts/
├── gates/           # Gate verification reports (GATE-04 to GATE-10)
├── seals/           # Phase seal documents (Phase 3-6)
├── runbooks/        # Execution runbooks for each phase
└── logs/            # Build, TypeScript compilation, and verification logs

releases/
└── v0.1/           # v0.1 release package
    ├── Seal documents (phase-3-seal.md through phase-6-final-acceptance.md)
    ├── release-notes-v0.1.md
    ├── master-evidence-manifest.v0.1.json
    ├── github-release-v0.1.md
    └── RELEASE_CUT_v0.1.md
```

## Document Categories

### Seal Documents (artifacts/seals/)

Phase completion reports documenting deliverables, verification, and acceptance:

- `phase-3-seal.md` - Evidence chain implementation (commit: c988e71)
- `phase-4-seal.md` - UI updates (6 commits: 315ea3d → 7df9dfc)
- `phase-5-seal.md` - Website/Docs cross-linking (2 commits: f2a0af1, aa86b28a)
- `phase-6-final-acceptance.md` - Final acceptance report (v0.1 ACCEPTED)

### Runbooks (artifacts/runbooks/)

Step-by-step execution guides:

- `phase-4-preflight-runbook.md` - Preflight fixes execution guide
- `phase-4-main-runbook.md` - Main phase (M1-M4) execution guide
- `release-runbook-v0.1.md` - Production deployment and release guide

### Gates Directory (artifacts/gates/)

Gate verification reports in JSON format:

- `gate-04-language.report.json` - Non-endorsement language lint
- `gate-05-no-exec-hosting.report.json` - Execution hosting guard
- `gate-06-robots-policy.report.json` - Robots/noindex policy
- `gate-07-pii-leak.report.json` - PII/path leak prevention
- `gate-08-curated-immutability.report.json` - Curated runs immutability
- `gate-09-ssot-projection.report.json` - SSOT projection guard
- `gate-10-curated-invariants.report.json` - Curated runs invariants

### Release Package (releases/v0.1/)

Complete v0.1 release artifacts:

- All phase seals (consolidated)
- Release notes
- Master evidence manifest (JSON index of all commits, logs, and evidence)
- GitHub release description
- Release freeze point documentation

## Usage

### For Verification

To verify any phase completion:
1. Check corresponding seal document in `artifacts/seals/`
2. Review commit SHAs listed in seal
3. Verify gates PASS status in seal document
4. Cross-reference with logs in `artifacts/logs/` (if needed)

### For Auditing

The master evidence manifest provides a complete index:

```bash
cat releases/v0.1/master-evidence-manifest.v0.1.json
```

### For Release

Follow the release runbook:

```bash
cat artifacts/runbooks/release-runbook-v0.1.md
```

## Version Control

**All files in this directory should be committed to version control** to maintain the audit trail.

**Exception**: Large log files may be `.gitignore`d if they exceed size limits, but references to them must remain in seal documents.

## Maintenance

- **Do not modify** sealed documents after their freeze point
- **Do not delete** historical evidence without approval
- **Add new phases** by creating new seal documents (phase-7-seal.md, etc.)
- **Update manifests** when adding new evidence files

---

**Last Updated**: 2026-01-11  
**Current Release**: v0.1 (ACCEPTED)
