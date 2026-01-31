#!/usr/bin/env bash
# Pack Path Helpers
#
# Standardized path construction for evidence packs

set -euo pipefail

# Get pack root path
# Usage: get_pack_root <indexability> <substrate_id> <run_id>
get_pack_root() {
  local indexability=$1
  local substrate_id=$2
  local run_id=$3
  
  local category
  case "$indexability" in
    INDEXABLE_REAL)
      category="real"
      ;;
    INDEXABLE_SYNTHETIC)
      category="synthetic"
      ;;
    NON_INDEXABLE)
      category="non-indexable"
      ;;
    *)
      echo "Error: Unknown indexability: $indexability" >&2
      exit 1
      ;;
  esac
  
  echo "data/runs/v2/$category/$substrate_id/$run_id"
}

# Export function
export -f get_pack_root
