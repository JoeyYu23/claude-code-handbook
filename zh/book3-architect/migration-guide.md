# 附录 D：迁移指南

本指南帮助使用其他 AI 编程工具的开发者迁移到 Claude Code。每个部分针对从特定工具切换时所需的思维模式转变、等效功能对应，以及实际迁移步骤进行说明。

---

## 从 GitHub Copilot 迁移

### 思维模式转变

Copilot 嵌入在编辑器中，在你打字时自动补全代码。它本质上是一个自动补全加速器——你主导，它跟随。

Claude Code 是终端中的对话式 agent。你描述目标，它来执行。交互模式有根本性的不同：你是在进行一场对话，而不是在接收内联建议。

| Copilot | Claude Code |
|---------|-------------|
| 内联代码补全 | 用自然语言描述你想要的内容 |
| 按 Tab 接受建议 | 审查并批准变更 |
| 逐文件处理，随打字触发 | 整体性地跨多文件工作 |
| 不了解你的项目 | 通过 CLAUDE.md 和自动记忆学习你的项目 |
| 不执行工具 | 可运行测试、lint、git 及其他命令 |
| 编辑器原生 | 终端优先（也有 VS Code 扩展） |

### 功能对应关系

| Copilot 功能 | Claude Code 等效功能 |
|-------------|---------------------|
| 内联补全 | 不适用（不同模式）——在对话中描述函数需求 |
| Copilot Chat | Claude Code 主对话 |
| 解释此代码 | 在对话中说"解释这个函数的工作原理" |
| 修复此处 | "修复 [文件] 中的错误"或粘贴错误信息 |
| 生成测试 | "为 [函数] 编写单元测试" |
| 解释 shell 命令 | "这个命令是什么意思：[命令]" |

### 实际迁移步骤

1. **将 Claude Code 与 Copilot 同时安装。** 无需卸载 Copilot。许多开发者同时使用两者：Copilot 负责打字时的内联补全，Claude Code 负责较大任务和对话。

2. **从 Copilot 不擅长的任务入手。** 跨文件变更、调试 session、代码审查以及理解大型代码库，是 Claude Code 附加价值最大的场景。

3. **学会描述目标，而非步骤。** 不要说"写一个函数来……"（Copilot 风格），而是说"参照 src/middleware/auth.ts 中的模式，为我们的 API 接口实现限流"（Claude Code 风格）。

4. **创建 CLAUDE.md。** 这是向 Claude Code 提供持久化项目知识的主要方式——相当于 Copilot 中不存在的东西，因为 Copilot 不读取任何持久化配置。

```bash
# 生成初始 CLAUDE.md
claude
/init
```

5. **两周后再评估。** Claude Code 的价值会随着它对项目的了解、以及你学会与它协作而持续积累。给它足够的时间再下结论。

---

## 从 Cursor 迁移

### 思维模式转变

Cursor 是集成了 AI 的完整 VS Code 分支 IDE。Claude Code 是终端优先的工具，也有 VS Code 扩展，但并非 IDE 替代品。

更深层的区别在于：Cursor 的 AI 功能围绕编辑器工作流设计（内联编辑、侧边栏对话、用于较大任务的 Composer）。Claude Code 则围绕 agent 工作流设计——它接收较大的目标，并跨工具、文件和命令执行。

| Cursor | Claude Code |
|--------|-------------|
| 编辑器集成 AI | 终端优先（也有 VS Code 扩展） |
| 内联编辑（Ctrl+K） | 对话式指令 + 审批 |
| Composer（多文件） | 自然语言多文件任务 |
| .cursorrules 文件 | CLAUDE.md（概念相似，功能更强） |
| 对话侧边栏 | 完整终端 session |
| Cursor context | 显式文件引用 + CLAUDE.md |

### 功能对应关系

| Cursor 功能 | Claude Code 等效功能 |
|------------|---------------------|
| 内联编辑（Ctrl+K） | 在对话中输入指令 |
| Composer | 标准 Claude Code 对话 |
| .cursorrules | CLAUDE.md（支持 import、路径范围规则，功能更强） |
| 对话中的 @-提及 | 对话中的 `@file.ts` 语法，或"读取 src/..." |
| 应用到代码库 | 普通的 Claude Code 多文件变更 |
| 终端集成 | 原生终端执行 |
| 对话历史 | 通过 `claude --resume` 查看 session 历史 |

### 迁移你的 .cursorrules

Cursor 的 `.cursorrules` 文件与 CLAUDE.md 在概念上相似。大多数 .cursorrules 内容可以直接迁移：

```bash
# 如果你有 .cursorrules 文件
cp .cursorrules CLAUDE.md
```

然后审查并完善：
- 添加构建/测试命令（Claude Code 需要这些；Cursor 通常从编辑器自动检测）
- 删除 Cursor 专用的规则（编辑器快捷键、Cursor 特定的 @ 引用）
- 将过长的段落转换为简洁的要点，以提高遵循度

### 实际迁移步骤

1. **使用 VS Code 扩展降低切换成本。** Claude Code 的 VS Code 扩展提供内联 diff、@-提及和 VS Code 内的对话历史——在过渡期间更接近 Cursor 的体验。

```
VS Code 扩展 → 搜索 "Claude Code" → 安装
```

2. **将 .cursorrules 迁移到 CLAUDE.md。** 先直接复制，后续逐步优化。

3. **学习终端工作流来处理较大任务。** 复杂的多文件变更、调试和自动化任务在终端中处理更好，因为 Claude Code 在那里拥有完整的工具访问权限。

4. **探索 hooks。** Claude Code hooks 提供自动化能力（编辑后自动 lint、提交前检查），Cursor 通过 AI 建议来实现类似功能——hooks 因其确定性而更加可靠。

---

## 从 Aider 迁移

### 思维模式转变

Aider 在哲学上与 Claude Code 最为接近。两者都基于终端、都直接操作真实代码库、都能进行多文件变更。主要区别在于范围和集成深度：

| Aider | Claude Code |
|-------|-------------|
| 以 git 为核心的工作流 | 更广泛：文件、git、命令、web、MCP |
| 通过 `/add` 显式添加文件 | Claude 按需主动读取文件 |
| Architect + editor 模式 | 具备扩展能力的单一 agent |
| 极少持久化 | CLAUDE.md + 自动记忆 |
| 无 MCP | 完整 MCP 集成 |
| 无子 agent 支持 | 多 agent 编排 |
| 开源，支持本地模型 | Anthropic 托管 |

### 功能对应关系

| Aider 功能 | Claude Code 等效功能 |
|-----------|---------------------|
| `/add file.py` | 在对话中引用文件；Claude 按需读取 |
| `/run command` | Claude 原生将命令执行作为任务的一部分 |
| `/commit` | 在对话中说"提交这些变更" |
| `/ask`（只读模式） | 计划模式（Shift+Tab） |
| `/architect` | 计划模式用于设计，普通模式用于实现 |
| `.aider.conf.yml` | CLAUDE.md 和 settings.json |
| `--model gpt-4` | `claude --model claude-sonnet-4-6` |
| Repo map | Claude 按需读取文件；自动记忆逐步积累结构 |
| `--watch`（自动模式） | Claude Code hooks 实现自动化响应 |

### 实际迁移步骤

1. **改掉显式文件管理的习惯。** Aider 要求你先 `/add` 文件才能操作。Claude Code 按需自动读取文件。这在一开始会让人意外——你不需要告诉 Claude 该看哪些文件。

2. **将配置迁移到 CLAUDE.md。** Aider 的配置文件与 CLAUDE.md 对应良好，把你的约定和命令偏好迁移过来。

3. **探索 MCP 进行集成。** 如果你曾通过 shell 命令将 Aider 与外部工具集成，这些集成通过 MCP 服务器会更加强大。

4. **尝试多 agent 模式。** Aider 是单 agent 的。Claude Code 的子 agent 支持实现了并行文件分析、编写者/审查者分离等工作流，能显著提升复杂任务的质量。

5. **适应审批模式。** Aider 的交互式 diff 和 Claude Code 的审批模式目的相同。Claude Code 的更加集成——你在同一个终端 session 中完成审查，无需切换视图。

---

## 从 ChatGPT / 网页版 Claude 迁移

### 思维模式转变

网页 AI 助手（ChatGPT、Claude.ai）是对话工具。你描述问题，它们给出建议，你去实现。Claude Code 消除了实现这一环节——它直接读取你的文件并进行修改。

这是最重要的思维模式转变。网页 AI 用户已经习惯了用文字仔细描述问题。Claude Code 用户描述目标，让 Claude 来完成实现。

| 网页 AI（ChatGPT/Claude.ai） | Claude Code |
|-----------------------------|-------------|
| 粘贴代码片段 | Claude 直接读取你的实际文件 |
| 接收代码建议 | Claude 直接编写和编辑 |
| 复制粘贴来实现 | 变更自动应用（需审批） |
| 无项目 context | CLAUDE.md 提供持久化 context |
| 不能执行命令 | 可运行测试、git、lint 等 |
| session 之间无记忆 | CLAUDE.md + 自动记忆 |

### 最大的调整：停止复制粘贴

网页 AI 用户最常见的适应：停止在 AI 和编辑器之间来回复制代码。使用 Claude Code 时：

```bash
# 不要：描述问题 → 复制代码 → 粘贴到编辑器
# 而是：描述问题 → Claude 直接编辑文件
```

```text
# 旧的网页 AI 模式（描述你想要的代码）
"Write me a function that validates email addresses using regex"

# Claude Code 模式（描述项目中的目标）
"Add input validation to the email field in src/auth/signup.ts.
Use the same validation pattern as the phone field."
```

### 实际迁移步骤

1. **从下一个 bug 修复开始。** 与其把错误粘贴到 ChatGPT，不如把它粘贴到 Claude Code。Claude 能读取实际文件并看到完整 context。

2. **学会引用文件。** 与 Claude Code 讨论代码时，引用实际文件而不是粘贴内容："看一下 src/api/handlers/user.ts，解释其中的错误处理模式。"

3. **立即创建 CLAUDE.md。** 网页 AI session 之间没有记忆。Claude Code 有 CLAUDE.md 和自动记忆。尽早配置，才能尽早享受持久化的价值。

4. **拥抱更长周期的任务。** 网页 AI 擅长一次性回答。Claude Code 擅长需要多个步骤、文件读取和命令执行的任务。把提示语转向多步骤目标。

---

## 通用迁移原则

无论从哪个工具迁移，以下原则都能加速过渡：

**1. 尽早投入 CLAUDE.md。** 其他每一种 AI 工具都要求你每次 session 重新解释项目。CLAUDE.md 终结了这种重复。越早创建一个好的 CLAUDE.md，你就越早享受到复利效应。

**2. 从一种任务类型开始。** 选择你当前工具最让你沮丧的任务类型（通常是：多文件重构、调试或代码审查）。在这个场景下精通，再扩展到其他场景。

**3. 接受审批模式。** 任何能修改文件的工具都应该在应用变更前需要审查。Claude Code 的审批模式设计良好，不要急于绕过它——认真参与其中。

**4. 大量使用 `/clear`。** 从编辑器类工具过来的人，对"需要管理的 context 窗口"这个概念不熟悉。切换到新任务时，清空 context。这个习惯能避免很多质量下降。

**5. 给它至少两周时间。** Claude Code 的价值随着它了解你的项目、你学会与它协作而持续积累。两天的评估并不能代表持续使用的真实体验。

---

## 共存：将 Claude Code 与其他工具并用

Claude Code 不要求你放弃其他工具。许多有经验的开发者会组合使用：

- **Copilot 用于内联补全**（打字辅助）+ **Claude Code 用于较大任务**（多文件变更、调试）
- **Cursor 作为编辑器** + **Claude Code 在终端中**处理复杂任务
- **Aider 用于以 git 为核心的工作流** + **Claude Code 在需要 MCP 集成时使用**

这些工具互补，并非互斥。优化的目标是工作流效率，而不是工具的排他性。
