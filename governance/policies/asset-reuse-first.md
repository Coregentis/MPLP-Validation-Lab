# Policy: Asset Reuse First

**Status**: Adopted
**Effective**: Phase 4-D
**Enforced By**: Manual Review + Asset Audits

## Principles
1.  **Reuse before Create**: Before creating any new data file, specific loader, or UI component, you MUST audit the repository for existing assets that can be reused or adapted.
2.  **Projection over Duplication**: If the data exists in a raw format (e.g. `public/_data`), adapt the Loader to project it to the View Model. Do NOT copy the data into a new "convenient" file.
3.  **Semantic Gates**: Gates must verify the *content* logic (e.g. "No Stubs"), not just the structural presence (HTTP 200).

## Mandatory Template: Implementation Plan
Every Implementation Plan must follow this "Asset-Survey-First" structure:

### 0) Asset Survey (Prerequisite)
*   **Data assets**: List paths + version/structure (e.g. `public/_data/**`).
*   **Loaders**: List existing loaders/adapters and their coverage.
*   **Routes/Pages**: List existing Topology.
*   **Gates**: List covering gates and gaps.
> *Must answer: "Can existing assets be reused directly? What adaptation is needed?"*

### 1) Reuse Plan (Binding)
*   Explicitly map **Asset** -> **Adapter/Loader** -> **UI Component**.
*   Prohibit abstract promises (e.g. "Establish SSOT") without pointing to a file.

### 2) Minimal Diff (Justification)
*   **Why-not-reuse**: If creating new files, justify why existing ones fail (e.g. Schema Conflict).
*   **Impact Scope**: List affected loaders/gates.

### 3) Gates Before Merge
*   New gates must verify **semantic integrity** (no regression), not just existence.

## Tooling
-   **Survey Script**: Run `npx tsx scripts/audit/asset-survey-general.ts` to generate an initial inventory.
