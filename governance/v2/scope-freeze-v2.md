# Validation Lab V2 - Scope Engineering Freeze (RC-2)

> [!IMPORTANT]
> This document serves as the **Engineering SSOT** for Scope Definitions in RC-2.
> The embedded YAML block below is the normative reference for Gates (`GATE-V2-SCOPE-SSOT-01`).

## 1. Scope Definitions (Canonical)

```yaml
scope_ssot_version: "v2-mvp-scope-01"
projection_schema_version: "2.1.0"

allowed_evidence_maturity_tiers:
  - "DECLARED"
  - "REPRODUCED"
  - "DISPUTE_READY"

allowed_adjudicable_surfaces:
  - "intent"
  - "plan"
  - "confirm"
  - "trace"
  - "snapshots"
  - "mcp"
  - "a2a"

frozen_profile_suites:
  - "ps-v2-mvp-01"

allowed_interop_stacks:
  - ["MCP"]
  - ["ACP"]
  - ["CrewAI"]
  - ["Magentic-One", "AutoGen"]
  - ["LangChain"]
  - ["LangGraph"]
  - ["Semantic Kernel"]
  - ["MetaGPT"]
  - ["LangGraph", "MCP", "A2A"]

scope_claims:
  liability_disclaimer: "Coverage reflects evidence maturity only; not endorsement or certification."
  tier_definitions:
    DECLARED: "Vendor or community declared evidence; not verified by MPLP Lab."
    REPRODUCED: "Verified by MPLP Lab with reproducible evidence pack and deterministic replay."
    DISPUTE_READY: "Fully adjudication-ready with failure closure and root cause isolation."

backfill_defaults:
  rc1_idx_runs:
    tier: "REPRODUCED"
    profile_suite_id: "ps-v2-mvp-01"
    surfaces:
      intent: false
      plan: true
      confirm: true
      trace: true
      snapshots: true
```

## 2. Engineering Notes

1.  **Immutability**: The values in the YAML block are FROZEN for RC-2. Any change requires a new RC cycle.
2.  **Usage**:
    - **Projections**: Must strictly output values from this allowlist.
    - **UI**: Must display the `liability_disclaimer` verbatim.
    - **Gates**: Validate that all Indexable Runs map to these definitions.
3.  **Exclusions**:
    - LangChain, LangGraph, A2A are explicitly **EXCLUDED** from this list.
