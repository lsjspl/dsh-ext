# dsh-ext 代码审查报告

> 审查日期：2026-09-05 · 审查范围：`src/`（服务端 + 客户端全部模块）、`bin/dsh-ext.mjs`、`scripts/`、配置与 README
> 方式：只读审查，未改动任何代码。所有发现均给出了真实文件行号依据。

---

## 一、总览

| 子系统 | 高 | 中 | 低 | 主要风险主题 |
|---|---|---|---|---|
| 服务端核心（http / git / quarantine / checkpoint-store 等） | 3 | 10 | 13 | 并发竞态、隔离记录丢失、同源栅栏可绕过 |
| 服务端功能模块（features/*） | 1 | 9 | 22 | 破坏性操作打到错误目标、Windows shell 引用、审计日志丢数据 |
| 客户端 UI（client/*） | 3 | 13 | 19 | 中文输入法误触破坏性 rewind、全局 CSS 污染、状态竞态 |
| CLI 与构建（bin / scripts） | 1 | 6 | 14 | YAML 格式损坏、救援工具自身缺陷、声明与实现不一致 |
| **合计（去重前）** | **8** | **38** | **68** | |

**代码总体评价**：质量较高。`execFile` 无 shell 注入、`-z` 输出解析、原子写、文件锁、影子 git 与项目仓库隔离等都有清晰的设计意识，注释与意图大体明确。问题集中在三类：

1. **并发边界与注释承诺不一致** —— `serialize()` 只覆盖了部分写路径，多个旁路（preview / prune / turnChanges / compact）绕过了串行化；
2. **"静默吞错转空值"** —— quarantine 读取失败当空名单、prune 空集直接返回、CLI 读文件失败当空文件，都会把故障放大成数据丢失；
3. **两份手抄副本**（`bin/dsh-ext.mjs` 与 `src/quarantine.ts`）已经出现行为漂移，且共有同一个高危 bug。

---

## 二、优先修复 Top 12（跨模块）

1. **【高】YAML 未加引号写入 `@` 开头的 id —— 救援工具会损坏它要修的文件**
   `bin/dsh-ext.mjs:104`（同一实现复制于 `src/quarantine.ts:69`）
   `isRowId` 刻意允许前导 `@`（scoped 包名），但 `renderRegion` 把它不加引号写进 YAML。YAML 中 `@` 是保留指示符，经仓库内 js-yaml@4.3.2 实测解析报错。触发路径：harness 挂掉 → 用户执行 `dsh-ext skip @scope/pkg`，若包名无法从 profile 解析到（恰恰是救援场景）就原样写入 `cordis.patch.yml` → launcher 读到非法 patch 文件，整个组合层崩掉。另外全数字/布尔形 id（`123`、`true`）不加引号会被解析成 number/boolean，与字符串 row id 永远不匹配。
   **建议**：渲染时一律加引号 `` `- id: "${row}"` ``（实测加引号后解析正常）；**两份副本必须同步修**，否则违背文件头 "never disagree" 的声明。

2. **【高】隔离记录的锁外 seed 写入可丢失隔离条目**
   `src/quarantine.ts:127-128`
   `updateQuarantine` 在进入 `withFileLock` 之前无条件 `readQuarantine` + 原子写回（注释声称"仅在缺失时 seed"，代码并非如此）。竞态：写者 B 读到旧记录 → 写者 A 完成加锁更新（含新条目 X）→ B 用旧内容覆盖 record → B 拿锁后基于被回退的记录渲染 patch，X 永久丢失。这是救活损坏 harness 的关键数据。
   **建议**：仅在 ENOENT 时 seed，且把 seed 移入锁内（或整个流程进 `withFileLock`）。

3. **【高】`preview()` 绕过每工作区串行化并写共享 shadow index，且未 `ensure`**
   `src/checkpoint-store.ts:487-501, 202-209`；调用点 `src/features/checkpoints.ts:727`
   三个问题叠加：(a) 注释宣称 preview 的写"由调用方串行化"，但 `/checkpoints/preview`（checkpoints.ts:727）没进 `serialize()` 队列，`preview` 内部却对**共享的 `dsh-index`** 执行 `git add --all`，与并发 snapshot 交错会提交出混合两个时刻的树，破坏检查点完整性；(b) 不调用 `ensure()`，影子仓库尚不存在时首次使用必 500；(c) 每次 GET 都全量 `git add --all`，昂贵副作用。
   **建议**：改用 `turnChanges` 式临时索引；至少纳入 serialize 队列 + 先 ensure + 捕获 `SnapshotError` 转 `ApiError`。

4. **【高】Windows 打开资源管理器：路径未加引号直通 cmd.exe —— 空格路径损坏 + cmd 元字符注入面**
   `src/features/explorer.ts:358-364`
   `spawn(COMSPEC, ['/d','/s','/c','start','', path], { windowsVerbatimArguments: true })` 下 Node 不做任何引号转义，空标题参数退化为一对空格。后果：含空格路径被 `start` 拆开（打开失败或错误目录），与 L355-357 注释声称相反；路径中的 `&`、`^`、`|` 等（`&` 在 NTFS 文件名合法）被 cmd 当命令分隔符解析，如目录名 `a & calc` 会被拆成两条命令。对比同文件 `openInEditor`（L498-503）正确地手工加引号，可见是遗漏。
   **建议**：`['/d','/s','/c','start','""', `"${path}"']`，或改用不经 shell 的方式（`spawn('explorer.exe', [path])`）。

5. **【高】`/explorer/*` 接受任意已存在目录为 workspace root，把"文件浏览"扩大到整个文件系统；叠加弱同源栅栏危害放大**
   `src/features/explorer.ts:1031-1033` + `src/http.ts:88-98`
   `resolveRoot` 对 query 里传的任何存在的绝对路径直接放行（`existsSync` 即通过），与同插件 checkpoints 的 fail-closed 哲学（`requireWorkspace` 拒绝非注册工作区）正好相反。而 `http.ts` 的同源校验放行 `Origin: null`、且 Origin===Host 的比较可被 DNS rebinding 绕过（攻击者域名解析到 127.0.0.1 后 Origin 与 Host 相等）。两者组合：外部网页可诱导浏览器读任意路径文件、restore 检查点改写工作区。
   **建议**：`resolveRoot` 回退限定为 registry + `process.cwd()`；`http.ts` 改为校验 Host 白名单（localhost/127.0.0.1/[::1]）并拒绝 `Origin: null`。

6. **【中】`/sessions/purge` 不校验目标必须在归档集合中，可永久删除活跃会话**
   `src/features/session-admin.ts:358-372, 439-457`
   targets 仅来自 body 的 `sessionId`（或 `all`），handler 从不检查 `reg.archivedSessionIds.includes(target)`，随后无条件 detach → 驱逐内存会话 → 物理删除文件与父目录。UI 可能只对回收站行提供按钮，但服务端对活跃会话 id 同样放行，绕过"先归档再删除"的设计契约。
   **建议**：非 `all` 模式校验 `targets ⊆ archivedSessionIds`，否则 400/404。

7. **【中】`/git/discard` 把"paths 为空"当作"放弃全部更改"，且服务端无确认门**
   `src/features/git-ops.ts:934-941`
   `if (all || paths.length === 0)` 即执行 `git checkout -- .` + `git clean -f -d`。一个客户端 bug 或误构造的空请求会静默清掉整个工作区未提交修改和未跟踪文件。其他破坏性操作（restore/forget）都有 `confirm: true` 门，这里没有。
   **建议**：paths 为空且未显式 `all===true` 时返回 400，或要求 `confirm: true`。

8. **【高】用户气泡编辑框：中文输入法的 Enter 直接触发破坏性 rewind**
   `src/client/UserEditBubble.tsx:203-208`
   `onKeyDown` 仅判断 `Enter && !shiftKey`，未检查 `event.nativeEvent.isComposing`。拼音输入法按 Enter 确认候选词会立即 `send()`，而 send 的副作用是重演 `rewindTurn`（文件还原 + 会话 fork + 归档原会话，见同文件 125-181 行）。对中文优先的产品这是高频误触。
   **建议**：加 `if (event.nativeEvent.isComposing || event.keyCode === 229) return`。

9. **【高】全局 CSS 把文档内所有 listbox 选项图标替换成回形针**
   `src/client/index.tsx:232-240`（`injectAttachIconStyles`）
   注入的选择器 `[role="listbox"] [role="option"] > span[aria-hidden="true"]` 作用域是整个文档且永不移除，会命中宿主其他菜单、其他插件中任何 listbox 选项内的 `span[aria-hidden]`。该样式只为 `+` 菜单里一条合成附件行服务。
   **建议**：给合成行的图标 span 加专属类名或限定容器，仅对该行应用 mask。

10. **【中】checkpoint `prune`：全部过期时永不清理（保留期失效、磁盘泄漏）**
    `src/checkpoint-store.ts:680-697`；调用点 `features/checkpoints.ts:770`（也未进 serialize）
    `keep.length === 0` 时 `oldest === undefined` → `return 0`：工作区闲置超过保留期后所有 checkpoint 过期却永远删不掉。且 prune 前不清理 `refs/dsh-turns/**`（L357-393 创建），gc 回收不了被 pin 的对象，名义执行实际几乎不释放；同时不在 serialize 队列，可与并发 snapshot/restore 竞态。
    **建议**：keep 为空时把分支指向零树提交再 gc；prune 前清理过期 turn refs；纳入 serialize。

11. **【高】rewind 引擎：detail 字段缺失时误判"第一轮"，走新建会话 + 归档原会话的破坏性回退**
    `src/client/rewind.ts:152-153`
    `isFirstTurn = detail?.turn === 1 || (detail?.turn === undefined && undoAnchorSeq === undefined)`。当 `/checkpoints/turn-info` 返回对象但缺 `turn` 字段（或 `UserEditBubble.tsx:140` 的 `as` 断言掩盖缺字段）时误入 first-turn 分支：新建空白会话、还原文件、归档原会话——一次数据异常即触发"清空当前会话"。TurnChangesCard 用 `detailReady` 挡住了 undefined，但字段级缺失没被挡。
    **建议**：first-turn 判定改为 `detail.turn === 1` 单条件；`turn` 缺失按错误处理而非回退。

12. **【中】新建 Worktree 弹窗在数据加载期间反复重置表单，清掉用户正在输入的内容**
    `src/client/ComposerGitBar.tsx:305-320`（根因 `:622`、`:1205-1206`）
    effect 依赖 `availableBranches`，而调用侧传 `branches.data?.local ?? []`——数据未就绪时每次父渲染产生新空数组引用，memo 重算、effect 重跑，`branchMode/selectedBranch/path/autoRegister` 全部重置。弹窗打开到接口返回之间的窗口内，用户输入被反复清空。
    **建议**：effect 只依赖 `props.open`，数据就绪后仅在字段为空时填默认值。

---

## 三、服务端核心（src/index / config / settings / http / git / sentinel / quarantine / checkpoint-store）

### 中危

| # | 位置 | 问题 | 建议 |
|---|---|---|---|
| C1 | `checkpoint-store.ts:551-563`（调用于 `features/checkpoints.ts:668`，未 serialize） | `turnChanges` 临时索引以固定 `dsh-turn-index-${process.pid}` 命名，同一进程内多卡片并发轮询时 read-tree/add/write-tree 互相踩踏 | 路径加请求级随机后缀，或纳入 per-workspace 队列 |
| C2 | `quarantine.ts:47-55` | `readQuarantine` 把 JSON 损坏/权限错误等一切失败吞成"空隔离名单"，随后任意一次 `updateQuarantine` 会以空 rows 重写 patch 托管区，静默清空全部隔离 | 区分 ENOENT 与其他错误；解析失败回退解析 patch 托管区或拒绝写入 |
| C3 | `paths.ts:39-41` | `workspaceKey` 直接哈希原始字符串，Windows 下 `C:\a\b`/`c:\a\b`/`C:/a/b`/尾斜杠各产生不同 key → 多套影子状态分裂；`git rev-parse` 返回正斜杠路径天然不一致 | `path.resolve()` 后 win32 统一大小写再哈希 |
| C4 | `checkpoint-store.ts:133-136` | `git init` 用 `env: {}` 清空子进程环境（无 PATH/SystemRoot），Windows 上 msys2 git 可能启动失败；`--initial-branch` 需 git ≥ 2.28，老版本失败会被上层误报"git 不在 PATH" | 从 `process.env` 派生并仅剔除 GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE |
| C5 | `sentinel.ts:132-194` | 救援脚本把未转义的插件名/服务端错误文本写入 `innerHTML`（XSS）；`pluginName` 源自失败卡片 DOM 正则提取或 `/plugins` 接口 | 用 `textContent` 组装或 HTML 转义 |
| C6 | `sentinel.ts:389-391, 403-408` | MutationObserver 检测到失败后永不断开，此后每次全页 DOM 变更都 `querySelector` + `innerText`（强制同步布局）；且 30 秒轮询停止后新出现的失败页无法救援 | 挂载后 `observer.disconnect()`；`innerText` 换 `textContent` |
| C7 | `checkpoint-store.ts:287-290` | `snapshot` 把 `diff --cached --quiet` 一切非零退出当"有变更"，exit 128（索引损坏）也会继续 commit 把坏索引固化成检查点 | 仅 `code === 1` 视为有变更，其余抛 SnapshotError |
| C8 | `settings.ts:43-61` | `unloading` 守护 effect 注册在 `ctx.inject` 之前，若 cordis LIFO 先释放 inject 派生 scope，detach 回调会在 `unloading===false` 时触发 `onChange` → teardown 中重新挂载特性；`scope.watch` 订阅也未显式解除 | detach 中额外判断 ctx 是否已卸载；保存并调用 watch 取消订阅 |
| C9 | `checkpoint-store.ts:491, 657, 673`（入口 `features/checkpoints.ts:722,733,745`） | `/checkpoints/preview|diff|restore` 的 `id` 仅判非空即拼入 git argv；`git diff --output=<file>` 可写任意可写路径（参数级注入） | 校验 `/^[0-9a-f]{7,40}$/` 或先 `rev-parse --verify` 归一化，加 `--` 分隔 |

### 低危 / 优化

| # | 位置 | 问题 |
|---|---|---|
| C10 | `config.ts:237` vs `config.ts:338` | schema 默认 `'deepseek-chat'` vs `DEFAULT_CONFIG.commandReview.model: 'deepseek-v4-flash'`，同设置双默认值漂移 |
| C11 | `index.ts:105-112`、`command-review.ts:457` | feature mount 中途抛错时已注册的部分监听没有 disposer 可回滚；建议约定"先装路由、后注册监听" |
| C12 | `git.ts:51-52` | 注释称 `GIT_CONFIG_NOSYSTEM` 阻止 repo 本地 hook，实际只禁系统级配置，注释误导 |
| C13 | `git.ts:138-154` | `gitBranchState` 串行 2-3 个 git 进程，可合并为一次 `rev-parse` / `status -b --porcelain` |
| C14 | `checkpoint-store.ts:152-153, 175-185` | `ensure`（每次 snapshot 调用）无条件重写 `info/exclude`，重复 IO；内容不变时跳过 |
| C15 | `checkpoint-store.ts:316-319`（轮询路径 `features/checkpoints.ts:446,460,547`） | `list()` 全量 `git log` 无上限，建议 `-n <上限>` |
| C16 | `checkpoint-store.ts:457-471` | `linkAnchor` 无锁读改写可丢更新；index 按 checkpointId 只增不减；`linkTurn/linkTurnEnd` 忽略 `update-ref` 失败静默丢关联 |
| C17 | `checkpoint-store.ts:637-642` | restore 删除环节：Windows 只读文件 EPERM 被静默吞掉；不清理空目录 |
| C18 | `quarantine.ts:85-91`（CLI 副本 `bin/dsh-ext.mjs:110-118` 同） | `spliceRegion` 对标记错位（END 在 BEGIN 前）不收敛，每次写入追加一个重复管理区，文件无限增长 |
| C19 | `sentinel.ts:198-204, 339-345` | `isStrictPackageName` 不允许 `.`，`foo.bar` 类合法包名漏检；兜底分支把所有第三方插件列为失败，易诱导误伤 |
| C20 | `http.ts:63-79` | 413 后未消费/关闭请求流，客户端可能在读到响应前收到连接重置 |
| C21 | `checkpoint-store.ts:498` | `preview` 的 `ls-files -- ...affected` 未分块，Windows argv ~32K 上限时失败 → known 为空 → 所有文件被误报"将永久丢失" |
| C22 | `bundle-rows.ts:78-80` | `bundleManifestPath` 未清洗包名，含 `..` 段可穿越（当前调用方安全，防御性缺失）；而 `isRowId` 允许中段 `..` |

---

## 四、服务端功能模块（src/features/*）

### 中危

| # | 位置 | 问题 | 建议 |
|---|---|---|---|
| F1 | `checkpoints.ts:687-689` vs `:639` | `/checkpoints/turn-info` seq 寻址分支漏了 `seqDetail.closed !== undefined` 的合并判断：turn 未结束（`closed:false`）但 `question`/`undoAnchorSeq` 均为 undefined 时，返回沿用硬编码 `closed: true`，前端据 api-contract 提前开放 undo/edit 给运行中的 turn | L687 条件补上 `|| seqDetail.closed !== undefined` |
| F2 | `checkpoints.ts:765-782` + `:279-280` | `/checkpoints/prune`、`/checkpoints/forget` 未显式指定 workspace 时静默回退 registry 第一行——"清空全部 checkpoint 历史"（forget 直接 rm 整个 shadow repo）可能落在屏幕外那个最旧项目上；forget 的 confirm 只确认意图不确认目标 | requested 与 session 均缺失时抛 400 |
| F3 | `command-review.ts:291-298, 320-325, 467-475` | AuditLog 的 `compact` 不走 `record` 的 `pending` 串行链：read 与原子替换之间经 `record` 追加的行在旧 inode 上，替换后丢失——审计日志（安全功能）静默丢数据 | compact 排入 `pending` 链 |
| F4 | `git-ops.ts:995-998` | discard 失败兜底 `rm(resolve(repo, up), { recursive: true, force: true })` 前无 repo 包含性断言（当前需上游解析变动才越界，防御纵深缺失） | rm 前断言 `!relative(repo, resolved).startsWith('..')` |
| F5 | `git-ops.ts:900-911` | `handleStage` 未跳过 `-z` porcelain rename 记录的原路径字段（`handleDiscard` L957-959 正确跳过），含 rename 时 staged/unstaged 计数虚高 | 与 handleDiscard 对齐 `i++` |
| F6 | `deepseek-balance.ts:117-127, 165-173` | `fetchBalance` 无超时（controller 创建后从未 abort）：上游挂起使共享 `inFlight` 永久 pending，所有后续 `/balance` 请求（含轮询）都 await 同一 promise 直到 undici 数百秒默认超时 | `AbortSignal.any([signal, AbortSignal.timeout(10_000)])`，客户端断开时 abort |
| F7 | `git-ops.ts:757-813` | `worktree remove --force` 丢弃未提交修改、目标路径可指向磁盘任意位置（与 `resolveRoot` 同一信任模型），无服务端确认 | force 时要求 confirm，路径限定 registry 附近 |

### 低危 / 优化

| # | 位置 | 问题 |
|---|---|---|
| F8 | `explorer.ts:1237-1248` | `/explorer/raw` Range 解析不支持 suffix range：`bytes=-N` 返回前 N 字节而非最后 N 字节，违反 HTTP 规范 |
| F9 | `explorer.ts:925-929` vs `checkpoints.ts:44-47` | `sessionRoot` 读 `session.meta.cwd`，而 checkpoints 注释明确 live session 的 cwd 在 `header`"never meta"，第 1 优先级恒 miss；应复用已导出的 `liveSessionCwd` |
| F10 | `explorer.ts:40` | `resolveWildcard` 只转义 `*`，目录名含 `(`、`+`、`[`、`.` 等时正则语义改变或永不匹配 |
| F11 | `explorer.ts:108-110` | `toPosix` 以未 realpath 的 `root` 对 realpath 后路径求 relative，root 含符号链接（macOS /tmp、subst 盘）时产出 `../../` 形态的"workspace 相对路径" |
| F12 | `checkpoints.ts:484-487` | `snapshotOn:'turn'` 去重 key 在快照成功前登记，失败的快照该 turn 内不会重试——该 turn 无回滚点且无补救；失败时应 `turnSnapshots.delete(key)` |
| F13 | `checkpoints.ts:305-329, 294` | `turnChangesCache` 与 `turnSnapshots` 无界增长（TTL 只控新鲜度不控容量），长运行缓慢内存泄漏 |
| F14 | `checkpoints.ts:699-718` | `/checkpoints/snapshot` 路由未创建 AbortController（同文件其余读路由都有），客户端断开后快照仍完整执行 |
| F15 | `git-ops.ts:611, 666-668, 719, 787-794` | branch/remote 等参数未拒绝 `^-` 开头与空白字符，会被 git 当选项（参数注入边缘） |
| F16 | `git-ops.ts:146, 156-165` | `listBranches` 用 `|` 作 `--format` 分隔符，refname 合法可含 `|`，会使字段错位；改 `%00` |
| F17 | `git-ops.ts:84-102` | `SessionBindingStore` 无串行化，并发 persist 交错时写盘内容取决于完成顺序 |
| F18 | `command-review.ts:292-294` | 每条审计记录都先 `mkdir`（热路径冗余 IO），首次成功后可置位跳过 |
| F19 | `command-review.ts:239-244` + `llm-cache.ts:51-69` | `cached` 无 in-flight 合并：相同命令并发各自调模型（浪费且可能得出不同裁决）；cache key 用截断到 8000 字符的 excerpt，前 8000 字符相同的不同命令共享同一裁决（key 应改用完整文本 hash） |
| F20 | `deepseek-balance.ts:50-77` | `credentials.resolve/readRecord` 异常未包裹，存储损坏/权限错误变成 500 而非语义化 409 |
| F21 | `plugin-safety.ts:101-138` | `buildView` 对 profile×package 串行 `await bundleRowIds`，`Promise.all` 可并行 |
| F22 | `plugin-safety.ts:191-201` | `/plugins/safe-mode` 无 confirm 门：一键把所有第三方插件写入禁用列表（需重启恢复），误触代价不对称 |
| F23 | `reasoning-effort.ts:431-436` | `/efforts/set`、`/vision/set` 不强制 `expectedRevision`，并发写互相覆盖（后写胜） |
| F24 | `reasoning-effort.ts:145-152` | `assertModelId` 允许 `__proto__`/`constructor` 作为 settings path 段（取决于 settings 实现风险有限，仍应显式拒绝保留字） |
| F25 | `reasoning-effort.ts:347-371` | `describe` 对每模型串行 `resolveModelInfo`（最多两次/模型），`/efforts` 每次 set 后整表重算，多时明显变慢 |
| F26 | `session-admin.ts:239-245` | `removeFromArchive` 读-改-写非原子，并发 restore/purge 会丢更新 |
| F27 | `session-admin.ts:266-436` 多处 | 大量 `as any` 探测 host 内部结构（entities/table/headers/preparations 等），host 升级重命名后静默失效且各步 catch 吞掉；至少探测失败时 log 一次 |
| F28 | `settings-api.ts:68-75` | `/config/mutate` 把所有错误统一映射 409，值不合法（400 语义）与 revision 冲突不可区分 |

---

## 五、客户端 UI（src/client/*）

### 高危（另见 Top 12 #8、#9、#11、#12）

### 中危

| # | 位置 | 问题 | 建议 |
|---|---|---|---|
| U1 | `index.tsx:335-341`（`:259` 的 `plusCommandSessions`） | `+` 菜单"添加附件"行在首次 candidates 调用即被 `delete(session.sessionId)`，同函数又按 query 过滤（预期多次调用）——第二次起 `isPlusMenu` 为 false，附件行从菜单中消失 | 不在首次调用后删标记，菜单关闭时清理 |
| U2 | `ComposerImages.tsx:156-178`（`insertText` 133-140） | 一次选入多个非图片文本文件时正文互相覆盖只留最后一个：循环内 `setDraft(current + text)` 的 `current` 是同一次渲染的 draft，不随前一次写入更新 | 循环外取一次 draft，循环内累加本地字符串，最后一次 setDraft |
| U3 | `use-client-config.ts:85-89` vs `use-config.ts:63-84` | 两条配置写路径乐观锁契约不一致：会话侧 `mutateClientConfig` 不带 `expectedRevision`（自动审核开关 index.tsx:729-731 等），与设置页带 revision 的写并发时互相静默覆盖 | mutateClientConfig 读最近 `/config` revision 一并提交，失败按 useConfig 语义 reload |
| U4 | `use-config.ts:63-84` | `setMany` 闭包捕获当前 revision，快速连续两次写时第二次用旧 revision 被误判冲突；busy 状态存在但 Toggle 未用它禁用 | store 内串行化写，或以服务端最新 revision 重试一次 |
| U5 | `panel-state.ts:46-48`（调用于 index.tsx:981、SidePanel.tsx:61） | `usePanelOpen` 模块级一次性初始化：会话头 toggle 在 config 未加载时以 `false` 初始化，SidePanel 只在 config 加载后才挂载——首次会话中 `explorer.defaultOpen: true` 永远不生效 | 初始化与订阅分离，或 config 到位后再决定默认值 |
| U6 | `turn-info-store.ts:141-143` + `:46-53` | `refresh(0)` 意为"冷条目立即取数"，但 `now - fetchedAt < 0` 永远 false 等于零过滤：每挂载一张卡片就把当前会话所有可见卡片全部重拉 `/checkpoints/turn-info` | 为单键提供 fetchOne |
| U7 | `turn-info-store.ts:34, 76-88` | STORE 只增不删（长会话滚动为每 (session,turn) 留存完整 TurnInfoView），ticker 订阅归零后 2s setInterval 永久空转 | refs===0 且超 TTL 删除；归零后 clearInterval |
| U8 | `SettingsPage.tsx:303-317` | 打开设置页即自动改写用户配置：`useLayoutEffect` 发现 `commandReview.provider/model` 不在 `/review/models` 列表（只反映当前在线路由）就自动 setMany 覆盖为官方 flash 并持久化——provider 暂时离线时用户配置被静默改写 | 仅用户主动保存时校验提示，或仅限"从未被用户修改过"的情况 |
| U9 | `use-workspace.ts:181-277` 八处 | 渲染期间直接改模块变量 `currentWorkspaceRoot = matched.path` 而非 `setActiveWorkspaceRoot`，订阅者收不到通知；同一全局状态两条写入路径两种通知语义；渲染期做 DOM 探测属副作用 | 统一走 setter，DOM 探测移入 effect |
| U10 | `index.tsx:597-643` | DevToolBalanceBadge：cleanup 用 `document.querySelectorAll('[data-has-balance-badge]')` 清掉**所有**实例的属性（两实例并存时一个卸载剥掉另一个的布局属性）；800ms DOM 轮询；渲染期 querySelector 读 hero/provider 状态且无响应式来源 | cleanup 只清自己的 cardEl；状态走事件/store；轮询改 MutationObserver |
| U11 | `CheckpointsPanel.tsx:54-62, 77-87` | `askPreview`/`showDiff` 依赖 `[]` 却引用 `props.sessionId`，会话切换后仍向旧会话发请求；且全仓 grep 确认该组件**无任何挂载点，是死代码**（功能已由 TurnChangesCard 承接） | 补依赖或删除文件 |
| U12 | `index.tsx:837, 857-868` | turnTail 缓存仅以 `String(owner.seq)` 为键不含 sessionId，切换会话后相同 seq 的 tail 短暂显示上一会话的回合号 | 键加入 sessionId |

### 低危 / 优化

| # | 位置 | 问题 |
|---|---|---|
| U13 | `use-locale.ts:47-54` | `useT` 的 subscribe 是渲染期内联箭头函数，每次渲染 unsubscribe+resubscribe；提为模块级稳定函数 |
| U14 | `index.tsx:188` + `ComposerImages.tsx:144` | `props.useInput(state => state)` 整状态订阅：每次击键重渲染 ComposerImages 并 dispose/provide 一轮 picker 通道；只选所需字段，insertText 改用 ref 读最新 draft |
| U15 | `index.tsx:639-643` vs `ComposerGitBar.tsx:592-595` | `isHero` DOM 探测逻辑两处重复且无响应式，抽共享 hook |
| U16 | `index.tsx:292-333, 335-374` | `inputTriggers.sessionOf` / `commandUi.candidates|dispatch` 猴子补丁无重复 apply 防护，插件重载/HMR 再包一层链式累积；WeakSet/模块标志防重入 |
| U17 | `BalanceView.tsx:339-345, 408-491` | 渲染期间写 sessionStorage；30s 定时器只为刷 peak；clearTimer 与 RAF 循环无卸载清理；每次轮询成功 `console.info` 噪音 |
| U18 | `use-resource.ts:28-32, 66-77` | disabled 分支不复位 `loading`；`useCommand.run` 无并发互斥 |
| U19 | `tabs.ts:137-148` | 内置 files/review 标签可被关至空，`activeId` 落在 `''`，面板主体渲染为空；禁止关闭或关闭后回落 |
| U20 | `file-link-interceptor.ts:143-218` | document 级三监听永不移除且 mouseover 高频路径每次 `readClientConfig()`；tooltip 硬编码中文（有 translate 可用）；正则会把 `v1.2`、`e.g` 当文件路径拦截点击 |
| U21 | 多文件 | i18n 硬编码中文绕过 locales 体系：ComposerGitBar（712/715/1214/1226/799/980/1007/1117-1118）、ExplorerPanel（127/143/516/533/870-871）、TrashModal（35/211/362）、PluginsPanel（17/41/49/157-161/223/241/250）、DiffView（488/522）——英文环境 UI 仍是中文 |
| U22 | `index.tsx:120, 408` | 注册期固化 `document.documentElement.lang`，语言切换后 settings.section label / tools group name 不更新 |
| U23 | `ComposerGitBar.tsx:640` | 分支名兜底硬编码 `'main'`，master 仓库显示错误分支；显示 `—` 或 `HEAD` |
| U24 | `ComposerGitBar.tsx:9-21` | GitErrorBoundary 出错后 `hasError` 永为 true，seat 整个生命周期渲染 null；应在 sessionId/workspaceRoot 变化时重置（对比 ExplorerPanel.tsx:913 用 key 重建） |
| U25 | `index.tsx:1054, 1056` | 遗留 `console.log('[DevTool] ...')` 调试输出 |
| U26 | `rewind.ts:234-238` | binding 未就绪仅固定等 50ms 一次，慢环境下编辑重发失败；轮询若干次或订阅就绪事件 |
| U27 | `PluginsPanel.tsx:232` | 请求体同时携带 `name` 与 `row` 两个同值键，疑似契约漂移残留 |
| U28 | `TurnChangesCard.tsx:255-264` | `archiveSession` 不可用（sessionAdmin 关闭）与归档真正失败走同一条 trashFailed Toast，与 :251-254 注释意图相悖；应区分"功能不可用（静默）"与"失败（提示）" |
| U29 | `ExplorerPanel.tsx:816-819`、`FilesView.tsx:309` | 面板打开期间每 5s 无条件重拉 status（可用 visibilityState 门控）；`expanded` 集合跨 workspace/session 不重置，同名路径自动展开并发请求 |
| U30 | `ModelPicker.tsx:249-254` | 渲染期重置 `itemRefs.current = []` 靠 push 顺序对位，脆弱；改 `Map` 或回调 ref |
| U31 | `use-client-config.ts:73-81` | 乐观更新只支持两级路径之外的写静默跳过；`JSON.parse(JSON.stringify(...))` 每次深拷贝整个 config |
| U32 | `DiffView.tsx:396` | 生成 patch 时过滤所有 `===` 开头的行（为剥 jsdiff banner），正文中 `===` 起始的行（Python 老式分隔注释）被静默删除，diff 内容与真实文件不一致；只剥头部 banner |

---

## 六、CLI 与构建（bin / scripts / 配置）

### 中危（另见 Top 12 #1）

| # | 位置 | 问题 | 建议 |
|---|---|---|---|
| B1 | `bin/dsh-ext.mjs:60` vs `src/paths.ts:22-24` | CLI 无 legacy 记录目录回退：从旧包名 `dsh-dev-tool-ext` 升级的机器上，Web 端读写 legacy 目录的 quarantine.json，CLI 读到空列表 → `dsh-ext skip foo` 以空 current 整体重写 patch 管理区，**Web 端已隔离的行被静默丢弃**；违背文件头 "the two halves never disagree" | CLI 复刻同样的回退规则，或两半统一放弃 legacy 并迁移 |
| B2 | `bin/dsh-ext.mjs:131-145` vs `src/quarantine.ts:120-146` | CLI 写 cordis.patch.yml 用裸 `writeFile`（非原子、无锁）：写中途被杀留截断 patch → harness 无法启动；与使用原子写+文件锁的 Web 半部不对称，并发修改丢失更新 | temp+rename 原子写；按 withFileLock 同一约定加锁 |
| B3 | `bin/dsh-ext.mjs:347-355` + `:270-274`；`src/features/plugin-safety.ts:163-176` 同 | "禁止禁用内置插件"防护可被 row id 绕过：`dsh-ext skip llm-pi-ai`（内置包插入的 row id）输入名不匹配 BUILTIN_PREFIX，byRow 解析后隔离的是内置包的行；Web 端 `row` 字段同样绕过 `isBuiltin(name)` | resolveTargets 返回后对 `entry.name` 再做一次 isBuiltin 检查 |
| B4 | `src/config.ts:107, 291`；`README.md:276` | `pluginSafety.quarantine` 配置键声明了但从未被消费（全 src 只有 `.enabled` 被读取）：用户按文档在 settings.yaml 写该键无任何效果，且与 CLI 实际写的 row-id 列表语义不符 | 删除该键，或挂载时并入 quarantine 记录并修正文档 |
| B5 | `bin/dsh-ext.mjs:52-56` vs `@deepseek-ai/dsh-home-paths` | `DSH_HOME="~/foo"` 时 harness 侧有 `expandHomePath`（支持 `~`）而 CLI 直接 `resolve(override)` 解析到 `<cwd>/~/foo`——CLI 读写另一份不存在的 patch，隔离静默无效 | CLI 复刻 expandHomePath（三行 stdlib） |
| B6 | `README.md:250` vs `src/config.ts:237` | `commandReview.model` 默认值文档写 `deepseek-v4-flash`、实现默认 `deepseek-chat`，声明与实现不一致 | 二选一修正 |

### 低危 / 优化

| # | 位置 | 问题 |
|---|---|---|
| B7 | `bin/dsh-ext.mjs:447-453, 468` | `readFlag` 值缺失时 `--profile` 泄漏进 skip 的插件名列表，报错难定位 |
| B8 | `bin/dsh-ext.mjs:415-424` | `uninstall` 未指定 `--profile` 时按全部 profile 解析行，而 `dsh plugin remove` 固定打 `profileName ?? 'web'`，插件在其它 profile 时输出与实际来源脱节 |
| B9 | `bin/dsh-ext.mjs:76-82, 139-142` | `readText` 把 EACCES 等一切错误吞成 `''`：existing 为空则连 `.bak-dsh-ext` 备份也不写，随后 writeFile 若成功则用户手写 patch 内容直接丢失且无备份；区分 ENOENT 与其他错误 |
| B10 | `bin/dsh-ext.mjs:140-143` vs `src/quarantine.ts:128, 142-143` | 文件权限不一致：Web 半部 0o600/0o700，CLI 默认 mode |
| B11 | `bin/dsh-ext.mjs:49, 72-74` vs `src/features/plugin-safety.ts:31-39` | 两半 `isBuiltin` 判定不一致（CLI 前缀 `'@deepseek-ai/dsh'` 无尾连字符更宽），`@deepseek-ai/dshxxx` 第三方包被 CLI 误判为内置 |
| B12 | `package.json:12, 17-22` + `scripts/build.mjs:53-64` | `lib/client.js` 是 CJS 内容但包声明 `type: module` 且 exports 暴露 `.js`：任何 Node 侧 `import('dsh-ext/client')` 按 ESM 解析失败（当前仅浏览器脚本消费可用）；产物改名 `.cjs` 或从 exports 移除 |
| B13 | `package.json:64-66` | `diff`/`react-diff-view`/`refractor` 只被客户端 bundle 使用且不在 CLIENT_EXTERNAL（会被打进 bundle），应移到 devDependencies |
| B14 | `scripts/verify-checkpoints.mjs:122,124`、`scripts/verify-parsers.mjs:17,24` | verify 脚本依赖 `process.cwd()`，换目录运行即 ENOENT；build.mjs 已示范 `import.meta.url` 正确做法 |
| B15 | `scripts/verify-parsers.mjs:16-17, 212-214`；`verify-checkpoints.mjs:125, 140` | 清理不在 finally 中，check 抛异常泄漏 `lib/parsers.verify.mjs` 与临时目录；mkdtemp 的 outDir 从未使用；两脚本并发运行互相覆盖同一 entry |
| B16 | `tsconfig.json:20` | include 了 `scripts/**/*.mjs` 但未开 `allowJs/checkJs`，tsc 静默忽略，typecheck 覆盖率有误导 |
| B17 | `scripts/verify-checkpoints.mjs:95, 348, 355` | `git init --initial-branch` 在旧 git 上抛未加工堆栈；15s 计时断言在慢 CI 天然抖动；`.at(-1).id` 无空列表防护以 TypeError 退出 |
| B18 | `scripts/build.mjs:26-35, 37-42` | CLIENT_EXTERNAL 硬编码白名单与 harness Loader 耦合，harness 升级只在运行期才炸（可加构建后产物断言）；target es2022 与 tsconfig ES2023 不一致；未产出 sourcemap |
| B19 | `bin/dsh-ext.mjs` 顶层即执行 `main()` | CLI 手抄了 src/quarantine.ts 的 renderRegion/spliceRegion/isRowId/标记常量且零测试覆盖（本次高危 #1 即两份共有）；建议纯函数可 import 并在 verify 脚本中做快照比对 |

---

## 七、修复优先级建议

**P0 —— 会损坏数据/破坏 harness 本身（本周内）**
- #1 YAML 引号（bin + src/quarantine.ts 两份同步）
- #2 隔离记录 seed 竞态
- B1 CLI legacy 目录缺失导致整体重写丢行
- B2 CLI 非原子写 patch 文件
- #3 preview 绕过串行化破坏 shadow index

**P1 —— 越权/破坏性操作缺防护（随后）**
- #5 resolveRoot 任意目录 + http 同源栅栏（DNS rebinding / Origin: null）
- #6 purge 可删活跃会话
- #7 discard 空 paths 无确认门
- B3 内置插件防护被 row id 绕过（bin + plugin-safety 两处）
- C9 checkpoint id 参数注入（`--output=`）

**P2 —— 用户可感知的交互 bug**
- #8 IME Enter 误触 rewind、#11 rewind first-turn 误判、F1 turn-info closed 字段、#9 全局 listbox CSS、#12 worktree 弹窗表单重置、U1 附件行消失、U2 多文本文件覆盖、U5 defaultOpen 失效

**P3 —— 其余中低危与优化**：按上表分批处理；两份手抄副本建议先做统一（可 import + 对照测试，B19），再修共有 bug，避免修一边漏一边。
