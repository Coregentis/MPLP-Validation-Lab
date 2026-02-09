# AUDIT-R1-SEMANTIC-0GAPS-SEAL

## Seal Status: ✅ VERIFIED

| Field | Value |
|-------|-------|
| **Audit Type** | R1 Semantic Coverage |
| **Generated** | 2026-02-03T11:32:57+08:00 |
| **Checked URLs** | 16 |
| **Passed** | 16 |
| **Gaps** | 0 |
| **Commit SHA** | `8ab2dd8` |
| **Report Hash** | `731f71587117f217` |

---

## Gates Enforced

| Gate ID | Description | Status |
|---------|-------------|--------|
| `GATE-SEMANTIC-0GAPS-01` | Semantic checker exit code = 0 | ✅ PASS |
| `GATE-SEMANTIC-REPORT-ARTIFACT-01` | gaps-report.md generated | ✅ PASS |

---

## Evidence Locations

| Evidence | Path |
|----------|------|
| Gap Report | [gaps-report.md](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/audit/semantic/gaps-report.md) |
| Gap JSON | [gaps.json](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/audit/semantic/gaps.json) |
| PSC Contracts | [page-semantic-contracts.json](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/audit/semantic/page-semantic-contracts.json) |
| Sample Params | [sample-params.json](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/audit/semantic/sample-params.json) |

---

## Auditor Components

| Component | Purpose |
|-----------|---------|
| `generate-page-semantic-contracts.ts` | Produces PSC from route manifest |
| `generate-sample-params.ts` | Stable sampling for dynamic routes |
| `check-page-semantics.ts` | DOM checker against PSC |
| `gate-ci-wrapper.mjs` | CI-compatible wrapper (build → start → check) |

---

## Scope Verified

- **Required Sections**: 9 pages
- **Required Disclaimers**: `non-endorsement-banner`, `non-certification-notice`
- **Version Scope**: 3 unified pages (`/guarantees`, `/runs`, `/rulesets`)

---

## Reproducibility

```bash
# Reproduce this audit
npm run build
PORT=3000 npm run start &
sleep 5
BASE_URL=http://localhost:3000 npm run gate:semantic
pkill -f "next"

# Verify hash
shasum -a 256 audit/semantic/gaps-report.md
```

---

## Attestation

> **This seal attests that the Validation Lab UI has zero R1 semantic gaps as of the commit and timestamp above.**
> 
> - All required sections are present (via `data-testid` anchors)
> - All required disclaimers are present (globally injected)
> - All unified pages have V1/V2 version scope indicators
