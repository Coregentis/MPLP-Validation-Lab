# Validation Lab 调研报告

## 1. 项目定位与边界

根据现有治理文档，**Validation Lab** 与 **Verification Suite** 是两个独立系统：

| 系统 | 输入 | 输出 | 治理范围 |
|:---|:---|:---|:---|
| **Verification Suite** (仓库内部) | 仓库文件 | `_manifests/` 一致性证据 | [GOV-ADDENDUM-EVID-BASELINE](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/governance/02-schema-verification/records/GOV-ADDENDUM-EVID-BASELINE-v1.0.md) |
| **Validation Lab** (用户端) | 用户 Evidence Packs | 一致性判定 (Verdicts) | Lab Ruleset (待定义) |

### 核心定位

> **Validation Lab = 基于证据的评估工具，非认证服务**

- ✅ 提供评估工具（Self-Assessment）
- ✅ 运行 Golden Flow 测试
- ✅ Schema 验证
- ❌ **不提供官方认证或背书**
- ❌ **不托管执行环境**
- ❌ **不授予徽章、印章或证书**

---

## 2. 功能范围（基于现有文档）

### 2.1 核心功能模块

根据 [MPLP_website/validation-lab/page.tsx](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/MPLP_website/app/validation-lab/page.tsx) 的规划：

| 功能 | 描述 |
|:---|:---|
| **Golden Flow Test Runners** | GF-01 ~ GF-05 测试运行器，验证生命周期一致性 |
| **Schema Validators** | Plan、Confirm、Trace、Snapshot 等模块的 JSON Schema 验证 |
| **Evidence Chain Verification** | 证据链完整性验证 |
| **Self-Assessment Reports** | 一致性自评估报告生成 |

### 2.2 一致性层级（Conformance Classes）

根据 [conformance-model.md](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/docs/docs/evaluation/conformance/conformance-model.md)：

| 等级 | 层 | 最低要求 |
|:---|:---|:---|
| **L1 Conformant** | Data | Valid Context, Plan, Trace schemas |
| **L2 Conformant** | Coordination | L1 + Module interactions valid |
| **L3 Conformant** | Execution | L2 + Runtime invariants hold |

### 2.3 Golden Flows 验证范围

| Golden Flow | 验证内容 | 对应层级 |
|:---|:---|:---|
| GF-01 | Single Agent Lifecycle | L1/L2 |
| GF-02 | Multi-Agent Coordination | L2 |
| GF-03 | Human-in-the-Loop Gating | L2 |
| GF-04 | Drift Detection & Recovery | L3 |
| GF-05 | External Tool Integration | L3/L4 |

---

## 3. 现有可复用资源

### 3.1 测试套件 — `tests/golden/`

**路径**: [tests/golden/](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/tests/golden/)

现有 9 个 Flow 测试用例:

| 目录 | 类型 |
|:---|:---|
| `flow-01-single-agent-plan` | Core Flow |
| `flow-02-single-agent-large-plan` | Core Flow |
| `flow-03-single-agent-with-tools` | Core Flow |
| `flow-04-single-agent-llm-enrichment` | Core Flow |
| `flow-05-single-agent-confirm-required` | Core Flow |
| `map-flow-01-turn-taking` | Multi-Agent Profile |
| `map-flow-02-broadcast-fanout` | Multi-Agent Profile |
| `sa-flow-01-basic` | Self-Assessment Profile |
| `sa-flow-02-step-evaluation` | Self-Assessment Profile |

**子目录结构**:
- `flows/` — Reference event sequences (Golden Flows)
- `harness/` — TypeScript test runner (Engineering Tool)
- `invariants/` — Logic for checking trace consistency

> [!IMPORTANT]
> 这些是**工程自验证**用例，非认证套件。可作为 Validation Lab 的核心测试数据复用。

### 3.2 Conformance 包 — `@mplp/conformance`

**路径**: [packages/npm/conformance/](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/packages/npm/conformance/)

已提供:
- Protocol conformance interfaces (MPLP v1.0.0)
- Golden Flow validation (Flow-01 ~ Flow-05) **接口**
- PSG (Protocol State Graph) validation **接口**
- Schema conformance utilities **接口**

**现状**: 当前仅重导出 `@mplp/compliance`，实际功能有限。

### 3.3 文档体系 — `docs/docs/evaluation/`

**路径**: [docs/docs/evaluation/](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/docs/docs/evaluation/)

| 目录 | 内容 |
|:---|:---|
| `conformance/` | 一致性模型、评估维度、结果定义等（7 个文件） |
| `golden-flows/` | Golden Flows 定义文档（11 个文件） |
| `governance/` | 评估治理文档（11 个文件） |
| `standards/` | 标准定义（4 个文件） |
| `tests/` | 测试相关文档（8 个文件） |

> 这些文档可作为 Validation Lab 的知识基础，部分内容可直接嵌入或链接。

### 3.4 Schemas — `schemas/v2/`

**路径**: [schemas/v2/](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/schemas/v2/)

- 所有 MPLP 模块的 JSON Schema 定义
- 包含 74 个 schema 文件
- Validation Lab 需要使用这些 schema 进行验证

### 3.5 现有 Website 占位页

**路径**: [MPLP_website/app/validation-lab/page.tsx](file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/MPLP_website/app/validation-lab/page.tsx)

- 当前为 "Coming Soon" 状态
- 已定义 SEO metadata、boundaries 声明
- 可作为迁移参考

---

## 4. 独立子仓库结构建议

参考 `MPLP_website` 的结构，建议 `validation-lab` 采用如下结构:

```
validation-lab/
├── .github/                    # CI/CD workflows
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # 首页
│   ├── schema-validator/      # Schema 验证器
│   ├── golden-flow-runner/    # Golden Flow 测试运行器
│   ├── evidence-pack/         # Evidence Pack 验证
│   └── conformance-report/    # 一致性报告生成
├── components/                 # UI 组件
├── lib/                        # 核心逻辑库
│   ├── schema-validator/      # Schema 验证逻辑
│   ├── golden-flow/           # Golden Flow 执行引擎
│   ├── evidence-chain/        # Evidence Chain 验证
│   └── report-generator/      # 报告生成器
├── data/                       # 静态数据
│   ├── schemas/               # 从 schemas/v2/ 同步
│   └── golden-flows/          # 从 tests/golden/flows/ 同步
├── public/                     # 静态资源
├── package.json
├── README.md
└── LICENSE
```

---

## 5. 开发路线图建议

### Phase 1: Foundation
1. 创建独立子仓库 `validation-lab/`
2. 配置 Next.js + TypeScript 环境
3. 复用 MPLP_website 的设计系统（颜色、组件）
4. 同步 schemas 和 golden-flow 测试数据

### Phase 2: Core Features
1. **Schema Validator** — 上传/粘贴 JSON → 验证 + 报告
2. **Golden Flow Viewer** — 展示 + 解析 Golden Flow 定义
3. **Evidence Pack Validator** — 上传 Evidence Pack → 验证

### Phase 3: Advanced Features
1. **Interactive Test Runner** — 基于 `tests/golden/harness/` 重构
2. **Conformance Report Generator** — 生成 L1/L2/L3 评估报告
3. **API/CLI 工具** — 支持自动化集成

---

## 6. 待确认事项

1. **治理范围**: Validation Lab 是否需要独立的 `Lab Ruleset` 治理文档？
2. **数据同步策略**: schemas 和 golden-flows 是静态复制还是动态引用？
3. **部署架构**: 独立域名 (e.g., `lab.mplp.io`) 还是子路径？
4. **技术栈**: 是否沿用 MPLP_website 的 Next.js + Tailwind？

---

**文档状态**: 调研报告  
**生成日期**: 2026-01-09
