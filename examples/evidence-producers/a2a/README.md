# A2A Evidence Producer Reference

**Substrate**: Agentic-to-Agentic (A2A)  
**Claim Level**: declared  
**Status**: Reference template (non-official)

---

## Overview

This reference demonstrates evidence pack generation for A2A substrate scenarios.

> [!WARNING]
> This is NOT an official SDK. Use as example only.

---

## Prerequisites

- A2A runtime environment (version 0.x or compatible)
- Python 3.9+ or Node.js 18+
- `shasum` utility (for integrity generation)

---

## Execution

### 1. Prepare Agent Configuration

Create agent configuration with:
- Task definition
- Context requirements
- Expected outputs

### 2. Run Agent Execution

Execute agent within A2A substrate:

```bash
# Example command (adjust for actual A2A runtime)
a2a-run --task <task_file> --output <evidence_dir>
```

### 3. Capture Timeline

Record execution events to `timeline/events.ndjson`:

```json
{"event":"agent_start","timestamp":"2026-01-10T00:00:00Z"}
{"event":"planning_complete","timestamp":"2026-01-10T00:00:05Z"}
{"event":"execution_complete","timestamp":"2026-01-10T00:00:10Z"}
```

---

## Expected Artifacts

After execution, evidence directory should contain:

- `artifacts/context.json` - Agent context state
- `artifacts/plan.json` - Generated plan
- `artifacts/trace.json` - Execution trace
- `timeline/events.ndjson` - Timeline events
- `manifest.json` - Pack metadata

---

## Verification

### Generate Integrity Files

```bash
cd <evidence_dir>

# Generate sha256sums.txt
find . -type f ! -path './integrity/*' -exec shasum -a 256 {} \; \
  | sed 's|^\([^ ]*\)  \./|\1  |' \
  | sort -k2 > integrity/sha256sums.txt

# Generate pack.sha256
python3 -c "
import hashlib, pathlib
content = pathlib.Path('integrity/sha256sums.txt').read_text()
lines = sorted([l for l in content.split('\n') if l.strip()])
normalized = '\n'.join(lines)
h = hashlib.sha256(normalized.encode()).hexdigest()
pathlib.Path('integrity/pack.sha256').write_text(h)
print(f'pack_root_hash: {h}')
"
```

### Validate Pack

```bash
# Using MPLP Validation Lab tools
npx tsx scripts/preflight/debug-gate02.ts <evidence_dir>
```

---

## Substrate Metadata (Optional)

Add to `manifest.json`:

```json
{
  "substrate": {
    "type": "a2a",
    "version": "0.1.0"
  }
}
```

---

## # repro-steps

**Note**: A2A substrate is currently `declared` level. Full reproduction requires:
1. Documented A2A runtime version
2. Deterministic task configuration
3. Reproducible agent behavior

---

## License

MIT (reference template only, no warranty)
