#!/usr/bin/env bash
# MCP Producer Entry Script
#
# Usage:
#   ./scripts/produce.sh --scenario d1_basic_pass --run-id mcp-d1-001

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRODUCER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PRODUCER_ROOT"

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run producer
echo "🔨 Running MCP producer..."
npm run produce -- "$@"
