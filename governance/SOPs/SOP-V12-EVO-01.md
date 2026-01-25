# SOP-V12-EVO-01: Ruleset Evolution & Shadow Locking

**Purpose**: Formalize the ruleset evolution pipeline to ensure logic shifts are documented, quantified, and cryptographically anchored.

## 1. Evolution Trigger
A ruleset evolution is triggered when a logic change is required to a versioned ruleset (e.g., 1.1 → 1.2).

## 2. Technical Workflow
1. **Ruleset Definition**: Create the new ruleset version in `governance/rulesets/`.
2. **Shadow Adjudication**:
   - Execute: `npm run derive:shadow -- --from ruleset-A --to ruleset-B`.
   - Output: `diffpack.json` and `shadow-summary.json` in `public/_data/ruleset-diffs/ruleset-A__ruleset-B/`.
3. **Rationale Attribution**:
   - The `diffpack.json` MUST contain technical, non-vague rationales for every change.
   - Every modified clause MUST include `evidence_refs`.
4. **Hash Locking**:
   - Compute `sha256` of `diffpack.json` and `shadow-summary.json`.
   - Update the `public/_meta/ruleset-diff-index.json` with these hashes.
   - Update `lab-manifest.json` anchors if a new primary evolution point is reached.

## 3. Governance Closure
- Run `npm run gate:evo` and `npm run gate:evo-ui`.
- Any evolution without a locked shadow output or missing technical attribution is prohibited.
- Seal the series by appending the hashes to the latest **SEAL-v0.12.x** document.
