# MCP Producer

Evidence producer for Model Context Protocol (MCP) substrate.

## Overview

Generates `INDEXABLE_REAL` evidence packs demonstrating MCP protocol compliance through real tool registration and invocation scenarios.

## Scenarios

### D1: Basic Pass (`d1_basic_pass`)
- **Objective**: Demonstrate basic MCP tool interaction
- **Actions**:
  1. Register tool (`get_weather`)
  2. Invoke tool with valid input
  3. Receive successful response
- **Expected Verdict**: PASS

## Usage

### Install Dependencies

```bash
cd producers/mcp
npm install
```

### Generate Evidence Pack

```bash
# Direct execution
npm run produce -- --scenario=d1_basic_pass --run-id=mcp-d1-001

# Via wrapper script
bash scripts/produce.sh --scenario d1_basic_pass --run-id mcp-d1-001

# Via repo root npm script
npm run produce:mcp:d1
```

## Output Structure

Evidence pack created at: `data/runs/v2/real/mcp/<run-id>/`

```
<run-id>/
├── manifest.json              # Complete provenance chain
├── artifacts/
│   ├── context.json           # Context establishment
│   ├── plan.json              # Planning phase
│   ├── confirm.json           # Confirmation
│   └── trace.json             # Execution trace
├──timeline/
│   └── events.ndjson          # Timeline events
├── reports/
│   ├── runner.meta.json       # (if run via runner)
│   └── verify.report.json     # Verification report
└── integrity/
    └── sha256sums.txt         # File hashes
```

## Provenance Chain

The producer fills complete `manifest.json` with:

- **protocol_ref**: MPLP schemas v2 reference
- **substrate_ref**: MCP upstream repo + tag + commit
- **lock_ref**: package-lock.json hash
- **env_ref**: Runner container digest (if via runner)
- **lab_ref**: Validation Lab v2 commit
- **producer_ref**: This producer's commit
- **canonicalization_ref**: Hash scope rules
- **hashes**: pack_root_hash + verify_report_hash
- **repro**: Reproduction command

## Verification

The producer generates `reports/verify.report.json` with:
- `overall_status`: "VERIFIED"
- `hash_verification.match`: true
- `checked_files[]`: All artifact hashes

## Integration with Runner

To run via container (for env_ref.container_digest):

```bash
../../runners/_lib/run-in-container.sh \
  --runner node-20 \
  --cmd "cd producers/mcp && npm run produce -- --scenario=d1_basic_pass" \
  --out-dir data/runs/v2/real/mcp/mcp-d1-001
```

## Dependencies

- Node.js 20+
- @modelcontextprotocol/sdk ^0.5.0
- TypeScript 5.3+

## Next Steps

After generating an evidence pack:

1. Build projection: `npm run projection:build`
2. Verify in UI: Navigate to `/runs/<run-id>`
3. Run gates: `npm run gate:all`
