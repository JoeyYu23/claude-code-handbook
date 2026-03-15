# 第一章：内置 Slash Commands 完全指南

## 命令系统概览

在 Claude Code 的交互界面里，输入 `/` 就会弹出命令列表。这些内置命令不是"聊天快捷方式"，而是直接驱动底层系统行为的控制接口——它们不经过 LLM 处理，执行的是固定逻辑。

理解这个区别很重要：当你键入 `/clear`，它不会"告诉 Claude 清除对话"，而是直接重置 session 状态。这让命令比自然语言指令更可靠、更快速。

> 注意：部分命令因平台、套餐或环境不同而显示不同。例如 `/desktop` 仅在 macOS/Windows 出现，`/upgrade` 和 `/privacy-settings` 仅 Pro/Max 套餐可见。

---

## 完整命令速查表

### Session 管理

| 命令 | 作用 |
|------|------|
| `/clear` | 清除对话历史，释放上下文。别名：`/reset`、`/new` |
| `/compact [instructions]` | 压缩对话，可附带聚焦指令 |
| `/fork [name]` | 在当前位置创建对话分支 |
| `/resume [session]` | 按 ID 或名称恢复历史对话。别名：`/continue` |
| `/rename [name]` | 重命名当前 session，显示在提示栏 |
| `/rewind` | 回退对话和/或代码到某个历史点。别名：`/checkpoint` |
| `/export [filename]` | 导出对话为纯文本 |

### 信息与诊断

| 命令 | 作用 |
|------|------|
| `/help` | 显示帮助和可用命令 |
| `/cost` | 显示 token 用量统计 |
| `/context` | 可视化当前上下文用量（彩色网格图） |
| `/doctor` | 诊断安装和配置是否正常 |
| `/status` | 显示版本、模型、账户、连接状态 |
| `/stats` | 可视化每日用量、session 历史、连续使用天数 |
| `/insights` | 生成 session 分析报告（交互模式、摩擦点等） |
| `/usage` | 显示套餐用量限制和速率限制状态 |

### 代码与 Git

| 命令 | 作用 |
|------|------|
| `/diff` | 打开交互式 diff 查看器，显示未提交改动 |
| `/security-review` | 分析当前分支待提交变更的安全漏洞 |
| `/pr-comments [PR]` | 获取 GitHub PR 的评论（需要 `gh` CLI） |

### 配置与个性化

| 命令 | 作用 |
|------|------|
| `/config` | 打开设置界面（主题、模型、输出样式等）。别名：`/settings` |
| `/model [model]` | 选择或切换 AI 模型 |
| `/effort [low\|medium\|high\|max\|auto]` | 设置模型算力级别 |
| `/theme` | 更换颜色主题（含深色、浅色、无障碍主题） |
| `/color [color\|default]` | 设置当前 session 的提示栏颜色 |
| `/vim` | 切换 Vim / Normal 编辑模式 |
| `/keybindings` | 打开或创建按键绑定配置文件 |
| `/memory` | 编辑 CLAUDE.md 文件，管理 auto-memory |
| `/init` | 初始化项目，生成 CLAUDE.md 指南 |

### Agent 与工具

| 命令 | 作用 |
|------|------|
| `/agents` | 管理 agent 配置 |
| `/tasks` | 列出和管理后台任务 |
| `/permissions` | 查看或更新权限设置。别名：`/allowed-tools` |
| `/hooks` | 查看 hook 配置 |
| `/skills` | 列出可用 skills |
| `/mcp` | 管理 MCP server 连接和 OAuth 认证 |
| `/plugin` | 管理 Claude Code 插件 |
| `/add-dir <path>` | 向当前 session 添加工作目录 |

### 快速问答与交流

| 命令 | 作用 |
|------|------|
| `/btw <question>` | 提问一个旁路问题（不计入对话上下文） |
| `/copy` | 复制最后一条助手回复到剪贴板 |
| `/fast [on\|off]` | 开关快速模式 |
| `/feedback [report]` | 提交反馈或 bug 报告。别名：`/bug` |

### IDE 与集成

| 命令 | 作用 |
|------|------|
| `/ide` | 管理 IDE 集成并显示状态 |
| `/desktop` | 在 Claude Code Desktop 中继续当前 session（仅 macOS/Windows） |
| `/remote-control` | 让当前 session 支持远程控制。别名：`/rc` |
| `/chrome` | 配置 Chrome 集成 |
| `/install-github-app` | 为仓库安装 GitHub Actions |
| `/install-slack-app` | 安装 Slack 集成 |

---

## 每个命令详解与使用时机

### `/clear` — 重置上下文

这是使用频率最高的命令之一。当你完成一个任务准备开始新任务时，`/clear` 可以清空上下文窗口，防止旧任务的信息干扰新任务。

```
# 完成 bug 修复后，开始新功能开发前
/clear
```

注意：`/clear` 会清除对话历史，但 CLAUDE.md 中的指令在下次对话时仍会重新加载。

**与 `/compact` 的区别**：`/clear` 完全清空历史；`/compact` 则压缩历史为摘要，保留上下文的精髓。如果你在长任务中途需要"减轻负担"而不是"从头开始"，用 `/compact`。

```
# 在长达 200 轮的重构任务中途，上下文快满了
/compact 保留关于认证模块的关键信息
```

### `/context` — 可视化上下文用量

这是高级用户必备的调试工具。运行后会显示彩色网格，直观展示哪些工具、memory 占据了多少上下文空间，并给出优化建议。

```
/context
```

当你发现 Claude 开始"遗忘"早期对话内容时，这是第一个应该运行的命令。

### `/cost` — 监控 token 消耗

对于 API 用户尤为重要。显示本次 session 的累计 token 用量。

```
/cost
```

专业技巧：在执行大型任务前后各运行一次，可以估算类似任务的 token 成本。

### `/doctor` — 诊断安装问题

遇到奇怪的行为时，第一步不是重装——而是运行 `/doctor`。它会检查：
- 安装完整性
- 配置文件是否有效
- 认证状态
- 工具可用性

```
/doctor
```

### `/diff` — 交互式 diff 查看器

不同于简单的 `git diff`，`/diff` 提供交互界面：
- 用左右箭头在当前 git diff 和逐轮改动之间切换
- 用上下箭头浏览文件

这对于审查 Claude 所做的多轮编辑特别有用。

### `/btw` — 旁路问题

这是一个被严重低估的命令。当你在进行某个任务时，脑海中闪过一个问题，但又不想打断当前流程、也不想让这个问题进入对话历史——就用 `/btw`。

```
/btw 你刚才提到的那个 async 模式，在 Python 3.8 里也能用吗？
```

Claude 会回答，但这个问答不会进入 session 历史，不影响上下文，也不会干扰正在进行的任务。

### `/rewind` / `/checkpoint` — 时光倒流

这是 Claude Code 的"版本控制"。当 Claude 走错了方向，你可以回退到某个之前的状态——包括代码文件。

```
/rewind
```

运行后会显示对话历史，选择要回退到的点即可。

### `/security-review` — 安全扫描

这是一个隐藏的强大工具。它会分析当前分支相比主分支的 git diff，专门寻找：
- 注入漏洞
- 认证问题
- 数据暴露风险

```
/security-review
```

在 PR 前运行是个好习惯。

### `/effort` — 控制思考深度

这个命令控制模型在每次回复上投入的算力：

```
/effort low     # 快速、轻量
/effort medium  # 默认
/effort high    # 更深入思考
/effort max     # 最高（当前 session，需要 Opus 4.6）
/effort auto    # 自动调整
```

对于复杂的架构讨论，设为 `high` 或 `max`；对于简单的格式修复，设为 `low` 节省时间和成本。

---

## 命令使用场景速查

| 场景 | 推荐命令 |
|------|---------|
| 完成任务，开始新任务 | `/clear` |
| 上下文快满但不想清空 | `/compact` |
| 诊断奇怪行为 | `/doctor` |
| 监控 token 用量 | `/cost` |
| 审查 Claude 做了什么改动 | `/diff` |
| 修复出错，想回到之前状态 | `/rewind` |
| 提交 PR 前检查安全 | `/security-review` |
| 想问个问题但不打断任务流 | `/btw` |
| 切换到算力密集模式 | `/effort max` |
| 管理 MCP 连接 | `/mcp` |

---

## 高级技巧

### 技巧 1：利用 `/fork` 做实验

当你不确定某个方向是否正确时，先 `/fork` 一个分支，在分支里实验，保留原始对话作为保险。

```
/fork 尝试重构认证模块
```

如果实验失败，原始对话还在。

### 技巧 2：`/insights` 定期回顾

每周用 `/insights` 生成一次分析报告，了解自己的使用模式、常见摩擦点，持续优化工作流。

### 技巧 3：结合 `/rename` 管理多 session

当同时维护多个项目时，给 session 命名：

```
/rename 前端重构-Q1
```

之后用 `/resume` 按名字快速切换：

```
/resume 前端重构-Q1
```

### 技巧 4：`/add-dir` 跨项目操作

Claude Code 默认工作在单一目录，但复杂任务常常跨多个 repo：

```
/add-dir ../shared-utils
/add-dir ../design-tokens
```

添加后，Claude 可以读写这些额外目录中的文件，实现真正的跨项目操作。

---

## 与 Skills 的关系

内置命令（如 `/help`、`/clear`）执行固定逻辑，不经过 LLM。而 `/` 菜单里还会显示 Skills（如 `/batch`、`/simplify`、`/debug`）——这些是提示词驱动的命令，底层是 markdown 文件，行为灵活。

区分标准：
- 响应快、行为固定 = 内置命令
- 需要 Claude "思考"才能执行 = Skill

下一章我们将深入 Skill 系统，学习如何创建自己的 `/` 命令。

---

**下一章：** [自定义 Skills](./02-custom-skills.md)
