# 术语表

本书及 Claude Code 生态系统中所有术语的通俗语言参考。将技术行话翻译成日常语言。

---

## A

**Agent（代理/智能体）**
能够采取行动——而不只是产生文字——来完成任务的程序。Claude Code 就是一个 Agent：它读取文件、运行命令、编辑代码并创建 Git 提交。与普通聊天机器人相比，后者只产生文字供人类采取行动。

**Agentic（代理式的）**
描述能够自主采取行动的程序。当 Claude Code"代理式地行动"时，它在通过运行工具并做出决策来完成多步骤任务，而不是在每一步都等待人类。

**API（Application Programming Interface，应用程序编程接口）**
一个程序与另一个程序交谈的既定方式。当你的天气应用显示当前温度时，它正在使用天气服务的 API 询问"现在天气如何？"API 定义了你可以提什么问题以及答案以何种格式返回。见第十三章。

**API key（API 密钥）**
调用 API 时标识你身份的一串秘密字符。类似密码，但是供应用程序使用的。必须安全存储，永远不要提交到 Git。

**Auto memory（自动记忆）**
Claude Code 自动保存关于你项目的笔记的功能——构建命令、工作流偏好、架构发现——这些内容会在未来会话开始时加载。见第十五章。

**Auto-accept mode（自动接受模式）**
Claude Code 的一种权限模式，在这种模式下 Claude Code 无需对每次编辑都请求批准就能应用文件改动。适用于你信任 Claude 方向的批量更改。用 `Shift+Tab` 激活。见第六章。

---

## B

**Bash**
最常见的 Unix Shell（命令行解释器）。当 Claude Code 在你的电脑上运行命令时，它通常在 Bash 中运行。Claude Code 中的 `!` 前缀让你直接运行 Bash 命令。

**Branch（分支，Git）**
Git 仓库中独立的开发线。创建分支让你能在不影响主代码库的情况下开发功能或修复 Bug。工作完成后，你将分支合并回去。见第十章。

**Build（构建）**
将源代码转换为可以运行或部署的形式的过程。"构建命令"是触发这个过程的命令（如 `npm run build`）。

---

## C

**CI/CD（Continuous Integration / Continuous Deployment，持续集成/持续部署）**
每次推送更改到仓库时自动运行测试和部署代码的过程。Claude Code 可以在 CI/CD 流水线中使用。

**CLI（Command-Line Interface，命令行界面）**
通过输入命令与程序交互的基于文字的方式。Claude Code 的终端界面就是 CLI。与 GUI（图形用户界面）相对，后者使用按钮和菜单等视觉元素。

**CLAUDE.md**
给 Claude Code 提供持久指令的 Markdown 文件，可以是针对某个项目的、你个人工作流的，或整个团队的。Claude 在每次会话开始时读取它。见第十四章。

**Commit（提交）**
Git 中保存的项目状态快照。每次提交都有一条描述改动了什么以及为什么改的消息。"提交"意味着创建这个快照。见第十章。

**Context window（上下文窗口）**
Claude 能"看到"并在其工作内存中保留的文字总量。把它想象成一张桌子——一次只能摆放这么多东西。长对话或大文件会消耗更多上下文窗口。

**Conventional Commits（约定式提交）**
广泛使用的 Git 提交信息编写标准。消息遵循 `类型: 描述` 的格式，类型是 `feat`、`fix`、`docs` 或 `chore` 等。Claude Code 在编写提交信息时使用这种格式。

---

## D

**Default mode（默认模式）**
Claude Code 的标准权限模式，Claude 在编辑文件或运行命令前会询问权限。大多数工作的安全起点。见第六章。

**Denylist（拒绝列表）**
Claude Code 永远不被允许使用的工具或命令列表，无论其他设置如何。在你的设置文件中使用 `deny` 规则创建。见第六章。

**Dependency（依赖）**
你的项目需要正常运行的库或包。依赖列在 `package.json`（JavaScript）或 `requirements.txt`（Python）等文件中，通过运行 `npm install` 等命令安装。

**Diff（差异）**
显示文件两个版本之间变化的视图。以 `-` 开头的行被删除；以 `+` 开头的行被添加。Claude Code 在应用提议的编辑前会向你展示差异。见第八章。

**Directory（目录）**
文件夹。"导航到某个目录"意味着在终端中"进入某个文件夹"。

---

## E

**Effort level（推理力度）**
控制 Claude 对任务应用多少推理的设置。用 `/effort low|medium|high|max` 设置。`max` 级别使用 Claude 的扩展思考，只在 Claude Opus 中可用。

**Environment variable（环境变量）**
存储在你系统环境中、程序可访问但不在其源文件中硬编码的值。API 密钥和数据库密码通常以环境变量的形式存储。在 `.env` 文件中定义。见第十三章。

**.env file（.env 文件）**
包含你项目环境变量的文件。通常被 gitignore（不提交到版本控制），因为它包含密钥。字面上命名为 `.env`，没有文件扩展名。

---

## F

**File path（文件路径）**
你电脑上文件的位置，描述为用 `/` 分隔的一系列目录。绝对路径从根目录开始（`/Users/alice/project/src/app.js`）。相对路径从当前目录开始（`./src/app.js`）。

**Fork（派生，Git）**
创建你独立控制的仓库副本。在 GitHub 上，"fork"是你制作别人项目副本来修改的方式。

---

## G

**Git**
随时间追踪文件改动的版本控制系统。让你查看历史、撤销更改、同时开发多个功能，以及与他人协作。见第十章。

**.gitignore**
告诉 Git 忽略哪些文件的文件。常见条目：`.env`（密钥）、`node_modules`（已安装的包）、编译输出。`.gitignore` 中的文件不会被追踪或提交。

**GitHub**
用于托管 Git 仓库和协作代码的网站。在 Git 基础上提供 Pull Request、问题追踪和项目管理。

**Glob pattern（Glob 模式）**
用于匹配文件路径的简化模式匹配语法。`*` 匹配一个目录级别内的任何内容；`**` 递归匹配。例如：`src/**/*.js` 匹配 `src/` 下任何位置的所有 `.js` 文件。

---

## H

**Headless mode（无界面模式）**
使用 `-p` 标志以非交互式、可脚本化的方式运行 Claude Code。没有界面——只有输入进来，输出出去。适用于自动化和脚本。

**Hook（钩子）**
在 Claude Code 工作流特定时间点自动运行的自定义命令——工具使用前、文件编辑后、提交时等。在设置文件中配置钩子。

**HTML（HyperText Markup Language，超文本标记语言）**
用于定义网页结构的语言。每个网站都建立在 HTML 上。见第十一章。

---

## I

**IDE（Integrated Development Environment，集成开发环境）**
内置了运行、调试和管理代码工具的代码编辑器。VS Code、Cursor 和 JetBrains 产品都是 IDE。Claude Code 为所有这些提供了插件。见第十六章。

---

## J

**JavaScript**
在网页浏览器中运行并支撑交互式网站的编程语言。也可以通过 Node.js 在服务器上运行。全球使用最广泛的编程语言。

**JSON（JavaScript Object Notation）**
用于存储和传输结构化数据的文字格式。API 响应通常是 JSON 格式。看起来像这样：`{"name": "Alice", "age": 30}`。

---

## L

**Library（库）**
你可以在项目中使用的预先编写的代码。不是从头编写常见功能，而是使用已经实现了它的库。也叫"包"或"依赖"。

---

## M

**Markdown**
简单的文字格式化语法。本书用 Markdown 编写。`**bold**` 变成**粗体**，`# Heading` 变成标题。CLAUDE.md 文件使用 Markdown。

**MCP（Model Context Protocol，模型上下文协议）**
将 Claude Code 连接到外部工具和数据源的开放标准。通过 MCP 服务器，Claude 可以访问数据库、读取 Google Drive 中的设计文档、更新 Jira 中的工单等。

**Merge（合并）**
将一个 Git 分支的更改合并到另一个分支。当同一文件的同一部分在两个分支中以不兼容的方式被更改时，就会发生"合并冲突"。见第十章。

**Modal（模态框）**
出现在主界面上方的弹出窗口或对话框，在你继续之前需要处理它。

---

## N

**Node.js**
让你在网页浏览器之外运行 JavaScript 的运行时——在服务器上或你自己的电脑上。许多开发工具（包括 Claude Code）都基于 Node.js 构建。

**npm（Node Package Manager，Node 包管理器）**
Node.js 项目的默认包管理器。用于安装 JavaScript 包并运行 `package.json` 中定义的脚本。

---

## P

**Package（包）**
库或依赖的另一种说法。你安装并在项目中使用的一包代码。

**Package manager（包管理器）**
用于安装、更新和管理包的工具。`npm`、`yarn` 和 `pnpm` 是 JavaScript 包管理器。`pip` 是 Python 的。`brew` 是 macOS 的。

**Permission mode（权限模式）**
Claude Code 六种模式之一，控制它在使用工具时如何请求批准。这六种模式是：Default（默认）、Auto-accept（自动接受）、Plan（计划）、Auto（自动）、DontAsk（不问）和 Bypass（绕过）。见第六章。

**Plan mode（计划模式）**
Claude Code 的一种权限模式，Claude Code 可以读取和分析你的代码，但不能修改任何东西。Claude 为你生成一个计划供你审查，然后再采取行动。见第六章。

**Prompt（提示）**
你发给 Claude Code 的消息。你输入的用来告诉 Claude 你想要什么的文字。也指终端中表示 Claude 在等待输入的 `>` 字符。

**Pull request（PR，拉取请求）**
将你的分支更改合并到主代码库的提议，通常由他人审查。向共享仓库贡献更改的标准方式。Claude Code 可以自动创建 Pull Request。见第十章。

---

## R

**Refactoring（重构）**
在不改变代码功能的情况下改善其结构、可读性或组织方式。"重构登录函数"意味着让代码变得更好，而不是添加新功能。

**Repository（仓库，简称 repo）**
Git 追踪的项目，包含所有文件和历史。"项目的仓库"是所有代码及其历史所在的地方。

**REST API**
最常见的 Web API 风格。REST API 使用 HTTP 方法（GET、POST、PUT、DELETE）和 URL 来定义操作。第十三章中的天气 API 就是一个 REST API。

---

## S

**Session（会话）**
与 Claude Code 的一次对话，从你启动到退出。会话稍后可以用 `claude --resume` 恢复。

**Shell（Shell 环境）**
解释你的终端命令的程序。Bash 和 Zsh 是 Unix 系统上常见的 Shell。PowerShell 在 Windows 上很常见。

**Slash command（斜杠命令）**
在 Claude Code 中以 `/` 开头输入的命令。例如：`/help`、`/clear`、`/memory`、`/permissions`、`/effort`、`/vim`、`/agents`、`/mcp`。完整列表见键盘快捷键附录。

**SSH**
安全连接到远程电脑的协议。用于部署代码或访问服务器。

**Stack trace（堆栈跟踪）**
崩溃发生时处于活动状态的函数调用列表。从下往上读 Stack Trace 会显示从最外层代码到错误发生的精确行的路径。见第十二章。

**Static site（静态网站）**
由可以直接提供而无需运行服务器代码的纯 HTML、CSS 和 JavaScript 文件组成的网站。第十一章中构建的作品集就是一个静态网站。

**Subagent（子代理）**
由另一个 Claude Code 进程启动以并行处理子任务的 Claude Code 进程。Claude 可以为独立的工作部分启动多个子代理并协调它们的结果。见 `/agents`。

---

## T

**Terminal（终端）**
通过输入命令与你的电脑交互的基于文字的界面。也叫"命令行"或"命令提示符"。Claude Code 在你的终端中运行。见第一章和第四章。

**Token（令牌）**
Claude 用来处理文字的基本单位。大约来说，一个令牌约等于 4 个字符或 3/4 个英文单词。令牌影响计费（使用 API 时按令牌付费）和上下文窗口限制。

**Tool（工具）**
在 Claude Code 中，工具是 Claude 可以调用的特定功能：读取文件（Read 工具）、编辑文件（Edit/Write 工具）、运行命令（Bash 工具）、搜索网络（WebSearch 工具）。你控制 Claude 可以使用哪些工具以及何时使用。

**Tool call（工具调用）**
在对话中 Claude 对使用其某个工具（Read、Edit、Bash、WebSearch 等）的请求。在默认权限模式下，每次工具调用都会在执行前向你展示。

**TypeScript**
一个添加了类型检查的 JavaScript 版本。TypeScript 代码在运行前可以发现许多常见的 Bug。所有 TypeScript 在运行前都会编译成 JavaScript。

---

## V

**Version control（版本控制）**
随时间追踪文件更改的系统，允许你查看历史并恢复到之前的状态。Git 是最流行的版本控制系统。

**Vim mode（Vim 模式）**
Claude Code 提示框输入中的一个可选编辑模式，使用 Vim 风格的键绑定。用 `/vim` 或在 `/config` 中启用。在 NORMAL 模式下，你可以用 `h/j/k/l`、`w/b`、`dd`、`yy` 等进行导航和编辑。

**VS Code（Visual Studio Code）**
微软制作的免费开源代码编辑器。全球使用最广泛的代码编辑器。有官方 Claude Code 插件。见第十六章。

---

## W

**Working directory（工作目录）**
你的终端当前"所在"的文件夹。命令相对于工作目录运行。当你启动 Claude Code 时，工作目录就是你的项目根目录。

---

## Y

**YAML**
用于配置文件的文字格式，在设置和构建配置中很流行。使用缩进来显示结构。你可能会在项目中遇到 `.yaml` 或 `.yml` 文件。

**yolo mode（YOLO 模式）**
有时用于 Claude Code 的绕过权限模式的非正式名称，在这种模式下所有权限提示都被跳过。只应在安全的隔离环境中使用。见第六章。

---

*本术语表涵盖第一册中使用的术语。特定于高级主题的额外术语出现在第二册中。*
