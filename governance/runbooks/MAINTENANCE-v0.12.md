# Runbook: Maintenance v0.12.x

This runbook defines the operational triggers and procedures for the **v0.12 Sustainability Series** during its **Maintenance Phase**.

## 1. Classification of Changes

| Category | Definition | Allowed in v0.12.x? | Trigger |
| :--- | :--- | :--- | :--- |
| **Hotfix** | Link fixes, UI micro-typos, non-cert text drift, gate parity repairs. | **YES** | v0.12.2, 12.3... |
| **Security** | Minor dependency security patches (no behavioral shift). | **YES** | v0.12.x |
| **Drift** | Any change to interpretive logic, new substrates, or IA categories. | **NO** | **MUST v0.13.0** |

## 2. Decision Logic: v0.12.x vs v0.13.0

The **v0.12 Stopline** is enforced for any change that alters the **Interpretive Boundary** or **Evidence Scale** of the Lab.

### 🚫 FORCE v0.13.0 IF:
- New **Substrate** (apart from existing MCP/SK/AutoGen/LangGraph baseline).
- New **Scenario Family** (d2, d3... if currently not covered in v0.12).
- New **L1 Entry** or **IA Category** (expansion of navigation depth).
- New **Adjudication Logic** (schema changes or new equivalence metrics).

## 3. Maintenance Release Procedure (v0.12.x)

### Phase 1: Preflight
1. Run sustainability gate suite:
   ```bash
   npm run gate:all && npm run gate:release:01 && npm run gate:v12-sop && npm run audit:nav-depth
   ```
2. Verify zero behavioral drift (`Verdict Flips: 0` in evolution hub).

### Phase 2: Implementation
1. Apply **minimal** change required.
2. Update cryptographic anchors in `lab-manifest.json` and `ruleset-diff-index.json`.

### Phase 3: SEALing
1. Issue `SEAL-v0.12.x.md` in `governance/seals/`.
2. Explicitly declare:
   - `Scope: Hotfix (Link/Anchor/Boundary)`
   - `Behavioral Drift: 0`
3. Update `lab_series` and `seal_v12_x_sha256` in `lab-manifest.json`.

## 4. Maintenance Phase Rules (Corrosion Prevention)

To maintain audit-grade durability, the following **MUSTs** are enforced:

- **MUST-1: Dependency Upgrade Rule**: Any security patch or dependency upgrade that causes **verified output hashes (manifest/summary) to change**—even if logic is identical—is a **v0.13.0 Trigger**. v0.12.x is bit-identical only.
- **MUST-2: Grey-Zone Rejection**: Any change that cannot be explicitly classified as a **Hotfix** (Procedure 1) or **Security Patch** (Procedure 2) is automatically classified as **Drift** and **PROHIBITED** in v0.12.x.
- **MUST-3: Anchor Backfill Checklist**: Every v0.12.x release MUST verify and backfill hashes across the following anchors:
    - [ ] `lab-manifest.json` (series, seal hashes, tripod anchors)
    - [ ] `ruleset-diff-index.json` (diffpack hashes, summary hashes)
    - [ ] `SEAL-v0.12.x.md` (triad hashes, scope declaration, drift=0 statement)

## 5. v0.13.0 Upgrade Triggers (Functional Evolution)

Functional expansion is strictly versioned in **v0.13.0**. Triggers include:

- **New Substrate**: Any substrate addition beyond the v0.12 baseline (MCP/A2A/ACP).
- **New Scenario Family**: Expansion into new domains (d2, d3, d4...).
- **Narrative Expansion**: New interpretation hubs, metrics, or weighting systems.
- **Protocol Schema Evolution**: Any upstream sync that changes the interpretive boundary.

## 6. Minimum Heartbeat (Routine Audit)

To ensure the project remains auditable even during low-activity periods, the following **Monthly Heartbeat** is recommended:

- **Command Chain**: Execute the preflight audit:
  ```bash
  npm run gate:all && npm run gate:release:01 && npm run gate:v12-sop
  ```
- **Verification Points**:
    - [ ] **Release Triad**: Confirm zero drift in `gate:release:01`.
    - [ ] **SOP Integrity**: Confirm manifest/physical/SEAL parity in `gate:v12-sop`.
    - [ ] **Evolution Hub**: Confirm zero verdict flips in the 1.1 → 1.2 exercise.
- **Reporting**: If any gate fails due to environment drift (e.g., CI changes, node versions), a **v0.13.0** upgrade must be evaluated.

---
**Sustainability Anchor**: [SEAL-v0.12.1](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/governance/seals/SEAL-v0.12.1.md) is the primary reference for the sustainability line.
