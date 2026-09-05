# dsh-ext

> **dsh-ext** 是面向 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) Web 平台的开发体验（DevX）综合增强插件。  
> 它覆盖输入框图片编排、第三方模型推理档位、DeepSeek 余额、高危命令审核、项目文件浏览器、Git 工作流、会话回收站、插件故障救援与影子 Git 检查点等能力。
>
> **English TL;DR:** A comprehensive DevX plugin bundle for DeepSeek Harness Web — image composer, third-party model reasoning-effort declaration, DeepSeek balance, command review, project explorer, Git workflows, recycle bin, plugin rescue, and shadow-git checkpoints.

<p align="left">
  <a href="https://github.com/deepseek-ai/deepseek-harness"><img alt="DSH Plugin" src="https://img.shields.io/badge/DSH-Plugin-blue?logo=deepseek&logoColor=white"></a>
  <a href="./package.json"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg"></a>
  <img alt="Node.js" src="https://img.shields.io/badge/node-%3E%3D22.19%20%7C%20%3E%3D24-blue">
  <img alt="Platform" src="https://img.shields.io/badge/platform-web-8A2BE2">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-blue">
</p>

---

## 目录

- [插件信息 / Plugin Info](#插件信息--plugin-info)
- [功能特性 / Features](#功能特性--features)
- [安装与快速上手 / Installation](#安装与快速上手--installation)
- [核心机制 / Core Architecture](#核心机制--core-architecture)
- [配置参考 / Configuration](#配置参考--configuration)
- [故障救援 CLI / Rescue CLI](#故障救援-cli--rescue-cli)
- [运行约束 / Requirements](#运行约束--requirements)
- [开发与测试 / Development](#开发与测试--development)
- [开源协议 / License](#开源协议--license)

---

## 插件信息 / Plugin Info

| 项目 | 内容 |
|---|---|
| 包名 | `dsh-ext` |
| 类型 | DeepSeek Harness Bundle 插件（Node 宿主层 + 浏览器前端层） |
| 宿主 | `webServer` 服务 |
| 运行时 | Node.js `^22.19.0 || >=24.0.0` |
| 默认配置命名空间 | `dsh-ext` |
| 许可证 | MIT |
| 代码 | TypeScript，构建产物为 `lib/index.js` + `lib/client.js` |

> 插件采用“零开销挂载”设计：每个功能模块都有独立的 `enabled` 开关，关闭后不会注册路由、监听器或前端插槽。

---

## 功能特性 / Features

| 功能模块 | 说明 | 使用入口 |
|---|---|---|
| **输入框图片增强** | 在 `+` 菜单提供图片入口，草稿图片支持拖拽排序与前后微调 | 聊天输入框、图片预览区 |
| **推理强度与图片能力声明** | 为第三方（pi-ai）模型声明推理档位和图片输入能力，联动输入框推理选择器 | 设置页、模型选择器 |
| **模型菜单** | 替换输入框自带模型菜单，支持按供应商分组折叠、按名称筛选 | 聊天输入框 |
| **DeepSeek 账户余额** | 读取官方 API 账户余额，展示余额卡片/输入框标记，支持北京时间高峰低谷时段提示 | 设置页、输入框 |
| **高危操作审核** | 本地规则初筛 + 第二模型复审，拦截/复核 Shell、文件删除等高风险工具调用 | 工具调用中间件、审计面板 |
| **项目文件浏览器** | 只读浏览工作区目录树、文件预览、未提交变更差异，支持在侧边栏/VS Code/IDEA 中打开 | 会话 Header、可停靠侧边栏 |
| **Git 版本控制** | AI 生成提交信息、提交/推送、分支管理、Worktree 隔离、会话-分支绑定 | 变更审查面板、输入框 Git 栏 |
| **会话回收站** | 会话软删除/归档、回收站还原、永久删除；当前宿主不支持安全的附件 GC，附件保留 | 左侧栏底部 |
| **插件安全与自愈** | 插件隔离名单、一键安全模式、Web 应急救援面板、零依赖 CLI 救援工具 | 设置页、终端 CLI |
| **按会话检查点** | 基于独立影子 Git 仓库的快照、差异、回滚，支持按轮次/工具调用自动快照 | 会话内变更卡片、设置页 |
| **侧边栏终端** | 在右栏 `+` 菜单新建终端标签页，直接执行命令；基于 xterm.js + node-pty（Win/macOS/Linux），支持切回恢复画面、刷新重连、多终端实例 | 侧边栏 `+` 菜单、设置页 |

---

## 安装与快速上手 / Installation

### 安装

```sh
dsh plugin --profile web add dsh-ext
```

> [!NOTE]
> `package.json` 已声明 `dsh.bundle.patch`，安装后 DSH 会自动把 `dsh-ext` 写入 profile 的 `bundles` 清单，无需手动修改 `$DSH_HOME/profiles/web/package.json`。

### 生效

安装后重启 DSH Web 并刷新浏览器：

```sh
dsh web
```

除 **高危操作审核** 默认开启模块但关闭了“聊天自动审核”，如需在会话中自动拦截高危命令，请在设置页开启 `commandReview.autoReview` 并选择复审模型；其余功能开箱即用。

### 卸载

```sh
dsh plugin --profile web remove dsh-ext
```

---

## 核心机制 / Core Architecture

### 1. 影子 Git 检查点（Shadow Git Checkpoints）

检查点模块使用独立于项目仓库的影子 Git 目录保存快照，保证 **不修改用户项目的 Git 历史、索引、暂存区或 stash**。

```text
项目工作区
├── src/
├── package.json
└── .git/                  <-- 项目原始 Git 库，保持完全隔离

影子仓库
└── $DSH_HOME/dsh-ext/checkpoints/<WorkspaceHash>/
    ├── HEAD
    ├── index
    └── objects/
```

- 通过 `GIT_DIR` / `GIT_INDEX_FILE` 环境变量把 Git 操作重定向到影子仓库。
- 回滚采用“向前提交”模型：还原后的状态本身成为新检查点，因此回滚操作也可以被撤销。
- 严格尊重项目的 `.gitignore`，内置排除 `node_modules/`、构建产物、日志等噪音文件。
- 保留期清理仅裁剪影子仓库的过期祖先和引用，不移动最新检查点；即使全部过期，也保留一个恢复基线。大小和排除设置即时生效，大文件在写入影子对象库前过滤。
- 运行中的工作区拒绝回滚；聊天回退先准备分叉，再恢复文件。轮次卡片按会话批量查询，完成后的轮次降低轮询频率，失效检查点会从卡片清除。

### 2. 高危命令审核（Command Review）

所有被覆盖的工具调用先经过本地正则规则，命中风险项后再交给第二模型复审；模型超时、无凭证或输出异常时按 `onFailure` 策略降级，默认 `ask`（询问用户），**绝不静默放行**。

```text
工具调用
  → 本地规则初筛
      ├── 只读/无风险 → 直接放行至原生审批
      └── 命中风险   → 审核模型复审
                          ├── allow → 交回原生审批
                          ├── deny  → 拦截
                          └── ask   → 请求用户二次授权
```

### 3. 插件故障救援（Plugin Safety）

- **Web 救援哨兵**：第三方插件在前端初始化失败时，错误页会自动出现“隔离此插件并重载 / 启用安全模式”操作栏。
- **进程外 CLI**：后端启动失败时，可通过零依赖的 `dsh-ext` CLI 修改 `$DSH_HOME/cordis.patch.yml`，以最高优先级禁用故障插件。
- **配置防损**：只编辑受管理的注释锚点区间，首次修改自动生成 `.bak-dsh-ext` 备份。
- **并发保护**：Web 与救援 CLI 共用隔离记录锁，读取、合并与原子写入都在锁内完成，避免覆盖其他请求的隔离项。

---

## 配置参考 / Configuration

可通过 **设置 → 开发者工具** 图形化配置，也可直接编辑 `$DSH_HOME/settings.yaml`（Windows 为 `%USERPROFILE%\.dsh\settings.yaml`）：

```yaml
dsh-ext:
  imageComposer:
    enabled: true
    pickerButton: true
    dragReorder: true
  reasoningEffort:
    enabled: true
    defaultFullEfforts: true
    defaultVision: true
  modelPicker:
    groupCollapse: true
  deepseekBalance:
    enabled: true
    cacheTtlSeconds: 60
    headerBadge: true
    pollSeconds: 60
    peakWindowsBeijing:
      - "09:00-12:00"
      - "14:00-18:00"
    peakWeekdaysOnly: true
  commandReview:
    enabled: true
    autoReview: false
    mode: expected          # expected / rules+llm / rules-only / all
    tools:
      - bash
      - pwsh
      - run_command
    writeOnly: true
    # readPatterns / deletePatterns / denyPatterns 不配置时使用内置规则
    deletePolicy: expected  # deny / ask / expected / allow
    gitPushPolicy: expected # 推送独立于全局审核模式
    provider: ""
    model: ""
    timeoutMs: 20000
    onFailure: ask
    auditLimit: 500
  explorer:
    enabled: true
    side: right
    defaultOpen: false
    respectGitignore: true
    maxEntriesPerDir: 500
    openLinksInPanel: true
  git:
    enabled: true
    provider: ""
    model: ""
    commitStyle: conventional
    commitLanguage: zh-CN
    autoStageAll: true
    sessionBinding: strict
    autoAlignBranch: true
    worktreeDirPattern: "../{repo}-{branch}"
    worktreeAutoRegister: true
    pushAutoSetUpstream: true
    pushTimeoutSeconds: 60
  sessionAdmin:
    enabled: true
    attachmentGc: false
  pluginSafety:
    enabled: true
    quarantine: []
  checkpoints:
    enabled: true
    snapshotOn: turn
    excludes:
      - ".git/"
      - "node_modules/"
      - ".venv/"
      - "__pycache__/"
      - "dist/"
      - "build/"
      - "target/"
      - ".next/"
      - ".turbo/"
      - "*.log"
    maxFileSizeMb: 32
    retentionDays: 30
  terminal:
    enabled: true
    shell: auto
    shellArgs: []
    scrollbackLines: 2000
```

### 配置参数说明

| 字段路径 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `imageComposer.enabled` | `boolean` | `true` | 是否启用输入框图片编排增强 |
| `imageComposer.pickerButton` | `boolean` | `true` | 是否在 `+` 菜单展示图片入口 |
| `imageComposer.dragReorder` | `boolean` | `true` | 是否启用草稿图片拖拽排序与前后移动 |
| `reasoningEffort.enabled` | `boolean` | `true` | 是否启用第三方模型推理档位声明 |
| `reasoningEffort.defaultFullEfforts` | `boolean` | `true` | 未单独配置的模型是否默认开放全部推理档位 |
| `reasoningEffort.defaultVision` | `boolean` | `true` | 未单独配置的模型是否默认声明支持图片输入 |
| `modelPicker.groupCollapse` | `boolean` | `true` | 输入框模型菜单是否按供应商分组折叠并支持筛选 |
| `deepseekBalance.enabled` | `boolean` | `true` | 是否启用 DeepSeek 官方余额查询 |
| `deepseekBalance.cacheTtlSeconds` | `number` | `60` | 后端余额缓存有效期（秒） |
| `deepseekBalance.headerBadge` | `boolean` | `true` | 是否在输入框显示紧凑余额标记 |
| `deepseekBalance.pollSeconds` | `number` | `60` | 余额轮询间隔（秒），`0` 表示关闭自动轮询 |
| `deepseekBalance.peakWindowsBeijing` | `string[]` | `["09:00-12:00", "14:00-18:00"]` | 北京时间高峰时段 |
| `deepseekBalance.peakWeekdaysOnly` | `boolean` | `true` | 周末是否全天按低谷计费 |
| `commandReview.enabled` | `boolean` | `true` | 是否启用高危命令审核 |
| `commandReview.autoReview` | `boolean` | `false` | 会话中是否自动执行审核 |
| `commandReview.mode` | `string` | `expected` | 其他命令的审核模式：按预期 / 规则与模型 / 仅规则 / 全量模型 |
| `commandReview.tools` | `string[]` | `["bash","pwsh","run_command"]` | 受审核的工具名列表 |
| `commandReview.writeOnly` | `boolean` | `true` | 非 `all` 模式下跳过可识别的静态只读命令，不使用并发元数据豁免 |
| `commandReview.readPatterns` | `string[]` | 内置只读正则 | 只读 Shell 命令识别规则 |
| `commandReview.deletePolicy` | `string` | `expected`（兼容显式旧选择） | 删除独立策略：`deny` / `ask` / `expected` / `allow` |
| `commandReview.gitPushPolicy` | `string` | `expected` | 推送独立策略：`deny` / `ask` / `expected` / `allow` |
| `commandReview.absoluteDenyDelete` | `boolean` | 未设置 | 兼容旧配置；未设置 `deletePolicy` 时，显式 `true` 映射为 `deny`，显式 `false` 映射为 `allow`；均未设置时使用 `expected` |
| `commandReview.deletePatterns` | `string[]` | 内置删除正则 | 删除操作识别规则 |
| `commandReview.provider` | `string` | `""` | 审核模型使用的 Provider；默认与 model 同时留空，自动跟随发起调用的会话 |
| `commandReview.model` | `string` | `""` | 审核模型 ID；默认跟随会话模型，安全审核提示词仍独立保留 |
| `commandReview.timeoutMs` | `number` | `20000` | 审核模型等待超时（毫秒） |
| `commandReview.onFailure` | `string` | `ask` | 审核失败时行为：`ask` / `deny` / `allow` |
| `commandReview.denyPatterns` | `string[]` | 内置高危正则 | 高风险命令识别规则 |
| `commandReview.auditLimit` | `number` | `500` | 最近记录条数，写入超过两倍时压缩；`0` 不限条数，仍受 2 MiB 文件上限约束 |

自动审核不会因风险规则未命中而放行无法确认只读的受审调用：`rules+llm` 交给模型，`rules-only` 转人工；`all` 同样审核只读调用。无法完整解析或超出审核输入上限的命令转人工确认。删除规则识别执行语法，不把搜索文字、注释或补丁新增内容直接当作删除操作。

“删除命令”和其下方的“git push（推送）命令”提供四档独立策略，在自动审核启用时生效。`deny` 直接拒绝；`ask` 强制询问用户；`expected` 独立做预期一致性审核（即使全局为仅本地规则）；`allow` 跳过本插件的 AI 审核和人工询问，不再走全局模式。其他命令才使用全局审核模式。复合命令按保留引号的操作片段分别处理，拒绝优先于询问，全部通过才执行，专项允许不能连带放行其他操作。无法可靠拆分的脚本或动态语法转人工确认。宿主权限始终保留；手动 Git 推送按钮不受此工具审核策略影响。

新配置及重置后的默认模式、删除与推送策略均为 `expected`；已有显式选择不会迁移为宽松策略。界面会随当前选项显示对应详细说明；仅本地模式下，如果专项需要预期审核，仍显示模型配置。

预期依据仅来自宿主标记 `source.kind=user` 的最近真人文本消息，保留消息 ID 与事件序号，不采信 Agent 自述、工具结果或插件注入内容作为授权。审核请求只携带相关真人上下文、原始参数、实际审核片段及只读取得的路径观察，不重放聊天系统提示词或工具列表。当前检查覆盖静态参数边界、相对路径、通配符所属范围、物理路径/符号链接，以及显式推送远端和引用参数；不执行命令、变量或脚本，不枚举通配符，也不猜测隐式 Git 推送目标。无法核实的目标、项目根目录等重大范围转人工确认。缺少预期依据或预期模型失败时，即使一般失败策略为允许，也不会自动批准。

预期判定包含预期范围、实际范围、证据，批准必须引用真人消息 ID；这些信息出现在人工确认理由与审计记录中。返回批准前会检查参数、设置、真人请求及已观察路径是否变化，变化则要求重新审核或确认。此检查不是文件系统锁，也不能保证识别任意动态脚本内部的全部效果。

审核模型收到脱敏后的完整工具参数和可确定的工作目录。仅缓存 `ask` 结果，缓存键包含完整原始参数的哈希及目录上下文；`allow` 和 `deny` 每次重新判断。人工确认前会保留后续审核监听器的拒绝结果。此模块仍是辅助审核，不是操作系统级执行隔离。
| `explorer.enabled` | `boolean` | `true` | 是否启用项目文件浏览器 |
| `explorer.side` | `string` | `right` | 面板停靠方位：`left` / `right` |
| `explorer.defaultOpen` | `boolean` | `false` | 会话开始是否默认展开文件面板 |
| `explorer.respectGitignore` | `boolean` | `true` | 文件树是否遵循 `.gitignore` |
| `explorer.maxEntriesPerDir` | `number` | `500` | 单目录最大展示条目数 |
| `explorer.openLinksInPanel` | `boolean` | `true` | 点击消息中的文件链接是否在侧边栏打开 |
| `git.enabled` | `boolean` | `true` | 是否启用 Git 工作流增强 |
| `git.provider` | `string` | `""` | AI 提交信息使用的 Provider，留空跟随当前会话 |
| `git.model` | `string` | `""` | AI 提交信息使用的模型，留空跟随当前会话 |
| `git.commitStyle` | `string` | `conventional` | 提交风格：`conventional` / `simple` / `detailed` |
| `git.commitLanguage` | `string` | `zh-CN` | 提交信息语言：`zh-CN` / `en` / `auto` |
| `git.autoStageAll` | `boolean` | `true` | 暂存区为空时是否自动暂存全部改动 |
| `git.sessionBinding` | `string` | `strict` | 会话与分支绑定模式：`strict` / `prompt` / `off` |
| `git.autoAlignBranch` | `boolean` | `true` | 切换会话时自动对齐绑定分支；仅在工作区干净且没有运行中会话时执行，绑定关闭时不执行 |
| `git.worktreeDirPattern` | `string` | `../{repo}-{branch}` | Worktree 目录命名规则 |
| `git.worktreeAutoRegister` | `boolean` | `true` | 创建 Worktree 后是否自动注册为 DSH 工作区 |
| `git.pushAutoSetUpstream` | `boolean` | `true` | 首次推送是否自动设置上游分支 |
| `git.pushTimeoutSeconds` | `number` | `60` | Git 推送超时时间（秒） |
| `sessionAdmin.enabled` | `boolean` | `true` | 是否启用会话管理与回收站 |
| `sessionAdmin.attachmentGc` | `boolean` | `false` | 兼容保留字段；当前宿主没有安全的附件删除接口，界面禁用且不接受开启请求 |
| `pluginSafety.enabled` | `boolean` | `true` | 是否启用插件隔离与故障救援 |
| `pluginSafety.quarantine` | `string[]` | `[]` | 当前被隔离禁用的插件包名列表 |
| `checkpoints.enabled` | `boolean` | `true` | 是否启用影子 Git 检查点 |
| `checkpoints.snapshotOn` | `string` | `turn` | 快照时机：`turn` / `tool` |
| `checkpoints.excludes` | `string[]` | 内置排除列表 | 影子仓库排除路径（git ignore 语法） |
| `checkpoints.maxFileSizeMb` | `number` | `32` | 单文件快照大小上限（MB） |
| `checkpoints.retentionDays` | `number` | `30` | 检查点保留天数，`0` 表示永久保留 |
| `terminal.enabled` | `boolean` | `true` | 是否启用侧边栏终端 |
| `terminal.shell` | `string` | `auto` | 执行命令的 Shell：`auto` 跟随平台默认，可选预设 id（`powershell`/`pwsh`/`cmd`/`gitbash`/`wsl`/`zsh`/`bash` 等），或填可执行文件绝对路径 |
| `terminal.shellArgs` | `string[]` | `[]` | 启动 Shell 时追加的参数 |
| `terminal.scrollbackLines` | `number` | `2000` | 每个终端在服务端保留的回滚行数，页面刷新或切回标签页时用于恢复画面 |

---

## 故障救援 CLI / Rescue CLI

当插件导致 DSH 后端启动失败时，可使用独立于插件构建产物的 CLI 工具：

```sh
dsh-ext status                      # 查看当前隔离状态
dsh-ext list [--profile <name>]     # 列出已知插件
dsh-ext skip <plugin>...            # 隔离指定插件
dsh-ext unskip <plugin>...          # 取消隔离
dsh-ext safe [--profile <name>]     # 一键安全模式，隔离全部第三方插件
dsh-ext restore                     # 清空全部隔离记录
dsh-ext uninstall <plugin> [--profile <name>]
                                    # 从 profile 移除插件
```

> 该 CLI 仅依赖 Node.js 标准库，不引入任何 npm 外部依赖；即使插件自身构建产物损坏，依然可以运行。

---

## 运行约束 / Requirements

1. **宿主要求**：唯一硬依赖是 DSH 的 `webServer` 服务；其他能力在缺少依赖服务时自动优雅降级。
2. **Git 环境**：项目差异比对、Git 工作流与检查点功能需要系统安装 `git`，并可从 `PATH` 访问。
3. **凭证隔离**：DeepSeek API 密钥只在 Node 宿主进程内使用，不会进入浏览器前端状态。
4. **构建产物**：发布包内置 `lib/index.js`、`lib/client.js` 与 `bin/dsh-ext.mjs`，运行时无需 TypeScript 编译。
5. **会话永久删除**：仅删除归档且已不在宿主中加载的会话；关闭会话或重启宿主后可重试。删除失败保留回收站记录，批量删除会报告部分失败，不递归删除会话所在目录。

---

## 开发与测试 / Development

```sh
# 安装依赖
pnpm install

# 类型检查、解析器单测、Git 隔离性与安全回归验证
npm run verify

# 构建 Node 宿主层与浏览器前端层
npm run build
```

构建产物：

- `lib/index.js`：Node 宿主层
- `lib/client.js`：浏览器前端层（DSH Loader 工厂格式）

---

## 开源协议 / License

本项目基于 [MIT License](./package.json) 开源。
