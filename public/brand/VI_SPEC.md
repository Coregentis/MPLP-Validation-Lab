任何使用 MPLP 品牌、标志、配色、字体或图形的行为，必须遵循本规范。

---

## 一、Brand Foundation（品牌基础层）

### 1. Brand Positioning（品牌定位声明）

**Brand Essence（一句话本质）**
> MPLP is the lifecycle protocol that makes multi-agent systems observable, governed, and auditable.

**Brand Mission（使命）**
为多智能体系统建立跨模型、跨工具、跨时间的一致生命周期语义标准，使复杂 AI 系统能够长期可靠运行。

**Brand Personality（品牌性格）**
*   **理性（Rational）**
*   **冷静（Calm）**
*   **严谨（Rigorous）**
*   **可审计（Auditable）**
*   **权威但不营销化（Authoritative, not Promotional）**

**What MPLP Is**
*   ✅ 一个 Protocol / Standard
*   ✅ 一个 Lifecycle Semantic Contract
*   ✅ 一个 Vendor-neutral Infrastructure Specification

**What MPLP Is NOT**
*   ❌ AI 产品
*   ❌ Agent Framework
*   ❌ Runtime / SDK 本身
*   ❌ SaaS / 平台 / 应用

**禁止将 MPLP 描述为“工具”“框架”“产品解决方案”。**

### 2. Brand Voice（语调与语言风格）

**推荐用词（Preferred Terms）**
*   protocol
*   lifecycle
*   semantic contract
*   conformance
*   observability
*   governance
*   auditability

**禁用用词（Forbidden Terms）**
*   hype
*   magic
*   revolutionary
*   next-gen
*   ultimate
*   all-in-one

**句式风格**
*   陈述句优先
*   技术陈述 > 情绪表达
*   避免感叹号

**技术密度原则**
*   **Homepage**：解释 What / Why
*   **Docs**：解释 How
*   **Blog**：解释 Context / Evolution

---

## 二、Logo System（标志系统）【核心】

### 3. Primary Logo（主标志）

**构成**
*   **Symbol**：四层结构化 “M”，中间为 Lifecycle Path
*   **Wordmark**：MPLP（大写）

**Protocol Mark Family（协议标志家族）**
为了满足不同场景的物理与数字需求，Protocol Mark 包含以下三种标准形态：
1.  **3D Color (Master Render)**: 官网、社交、Keynote 主用。
2.  **Flat Vector (SVG Master)**: 印刷、PDF、规范引用、长期存档。（*注：这不是重新设计，而是同一几何结构的无光照投影*）
3.  **Mono (White/Black)**: UI 低干扰场景、暗色/亮色背景。

**语义说明（Normative Definition）**
> **MPLP Logo = 一个“4 层协议栈 + 生命周期中轴”的三维结构体**

*   **4 Layers (Vertical Strata)**: 垂直方向共有 4 层（Top, Mid1, Mid2, Bottom）。左右两翼共享同一垂直层级，**不增加总层数**。
*   **Lifecycle Axis (Channel)**: 中央垂直路径代表生命周期流动与状态变迁，是协议的核心视觉隐喻。必须为**单一贯穿通道**，不得分叉。
*   **3D Structure**: 必须保留体块感与深度。
*   **Color Logic**: 上浅下深（Cyan → Indigo），代表从抽象定义到具体实现的落地过程。

**⚠️ 根因总结**
> **MPLP 的 Logo 不是“可被简化的图形”，而是“不可被压缩的结构表达”。**
> **MPLP does not have multiple logos. MPLP has one protocol mark, rendered in strictly governed variants.**
> (MPLP 不是“一套 Logo”，而是“一个结构，在不同治理态下的投影”。)

**最小尺寸**
*   数字端：≥ 24px 高度 (Favicon)
*   印刷端：≥ 15mm 高度

### 4. Brand Asset Layers & Derivation Governance

**核心原则：** MPLP 的视觉资产分为三个严格的治理层级。不同层级的资产具有不同的“身份”和“使用权限”。

#### 4.1 Derivation Space Model（可衍生空间模型）
MPLP 允许生成衍生 Logo，但衍生只能发生在“渲染与裁切层”，**绝不允许发生在“结构层”**。

```text
┌─────────────────────────┐
│ Layer A: Geometry Layer │  ← ❌ 禁止改动（Frozen）
│  - 4 层结构             │
│  - 中央 Lifecycle Axis  │
│  - 比例 / 厚度 / 对称性 │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│ Layer B: Render Layer   │  ← ✅ 允许衍生
│  - Color / Mono         │
│  - Lighting / Flat      │
│  - Glow / No-glow       │
└─────────────────────────┘
           ↓
┌─────────────────────────┐
│ Layer C: Composition    │  ← ✅ 允许衍生
│  - 是否带 Wordmark      │
│  - Icon Crop            │
│  - 背景 / 留白          │
└─────────────────────────┘
```

#### 4.2 Official Derivation Matrix（合法衍生矩阵）

**1️⃣ Protocol Mark Family (Layer 1 · 冻结)**
| 名称 | 来源 | 是否衍生 | 说明 |
| :--- | :--- | :--- | :--- |
| **Primary 3D Color** | Geometry → Render | 否（母版） | 唯一结构基准 (SOT) |
| **Flat Vector (SVG)** | Primary → 去光照 | ✅ | 同几何，仅无光照 |
| **Mono White** | Primary → 去色 | ✅ | 同几何，白色投影 |
| **Mono Black** | Primary → 去色 | ✅ | 黑色投影 |
| **Icon Only** | Primary → 裁切 | ✅ | 仅裁切，不改结构 |

**2️⃣ Docs 专用衍生 (Layer 1 · 受控)**
*原则：Docs 永远使用“最低情绪密度”的合法衍生。*
| 场景 | 合法资产 |
| :--- | :--- |
| **Docs Header** | Protocol Mark · Mono White / Flat |
| **Docs Sidebar** | Icon Only · Mono |
| **Docs Favicon** | Icon Only · Mono |
| **Docs 内文** | ❌ 禁止出现 3D / 发光版本 |

**3️⃣ Campaign / Social (Layer 2 · 可变化)**
*这里不是生成新 Logo，而是生成“Logo 的使用场景”。*
| 项目 | 是否允许 | 说明 |
| :--- | :--- | :--- |
| **电路背景** | ✅ | 允许 |
| **光效 / Glow** | ✅ | 只包裹，不侵蚀结构 |
| **Slogan 文案** | ✅ | 允许 |
| **改结构** | ❌ | 禁止 |
| **改层数** | ❌ | 禁止 |
| **改中轴** | ❌ | 禁止 |

#### 4.3 Governance Layers

#### Layer 1: Protocol Mark（协议主标）✅ 冻结
**身份定义：** MPLP 的“规范级主标志（Specification Mark）”。
**气质：** 冷静、克制、抽象、非营销、非情绪化。
**对应文件：**
*   `mplp-logo-primary-hd.png` (3D Color)
*   `mplp-logo-mono-white-hd.png` (Mono White)
*   `mplp-icon-mono-white-hd.png` (Icon Only)

**使用规则：**
*   **必须用于：** 官网 Header、Docs Header、Whitepaper、GitHub、NPM/PyPI。
*   **禁止：** 添加背景纹理、添加额外发光、作为营销海报主视觉。
*   **地位：** 类似于 TCP/IP、Linux Foundation 的标志，代表协议的权威性与稳定性。

#### Layer 2: Campaign Visual（传播视觉）✅ 可变化
**身份定义：** MPLP 的“传播态视觉资产（Key Visual）”。
**气质：** 情绪化、技术感、视觉冲击、适合传播。
**对应文件：**
*   `mplp-social-cover.png` (Social Cover)

**使用规则：**
*   **推荐用于：** X / Twitter Banner、Medium 封面、Product Hunt、宣传海报。
*   **禁止：** 替代 Protocol Mark 出现在文档、规范或官网导航栏中。
*   **特征：** 允许包含背景电路、光效、Slogan 文案。它不是 Logo，它是 KV。

#### Layer 3: Sub-brand / Product（预留）
**身份定义：** 未来基于 MPLP 构建的产品或子品牌（如 TracePilot）。
**规则：** 必须在视觉上继承 MPLP 基因，但必须有明显的区分，不可混淆协议与产品。

---

**⚠️ 治理红线：**
> **Campaign Visual (Layer 2) 永远不得替代 Protocol Mark (Layer 1) 出现在任何“定义性”场景中。**

### 5. Mono / White 版本唯一正确规则（Normative）

Mono 版本不是重新设计，而是 **“彩色 3D 母版（Master Logo）的颜色投影”**。

**Hard Constraints（必须遵守的红线）：**
1.  **禁止描边 (No Outline Stroke)**: 必须是实心形状切割。
2.  **实心几何 (Solid Boolean Geometry)**: 所有边界必须清晰、锐利。
3.  **单一中轴 (Single Continuous Axis)**: 中轴必须是贯穿的、单一的负空间通道，不得分叉或侧向开槽。
4.  **层厚一致 (Uniform Slab Thickness)**: 所有 4 层的厚度必须视觉一致。

**正确生成顺序（The Only Valid Pipeline）：**
1.  **Freeze Master**: 先冻结彩色 3D 母版。
2.  **Projection**: 生成 Mono White（保持体块、去色）、Mono Black。
3.  **Crop**: 生成 Icon Crop（不改结构，只裁切）。

**非法使用（Illegal Usage）：**
任何 Mono 版本如果出现以下情况，直接判为非法：
*   ❌ 改了层数（非 4 层）
*   ❌ 改了厚度（变薄或变厚）
*   ❌ 改了中轴形态（丢失通道或变形）
*   ❌ 出现了线框或描边效果

### 6. Logo Usage Policy (Normative Matrix)

| 场景 (Scenario) | 推荐资产 (Recommended Asset) | 层级 (Layer) | 说明 (Note) |
| :--- | :--- | :--- | :--- |
| **官网首页 Header** | **Protocol Mark** (3D / Mono) | Layer 1 | 代表协议官方身份 |
| **Docs 站 Header** | **Protocol Mark** (Mono White) | Layer 1 | 减少干扰，强调文档属性 |
| **Whitepaper / PDF** | **Protocol Mark** (Mono / Flat) | Layer 1 | 专业、可打印、长期存档 |
| **GitHub / NPM** | **Protocol Mark** (Icon Only) | Layer 1 | 小尺寸清晰识别 |
| **Social Media Banner** | **Campaign Visual** | Layer 2 | 吸引注意力，传递情绪与愿景 |
| **Marketing Poster** | **Campaign Visual** | Layer 2 | 允许更强的视觉冲击力 |
| **Diagram / Architecture** | **Protocol Mark** (Icon Only) | Layer 1 | 作为节点或水印嵌入 |

### 7. Clear Space & 禁用规范

**Brand Unit (U)**
定义 **U** 为标志中“单层体块的厚度 (Slab Thickness)”。

**Clear Space**
*   四周至少留出 **2U** 的安全空间。
*   在此范围内不得出现其他 Logo、文本或复杂图形。

**禁用行为（Do NOT）**
*   ❌ 拉伸 / 压缩比例
*   ❌ 修改颜色
*   ❌ 添加阴影、描边、额外发光
*   ❌ 与其他 Logo 叠加
*   ❌ 将 Logo 作为文字的一部分使用

---

## 三、Color System（颜色系统）

### 8. Color Palette

#### 8.1 Brand Colors（不可更改）
| 名称 | HEX | 用途 |
| :--- | :--- | :--- |
| **MPLP Blue** | `#3B82F6` | 主 CTA / 标题 |
| **MPLP Cyan** | `#5ADEFF` | Lifecycle / Context |
| **MPLP Indigo** | `#6366F1` | 深度 / Role |

#### 8.2 Semantic Colors（协议语义色）
| 语义 | 含义 |
| :--- | :--- |
| **Emerald** | Frozen / Stable |
| **Yellow** | Experimental |
| **Red** | Invalid / Error |
| **Blue** | Reference / Info |

**⚠️ 语义色不可随意复用为装饰色。**

#### 8.3 Background System
*   **Main**: `#020617` (Dark enforced)
*   **Surface / Card**: Slate-900 / 80%
*   **Border / Divider**: Slate-800

---

## 四、Typography System（字体系统）

### 9. Font Family
*   **Primary**: Inter
*   **Monospace**: JetBrains Mono
*   **Fallback**: system-ui, sans-serif

### 10. Hierarchy
| Level | Size | Line-Height | Weight |
| :--- | :--- | :--- | :--- |
| **H1** | 48–64px | 1.15 | 700 |
| **H2** | 28–32px | 1.25 | 600 |
| **Body** | 16–18px | 1.6 | 400 |
| **Code** | 14–16px | 1.5 | 400 |

---

## 五、Layout & Spacing

### 11. Grid
*   **Max content width**: 1280px
*   **Full-bleed**: 仅用于 Hero / Section Divider

### 12. Vertical Rhythm
*   **Section spacing**: 80–96px
*   **Card padding**: 24–32px

---

## 六、UI Components

### 13. Core Components
*   **Button**（Primary / Secondary / Ghost）
*   **Card**（Normal / Elevated）
*   **Badge**（Version / Frozen）
*   **Code Block**（Quickstart）

**每个组件必须说明：**
*   何时使用
*   何时禁止使用

---

## 七、Motion & Interaction

### 14. Motion Principles
*   动效服务于结构理解
*   Docs 页面默认禁用动效

### 15. Allowed Motions
*   fade-in
*   slide-up（≤ 20px）
*   hover elevation

**禁止：**
*   ❌ bounce
*   ❌ elastic
*   ❌ attention-grabbing animation

---

## 八、Illustration & Diagram Style

### 16. Architecture Diagram Rules
*   **线条**：1.5–2px
*   **圆角**：小半径
*   **箭头**：直线、无装饰
*   **L1–L4 颜色**：必须与 Brand Color 对齐

---

## 九、Accessibility

### 17. Accessibility Rules
*   WCAG AA 对比度
*   最小字体 14px
*   色盲安全组合

---

## 十、Usage & Governance

### 18. External Usage & Co-branding

**Co-branding (Lockup Rules)**
当 MPLP 与其他品牌（如 Partners, Frameworks）并排展示时：
*   **间距**：至少 **2U**。
*   **对齐**：基于 Logo 的视觉中心或基线对齐。
*   **禁止**：将对方 Logo 放入 MPLP 的中轴通道内（常见误用）。

**社区使用许可**
*   社区可在遵循本规范的前提下使用 **Protocol Mark**。
*   禁止暗示 MPLP 官方背书（除非获得书面授权）。
*   禁止修改 Logo 结构或颜色。

### 19. Legal & Trademark
*   **归属声明**：MPLP 名称与标志归属于 MPLP Governance Committee（或相关法律实体）。
*   **违规处理**：对于滥用、篡改或用于欺诈项目的行为，MPLP 社区保留追究权利。
*   **举报渠道**：governance@mplp.io (示例)

### 20. Versioning
*   **VI v1.0 Freeze Gate**:
    *   ✅ Protocol Mark Family (3D/Flat/Mono/Icon) 齐全。
    *   ✅ 4-layer 计数规则明确。
    *   ✅ Clear Space 可测量 (Brand Unit)。
    *   ✅ Layer 1 vs Layer 2 边界清晰。
*   更新需经 MPLP Governance Committee 审核。

---

## 最终声明（Normative）
> "You are NOT designing a new logo. You are rendering a derived variant of an EXISTING protocol logo."
> (你不能设计 Logo，你只能“渲染”这个已存在的结构。)

**Step 2: Specify Derivation Dimensions**
> **Base geometry (frozen):**
> - 4 horizontal layers total (exactly four)
> - Single continuous vertical lifecycle channel
> - Uniform slab thickness
> - Symmetrical left/right structure
>
> **Allowed changes ONLY:**
> - Remove all colors → pure white
> - Remove lighting and glow
> - Keep solid filled geometry (no outlines)

**Step 3: Verification**
> 任何“看起来不一样”的结果，先问一句：“这是渲染差异，还是结构差异？”
> *   渲染差异 → ✅ 合法
> *   结构差异 → ❌ 非法

---

### 🔒 MPLP Logo 的“不可破坏约束”（Hard Constraints）

1.  **必须是 4 层结构**：垂直方向 4 层 (Vertical Strata)，左右两翼共享层级。
2.  **必须是 3D 体块**：禁止使用线框 (Wireframe) 或单纯描边 (Outline)。
3.  **必须存在“贯穿式生命周期通道”**：中间的切口是核心语义，代表 Lifecycle Flow。
4.  **M 字母是“结构结果”**：不是绘制目标，而是堆叠结构自然形成的形态。
5.  **彩色 3D 是唯一 Primary Logo**。
6.  **Mono / Icon 只能是 Primary 的降级渲染**：不可重设计。

### ✅ Official Prompt (Primary 3D - Master Render)

```text
Design the official master logo (Protocol Mark) for “MPLP — Multi-Agent Lifecycle Protocol”.

This is a protocol identity mark (like TCP/IP or HTTP), not a product logo.

Hard constraints (must follow strictly):
1) The symbol is a 3D architectural structure with EXACTLY FOUR horizontal strata in total (top, mid-1, mid-2, bottom).
   - The 4 strata must be clearly distinguishable as stacked solid slabs.
   - Do NOT add a 5th/6th layer. Do NOT make the count “per side”.

2) The structure forms an abstract capital “M” as an emergent shape.
   - Do NOT draw a letter. The “M” must arise from the stacked geometry.

3) A SINGLE continuous vertical central channel must cut through the structure from top to bottom.
   - One channel only. No branching. No side cutouts. No “F-shape” inner notch.
   - The channel must read as a deliberate lifecycle axis.

4) Geometry rules:
   - Uniform slab thickness across all 4 strata.
   - Clean boolean geometry: solid faces, crisp edges, subtle bevel.
- Solid white on black (or transparent background variant).
No redesign, no simplification, no layer merging.
```