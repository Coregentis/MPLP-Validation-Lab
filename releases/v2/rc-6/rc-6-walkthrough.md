# RC-6 Manual Proof Pack (PR-10B)

**Status:** READY FOR ADJUDICATION  
**Date:** 2026-01-28

This document provides the canonical "3 Clicks or Less" verification paths for the 4 primary roles. Use this to validate the "Court Availability" release criteria.

## 1. Enterprise Architect (Interop Verification)
**Goal:** Verify that a complex Interop Stack (MCP + LangGraph + A2A) executed deterministically.

*   **Start Route:** `/start?role=architect`
*   **Step 1:** Click **Start Journey**.
    *   *Transition:* -> `/cases/interop-mcp-a2a-langgraph-d1-real-runner-det-001`
*   **Step 2:** Locate **Interop Stack Flow** and click any event (e.g., Event 3).
    *   *Target Ptr:* `?ptr=mplp://timeline/event/3`
    *   *Result:* Parameter introspection works; `BLOCK_INTEROP_VISUALIZER` is present.
*   **Total Clicks:** 2

## 2. Compliance Officer (Regulatory Mapping)
**Goal:** Assess how the lab maps to EU AI Act Article 15.

*   **Start Route:** `/start?role=compliance`
*   **Step 1:** Click **View Regulatory Mapping**.
    *   *Transition:* -> `/policies/reg-mapping`
    *   *Tripod Check:* `reg_mapping_access` inbound rule fired. `BLOCK_DISCLAIMER_BANNER` must be visible ("Reading Aid Only").
*   **Step 2:** Verify table rows show "Article 15" mapping to "MPLP Clause".
*   **Total Clicks:** 1

## 3. Third-Party Auditor (Dispute Resolution)
**Goal:** Verify a Dispute Closure and resolving Root Cause.

*   **Start Route:** `/start?role=auditor`
*   **Step 1:** Click **Inspect Failure Benchmark**.
    *   *Transition:* -> `/cases/mcp-d1-fail-benchmark-001`
*   **Step 2:** Locate **Dispute Closure** Panel (Red).
*   **Step 3:** Click **Jump to Evidence** (if pointer exists) or verify Root Cause text.
    *   *Target:* `mplp://artifacts/verdict.json` context.
    *   *Result:* Root cause explicitly identified as "Tool Call Latency" (or similar).
*   **Total Clicks:** 2

## 4. Framework Developer (Evidence Protocol)
**Goal:** Implement the MPLP Manifest schema.

*   **Start Route:** `/start?role=builder`
*   **Step 1:** Click **Build Evidence**.
    *   *Transition:* -> `/cases/interop-mcp-a2a-langgraph-d1-real-runner-det-001`
*   **Step 2:** Click **Evidence Docket** (or scroll to Manifest).
    *   *Target:* `BLOCK_MANIFEST_VIEWER`
*   **Step 3:** verify `Run ID`, `Schema Bundle`, `Root Hash` are visible and tokenized.
*   **Total Clicks:** 2

## Tripod Integration Verification
- **Inbound:** Verified `/policies/reg-mapping` enforces Disclaimer.
- **Outbound:** Verified "Clause Name" links in `/laws` point to `docs:/laws/...` pattern with "Reading Aid" checks.
