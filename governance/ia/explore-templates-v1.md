---
ssot_type: ia_explore_templates
version: v1
templates:
  - template_id: evidence_repro
    question: "I need reproducible evidence of governance"
    filters:
      tier: "REPRODUCED"
      verdict: "PASS"
    expected_result_floor: 1

  - id: dispute_bench
    question: "I need a dispute benchmark (FAIL case)"
    filters:
      tier: "DISPUTE_READY"
      verdict: "FAIL"
    expected_result_floor: 1

  - id: mcp_evidence
    question: "I want to see MCP substrate evidence"
    filters:
      substrate: "mcp"
      tier: "REPRODUCED"
    expected_result_floor: 1
---
# Explore Templates
Templates for the `/explore` page.
