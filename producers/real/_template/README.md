# Evidence Producer Template (RC-5)

This template defines the contract for RC-5 "Coverage & Interop" evidence producers.

## Directory Structure
```text
producers/<framework>/
├── artifacts/          # Generated artifacts (context.txt, plan.md, etc.)
├── timeline/
│   └── events.ndjson   # Structured event log
├── snapshots/          # UI Snapshots & Diffs
└── manifest.json       # Evidence Manifest (Manifest-First)
```

## Manifest Contract
The `manifest.json` must strictly adhere to this schema to be indexed as RC-5 compliant.

```json
{
  "pack_id": "<framework>-d1-real-runner-det-001",
  "indexability_status": "INDEXABLE_REAL",
  "scenario_id": "d1_basic_pass",
  "execution_type": "REAL",
  
  "protocol_ref": { ... },
  "substrate_ref": { ... },
  "lock_ref": { ... },
  "env_ref": { ... },
  
  "evidence_maturity_tier": "REPRODUCED",
  
  "interop_stack": ["<Framework>", "MCP", "A2A"], // Optional: Only for Interop Runs
  
  "adjudicable_surfaces": {
    "intent": true,
    "plan": true,
    "confirm": true, // or false if not applicable
    "trace": true,
    "snapshots": true,
    "mcp": true,     // Optional: RC-5 Interop
    "a2a": true      // Optional: RC-5 Interop
  },
  
  "hashes": {
    "pack_root_hash": "...",
    "canonical_pack_root_hash": "..."
  }
}
```

## Timeline Contract (Interop Events)
For Interop Runs, the timeline must contain specific events pointed to by `mplp://` URI.

### MCP Tool Call
```json
{
  "type": "mcp_tool_call",
  "data": {
    "server": "math-server",
    "tool": "add",
    "args": { "a": 5, "b": 3 }
  }
}
```

### A2A Envelope
```json
{
  "type": "a2a_envelope",
  "data": {
    "protocol": "open_agent",
    "payload": { "task_id": "123" }
  }
}
```
