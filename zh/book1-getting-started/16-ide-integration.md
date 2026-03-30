# 第十六章：IDE 集成

## 使用 Claude Code 的两条路径

使用 Claude Code 主要有两种方式：在终端中（命令行界面，CLI），或者在代码编辑器（IDE，集成开发环境）中。

两者都没有绝对的优劣之分。它们有不同的优势，很多开发者会根据当时的任务两者都用。本章介绍主要的 IDE 集成方式，让你决定哪种设置——或者哪种组合——最适合你。

---

## VS Code 插件

Visual Studio Code 是全球最流行的代码编辑器，有数以千万计的开发者使用。官方 Claude Code 插件将 Claude 直接带入 VS Code 界面。

### 安装插件

打开 VS Code，按 `Cmd+Shift+X`（Mac）或 `Ctrl+Shift+X`（Windows/Linux）打开扩展面板。搜索"Claude Code"并安装 Anthropic 发布的插件。

或者，在浏览器中访问此类链接：`vscode:extension/anthropic.claude-code`——VS Code 会打开并提示你直接安装。

该插件需要 VS Code 1.98.0 或更高版本。在 Help → About 中检查你的版本。

### 在 VS Code 中打开 Claude

安装后，你有以下几种方式打开 Claude 面板：

- 点击任何打开文件右上角的火花图标（Claude 标志）
- 点击左侧活动栏中的火花图标，查看对话历史
- 按 `Cmd+Shift+P` / `Ctrl+Shift+P` 打开命令面板，输入"Claude Code"并选择一个选项
- 点击右下角状态栏中的"✱ Claude Code"——即使没有打开文件也有效

### VS Code 插件额外提供的功能

除了终端 CLI 的功能外，插件还提供：

**内联差异视图：** 当 Claude 想要编辑文件时，它会显示原始内容和建议改动的并排视图——就像代码评审一样。在任何内容改变之前，你可以接受、拒绝或要求修改。

**@-提及：** 在消息中，输入 `@` 后跟文件名来引用特定文件。模糊匹配意味着你可以输入部分名称：`@auth` 可能匹配 `auth.js`、`AuthService.ts` 和 `auth.test.ts`。Claude 会提供补全建议。

**选区上下文：** 当你在编辑器中高亮代码时，Claude 会自动看到它。提示框显示选中了多少行。按 `Option+K`（Mac）/ `Alt+K`（Windows/Linux）可以将文件路径和行号的 @-提及插入到你的提示中。

**对话历史：** 面板顶部的下拉菜单显示你所有过去的对话，可搜索并可恢复。对话会被自动生成有描述性的标题，方便你一眼找到需要的会话。

**多个对话：** 在单独的标签页或窗口中打开额外的 Claude 对话，同时处理不同的任务。

**检查点：** 将鼠标悬停在任何消息上，就会出现回退按钮。你可以从之前的某个时间点分叉对话、将文件改动恢复到之前的状态，或者两者同时进行。这是你 Claude 会话更复杂的版本控制。

**计划模式集成：** 当 Claude 创建计划时（在计划模式下——见第六章），VS Code 将其作为一个完整的 Markdown 文档打开，你可以在 Claude 继续执行前添加内联注释。

**内置 MCP 服务器：** VS Code 1.98.0+ 包含内置的 MCP（Model Context Protocol）服务器，向模型暴露两个工具：`getDiagnostics`（TypeScript/JavaScript 诊断）和 `executeCode`（运行选中的代码）。其他编辑器交互（如文件访问和选区读取）由 CLI 与 VS Code 之间的内部 RPC 处理——这些不是 Claude 可见的 MCP 工具。使用插件时会自动连接，无需额外配置。

### VS Code 中的键盘快捷键

| 快捷键 | 功能 |
|---|---|
| `Cmd+Esc` / `Ctrl+Esc` | 在编辑器和 Claude 之间切换焦点 |
| `Cmd+Shift+Esc` / `Ctrl+Shift+Esc` | 在编辑器标签中打开新的 Claude 对话 |
| `Cmd+N` / `Ctrl+N` | 开始新对话（当 Claude 获得焦点时） |
| `Option+K` / `Alt+K` | 为当前文件/选区插入 @-提及 |

### VS Code 中的权限模式

VS Code 提示框底部有一个模式指示器。点击它可以在以下模式间切换：
- **默认模式** — Claude 在每个操作前询问
- **计划模式** — Claude 描述它要做什么，你批准后才开始
- **自动接受** — Claude 无需每次询问就能进行编辑

你可以在 VS Code 设置的 Extensions → Claude Code → `initialPermissionMode` 中设置默认模式。

---

## Cursor 集成

Cursor 是一个专为 AI 辅助开发构建的代码编辑器——它是 VS Code 的一个分支，深度嵌入了 AI 功能。如果你已经是 Cursor 用户，Claude Code 在那里同样可用。

### 在 Cursor 中安装

安装过程与 VS Code 相同。在 Cursor 的扩展面板中，搜索"Claude Code"并安装。或者使用直接链接：`cursor:extension/anthropic.claude-code`。

### 在 Cursor 中使用 Claude Code

Cursor 中的体验与 VS Code 几乎相同——相同的面板、相同的 @-提及语法、相同的键盘快捷键。由于 Cursor 和 VS Code 共享相同的扩展架构，Claude Code 插件在两者中的工作方式完全一样。

一点说明：Cursor 有自己内置的 AI 助手。Claude Code 和 Cursor 的内置 AI 可以共存——它们服务于不同目的，使用不同界面。Claude Code 的优势在于它能运行命令、使用 Git、读取整个代码库并采取代理行动。Cursor 的内置助手处理快速内联补全。很多开发者两者都用。

---

## JetBrains 插件

JetBrains 提供一系列强大的编辑器：Java/Kotlin 的 IntelliJ IDEA、Python 的 PyCharm、JavaScript/TypeScript 的 WebStorm、Go 的 GoLand 等。Claude Code 插件适用于所有这些编辑器。

### 安装插件

打开任意 JetBrains IDE，进入 Settings（Mac 上是 Preferences）→ Plugins → Marketplace。搜索"Claude Code Beta"并安装。安装后重启 IDE。

或者访问 JetBrains Marketplace 网站，找到 Claude Code 插件，从那里安装。

### JetBrains 插件提供的功能

JetBrains 插件提供：

**交互式差异查看：** 当 Claude 提议修改文件时，改动会以差异形式显示在 JetBrains 的差异查看器中——与你用于常规 Git 差异的查看器相同。如果你熟悉 JetBrains 的差异界面，Claude Code 的编辑体验会感觉很自然。

**选区上下文共享：** 与 VS Code 插件一样，JetBrains 插件会自动将你选中的代码传递给 Claude。

**对话历史：** 所有过去的对话都可访问并可恢复。

**Remote Development 和 WSL 支持：** JetBrains 插件可在 JetBrains Gateway 和 WSL（Windows Subsystem for Linux）环境中工作，让你在远程服务器或 Linux 环境中运行 Claude Code，同时在本地 IDE 中工作。

JetBrains 插件标注为"Beta"——它功能完整，但偶尔可能有些小问题。如果你遇到问题，请在 GitHub 仓库上提交反馈。

---

## 纯终端工作流

使用 Claude Code 最原始、至今仍最强大的方式是终端 CLI。IDE 集成在各方面并不超过它——它们增加了视觉便利性，但 CLI 有一些插件没有的功能。

### 开发者选择纯终端的原因

**完整的命令访问。** CLI 提供所有 Claude Code 命令。IDE 插件只支持其中的一个子集——最常用的那些——但某些高级功能只能在终端中访问。

**Shell 集成。** 在终端中，你可以通过管道向 Claude 传递数据（`cat errors.log | claude -p "explain this"`），串联命令，并将 Claude 用于 Shell 脚本中。

**`!` bash 快捷方式。** 在输入开头输入 `!` 可以直接运行 Shell 命令并将其输出添加到对话中。这只在终端中可用。

**Tab 补全。** CLI 有文件路径和命令历史的 Tab 补全功能。

### 在 VS Code 或 JetBrains 内部运行 CLI

你不需要做选择。如果你想要 VS Code 的图形界面，但偶尔也需要 CLI 访问，可以使用 VS Code 的集成终端：

- 在 VS Code 中：按 `` Ctrl+` ``（Mac 上是 `` Cmd+` ``）打开集成终端
- 运行 `claude` 在 VS Code 内启动 CLI 会话
- 在 CLI 会话中输入 `/ide` 将其连接到 VS Code 编辑器（用于差异查看等功能）

这让你同时拥有两种界面。CLI 和插件共享相同的对话历史，你可以无缝地在两者之间切换。

---

## 选择合适的设置

以下是一个简单的决策框架：

| 如果你… | 考虑… |
|---|---|
| 是代码编辑器新手 | VS Code 插件——它有最好的入门体验，用户基础最广，最容易找到帮助 |
| 已经在用 Cursor | Cursor 插件——与 VS Code 体验相同 |
| 已经在用 IntelliJ、PyCharm 或 WebStorm | JetBrains 插件——留在你现有的环境中 |
| 偏好极简配置和最大控制权 | 纯终端——CLI 是最强大的界面 |
| 想要两全其美 | VS Code + 其中的终端——用插件进行可视化差异审查，用 CLI 处理其他一切 |
| 在运行自动化任务或 CI | 纯终端——CLI 专为脚本和自动化设计 |

### 一个可以先试试的设置

如果你不确定，从 VS Code 插件开始。仅内联差异视图就值得一试——能在熟悉的分栏视图中看到 Claude 正在修改什么，让你更有信心地审查编辑内容。你随时可以针对特定任务回退到终端。

---

## 共同的基础

有一点很重要：所有这些界面都连接到同一个底层的 Claude Code 引擎。无论你使用终端、VS Code、Cursor 还是 JetBrains，你的 `CLAUDE.md` 文件、设置、记忆和 MCP 服务器配置的工作方式都是一样的。

在终端开始一个对话，在 VS Code 中继续，在网页上结束——都是同一个 Claude Code。选择适合你当下需求的界面，而不是固定的使用方式。

---

**下一步：** [术语表](./glossary.md) — 本书及整个 Claude Code 生态系统中所有术语的定义。

---

你已完成第一册。如果这本手册对你有帮助，欢迎在 GitHub 上 [Star 这个项目](https://github.com/JoeyYu23/claude-code-handbook)，帮助更多人发现它。

准备好了？[开始第二册：进阶篇 →](/zh/book2-advanced/)
