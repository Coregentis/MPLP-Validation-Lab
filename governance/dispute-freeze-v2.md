```yaml
dispute_freeze:
  version: v2
  status: frozen
  purpose: "Dispute-Ready / FAIL Benchmark governance overlay for V2."
  invariants:
    projection_only: true
    run_only_expansion: true
    allowed_root_causes:
      - policy_violation
      - provenance
    disallowed_root_causes:
      - subtle_determinism_fault
      - heuristic_adjudication
  dispute_types:
    enabled_in_rc3:
      - policy_violation
      - provenance
    reserved_not_enabled:
      - determinism
      - integrity

  dispute_ready_minimum:
    # Required for tier=DISPUTE_READY + verdict=FAIL
    required_fields:
      - dispute_closure.fail_signature
      - dispute_closure.clause_hits
      - dispute_closure.primary_evidence_pointers
      - dispute_closure.fail_root_cause_pointer
      - dispute_closure.replay_instructions_ref
      - dispute_closure.snapshot_diff_set

    pointer_requirements:
      must_be_resolvable: true
      must_be_mplp_pointer: true

  evidence_requirements:
    policy_violation:
      requires:
        - timeline_event_pointer
        - clause_hit_pointer
        - confirm_gate_or_verification_step_pointer
        - snapshot_diff_pointer_optional: true
    provenance:
      requires:
        - runner_seal_pointer
        - manifest_env_ref_pointer
        - integrity_hash_pointer

  ui_invariants:
    show_dispute_panel_only_when:
      verdict: FAIL
    must_display_disclaimer: true
    disclaimer_text_exact:
      - "Dispute capability is pointer-backed and ruleset-bounded; not certification or endorsement."
```
