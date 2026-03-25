# 第一章：内置 Slash Commands 完全指南

Claude Code 内置了丰富的 slash commands，涵盖从 session 管理到安全分析的方方面面。这些不仅仅是快捷方式——它们是控制 Claude 在 session 中行为的主要接口。熟练掌握它们将显著改变你的工作效率。

---

## 命令的工作方式

在 Claude Code 的提示框中输入 `/` 即可看到可过滤的命令列表，继续输入字母可以缩小结果范围。有些命令需要必填参数（`<arg>`），有些接受可选参数（`[arg]`）。根据你的平台、套餐和环境不同，此处未列出的命令可能也会出现在你的安装中——例如 `/desktop` 只在 macOS 和 Windows 上显示。

你或团队创建的 Skills 也会和内置命令一起显示在 `/` 菜单中。

---

## 完整命令速查

### Session 管理

| 命令 | 作用 |
|---|---|
| `/clear` | 清除对话历史，释放上下文。别名：`/reset`、`/new` |
| `/compact [instructions]` | 将对话压缩为摘要以节省上下文；可附带指令聚焦保留内容 |
| `/fork [name]` | 在当前位置创建对话分支 |
| `/resume [session]` | 按名称或 ID 恢复历史 session，或打开 session 选择器。别名：`/continue` |
| `/rename [name]` | 重命名当前 session，便于在 `/resume` 中识别 |
| `/rewind` | 回退对话和代码到某个历史检查点。别名：`/checkpoint` |
| `/export [filename]` | 将当前对话导出为纯文本 |
| `/loop` | 进入连续循环模式，Claude 持续工作直到满足停止条件 |
| `/schedule` | 安排任务或提醒稍后执行 |

### 信息与诊断

| 命令 | 作用 |
|---|---|
| `/help` | 显示帮助和可用命令 |
| `/cost` | 显示当前 session 的 token 用量统计 |
| `/context` | 以彩色网格可视化上下文用量并给出优化建议 |
| `/doctor` | 诊断并验证 Claude Code 安装和设置是否正常 |
| `/status` | 显示版本、模型、账号和连接状态 |
| `/stats` | 显示每日用量历史、session 连续使用天数和整体使用模式 |
| `/insights` | 生成 session 分析报告（交互模式、摩擦点等） |
| `/usage` | 显示当前套餐的用量限制和速率限制状态 |
| `/release-notes` | 显示当前 Claude Code 版本的更新内容 |

### 代码与 Git

| 命令 | 作用 |
|---|---|
| `/diff` | 打开交互式 diff 查看器，显示未提交改动和逐轮 diff |
| `/security-review` | 分析当前分支待提交变更的安全漏洞 |
| `/pr-comments [PR]` | 获取并显示 GitHub PR 的评论（需要 `gh` CLI） |
| `/branch [name]` | 创建新的 git 分支。别名：`/fork`（与分支名一起使用时） |
| `/plan` | 进入计划模式，Claude 提出变更方案但不执行 |

### 配置与个性化

| 命令 | 作用 |
|---|---|
| `/config` | 打开设置界面。别名：`/settings` |
| `/model [model]` | 在 session 中途选择或切换 AI 模型 |
| `/effort [low\|medium\|high\|max\|auto]` | 设置模型算力级别 |
| `/theme` | 更换颜色主题（浅色、深色、无障碍、ANSI 变体） |
| `/color [color\|default]` | 设置当前 session 的提示栏颜色 |
| `/vim` | 切换 Vim / Normal 编辑模式 |
| `/keybindings` | 打开或创建按键绑定配置文件 |
| `/memory` | 编辑 `CLAUDE.md` 文件并管理 auto-memory 条目 |
| `/init` | 初始化项目，生成 `CLAUDE.md` 指南 |
| `/mobile` | 针对移动端或窄屏幕优化界面 |
| `/sandbox` | 配置代码执行的沙箱模式 |

### Agent 与工具

| 命令 | 作用 |
|---|---|
| `/agents` | 查看、创建和编辑 sub-agent 配置 |
| `/tasks` | 列出并管理后台任务 |
| `/permissions` | 查看或更新当前 session 的工具权限。别名：`/allowed-tools` |
| `/hooks` | 按事件类型显示所有 hook 配置 |
| `/skills` | 列出可用的 skills |
| `/mcp` | 管理 MCP server 连接和 OAuth 认证 |
| `/plugin` | 管理 Claude Code 插件 |
| `/reload-plugins` | 不重启 session 的情况下重新加载所有插件 |

### 快速问答与实用工具

| 命令 | 作用 |
|---|---|
| `/btw <question>` | 提问一个旁路问题，不计入对话上下文 |
| `/copy` | 将最后一条助手回复复制到剪贴板 |
| `/fast [on\|off]` | 开关快速模式（降低延迟，减少深度）|
| `/feedback [report]` | 提交反馈或 bug 报告。别名：`/bug` |
| `/remote-control` | 让当前 session 支持远程控制。别名：`/rc` |

### IDE 与集成

| 命令 | 作用 |
|---|---|
| `/chrome` | 配置 Chrome 浏览器集成 |
| `/install-github-app` | 为仓库安装 Claude GitHub Actions 应用 |
| `/install-slack-app` | 通过 OAuth 流程安装 Claude Slack 应用 |

---

## 核心命令详解

### `/clear` — 重置上下文

清除对话历史并释放上下文窗口空间。别名：`/reset`、`/new`。

当对话变得陈旧、你解决了一个问题准备开始新问题，或者上下文已经大到 Claude 开始遗忘早期内容时，使用这个命令。

```text
/clear
```

这与退出并重启不同——它保留了你的 MCP 连接、工具权限和 session 设置，只清除消息历史。

**与 `/compact` 的区别：** `/clear` 完全丢弃历史；`/compact` 将历史压缩成摘要，保留精髓。如果你在任务进行中需要减轻上下文负担而不是重新开始，使用 `/compact`。

```text
/compact 聚焦于我们做的认证模块改动
```

### `/resume [session]` — 继续之前的工作

按名称或 ID 恢复历史对话，或打开交互式 session 选择器。别名：`/continue`。

```text
/resume
/resume auth-refactor
```

除非你使用了 `/rename` 或启动时加了 `--name` 标志，否则 session 会自动命名。恢复功能是长期项目中最强大的特性之一——你可以精确地从多天前的重构任务中断处继续。

### `/fork [name]` — 无风险地探索

在当前位置创建对话分支，原始对话和分支从此独立继续。

```text
/fork 尝试方案-B
```

当你想探索同一个问题的两种不同解决方法，又不想丢失任何一条路径时，这个命令极为宝贵。

### `/rewind` — 时光倒流

将对话和代码回退到之前的检查点。别名：`/checkpoint`。

```text
/rewind
```

运行后会显示对话历史，让你选择要回退到哪个位置。Claude Code 在工作过程中会自动创建检查点。

### `/context` — 理解上下文用量

以彩色网格可视化当前上下文用量，显示哪些工具和内存来源占用了最多的 token，并在接近上下文限制时给出警告和优化建议。

```text
/context
```

当 Claude 似乎开始遗忘对话早期内容时，或者你想提前检查是否需要压缩上下文时，首先运行这个命令。

### `/cost` — 监控 Token 消耗

显示当前 session 的 token 用量统计。输出因订阅类型而异——API key 用户看到美元金额；订阅用户看到相对用量指标。

```text
/cost
```

### `/doctor` — 诊断问题

诊断并验证 Claude Code 安装和设置是否正常，检查常见的配置问题、连接问题和版本不匹配。

```text
/doctor
```

遇到任何异常行为时，首先运行这个命令。它通常能立即定位到问题所在。

### `/model [model]` — 切换模型

在 session 中途选择或更改 AI 模型。支持模型别名（`sonnet`、`opus`、`haiku`）或完整模型 ID。对于支持算力级别的模型，可以用左右箭头调整。

```text
/model
/model opus
/model claude-sonnet-4-6
```

更改立即生效，无需等待当前回复完成。

### `/effort [level]` — 控制推理深度

在不更换模型的情况下设置模型算力级别。更高的算力意味着更仔细的推理，代价是速度和 token 消耗。

```text
/effort low
/effort medium
/effort high
/effort max
/effort auto
```

`max` 仅适用于当前 session，需要 Opus 4.6。不带参数时显示当前级别。

### `/btw <question>` — 旁路问题

提问一个旁路问题，不将其加入对话历史。Claude 使用当前上下文作答，但这次交流随后被丢弃。

```text
/btw AuthMiddleware 类是做什么的？
```

这非常适合在任务进行中提问快速的澄清性问题。与普通提示不同，`/btw` 不会在你的上下文中积累。

### `/diff` — 交互式 diff 查看器

打开交互式 diff 查看器，显示未提交改动和逐轮 diff。用左右箭头在当前 git diff 和各个 Claude 轮次之间切换，用上下箭头浏览文件。

```text
/diff
```

特别适合在提交之前审查 Claude 在多个轮次中所做的改动。

### `/security-review` — 合并前安全扫描

分析当前分支上的待提交变更是否存在安全漏洞，审查 git diff 并识别注入漏洞、认证问题和数据暴露等风险。

```text
/security-review
```

在合并任何涉及认证、用户输入处理或外部 API 调用的分支之前运行此命令。

### `/plan` — 先审查后执行

直接从提示框进入计划模式。Claude 分析你的代码库并提出变更方案，不执行任何操作，让你在任何内容被修改之前先进行审查。

```text
/plan
```

### `/loop` — 持续执行模式

进入连续循环模式，Claude 自主工作直到满足定义的停止条件。适用于处理目录中所有文件或完成一系列相关修复等长时间运行的任务。

```text
/loop
```

### `/schedule` — 延迟任务

安排任务或提醒稍后运行，让你在不阻塞当前 session 的情况下排队安排工作。

```text
/schedule
```

### `/permissions` — 工具访问控制

查看或更新当前 session 的工具权限。别名：`/allowed-tools`。

```text
/permissions
```

### `/hooks` — 查看 Hook 配置

显示当前 session 所有 hook 配置，按事件类型组织，告诉你每个 hook 来自哪个配置文件以及运行什么命令。

```text
/hooks
```

### `/mcp` — MCP Server 管理

管理 MCP server 连接并处理远程 server 的 OAuth 认证流程。用于检查 server 状态、对需要 OAuth 的 server 进行认证以及诊断连接问题。

```text
/mcp
```

### `/agents` — Sub-agent 管理

管理 sub-agent 配置。查看可用的 agents、通过引导式设置或 Claude 生成的提示词创建新 agent、编辑现有配置，以及查看当存在同名 agent 时哪个处于激活状态。

```text
/agents
```

### `/install-github-app` — GitHub Actions 安装

为仓库安装 Claude GitHub Actions 应用，引导你完成仓库选择和集成配置，包括创建所需的 secrets。

```text
/install-github-app
```

---

## 高级用法模式

**每个新项目都先运行 `/init`。** 这一次性投入会创建一个 `CLAUDE.md`，显著提升 Claude 在你的代码库中的表现，对未来所有 session 都有效。

**大任务前先用 `/compact`。** 如果你进行了长时间的探索性对话，现在想让 Claude 实现某些东西，先压缩上下文。Claude 会有一份关键决策的清晰摘要，而不是大量原始历史。

**将 `/pr-comments` 与修复请求组合使用。** 获取代码审查评论后，立即让 Claude 处理它们。Claude 会同时阅读评论和当前代码状态，进行精准的修复。

**大量使用 `/btw`。** 许多开发者不知道 `/btw` 的存在。它非常适合任务进行中的快速澄清性问题，不会污染上下文。

**为复杂任务明确设置算力级别。** 对于架构决策或安全审查，`/effort high` 或 `/effort max` 能让 Claude 进行最仔细的推理。日常任务回到 `/effort auto` 以保持速度。

**用 `/fork` 探索替代方案。** 在提交重大重构方向之前，先 fork 对话并尝试两种路径。你随时可以回到原始的 fork。

**通过重命名管理多项目工作流。** 在多个项目或长期任务之间工作时，使用 `/rename` 给 session 取有意义的名字，然后用 `/resume` 按名字在它们之间切换。

---

**下一章：** [第二章——自定义 Skills](./02-custom-skills.md) — 如何编写自己的 slash commands 并自动化可重复的工作流程。
