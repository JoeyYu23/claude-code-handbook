# 附录 A：术语表

本术语表收录了 Claude Code 学习过程中会遇到的 30+ 常见术语，按字母顺序排列。每个术语都有简明的中文解释。

---

## A

**Agent（代理/智能体）**
能够自主规划并执行多步骤任务的 AI 程序。Claude Code 就是一种 Agent——它不只是回答问题，还能主动读取文件、运行命令、修改代码来完成任务。

**API（Application Programming Interface，应用程序编程接口）**
两个软件之间通信的规范。通过 API，你的程序可以向其他服务（比如天气服务、支付系统）发出请求并获取数据。比喻：餐厅里的服务员，负责传递顾客（你的程序）和厨房（外部服务）之间的信息。

**API Key**
访问某个 API 的密钥，通常是一串字母和数字组成的字符串。相当于会员卡号，让服务提供商知道是谁在使用 API。注意：API Key 必须保密，不能提交到 Git。

**Auto Memory（自动记忆）**
Claude Code 的功能，让它能在工作过程中自动记录有用信息（如构建命令、调试技巧、你的偏好），并在未来的对话中自动使用这些信息。

---

## B

**Bash**
Linux/macOS 上的默认命令行 Shell 程序。Claude Code 通过 Bash 在你的电脑上执行命令（如 `npm install`、`git commit`）。

**Branch（分支）**
Git 中独立的工作线。你可以在分支上进行开发，不影响主代码。完成后再合并回主线。比喻：装修时开辟的"施工便道"，不影响主路通行。

**Bug**
代码中的错误，导致程序行为不符合预期。

---

## C

**CLI（Command-Line Interface，命令行界面）**
通过输入文字命令来操作程序的界面。与 GUI（图形界面）相对。Claude Code 的终端版本就是 CLI。

**CLAUDE.md**
放在项目里的配置文件，Claude Code 每次启动时自动读取。用于存放项目规范、常用命令、架构说明等，相当于给 AI 的"岗位说明书"。

**Commit（提交）**
Git 操作，把当前的代码改动保存为一个历史版本。每次 commit 都会生成一个快照，附带提交者、时间和描述。

**Commit Message（提交信息）**
描述这次 commit 做了什么的文字。好的 commit message 应该清晰说明"为什么做这个改动"。格式通常遵循 Conventional Commits 规范（见下）。

**Context Window（上下文窗口）**
AI 模型一次能处理的最大文本量。在 Claude Code 的单次对话中，所有的对话内容、文件内容都要放进上下文窗口。超出限制时，Claude 会自动压缩（compact）旧内容。

**Conventional Commits**
一种 commit message 规范，格式为 `类型: 描述`，比如 `feat: add login button` 或 `fix: resolve timeout error`。Claude Code 默认使用这种格式。

---

## D

**Debug（调试）**
找出并修复代码中错误的过程。

**Default Mode（默认模式）**
Claude Code 的默认权限模式。在此模式下，Claude 在执行每个操作（创建文件、运行命令等）前都会征求你的确认。

**Dependency（依赖）**
你的项目所需要的外部库或包。例如，一个 Node.js 项目可能依赖 `express` 库来处理 HTTP 请求。

**Diff（差异对比）**
显示两个版本代码之间差异的格式。`+` 表示新增的行，`-` 表示删除的行。Claude Code 在修改文件前会展示 diff 让你审查。

**dotenv / .env 文件**
一种存储环境变量（特别是敏感信息如 API Key）的文件格式。`.env` 文件不应该提交到 Git。

---

## E

**Environment Variables（环境变量）**
存储在操作系统级别的变量，程序可以读取但不会被直接写进代码里。常用于存储 API Key、数据库密码等敏感信息。

---

## F

**Fork（派生/分支）**
① 在 GitHub 上复制别人的仓库到自己的账号下；② 在对话中创建一个新的对话分支（保留历史但继续不同方向）。

---

## G

**Git**
版本控制系统，记录代码的所有历史修改，让你可以回溯、协作和管理不同版本。

**GitHub**
基于 Git 的代码托管平台，让团队可以在云端共享和协作代码。

**GitHub Pages**
GitHub 提供的免费静态网站托管服务，适合部署个人作品集、文档等简单网站。

**gh（GitHub CLI）**
GitHub 的命令行工具，让你在终端里完成创建仓库、提交 PR 等操作，不需要打开浏览器。

---

## H

**Hook**
Claude Code 中一种自动化机制，允许你在特定事件（如每次文件编辑后、每次 commit 前）自动运行自定义命令。

---

## I

**IDE（Integrated Development Environment，集成开发环境）**
集代码编辑、运行、调试于一体的软件。VS Code、JetBrains IntelliJ 都是 IDE。

---

## J

**JSON（JavaScript Object Notation）**
一种轻量级的数据交换格式，以键值对的形式组织数据。API 返回的数据通常是 JSON 格式。示例：`{"name": "李明", "age": 28}`

---

## M

**Markdown**
一种轻量级标记语言，用简单符号来表示格式（标题用 `#`，粗体用 `**`，列表用 `-`）。CLAUDE.md 就是用 Markdown 写的。

**MCP（Model Context Protocol）**
一种开放协议，让 Claude Code 连接外部数据源和工具（如 Google Drive、Jira、Slack）。通过 MCP，Claude 可以读取你的设计文档、更新任务状态等。

**Memory（记忆系统）**
Claude Code 跨对话保存信息的机制。分为 CLAUDE.md（手动写的规则）和 Auto Memory（Claude 自动记录的发现）两种。

**Merge（合并）**
把一个 Git 分支的改动合入另一个分支的操作。

---

## N

**npm（Node Package Manager）**
Node.js 的包管理工具，用于安装和管理 JavaScript 依赖。常用命令：`npm install`、`npm run [脚本名]`。

**Node.js**
让 JavaScript 能在浏览器之外运行的平台，是很多现代 Web 工具的基础。

---

## P

**Package（包/依赖包）**
可复用的代码模块，通过 npm、pip 等工具安装和管理。

**Plan Mode（计划模式）**
Claude Code 的一种权限模式。Claude 先制定完整执行计划，等你审批后再开始操作。适合大型任务。

**Prompt**
你发给 AI 的输入文字，即你的"提问"或"指令"。好的 prompt 能让 AI 更准确地理解你的意图。

**Pull Request（PR）**
在 GitHub 上发起的"代码合并请求"，请求把某个分支的改动合入主分支，同时接受团队代码审查。

---

## R

**README**
项目根目录的说明文件，通常命名为 `README.md`，介绍项目是什么、如何安装和使用。

**Refactor（重构）**
在不改变程序外部行为的前提下，改善代码内部结构的过程。目的是提高可读性和可维护性。

**Repository（仓库，简称 Repo）**
Git 项目的存储单元，包含所有代码文件和完整的修改历史。

**Responsive Design（响应式设计）**
让网页在不同屏幕尺寸（手机、平板、电脑）上都能良好显示的设计方法。

---

## S

**Shell**
命令行环境，你在里面输入命令来操作电脑。macOS 默认是 zsh，Linux 常用 bash，Windows 有 PowerShell 和 CMD。

**Stack Trace（堆栈跟踪）**
程序崩溃时显示的错误报告，显示了错误发生的位置以及调用链（哪个函数调用了哪个函数）。

---

## T

**Terminal（终端）**
运行命令行的窗口。macOS 上有内置的"终端"应用，也可以用 iTerm2。Windows 上有命令提示符（CMD）和 PowerShell。

**TypeScript**
在 JavaScript 基础上加入类型系统的编程语言。让代码更健壮，错误在运行前就能被发现。

---

## V

**Version Control（版本控制）**
管理代码历史版本的系统，Git 是目前最流行的版本控制工具。

**VS Code（Visual Studio Code）**
微软开发的开源代码编辑器，是目前最受欢迎的 IDE，有 Claude Code 官方插件。

---

## Y

**YOLO Mode**
口语化的称呼，指 Claude Code 的"绕过所有确认"模式（`bypassPermissions`）。Claude 在此模式下不询问任何权限。名称来自英文 "You Only Live Once"。仅用于完全可信的自动化场景，慎用。

---

*术语表持续更新中。如果你遇到了不在这里的术语，可以直接问 Claude Code："XX 是什么意思？"*
