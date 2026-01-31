# RC-6 Strategy: The Determination Court (UX-as-Code)

> **Goal**: Transform the Validation Lab from an "Evidence Warehouse" into a "Public Determination Court".
> **Architecture**: **UX-as-Code**. All critical UI text, navigation paths, and verified claims are driven by SSOT files and enforced by Gates.

## 1. Core Architecture: UX-as-Code

### The SSOT Layer (`governance/ux/`)
Six immutable definitions drive the UI, preventing manual drift:

1.  **`role-model-v1.yaml`**: Who are the users (Architect/Compliance/Auditor/Builder). Defines:
    -   `primary_questions` (Human readable intent)
    -   `must_see_cases` (PASS/FAIL/SHIM)
    -   `must_see_proof_targets` (mplp:// pointers)
    -   `must_show_blocks` (Component Registry IDs)
    -   `required_disclaimer_tokens` (Frozen copy)
2.  **`role-journeys-v1.yaml`**: Canonical ≤3 click paths. Defines `expect_blocks` and `expect_ctas` per step.
3.  **`court-ia-freeze-v1.md`**: Immutable Route Map (Cases vs Laws vs Evidence). Mandates Clause Page structure.
4.  **`case-shelves-v1.yaml`**: Defined shelves (Precedents, Failures, Shims) with `criteria` and `why_this_matters`.
5.  **`tripod-entry-map-v1.yaml`**: Binding between Lab, Website, and Docs with `boundary_disclaimer_ref`.
6.  **`component-registry-v1.yaml`**: Component binding. Defines `hardcoded_text_policy` (Forbid/Allowlist) and `required_tokens`.

### The Compiler Layer
*   `scripts/build/build-ux-ssot.ts`: Compiles YAMLs into type-safe `app/_ssot/ux.generated.ts`.
*   **Validation**: Verifies all `mplp://` pointers resolve to actual Evidence in Projections.

### The Gate Layer
*   **Anti-Drift (Hard)**:
    *   `GATE-V2-NO-HANDWRITE-COPY-01`: Ban frozen sentence tokens in TSX. Force usage of generated tokens.
    *   `GATE-V2-SSOT-GENERATED-01`: Generated TS matches SSOT hash.
*   **Experience Quality (DoD)**:
    *   `GATE-V2-ROLE-MODEL-01` & `GATE-V2-ROLE-JOURNEYS-01`: Verify coverage and route integrity.
    *   `GATE-V2-ODL-FIRSTFOLD-01`: (Object Level) Verifies Case and Clause pages have required blocks (Verdict/Intent/Examples).

## 2. Information Architecture (3-Object Model)

| Juridical Concept | URL | Purpose |
| :--- | :--- | :--- |
| **Cases** | `/cases/[id]` | The Unit of Adjudication (Run). |
| **Laws** | `/laws` | The Standard of Adjudication (Ruleset). |
| **Evidence** | `/cases/[id]/evidence` | The Proof of Fact (Artifacts). |

## 3. Key Components
*   **Interop Visualizer**: Graph showing `LangGraph -> MCP -> A2A` flow.
*   **Clause Browser**: Shows Intent, Surfaces, and **Example Cases** (PASS/FAIL).
*   **Disclaimer Banner**: Verified Component that cannot be handwritten.
