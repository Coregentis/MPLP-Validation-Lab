# Ruleset Utilities

This directory contains scripts related to **ruleset management and auditability**.

## Non-Endorsement Boundary

Ruleset utilities MUST NOT be used to imply certification, endorsement, ranking, or scoring of frameworks/vendors/substrates. They support reproducibility of **ruleset evolution** only.

## Tools

### generate-ruleset-diff.mjs (MUST-3)

Generates ruleset diff reports under:

- `export/ruleset-diff/`

Expected outputs:
- `export/ruleset-diff/index.json`
- `export/ruleset-diff/<diff_id>/diff.json`

## Typical workflow

```bash
# Generate diffs
node scripts/ruleset/generate-ruleset-diff.mjs --from ruleset-1.0 --to ruleset-1.1

# Verify hashes
shasum -a 256 export/ruleset-diff/index.json

# Optional: build / gates
npm run gate:projection-map
npm run gate:no-ssot-duplication
npm run build
```

## Enhanced Mode (v0.9+)

```bash
node scripts/ruleset/generate-ruleset-diff.mjs --enhanced --explain-profile eh-1 --from ruleset-1.0 --to ruleset-1.1
```

**Notes**:
- Enhanced mode writes `index.enhanced.json` and `diff.enhanced.json` only
- v0.8 artifacts (`index.json`, `diff.json`) are **frozen** and protected by Freeze Guard
- Explanations use deterministic template `eh-1` (no LLM, no evaluative language)
- Banned word linter enforces non-endorsement boundary

**Freeze Guard**: Attempting to write to v0.8 frozen paths will throw an error:
```
🔒 FROZEN: v0.8 artifact "export/ruleset-diff/index.json" is immutable.
   To generate enhanced artifacts, use: --enhanced flag
```

## Repro Pack Mode (v0.9.2)

```bash
node scripts/ruleset/generate-ruleset-diff.mjs --repro-pack --repro-profile rp-1 --from ruleset-1.0 --to ruleset-1.1
```

**Output**:
- `export/ruleset-diff/<diff_id>/repro-pack.json` - Per-diff reproduction pack
- `export/ruleset-diff/index.repro.json` - Index of all repro packs

**Contents** (rp-1 profile):
- Input manifest sha256 hashes
- Artifact hashes (v0.8 frozen + v0.9 enhanced)
- Verification commands (copy-paste ready)
- Non-endorsement boundary statement

See also:

* `export/ruleset-diff/README.md`
* UI: `/rulesets/diff`
