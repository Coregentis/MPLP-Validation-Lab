# Export Contract Changelog

> **Authority**: Validation Lab governance document.
> **Non-endorsement**: This document defines technical compatibility contracts. It does not endorse, certify, rank, or recommend any producer or evidence pack.

---

## Scope

This document governs the **`export/` directory** only — the public-facing contract surface for external consumers.

It does NOT define:
- Evidence pack generation (producer responsibility)
- Execution or runtime behavior
- Endorsement or quality assessment

---

## Versioning Policy

The `export_version` field in `export/manifest.json` follows **MAJOR.MINOR** semantics:

| Version Component | When to Increment |
|:---|:---|
| **MAJOR** | Breaking changes (see Prohibited Changes) |
| **MINOR** | Backward-compatible additions |

**Current Version**: `1.2`

---

## Compatibility Commitments

### ✅ Allowed (Backward Compatible — MINOR bump or no bump)

| Change Type | Example |
|:---|:---|
| Add optional field | `new_optional_field?: string` in curated-runs.json |
| Add new index entry | New run in curated-runs.json |
| Add new export file | New JSON file listed in manifest |
| Add new adjudication bundle | New bundle in adjudication/ |

### ❌ Prohibited (Breaking — require MAJOR bump)

| Change Type | Impact |
|:---|:---|
| Remove field | Consumer parsers break |
| Change field semantics | Consumer interpretation invalidated |
| Change enum value set | E.g., `adjudication_status` allowed values |
| Change hash algorithm | All stored hashes become invalid |
| Change normalization rules | Pack root hash / verdict hash drift |
| Change exclusion rules | Already frozen in PR-11.3 SSOT |

---

## Gates as Contract Enforcement

| Gate | Contract Enforced |
|:---|:---|
| **Gate-14** | Adjudication consistency: bundle ↔ export alignment |
| **Gate-15** | Curated closure: curated runs → adjudication required |

> **Note**: Gates are contract enforcement, NOT quality assessment or endorsement.

---

## Changelog

### v1.2 (PR-8, 2026-01-14)

**Added** curated runs → adjudication linking fields:

| Field | Type | Description |
|:---|:---|:---|
| `adjudication_status` | enum | ADJUDICATED \| NOT_ADMISSIBLE \| NOT_ADJUDICATED |
| `adjudication_verdict_hash` | string? | 64-char hex, present if adjudicated |
| `adjudication_ruleset` | string? | Ruleset version used |
| `adjudication_protocol_pin` | string? | Protocol version pinned |

**Gate Changes**:
- Gate-15 now requires adjudication bundle for curated runs

### v1.1 (2026-01-10)

- Initial stable export contract
- manifest.json + releases.json + rulesets.json + curated-runs.json
- verdict-index.json + adjudication-index.json

### v1.0 (Pre-release)

- Development version, not for external consumption

---

## Consumer Notes

> **Reviewability ≠ Reproducibility**.
> The Lab provides recheckable verdicts (same evidence → same verdict_hash).
> It does NOT guarantee execution reproducibility.

Consumers should:
1. Parse `export_version` first
2. Handle unknown fields gracefully (ignore, don't fail)
3. Validate `verdict_hash` via `npm run vlab:recheck-hash <run_id>`

---

## References

- [PR-8 Seal](artifacts/seals/phase-pr8-seal-2026-01-14.md) — Curated → Adjudication mapping
- [PR-11 Seal](artifacts/seals/phase-pr11-seal-2026-01-14.md) — Pack Hash SSOT convergence
- [Gate-14](lib/gates/gate-14-adjudication-consistency.ts) — Adjudication consistency
- [Gate-15](lib/gates/gate-15-curated-adjudication-required.ts) — Curated closure
