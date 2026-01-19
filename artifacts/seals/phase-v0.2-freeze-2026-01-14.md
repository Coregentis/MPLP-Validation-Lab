# Milestone Freeze Record: v0.2

**Frozen Date**: 2026-01-14
**Status**: ✅ FROZEN

---

## What is Frozen (v0.2)

This milestone is complete and locked. Changes to these items require a new PR with explicit justification.

| Item | Contract |
|:---|:---|
| `export_version` | `1.2` |
| Pack Hash SSOT | `lib/engine/packHash.ts` (PR-11.3) |
| Gate-14 | Adjudication consistency enforcement |
| Gate-15 | Curated closure enforcement |
| Curated Set | PASS + FAIL + NOT_ADMISSIBLE coverage |
| Exclusion Rules | `EXCLUDED_DIRS`, `EXCLUDED_FILES` frozen |
| Tests | 77 tests (equivalence locks included) |

---

## Non-Goals (Explicitly Out of Scope)

The following are **NOT** goals for v0.2 and must NOT be added without a new milestone:

| Non-Goal | Reason |
|:---|:---|
| Execution reproducibility | Reviewability ≠ Reproducibility |
| Certification / Endorsement | Authority boundary |
| Ranking / Recommendations | Non-endorsement principle |
| New release pages | Scope freeze |
| Ruleset beyond 1.0 | Requires separate PR flow |
| Additional UI pages | v0.3 backlog item |

---

## Next Milestone Candidates (v0.3 Backlog)

These items are deferred to the next milestone:

| Candidate | Description | Priority |
|:---|:---|:---|
| UI P2: /reverification | Browser for reverification bundles | Medium |
| More curated runs | Target: 12 runs | Low |
| Ruleset 1.1 | If protocol evolves | Low |
| Export v1.3 | If new fields needed | Low |

---

## Decision Rule

Before adding any new work:

1. **Is it in "Frozen"?** → Reject unless explicit PR justification
2. **Is it in "Non-Goals"?** → Reject outright
3. **Is it in "Next Milestone Candidates"?** → Schedule for v0.3

---

## Related Seals

- [PR-8 Seal](./phase-pr8-seal-2026-01-14.md)
- [PR-11 Seal](./phase-pr11-seal-2026-01-14.md)
- [Export Contract](../../governance/EXPORT_CONTRACT_CHANGELOG.md)
