# Evidence Producer Specification

**Version**: v0.1 (Historical)  
**Status**: Superseded — See current entry points below  
**Applicable Site Version**: site-v0.5

> [!IMPORTANT]
> **Current Entry Points**:
> - For evidence pack structure: See [Export Contract](/policies/contract)
> - For submission process: See [Intake Policy](/policies/intake)
> - For substrate admission: See [Substrate Scope Policy](/policies/substrate-scope)

---

## Purpose

This specification defines how third parties can generate evidence packs compatible with the MPLP Validation Lab's verification pipeline.

## Critical Disclaimers

> [!CAUTION]
> **NOT Official SDKs**: The reference implementations provided are examples only. They are NOT official, supported, or maintained SDKs.

> [!WARNING]
> **NOT Endorsement**: Inclusion of a substrate in examples does NOT constitute endorsement, qualification, or recommendation by the MPLP Validation Lab.

> [!IMPORTANT]
> **Substrate Definition**: "Substrate" refers to the execution environment (e.g., A2A runtime, Langchain framework, MCP server). The substrate is NOT the verdict authority. Verdicts are determined solely by the Validation Lab's evaluation against frozen rulesets.

> **Lab Infrastructure**: The MPLP Validation Lab does NOT execute agent code. All evidence generation occurs in third-party environments outside Lab control.

---

## Evidence Pack Requirements

Per Evidence Pack Contract v1.0:

### Mandatory Files

1. `manifest.json` - Pack metadata
2. `integrity/sha256sums.txt` - File integrity checksums
3. `integrity/pack.sha256` - Pack root hash
4. `timeline/events.ndjson` - Execution timeline

### Artifact Requirements (GF-01)

For Golden Flow 01 (Single Agent Lifecycle):

- `artifacts/context.json` - Agent context
- `artifacts/plan.json` - Agent plan
- `artifacts/trace.json` - Execution trace

---

## Producer Responsibilities

Evidence producers are responsible for:

1. **Generating Valid Packs**: Files must conform to Evidence Pack Contract v1.0
2. **Computing Integrity**: Correct `sha256sums.txt` and `pack.sha256`
3. **Deterministic Artifacts**: Same execution should produce verifiably equivalent evidence
4. **Substrate Metadata** (optional): May include `manifest.substrate` per Contract v1.1

---

## Verification Process

Packs submitted for curated inclusion undergo:

1. **GATE-02 (Admission)**: Integrity and structural validation
2. **GATE-03 (Determinism)**: Verdict hash stability
3. **GATE-08 (Curated)**: Schema compliance, repro_ref validation
4. **Evaluation**: Assessment against frozen ruleset (e.g., ruleset-1.0)

---

## Third-Party Recomputation

Anyone can verify curated verdicts using `@mplp/recompute`:

```bash
npm install @mplp/recompute
npx @mplp/recompute <pack_path> --ruleset 1.0
```

This CLI:
- Bundles frozen ruleset-1.0
- Operates offline (no network)
- Produces deterministic `verdict_hash`
- Enables trustless third-party verification

---

## Reference Implementations

The Lab provides **non-official** reference templates for:

- **A2A** (Agentic-to-Agentic substrate)
- **Langchain** (Python framework substrate)
- **MCP** (Model Context Protocol substrate)

See `examples/evidence-producers/` for templates with reproduction steps.

---

## License

Evidence Pack Contract and specifications: MIT  
Reference implementations: MIT (examples only, no warranty)

## Support

Evidence producers are **self-service**. The Lab does not provide:
- Substrate-specific debugging
- Custom pack generation services
- Hosted execution environments

For questions on pack structure: See Evidence Pack Contract v1.0  
For questions on evaluation: See Ruleset documentation
