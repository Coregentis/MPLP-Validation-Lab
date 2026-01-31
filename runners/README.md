# MPLP Runner Framework V2

## Overview

Unified container-based execution environment for all MPLP substrate producers. Provides reproducible, version-pinned runtimes with container digest tracking and environment fingerprinting.

## Architecture

### Runner Contract

All runners must:
1. Produce `reports/runner.meta.json` with `container_digest` + `environment_fingerprint`
2. Support bind-mount of `OUT_DIR` to `/workspace/out`
3. Align with substrate registry (`producers/_registry/substrates.v2.yaml`)

### Directory Structure

```
runners/
  _lib/
    run-in-container.sh    # Unified execution wrapper
    env-fingerprint.sh     # Environment fingerprinting
    write-sha256sums.sh    # Integrity checksums
    pack-paths.sh          # Path helpers
  base/                    # Minimal Ubuntu base
  node-20/                 # Node.js 20 runtime
  python-3.11/             # Python 3.11 + poetry
  dotnet-8/                # .NET 8 SDK
```

## Available Runners

### node-20
- **Base**: node:20-slim
- **Lock kind**: npm (package-lock.json)
- **Substrates**: MCP, ACP, A2A

### python-3.11
- **Base**: python:3.11-slim
- **Lock kind**: poetry (poetry.lock)
- **Substrates**: LangChain, LangGraph, MetaGPT

### dotnet-8
- **Base**: mcr.microsoft.com/dotnet/sdk:8.0
- **Lock kind**: nuget (packages.lock.json)
- **Substrates**: Semantic Kernel

## Usage

### Direct Execution

```bash
./runners/_lib/run-in-container.sh \
  --runner node-20 \
  --cmd "npm run produce" \
  --out-dir /path/to/pack/root
```

### From Producer Script

```bash
#!/usr/bin/env bash
source runners/_lib/pack-paths.sh

PACK_ROOT=$(get_pack_root "INDEXABLE_REAL" "mcp" "run-001")
mkdir -p "$PACK_ROOT"

./runners/_lib/run-in-container.sh \
  --runner node-20 \
  --cmd "cd /workspace/producers/mcp && npm run produce" \
  --out-dir "$PACK_ROOT"
```

## Runner Metadata Output

Each run produces `reports/runner.meta.json`:

```json
{
  "runner_id": "node-20",
  "container_digest": "sha256:abc123...",
  "environment_fingerprint": {
    "os": "linux",
    "arch": "x86_64",
    "runtime_type": "node",
    "runtime_version": "20.11.0",
    "generated_at": "2026-01-26T10:00:00Z"
  },
  "workdir": "/workspace",
  "executed_at": "2026-01-26T10:00:05Z"
}
```

## Smoke Tests

Each runner includes a smoke test to validate:
- Image builds successfully
- Runtime is accessible
- Can write to output directory
- Produces valid `runner.meta.json` with non-empty `container_digest`

```bash
# Test all runners
bash runners/node-20/smoke.sh
bash runners/python-3.11/smoke.sh
bash runners/dotnet-8/smoke.sh
```

## Environment Fingerprinting

The `env-fingerprint.sh` script generates a stable JSON fingerprint containing:
- OS (linux/darwin)
- Architecture (x86_64/arm64)
- Runtime type (node/python/dotnet)
- Runtime version

**Critical**: Field order is stable to ensure deterministic hashing.

## Provenance Chain Integration

Runner metadata feeds into evidence pack `manifest.json`:

```json
{
  "env_ref": {
    "runner_type": "container",
    "runner_id": "node-20",
    "container_digest": "sha256:abc123...",
    "environment_fingerprint": { ... }
  }
}
```

This satisfies `GATE-V2-SSOT-01` requirement for complete provenance in `INDEXABLE_REAL` packs.

## Adding New Runners

1. Create `runners/<runner-id>/Dockerfile`
2. Add smoke test: `runners/<runner-id>/smoke.sh`
3. Register in `producers/_registry/substrates.v2.yaml`
4. Run smoke test to validate

## Alignment with Substrate Registry

All `runner_id` values in `producers/_registry/substrates.v2.yaml` must have corresponding runner directories:

- `node-18` → `runners/node-18/`
- `node-20` → `runners/node-20/`
- `python-3.9` → `runners/python-3.9/`
- `python-3.10` → `runners/python-3.10/`
- `python-3.11` → `runners/python-3.11/`
- `dotnet-8` → `runners/dotnet-8/`

**Phase 1 Priority**: node-20, python-3.11, dotnet-8 (as specified in registry)

## Integration with Gates

- **GATE-V2-SSOT-01**: Validates `env_ref.container_digest` exists for INDEXABLE_REAL
- **GATE-V2-HOST-ALLOW-01**: Runners must not introduce forbidden hosts
- **GATE-V2-RUNNER-SMOKE-01** (future): Validates all registered runners pass smoke tests
