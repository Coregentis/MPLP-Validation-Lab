---
doc_type: governance
authority: Validation Lab
normativity: non-normative
status: active
version: "1.0"
---

# Provenance Model — Validation Lab

**Authority**: Validation Lab (Non-Normative)  
**Last Updated**: 2026-01-14

---

## Core Principle

> **Lab 裁决证据，唯一 Verifier 为 lib + ruleset + gates，入口为 vlab CLI**

---

## 1. Authority Chain

```
Evidence Pack (Any Producer)
       │
       ▼
┌─────────────────────────────────┐
│  Canonical Verifier (lib/)      │
│  ├── engine/verify.ts           │
│  ├── evaluate/evaluate.ts       │
│  └── verdict/taxonomy.ts        │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Ruleset (data/rulesets/)       │
│  └── ruleset-1.0/               │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Gates (lib/gates/)             │
│  └── gate-02..10                │
└─────────────────────────────────┘
       │
       ▼
    Verdict / Proof
```

---

## 2. Producer vs Verifier Separation

| Concern | Owner | Location |
|:---|:---|:---|
| **Producer** | Various (framework authors, Lab, third-party) | External or `fixtures/` |
| **Verifier** | Validation Lab Only | `lib/engine/`, `lib/gates/` |
| **Ruleset** | Validation Lab Only | `data/rulesets/` |

> **Key Insight**: 多 Producer 可存在，但 Verifier 必须唯一且版本化

---

## 3. Historical Releases (v0.1–v0.7.3)

Historical releases were produced by various harnesses (some via main repo `scripts/gates/*`).

**Resolution**: All historical releases can be **reverified** by the current canonical verifier:

- Reverification results are stored in `reverification/<version>/`
- Original `releases/` remain immutable
- Authority is established through reverification, not production history

---

## 4. Canonical Entry Point

All verification and adjudication MUST go through:

```bash
pnpm vlab:verify <pack_path>
pnpm vlab:adjudicate <run_id>
pnpm vlab:reverify <release_version>
pnpm vlab:gates
```

The CLI entry point is: `src/cli/vlab.ts`

---

## 5. Cross-Repo Authority

| Direction | Allowed | Mechanism |
|:---|:---|:---|
| VLab reads main repo schemas | ✅ | `UPSTREAM_BASELINE.yaml` + sync scripts |
| Main repo reads VLab export | ✅ | `export/manifest.json` |
| Main repo executes VLab gates | ❌ | Forbidden |
| VLab modifies main repo | ❌ | Forbidden |

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-14
