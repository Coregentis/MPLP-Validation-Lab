# MCP Evidence Producer Reference

**Substrate**: Model Context Protocol (MCP)  
**Claim Level**: declared  
**Status**: Reference template (non-official)

---

## Overview

This reference demonstrates evidence pack generation for MCP server scenarios.

> [!WARNING]
> This is NOT an official MCP SDK or endorsement.

---

## Prerequisites

- MCP server runtime (TypeScript or Python)
- Node.js 18+ or Python 3.9+
- MCP SDK (`npm install @modelcontextprotocol/sdk`)
- `shasum` utility

---

## Execution

### 1. Implement MCP Server

```typescript
// example-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "example-server",
  version: "0.1.0",
}, {
  capabilities: {
    tools: {}
  }
});

// Register tool
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "example_tool",
    description: "Example MCP tool",
    inputSchema: { type: "object", properties: {} }
  }]
}));

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 2. Capture Evidence

Run MCP server and capture:
- Tool execution context
- Planning steps
- Execution trace

### 3. Generate Artifacts

```bash
# Create evidence structure
mkdir -p pack/{artifacts,integrity,timeline}

# Generate artifacts (example)
echo '{"server":"example-server","tools":["example_tool"]}' > pack/artifacts/context.json
echo '{"plan":"use_example_tool"}' > pack/artifacts/plan.json
echo '{"trace":[{"event":"tool_call","tool":"example_tool"}]}' > pack/artifacts/trace.json
echo '{"event":"server_start","timestamp":"2026-01-10T00:00:00Z"}' > pack/timeline/events.ndjson
```

---

## Expected Artifacts

- `artifacts/context.json` - MCP server context
- `artifacts/plan.json` - Tool usage plan
- `artifacts/trace.json` - Execution trace
- `timeline/events.ndjson` - Server events
- `manifest.json` - Pack metadata

---

## Verification

### Generate Integrity

```bash
cd pack

# sha256sums.txt
find . -type f ! -path './integrity/*' -exec shasum -a 256 {} \; \
  | sed 's|^\([^ ]*\)  \./|\1  |' \
  | sort -k2 > integrity/sha256sums.txt

# pack.sha256
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
npx tsx scripts/preflight/debug-gate02.ts pack/
npx @mplp/recompute pack/ --ruleset 1.0
```

---

## # repro-steps

**Note**: MCP substrate is currently `declared` level. Full reproduction requires:

1. Documented MCP SDK version
2. Server implementation code
3. Deterministic tool execution
4. Reproducible client interactions

For `reproduced` claim level, provide:
- Fixed MCP server version
- Deterministic test client
- Documented reproduction steps

---

## Substrate Metadata (Optional)

```json
{
  "substrate": {
    "type": "mcp",
    "version": "0.1.0",
    "sdk_version": "@modelcontextprotocol/sdk@0.5.0"
  }
}
```

---

## License

MIT (reference template only, no warranty)
