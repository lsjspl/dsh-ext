# dsh-ext

`dsh-ext` 是针对 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) 的开发者体验（DevX）综合增强插件，为 DSH Web 平台提供图片编排、模型推理档位声明、账户余额、操作审计、目录树浏览、会话回收站、故障急救与影子 Git 检查点等 8 项核心扩展功能。

插件遵循零开销挂载设计：每个功能特性均可在 **设置 → 开发者工具 (Settings → Dev Tools)** 中独立配置启停。未启用的特性不会注册任何路由处理函数、事件监听器或前端插槽，保证宿主环境轻量运行。

---

## 功能特性矩阵

| 特性模块 | 描述 | UI 挂载点 | 配置前缀 | 默认状态 |
|---|---|---|---|---|
| **输入框图片增强** | 在 `+` 菜单提供图片选择器入口，支持草稿图片拖拽排序与微调 | 聊天输入框工具栏与图片预览区 | `imageComposer` | 启用 |
| **推理强度声明** | 为第三方（pi-ai 适配器）模型声明推理档位，联动原生推理选择器 | 设置面板 & 输入框推理强度控制区 | `reasoningEffort` | 启用 |
| **DeepSeek 账户余额** | 轮询官方 API 账户余额，支持北京时间高峰/低谷费率与顶部胶囊展示 | 设置面板 & 会话 Header 胶囊 | `deepseekBalance` | 启用 |
| **高危操作审核** | 规则筛查与大模型协同审计高危工具调用，权限只收紧不放宽 | 工具调用中间件管线 | `commandReview` | 禁用 |
| **项目文件浏览器** | 只读检视工作区目录树结构与未提交变更差异（Git 差异对比） | 输入框上方可折叠侧边栏 | `explorer` | 启用 |
| **会话回收站** | 会话软删除与恢复机制，避免操作失误导致数据丢失 | 左侧边栏底部（设置按钮旁） | `sessionAdmin` | 启用 |
| **插件安全与自愈** | 隔离故障插件；提供独立零依赖 CLI 工具在 Harness 崩溃时脱困 | 设置面板 & `dsh-ext` 命令行工具 | `pluginSafety` | 启用 |
| **按会话检查点** | 基于独立影子仓库的代码快照与回滚，绝对隔离项目原有 Git 历史 | 会话交互卡片 & 设置面板 | `checkpoints` | 启用 |

---

## 安装与快速上手

### 1. 安装插件

使用 DSH 官方插件管理命令安装：

```sh
dsh plugin --profile web add dsh-ext
```

> [!NOTE]
> 本插件为标准 DSH Bundle 插件，`package.json` 中已声明 `dsh.bundle.patch`。执行安装后，DSH 会自动将包注册至 profile 的 `bundles` 清单，**无需手动修改** `$DSH_HOME/profiles/web/package.json`。

### 2. 生效与初始化

安装完成后，重启 `dsh web` 并刷新浏览器：

```sh
dsh web
```

除 **高危操作审核**（需预先指定审核模型）外，其余特性均开箱即用。

### 3. 卸载插件

如需卸载，执行：

```sh
dsh plugin --profile web remove dsh-ext
```

---

## 核心机制与架构设计

### 1. 影子 Git 检查点机制 (Shadow Git Checkpoints)

检查点模块允许按会话记录智能体引发的文件变更，并在需要时快速回滚，同时严格保证**不污染、不篡改用户项目的 Git 历史与状态**。

```
项目工作区 (Project Workspace)
├── src/
├── package.json
└── .git/  <----------------- [完全隔离] 项目原始 Git 库（HEAD/Index/Stash 保持原样）

独立影子仓库 (Shadow Repository)
└── $DSH_HOME/dsh-ext/checkpoints/<SessionID>/
    ├── HEAD
    ├── index  <-------------- 专用索引，避免 git add 产生工作区副作用
    └── objects/
```

- **隔离保证**：插件执行底层 Git 操作时，通过环境变量注入 `GIT_DIR`（指向外部影子仓库）与 `GIT_INDEX_FILE`（指向影子索引文件），并显式将项目的 `.git/` 排除在快照范围之外。
- **验证保障**：项目内置了 `npm run verify:checkpoints` 验证套件，在快照 → 还原 → 撤销完整生命周期中比对 `HEAD`、提交图、`reflog`、`stash`、分支、索引二进制等指标，确保项目 Git 状态字节级完全一致。
- **向前提交模型**：回滚操作不是强制重置分支指针，而是将还原状态作为**新快照向前提交**。因此回滚操作本身随时可撤销（Undo），已生成的后续检查点链条依然完整可达。
- **过滤边界**：严格遵从项目的 `.gitignore` 配置，避免将 `node_modules` 或构建中间文件载入快照。针对无 `.gitignore` 的工程，可通过配置文件的 `excludes` 进行补充。

---

### 2. 插件故障安全与救援工具 (Plugin Safety & Rescue)

针对插件引起的启动失败，本插件提供**网页可视化急救**与**进程外脱困 CLI** 双重保障：

#### 方案 A：Web 引导错误页可视化急救（开箱即用）
当第三方插件在前端初始化抛错导致 DSH 停滞在 `Failed to load plugins` 错误引导页时，内置的**原生救援哨兵**会自动激活：
- **就地展示**：直接在错误卡片正下方动态挂载 `[🛠️ DSH-Ext 故障急救]` 操作栏；
- **一键隔离**：自动识别导致失败的插件名，点击 **`[ 🛡️ 隔离此插件并重载 ]`** 即可自动将其写入 `$DSH_HOME/cordis.patch.yml` 并刷新；
- **一键安全模式**：提供 **`[ 🚨 启用安全模式 ]`** 批量隔离所有第三方插件，秒级恢复 DSH 主界面。

#### 方案 B：进程外脱困 CLI（终端命令行）
若插件在 Node.js 后端启动期抛出异常导致整个进程退出时，可直接通过独立的急救 CLI 工具自愈：

```sh
# 方式一：直接调用（推荐，已全局安装或由包管理器链接）
dsh-ext safe                 # 启用安全模式：跳过所有第三方插件，恢复 Harness 正常启动
dsh-ext skip <plugin-name>   # 隔离指定故障插件
dsh-ext restore              # 解除隔离，恢复全部插件
dsh-ext list                 # 检视当前插件状态与隔离清单

# 方式二：免全局安装（通过 npx 运行）
npx dsh-ext safe
npx dsh-ext restore
```

- **零外部依赖**：`bin/dsh-ext.mjs` 仅依赖 Node.js 运行时核心库，不引入任何 npm 外部包或 Harness 模块。即使插件自身构建产物损坏，该 CLI 依然能够独立运行。
- **Patch 优先级覆盖**：隔离记录写入 `$DSH_HOME/cordis.patch.yml`。该层级位于所有 bundle 层与 profile 自身层之后，具有最高合并优先级，通过标记 `{ id, disabled: true }` 实现强制禁用。
- **配置防损**：仅修改两段注释锚点之间的隔离区间，首次变更自动创建 `.bak-dsh-ext` 副本。

---


### 3. 高危工具调用审核管线 (Command Review Pipeline)

针对智能体调用的系统指令（Shell/Cmd）以及文件覆写/删除动作建立安全栅栏：

```
智能体发起工具调用
      │
      ▼
本地规则筛查 (Local Rules) ──────── (无风险) ────────► 放行至原生审批管线
      │
  (匹配风险模式)
      │
      ▼
审核模型复审 (LLM Reviewer)
      │
  ┌───┴───────────────┐
  ▼                   ▼
通过 (Allow)       拦截 (Deny / Ask)
  │                   │
  ▼                   ▼
交回原生审批管线     终止执行 / 弹窗向用户请求二次授权
```

- **权限单向收紧原则**：审核判定为 `allow` 时，插件仅是“放弃反对权”，最终调用仍须通过 DSH 原生的用户审批层，绝不会绕过系统的原有安全限制。
- **故障保守原则**：审核模型发生超时、无凭证或输出畸形时，严格走 `onFailure` 降级流程（默认为 `ask`），绝不静默放行。
- **全量审计日志**：所有筛查与判定记录持久化存储于 `$DSH_HOME/dsh-ext/command-review.jsonl`，可在设置页面中随时审计复核。

---

## 配置参考

支持通过 Web 端 **设置 → 开发者工具** 图形化配置，改动即时生效。亦可直接编辑 `$DSH_HOME/settings.yaml`（Windows 对应 `%USERPROFILE%\.dsh\settings.yaml`）：

```yaml
dsh-ext:
  imageComposer:
    enabled: true
    pickerButton: true
    dragReorder: true
  reasoningEffort:
    enabled: true
    defaultFullEfforts: true
  deepseekBalance:
    enabled: true
    headerBadge: false
    pollIntervalSeconds: 60
    cacheTtlSeconds: 60
    peakWeekdaysOnly: true
    peakWindows:
      - "09:00-12:00"
      - "14:00-18:00"
  commandReview:
    enabled: false
    mode: rules+llm
    onFailure: ask
    provider: deepseek-official
    model: deepseek-v4-flash
  explorer:
    enabled: true
    side: right
    defaultOpen: false
    respectGitignore: true
  sessionAdmin:
    enabled: true
    trashEnabled: true
    attachmentGc: false
  pluginSafety:
    enabled: true
    quarantine: []
  checkpoints:
    enabled: true
    snapshotOn: turn
    retentionDays: 30
    maxFileSizeMb: 32
    excludes: []
```

### 完整配置参数表

| 字段路径 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `imageComposer.enabled` | `boolean` | `true` | 是否启用输入框图片编排增强 |
| `imageComposer.pickerButton` | `boolean` | `true` | 是否在输入框 `+` 菜单展示图片选取项 |
| `imageComposer.dragReorder` | `boolean` | `true` | 是否启用多图片拖拽排序与快捷位置微调 |
| `reasoningEffort.enabled` | `boolean` | `true` | 是否启用第三方模型推理档位声明与映射 |
| `reasoningEffort.defaultFullEfforts` | `boolean` | `true` | 未单独配置的模型是否默认开放全档位选项 |
| `deepseekBalance.enabled` | `boolean` | `true` | 是否启用 DeepSeek 官方 API 账户余额查询 |
| `deepseekBalance.headerBadge` | `boolean` | `false` | 是否在会话顶部栏显示余额胶囊状态卡 |
| `deepseekBalance.pollIntervalSeconds`| `number` | `60` | 余额轮询刷新周期（秒），`0` 为禁用自动轮询 |
| `deepseekBalance.cacheTtlSeconds` | `number` | `60` | 后端余额数据缓存有效期（秒） |
| `deepseekBalance.peakWindows` | `string[]`| `["09:00-12:00", "14:00-18:00"]` | 北京时间高峰期时段列表（非窗口期官方按低谷计费） |
| `deepseekBalance.peakWeekdaysOnly` | `boolean` | `true` | 周末是否全天执行低谷优惠计费规则 |
| `commandReview.enabled` | `boolean` | `false` | 是否开启高危指令与文件修改拦截审核 |
| `commandReview.mode` | `string` | `"rules+llm"` | 审核模式：`rules-only`（纯规则）、`rules+llm`（规则+模型复审）、`all`（全量模型评审） |
| `commandReview.onFailure` | `string` | `"ask"` | 评审服务异常时的动作：`ask`（人工确认）、`deny`（直接拦截）、`allow`（放行） |
| `commandReview.provider` | `string` | `""` | 评审模型所属的 LLM Provider ID（如 `deepseek-official`） |
| `commandReview.model` | `string` | `""` | 评审使用的具体模型标识（如 `deepseek-v4-flash`） |
| `explorer.enabled` | `boolean` | `true` | 是否启用工作区项目文件浏览器 |
| `explorer.side` | `string` | `"right"` | 面板停靠方位：`"right"` 或 `"left"` |
| `explorer.defaultOpen` | `boolean` | `false` | 进入会话时是否默认展开文件树面板 |
| `explorer.respectGitignore` | `boolean` | `true` | 文件列表是否遵循 `.gitignore` 规则 |
| `sessionAdmin.enabled` | `boolean` | `true` | 是否启用会话管理增强（删除与回收站） |
| `sessionAdmin.trashEnabled` | `boolean` | `true` | 删除会话是否转入回收站而非物理删除 |
| `sessionAdmin.attachmentGc` | `boolean` | `false` | 清空回收站时是否一并回收无引用的附件存储 |
| `pluginSafety.enabled` | `boolean` | `true` | 是否启用插件隔离防护体系 |
| `pluginSafety.quarantine` | `string[]`| `[]` | 当前处于隔离禁用状态的插件包名列表 |
| `checkpoints.enabled` | `boolean` | `true` | 是否启用基于影子 Git 的会话检查点机制 |
| `checkpoints.snapshotOn` | `string` | `"turn"` | 快照触发机制：`"turn"`（每个智能体回复轮次后） |
| `checkpoints.retentionDays` | `number` | `30` | 历史快照保留期限（天） |
| `checkpoints.maxFileSizeMb` | `number` | `32` | 单文件快照体积阈值（MB） |
| `checkpoints.excludes` | `string[]`| `[]` | 自定义排除路径模式（Glob 格式） |

---

## 运行约束与环境要求

1. **运行时依赖**：插件对宿主环境的唯一硬依赖为 `webServer` 服务。审批、会话持久化等其他依赖项均在运行时动态探测，缺失时对应功能自动优雅降级。
2. **Git 支持**：项目文件差异比对与检查点快照依赖宿主环境已安装 `git` 且可从 `PATH` 访问。
3. **会话存储**：会话删除与回收站特性适配单文件格式后端（DSH 原生 JSONL 引擎支持良好）。
4. **凭证隔离**：DeepSeek API 密钥仅在 Node 宿主进程内部持有并调用，绝不序列化至前端状态。

---

## 开发与测试

```sh
# 1. 安装依赖
pnpm install

# 2. 执行完整验证套件（类型检查、解析器单测与 Git 隔离性测试）
npm run verify

# 3. 构建产物
npm run build
```

产物生成于 `lib/index.js`（Node 宿主层）与 `lib/client.js`（浏览器前端层）。

---

## 开源协议

本项目基于 [MIT License](./package.json) 协议开源。
