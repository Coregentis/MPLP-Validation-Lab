#!/bin/bash
# Repro Bundle Entry Script: gf-01-a2a-official-v0.2
# Authority: Validation Lab (Non-Normative)

set -e
cd "$(dirname "$0")"

GENERATOR_PATH="../../../../tests/cross-substrate/gf-01/a2a"
OUTPUT_DIR="./output/a2a"

echo "=== A2A Repro Bundle ==="
echo "Generator: $GENERATOR_PATH"

mkdir -p "$OUTPUT_DIR"

echo "Installing dependencies..."
pip3 install -q -r "$GENERATOR_PATH/requirements.txt"

echo "Running generator..."
cd "$GENERATOR_PATH"
python3 generate_pack.py

echo "Copying pack to output..."
cd -
cp -r "$GENERATOR_PATH/pack" "$OUTPUT_DIR/"

echo ""
echo "✅ Repro complete: $OUTPUT_DIR/pack"
