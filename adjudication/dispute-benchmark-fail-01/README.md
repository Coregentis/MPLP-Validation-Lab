# Dispute Benchmark FAIL Pack (P0-3)

This pack serves as a **textbook example** of how a FAIL verdict can be closed and disputed.

## Purpose

1. **Third-party reproducibility**: Anyone can verify the FAIL verdict without Lab execution
2. **Evidence chain transparency**: All pointers are explicit and resolvable
3. **Dispute enablement**: Provides complete closure for external review

## Pack Structure

```
dispute-benchmark-fail-01/
├── README.md                    # This file
├── verdict.json                 # FAIL verdict with clause refs
├── evidence_pointers.json       # Explicit event/diff/integrity pointers
├── timeline/
│   └── events.ndjson            # Event stream with disputed event
├── snapshots/
│   └── diffs/
│       └── confirm-gate-missing.json   # State diff showing missing gate
└── integrity/
    ├── manifest.json            # Pack manifest
    └── sha256sums.txt           # File hashes
```

## FAIL Scenario

**Clause**: CL-D3-02 (Authorization confirm-gate enforcement)  
**Requirement**: RQ-D3-02 (DENY outcome must have prior confirm gate)  
**Failure**: Authorization decision with `outcome: deny` but missing `confirm_gate` event

This is a high-controversy FAIL: it tests whether the agent properly gated a denial action.

## Non-Normative Boundary

> This pack demonstrates evidence adjudicability, NOT framework superiority.
> The Lab does not judge whether the agent's behavior was "correct" in an application sense.
