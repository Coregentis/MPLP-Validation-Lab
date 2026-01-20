#!/bin/bash
# Repro Bundle Entry Script: gf-01-mcp-official-v0.2
# Authority: Validation Lab (Non-Normative)

set -e
cd "$(dirname "$0")"

GENERATOR_PATH="../../../../tests/golden/flows/tool-call-flow"
OUTPUT_DIR="./output/mcp"

echo "=== MCP Repro Bundle ==="
echo "Generator: $GENERATOR_PATH"

mkdir -p "$OUTPUT_DIR"

echo "Installing dependencies..."
cd "$GENERATOR_PATH"
npm install --silent

echo "Running generator..."
node generate_pack.mjs

echo "Copying pack to output..."
cd -
cp -r "$GENERATOR_PATH/pack" "$OUTPUT_DIR/"

echo ""
echo "✅ Repro complete: $OUTPUT_DIR/pack"
