# RC-5 Validation Lab Research Report & Implementation Plan

## 1. 现状调研 (RC-1 ~ RC-4)

经过对仓库的深度扫描，我们确认了 Validation Lab V2 当前的架构状态，完全支持 RC-5 的增量演进。

### 1.1 核心资产分布
- **Governance (SSOT)**: `governance/` 目录存放了 Gates (`gates/`), Information Architecture (`ia/`), Regulatory Mapping (`reg-mapping/`) 和 Freeze Files (`scope-freeze-v2.md`, `dispute-freeze-v2.md`).
- **Data (Evidence)**: `data/runs/v2/` 按照 `real/` 和 `synthetic/` 分类存储。每个 run 包含 `manifest.json`, `timeline/`, `artifacts/` 等标准结构。
- **Pipeline (Projections)**: `scripts/build/build-projection.ts` 是核心构建脚本，负责将原始 evidence 转换为 UI 可读的 JSON (`public/_data/v2/`). 目前包含 28 个 active gates。
- **UI (The Court)**: `app/` 实现了基于 Next.js 的 "Determination Court"，严格遵循 "No-FS" 架构，仅读取 `public/_data/v2/` 下的 projections。

### 1.2 关键约束 (RC-5 必须遵守)
1.  **Strict Gates**: 目前有 28 个 active gates，必须全部通过 (`npm run gate:all`).
2.  **Projection-Only**: UI 禁止访问文件系统，必须通过 `lib/projections.ts` 读取构建产物。
3.  **Deterministic**: 所有 run 必须由 `canonicalization/rules.v2.md` 定义的规则进行哈希校验。

---

## 2. RC-5 实施方案评估

### 2.1 方案可行性
- **Coverage Expansion**: 可行。现有 `data/runs/v2/real/` 结构完全支持新增 substrates (langchain, langgraph, etc.)。
- **Interop Benchmark**: 可行。`manifest.json` 需要扩展字段支持 `interop_stack` 和 `adjudicable_surfaces` 的显式声明（目前是脚本硬编码推断，需要升级为 "Manifest-First" 策略）。
- **UI Updates**: 可行。`RunList.tsx` 已经实现了基于 Projection Facets 的过滤逻辑，只需确保后端 `build-projection.ts` 正确输出 `interop_stack` 数组即可。

### 2.2 关键调整点 (Projections Pipeline)
- **Manifest 优先原则**: 修改 `build-projection.ts`，不再强制根据 `substrate_id` 覆盖 `interop_stack`。如果 `manifest.json` 中存在该字段，优先使用 manifest 的值。这允许我们灵活定义 "Interop Combo" run。
- **Producer 合同**: 明确 `producers/<framework>/` 必须输出包含 `interop_stack` 的 manifest。

---

## 3. RC-5 详细执行蓝图

### 3.1 目录结构规划
```text
validation-lab-v2/
├── producers/
│   ├── langchain/          # [NEW] LangChain Producer
│   ├── langgraph/          # [NEW] LangGraph Producer
│   ├── semantickernel/     # [NEW] Semantic Kernel Producer
│   ├── metagpt/            # [NEW] MetaGPT Producer
│   └── interop/            # [NEW] Interop Combo Producer (LangGraph + MCP/A2A)
├── data/runs/v2/real/
│   ├── langchain/langchain-d1-real-runner-det-001/
│   ├── langgraph/langgraph-d1-real-runner-det-001/
│   ├── semantickernel/semantickernel-d1-real-runner-det-001/
│   ├── metagpt/metagpt-d1-real-runner-det-001/
│   └── interop/interop-mcp-a2a-langgraph-d1-real-runner-det-001/  # [Killer Feature]
└── scripts/gates/
    ├── check-framework-coverage-01.ts  # [NEW]
    ├── check-interop-bench-01.ts       # [NEW]
    └── check-interop-evidence-01.ts    # [NEW]
```

### 3.2 Interop Benchmark (LangGraph Host) 蓝图

这是一条 **"Killer Run"**，其 Evidence 必须包含 MCP 和 A2A 的真实交互指针。

- **Run ID**: `interop-mcp-a2a-langgraph-d1-real-runner-det-001`
- **Scenario**: `d1_basic_pass`
- **Interop Stack**: `["LangGraph", "MCP", "A2A"]`
- **Evidence Surfaces (Producer 输出)**:
    - **Manifest**:
        ```json
        {
          "interop_stack": ["LangGraph", "MCP", "A2A"],
          "adjudicable_surfaces": { "mcp": true, "a2a": true, "timeline": true }
        }
        ```
    - **Timeline (`events.ndjson`)**:
        ```json
        // Event 0: The Context
        {"type": "context", "content": "Calculate 5 + 3 using MCP tool and send result via A2A."}
        
        // Event 1: The Plan
        {"type": "plan", "content": "1. Call calculator. 2. Send envelope."}
        
        // Event 2: MCP Tool Call (Key Evidence)
        {"type": "mcp_tool_call", "server": "math-server", "tool": "add", "args": {"a": 5, "b": 3}}
        
        // Event 3: MCP Tool Result
        {"type": "mcp_tool_result", "result": 8}
        
        // Event 4: A2A Envelope (Key Evidence)
        {"type": "a2a_envelope", "protocol": "open_agent", "payload": {"task_id": "123", "result": 8}}
        
        // Event 5: Confirm
        {"type": "confirm", "status": "success"}
        ```
    - **Pointers (Ruleset 引用)**:
        - `mplp://timeline/events.ndjson#2` (MCP Proof)
        - `mplp://timeline/events.ndjson#4` (A2A Proof)

---

## 4. 实施步骤 Checklist

### Phase 1: Pipeline & Architecture
- [ ] 修改 `scripts/build/build-projection.ts`: 支持 `manifest.interop_stack` 优先读取。
- [ ] 修改 `app/runs/RunList.tsx`: 确保 UI 正确渲染多值 Stack 标签。

### Phase 2: Producers & Evidence (The "Real Work")
- [ ] 创建 `producers/langchain` 及对应 Run。
- [ ] 创建 `producers/langgraph` 及对应 Run。
- [ ] 创建 `producers/semantickernel` 及对应 Run。
- [ ] 创建 `producers/metagpt` 及对应 Run。
- [ ] **创建 `producers/interop` 及 Interop Benchmark Run (LangGraph Host)。**

### Phase 3: Governance (The "Bailiffs")
- [ ] 实现 `GATE-V2-FRAMEWORK-COVERAGE-01`: 扫描必须包含 4 大框架。
- [ ] 实现 `GATE-V2-INTEROP-BENCH-01`: 扫描必须包含 Interop Combo。
- [ ] 实现 `GATE-V2-INTEROP-EVIDENCE-01`: 深度扫描 Interop Run 的 timeline 是否包含 MCP/A2A 事件。
- [ ] 注册新 Gates 到 `gate-registry-v2.json` (总数 28 -> 31)。

### Phase 4: UI & Release
- [ ] 更新 `governance/ia/recommended-runs-v1.yaml` (上架 Interop Run)。
- [ ] 生成 Release Closure (RC-5)。

---

## 5. 结论
本方案完全符合 RC-4 的架构约束，且能以最小侵入性实现 RC-5 的目标。Interop Benchmark 将作为 V2 的首个 "Multi-Protocol Composition" 证据，具有里程碑意义。
