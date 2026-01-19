---
doc_type: reference
normativity: non-normative
authority: Validation Lab
status: active
scope_id: S1
---

# S1 — Single-Substrate Evidence Validation

**What S1 adjudicates**  
S1 adjudicates whether **a single substrate's evidence pack** is:
- structurally valid (contract/schema compliant),
- internally consistent (hashes/verdict reproducible under declared ruleset),
- policy-compliant (non-endorsement / no execution hosting / noindex / PII hygiene).

**What S1 does NOT adjudicate**
- runtime quality, latency, safety, model capability, framework "better/worse"
- production determinism under distributed scheduling/network variance
- certification, ranking, or endorsement

## Required Evidence Inputs (by strength)
- **E-A (Static Evidence)**: submitted pack + integrity files + ruleset reference
- **E-B (Reproduction)**: generator-based regenerated packs with run-twice hash match *(if applicable)*
- **E-S (Seal)**: cryptographic proof that binds a frozen evidence snapshot *(optional)*

## Typical Verdict Outputs
- `PASS / FAIL / NOT-EVALUATED` under a versioned ruleset.
- `verdict_hash` MUST be independently recomputable (e.g. recompute toolchain).

## Existing Truth Anchors (repo)
- Curated runs SSOT: `data/curated-runs/allowlist.yaml`
- Rulesets: `data/rulesets/ruleset-1.0/`
- Contracts: `governance/contracts/evidence-pack-contract-v1.*.md`
- Executable gates: `lib/gates/gate-02..10-*.ts`
- Recompute package: `packages/recompute/`
- Frozen snapshots: `releases/`

## Non-Endorsement Boundary
> **S1 validates evidence integrity and compliance, not framework capability.**
