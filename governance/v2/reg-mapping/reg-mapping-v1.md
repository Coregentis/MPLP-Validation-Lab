# Regulatory Mapping v1

> **Status**: Frozen (RC-4)
> **Type**: Reading Aid Only

```yaml
reg_mapping:
  version: v1
  status: frozen
  non_normative: true
  purpose: "Reading aid mapping from ruleset clauses to external governance frameworks."
  disclaimer_text_exact:
    - "Reading aid only. Not compliance. Not certification. Not endorsement."

  sources:
    - iso_iec_42001
    - nist_ai_rmf
    - eu_ai_act

  forbidden_terms:
    - compliant
    - compliance
    - certified
    - certification
    - attested
    - endorsement
    - audit_passed

  mapping:
    - clause_id: "TRUST-V2-01"
      clause_ref:
        ruleset: "v2.0.0"
        # pointer must be resolvable in your pointer contract model
        clause_pointer: "mplp://rulesets/v2.0.0#/clauses/TRUST-V2-01"
      iso_iec_42001:
        - control_point: "A.6.1.2"
          refs: ["ISO/IEC 42001:2023 - System Impact Analysis"]
      nist_ai_rmf:
        - function: "GOVERN"
          category: "GV-1.3"
          refs: ["NIST AI RMF 1.0 - Processes and procedures"]
      eu_ai_act:
        - theme: "risk-management"
          article_ref: "Art. 9"
          refs: ["EU AI Act - Risk Management System"]
          
    - clause_id: "SAFE-V2-02"
      clause_ref:
        ruleset: "v2.0.0"
        clause_pointer: "mplp://rulesets/v2.0.0#/clauses/SAFE-V2-02"
      iso_iec_42001:
        - control_point: "A.9.2"
          refs: ["ISO/IEC 42001:2023 - Data Management"]
      nist_ai_rmf:
        - function: "MANAGE"
          category: "MAN-2"
          refs: ["NIST AI RMF 1.0 - Data Analysis"]
      eu_ai_act:
        - theme: "data-governance"
          article_ref: "Art. 10"
          refs: ["EU AI Act - Data Governance"]
```
