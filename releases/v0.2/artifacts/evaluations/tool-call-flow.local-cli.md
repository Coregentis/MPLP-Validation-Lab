# MCP Tool-Call Flow Evaluator Evidence
# Generated: 2026-01-13
# Purpose: Auditable verdict_hash stability for v0.2 MCP run

## Evaluator Info
- evaluator: local-cli
- evaluator_version: v0.2.0
- pack_path: tests/golden/flows/tool-call-flow/pack

## Run 1
```
Verdict: PASS
verdict_hash: e7f5b31e40d6a645782d219428c731ebed338739b5eadf831ec206fc7d002011
pack_root_hash: 403b0c41336ae4c674031c53d52447e441fd86fca5c0bf38982e5b29486cf2ca

Checks:
  ✓ file_exists:manifest.json
  ✓ file_exists:artifacts/context.json
  ✓ file_exists:artifacts/plan.json
  ✓ file_exists:artifacts/trace.json
  ✓ file_exists:timeline/events.ndjson
  ✓ file_exists:integrity/sha256sums.txt
  ✓ invariant:tool_call_event_present
  ✓ invariant:tool_result_event_present
  ✓ invariant:tool_data_present
```

## Run 2
```
Verdict: PASS
verdict_hash: e7f5b31e40d6a645782d219428c731ebed338739b5eadf831ec206fc7d002011
pack_root_hash: 403b0c41336ae4c674031c53d52447e441fd86fca5c0bf38982e5b29486cf2ca
```

## Diff Stability
```
Diff output: Only timestamp differs (expected)
verdict_hash: IDENTICAL ✅
pack_root_hash: IDENTICAL ✅

DIFF STABILITY: PASS
```

## Conclusion
MCP tool-call-flow pack produces deterministic verdict_hash across multiple evaluator runs.
