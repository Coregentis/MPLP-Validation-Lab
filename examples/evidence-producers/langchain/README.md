# Langchain Evidence Producer Reference

**Substrate**: Langchain (Python)  
**Claim Level**: reproduced  
**Status**: Reference template with reproduction steps

---

## Overview

This reference demonstrates evidence pack generation for Langchain-based agents with full reproduction capability.

> [!IMPORTANT]
> This template achieves `reproduced` claim level through deterministic pack generation.

---

## Prerequisites

- Python 3.9+
- Langchain 0.1.0+ (`pip install langchain`)
- `shasum` utility
- Git (for cloning reference scripts)

---

## Execution

### 1. Install Dependencies

```bash
pip install langchain==0.1.0 langchain-community
```

### 2. Run Reference Agent

```python
# example_agent.py
from langchain.agents import initialize_agent, AgentType
from langchain.llms import FakeListLLM
from langchain.tools import Tool

# Deterministic LLM for reproducibility
responses = ["I will complete the task", "Task completed successfully"]
llm = FakeListLLM(responses=responses)

# Define tools
tools = [
    Tool(name="Example", func=lambda x: "result", description="Example tool")
]

# Initialize agent
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION)

# Execute
result = agent.run("Complete example task")
```

### 3. Generate Evidence Artifacts

```python
import json
from datetime import datetime

# Context
context = {
    "agent_type": "zero_shot_react",
    "tools": ["Example"],
    "task": "Complete example task"
}

# Plan
plan = {
    "steps": [
        {"step": 1, "action": "use_tool", "tool": "Example"},
        {"step": 2, "action": "complete", "result": "Task completed"}
    ]
}

# Trace
trace = {
    "events": [
        {"timestamp": "2026-01-10T00:00:00Z", "type": "start"},
        {"timestamp": "2026-01-10T00:00:05Z", "type": "tool_call", "tool": "Example"},
        {"timestamp": "2026-01-10T00:00:10Z", "type": "complete"}
    ]
}

# Write artifacts
json.dump(context, open('artifacts/context.json', 'w'))
json.dump(plan, open('artifacts/plan.json', 'w'))
json.dump(trace, open('artifacts/trace.json', 'w'))
```

---

## Expected Artifacts

Pack structure after generation:

```
pack/
├── manifest.json
├── integrity/
│   ├── sha256sums.txt
│   └── pack.sha256
├── timeline/
│   └── events.ndjson
└── artifacts/
    ├── context.json
    ├── plan.json
    └── trace.json
```

---

## Verification

### Generate Integrity Files

```bash
cd pack/

# sha256sums.txt
find . -type f ! -path './integrity/*' -exec shasum -a 256 {} \; \
  | sed 's|^\([^ ]*\)  \./|\1  |' \
  | sort -k2 > integrity/sha256sums.txt

# Remove trailing newline (macOS)
perl -pi -e 'chomp if eof' integrity/sha256sums.txt

# pack.sha256
python3 << 'PY'
import hashlib, pathlib
content = pathlib.Path("integrity/sha256sums.txt").read_text()
lines = sorted([l for l in content.split("\n") if l.strip()])
normalized = "\n".join(lines)
h = hashlib.sha256(normalized.encode()).hexdigest()
pathlib.Path("integrity/pack.sha256").write_text(h)
print(f"pack_root_hash: {h}")
PY
```

### Validate with MPLP Lab

```bash
# Admission check
npx tsx scripts/preflight/debug-gate02.ts pack/

# Full evaluation
npx tsx scripts/test-evaluate.ts pack/

# Third-party recompute
npx @mplp/recompute pack/ --ruleset 1.0
```

---

## # repro-steps

### Full Reproduction

1. **Clone reference**:
   ```bash
   git clone https://github.com/example/langchain-evidence-ref
   cd langchain-evidence-ref
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Generate pack**:
   ```bash
   python generate_pack.py --output ./pack
   ```

4. **Verify integrity**:
   ```bash
   cd pack
   cat integrity/pack.sha256
   # Should match: <expected_hash_from_curated>
   ```

5. **Recompute verdict**:
   ```bash
   npx @mplp/recompute ./pack --ruleset 1.0
   # Should match curated verdict_hash
   ```

### Determinism Guarantee

- Uses `FakeListLLM` with fixed responses
- Timestamps normalized to ISO8601 UTC
- File ordering deterministic (sorted)
- No randomness or system-dependent behavior

---

## Substrate Metadata

`manifest.json` includes:

```json
{
  "substrate": {
    "type": "langchain",
    "version": "0.1.0",
    "python_version": "3.9+"
  }
}
```

---

## License

MIT (reference template, fully reproducible)
