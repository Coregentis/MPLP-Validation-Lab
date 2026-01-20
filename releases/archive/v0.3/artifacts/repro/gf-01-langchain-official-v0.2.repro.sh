#!/bin/bash
# Repro Bundle Entry Script: gf-01-langchain-official-v0.2
# Authority: Validation Lab (Non-Normative)
# 
# This script reproduces the LangChain pack generation.
# Run from this directory: ./gf-01-langchain-official-v0.2.repro.sh

set -e
cd "$(dirname "$0")"

GENERATOR_PATH="../../../../tests/cross-substrate/gf-01/langchain"
OUTPUT_DIR="./output/langchain"

echo "=== LangChain Repro Bundle ==="
echo "Generator: $GENERATOR_PATH"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Install dependencies
echo "Installing dependencies..."
pip3 install -q -r "$GENERATOR_PATH/requirements.txt"

# Run generator
echo "Running generator..."
cd "$GENERATOR_PATH"
python3 generate_pack.py

# Copy pack to output
echo "Copying pack to output..."
cd -
cp -r "$GENERATOR_PATH/pack" "$OUTPUT_DIR/"

echo ""
echo "✅ Repro complete: $OUTPUT_DIR/pack"
