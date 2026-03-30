# 第 19 章：桌面应用与电脑使用

## 为什么桌面应用改变一切

网络版 Claude 在聊天和专注编码方面很强大。但桌面应用打开了根本上改变你工作方式的能力：三种不同的交互模式（Chat、Cowork、Code）、在你真实屏幕上进行可视化差异审查、实时应用预览，以及在 macOS 上可以直接进行电脑控制，使 Claude 能够看到你的屏幕、点击按钮并自动导航应用。

本章涵盖每种模式、何时使用它们，以及电脑使用能开启的新可能性。

---

## 三种模式：Chat、Cowork、Code

Claude 桌面应用提供了三种不同的交互模式，每一种都针对不同的工作模式进行了优化。它们在同一应用中的不同选项卡中生存。

### Chat：对话基础

Chat 是你从网页版了解的模式 — 对话式、即时的、默认情况下无文件系统访问。但桌面版 Chat 获得了两个关键优势：

1. **截图上下文** — 按 Option-Shift-C (macOS) 来捕获你的屏幕并询问 Claude 你看到了什么。这比用言语解释问题要快得多。
2. **双击 Option 键** — 从任何应用启动 Claude 的快速访问覆盖层，无需切换窗口。在聚焦代码编辑器、浏览器或设计工具的同时提出问题。

Chat 适合于：
- 快速提问和调试
- 在提交代码之前探索想法
- 一次性分析和解释

### Cowork：自主知识工作

Cowork 在 Chat 和 Code 之间取得平衡。你允许 Claude 读取和编辑你指定的文件夹中的文件，它在多个步骤中自主运行以完成复杂任务。与 Chat 不同，Cowork 有持久的状态 — 它记住它做了什么、积累上下文，并且可以跨会话从中断处继续。

关键能力：
- **文件系统访问** — 你授予特定文件夹的访问权限。Claude 以权限的形式读取、编辑和创建文件。
- **多步自主性** — 描述一个结果（"为第一季度准备财务分析"），Cowork 将其分解为步骤、执行并报告回来。
- **计划任务** — 设置定期任务在计划上运行。
- **电脑使用**（Pro/Max）— 在 macOS 上，你可以授予 Claude 使用你的鼠标、键盘和查看屏幕的能力。

Cowork 在一个沙箱隔离的环境中运行。除非你明确连接，否则它无法访问更广泛的互联网。这比 Code 更安全，后者在更开放的环境中运行。

典型的 Cowork 使用案例：
- 跨越多个来源和文档的研究任务
- 重复的知识工作（数据输入、表格填充、批量处理）
- 计划的分析和报告
- 任何你描述目标而 Claude 找出步骤的地方

### Code：完整的开发能力

Code 是在桌面应用中运行的 Claude Code。它对连接的文件夹或 GitHub 存储库中的代码库有完整的读写访问权限。与 Cowork 不同，Code 假设你是开发者并针对构建、测试和发布进行了优化。

关键区别：
- **双向 git 集成** — 读取和写入提交、推送分支、打开 PR。
- **可视化差异** — 将更改显示为屏幕上的图形差异（更多信息见下文）。
- **测试执行** — 直接运行测试、调试器和构建系统。
- **三种交互风格** — Ask、Code、Plan 模式让你控制自主性。

Code 用于：
- 端到端构建功能
- 重构和迁移
- 调试复杂问题
- 任何需要深入代码库知识和版本控制的事情

---

## 安装与设置

### 桌面应用安装

从 [claude.com](https://claude.com) 下载 Claude：

1. 下载适合你的操作系统的版本（macOS Intel/Apple Silicon、Windows）。
2. 安装并启动。
3. 用你的 Claude 账户登录（如果需要可创建新账户）。
4. 选择你的计划：Chat 是免费的，Cowork 和 Code 需要 Pro、Max、Team 或 Enterprise。

### 连接文件夹（Cowork & Code）

对于 Cowork 和 Code 选项卡，你必须明确连接一个文件夹：

1. 打开 Cowork 或 Code 选项卡。
2. 点击"Connect Folder"（或根据你的版本类似的按钮）。
3. 选择一个文件夹。Claude 获得该文件夹及其内容的读写访问权限。
4. 可选：对于 Cowork，配置 Claude 可以访问哪些子文件夹（限制存储在你的机器上，不发送给 Anthropic）。

### 连接 GitHub 存储库（Code）

要直接与 GitHub 存储库合作：

1. 打开 Code 选项卡。
2. 点击"Connect Repository"。
3. 输入存储库 URL（GitHub 链接）或选择本地存储库。
4. 使用你的个人访问令牌或 OAuth 流程通过 GitHub 进行身份验证。
5. Claude 现在可以读取、写入和推送提交到该存储库。

### 电脑使用（macOS）

如果你在 Pro 或 Max 上使用 macOS，你可以授予 Claude 访问权限以使用你的鼠标、键盘和屏幕截图：

1. 打开设置（齿轮图标）。
2. 导航到"Computer Use"或"Capabilities"。
3. 切换"Allow computer use"为 ON。
4. 授予屏幕记录权限（当 Claude 首次尝试截图时，macOS 会提示你）。
5. 授予权限后，Claude 可以看到你的屏幕并控制你的光标。

此权限是本地的 — 除非你在消息中明确要求 Claude 进行截图，否则它不会将你的屏幕发送给 Anthropic。

---

## 可视化差异审查

桌面的最强大功能之一是可视化差异查看器。当 Claude Code 进行更改时，你在提交之前会看到它们以图形方式呈现。

### 理解差异视图

当 Claude 编辑一个文件时，差异视图显示：
- **左侧：** 原始代码（红色删除）。
- **右侧：** 新代码（绿色添加）。
- **行号：** 原始和新行号都是可见的。
- **上下文：** 在每个更改上方和下方有几行未更改的代码以便定向。

### 审查更改

用 `/diff` 打开差异视图或点击 Cowork/Code 界面中的"Review Changes"按钮。

你可以：
1. **接受整个差异** — 点击"Apply"来提交更改。
2. **拒绝整个差异** — 点击"Discard"来撤销更改而不提交。
3. **检查特定更改** — 悬停在部分上以查看上下文，跳转到差异中的其他文件。
4. **请求改进** — 当差异打开时，告诉 Claude"在这里使变量名更清晰"或"这个函数太长了，拆分它"，Claude 会修改。

### 示例：审查功能

你要求 Claude："Add a dark mode toggle to the settings page."

Claude 在 `src/components/Settings.tsx`、`src/styles/theme.css` 和 `src/utils/storage.ts` 中进行更改。

差异视图打开，显示：
- 新的 `DarkModeToggle` 组件与状态管理。
- CSS 深色模式样式的补充。
- 新的本地存储实用函数。

你审查每个更改。你注意到深色模式类名太冗长。你说：
```
The CSS class names are too long. Rename "dark-mode-active" to "dm"
and "light-mode-active" to "lm" everywhere.
```

Claude 实时修改所有三个文件，差异视图更新。一旦满意，你点击 Apply。

---

## 实时应用预览

对于前端项目（React、Vue、Next.js 等），Code 可以启动你的应用的开发服务器并在桌面界面中显示实时预览。

### 启动预览

1. 打开连接到网络项目文件夹的 Code。
2. 要求："Start the dev server and show me a preview."
3. Claude 运行你的构建命令（例如 `npm run dev`），检测服务器端口，并在 Claude 窗口内打开预览窗格。

### 互动预览

预览是实时和互动的：
- 点击按钮、填充表单、像往常一样导航。
- Claude 对代码所做的更改会自动重新加载预览。
- 你可以检查预览 DOM、控制台日志和网络请求（开发者工具集成）。

### 排查预览问题

如果预览加载失败：
- Claude 将显示构建/开发服务器输出。
- 常见问题：端口错误、依赖失败、缺少环境变量。
- 你可以告诉 Claude："The server crashed. Check the build output and fix the error."

---

## 电脑使用：自主鼠标、键盘、截图

> **2026 年 3 月发布（研究预览）。** Computer Use 让 Claude 直接控制你的屏幕——点击、输入、导航、截图——无需额外设置。目前仅限 macOS，需要 Pro 或 Max 订阅。这是一项强大但需谨慎使用的能力：Claude 在启用后可以看到你屏幕上的所有内容，包括通知、聊天窗口和浏览器标签页中的敏感信息。
>
> 典型用途包括：网页浏览与表单填写、GUI 应用的自动化操作、UI 测试流程验证、跨应用的数据搬运。功能默认关闭，需要在 Settings 中手动开启并授予 macOS 屏幕录制权限。
>
> 与传统的 Bash/脚本自动化相比，Computer Use 适合那些**只能通过 GUI 完成**的任务。如果一个操作可以用命令行完成，优先使用命令行——更快、更可靠、更安全。

电脑使用在 macOS 的 Cowork 和 Code 中是独一无二的。启用后，Claude 可以：
- **进行截图** 以查看当前状态。
- **移动鼠标光标** 并点击元素。
- **使用键盘输入** 文本。
- **导航应用** — 打开文件、切换应用、填充表单、在终端运行脚本。

这很强大，但需要理解 Claude 可以和不能安全做什么。

### 电脑使用能做什么

**自动化重复的 UI 交互：**

你在浏览器和桌面应用中管理客户数据电子表格。与其手动复制和粘贴条目，不如告诉 Claude：

```
I have a list of customers in Spreadsheet A (browser) and need to
enter them into CRM System B (desktop app). Take a screenshot, then
automate the data entry: for each row in the spreadsheet, open a
new entry form in the CRM, fill in the fields, and save.
```

Claude 进行截图，看到两个应用，并系统地传输数据。

**测试 UI 流程：**

你正在构建结账流程。与其手动测试每一条路径：

```
Test the complete checkout flow:
1. Add an item to cart.
2. Proceed to checkout.
3. Fill in shipping address (use 123 Test St, Brooklyn, NY 11201).
4. Select "UPS Ground" as shipping method.
5. Enter test credit card (4111 1111 1111 1111).
6. Submit the order.

Take screenshots at each step to show me the flow.
```

Claude 自动化整个流程，向你显示什么有效，什么破坏了。

**文件和应用管理：**

```
Find the file "report-2024.xlsx" in my Downloads folder,
open it in Excel, and sort the "Sales" sheet by revenue (descending).
```

### 电脑使用的安全限制

Claude 不能自主使用电脑使用 — 你必须明确要求。即便如此，Claude 也在安全限制下运行：

1. **在输入敏感数据前无需确认** — Claude 将在输入密码、API 密钥或信用卡信息之前询问。
2. **长时间操作的超时** — 如果自动任务在没有进展的情况下耗时过长，Claude 会停止并要求澄清。
3. **无自动购买** — Claude 在没有明确逐个确认的情况下不会提交订单或处理付款。
4. **部分自动化** — 对于风险操作，Claude 可能会自动执行 80%，并要求你确认最后 20%。

### 风险与最佳实践

**风险：**

- **无意的行为** — 如果 Claude 误识别按钮或输入字段，它可能会点击错误的东西。在自动化关键流程之前总是检查截图。
- **状态假设** — 如果你的应用 UI 意外改变，Claude 的自动化可能失败或采取错误的行为。小心监视第一次运行。
- **无回滚** — 一些操作（删除文件、关闭应用）无法轻易撤销。对于破坏性操作，使用电脑使用来 *预览* 行为，而不是立即执行。

**最佳实践：**

1. **先在非关键数据上测试** — 在针对生产数据库自动化前，针对副本进行测试。
2. **审查截图** — 在确认之前总是检查 Claude 是否在查看正确的内容。
3. **对重复、低风险的任务使用电脑使用** — 数据输入、表单填充、日常检查。对风险操作谨慎使用。
4. **与 Code 模式结合** — 对于复杂自动化，通常让 Claude 写一个脚本（在 Code 中）然后运行脚本（在 Cowork/电脑使用中）更安全，而不是完全依赖 UI 自动化。

### 示例：有审查的批量数据输入

```
I need to process a list of 50 customer signups from a CSV file.
For each row, open the admin dashboard, fill in the signup form,
and save. But take a screenshot before each save so I can review
before you proceed.
```

Claude 将：
1. 读取 CSV 文件。
2. 打开仪表板并填充第一个条目。
3. 进行显示已填充表单的截图。
4. 在点击保存之前等待你的确认。
5. 对每个条目重复。

这种混合方法给你安全性和自动化。

---

## PR 监视与调度

Code 与 GitHub 的集成允许 Claude 监视拉取请求并基于 PR 状态更改调度任务。

### 监视 PR

要求 Claude 监视特定 PR：

```
Watch PR #142 (feature/dark-mode). When:
1. A new review comment appears, fetch it and summarize.
2. CI/CD checks fail, diagnose the failure and suggest a fix.
3. The PR is merged, post a completion summary to Slack.
```

Claude 定期轮询 PR 并在满足条件时采取行动。

### 从 PR 审查中调度任务

如果审查人员请求更改：

```
Fetch any new PR comments on #142. For each comment requesting
changes, create a task in my Cowork session to fix the issue.
```

### GitHub Actions 集成

对于连接到具有 GitHub Actions 的存储库的 Code：

```
Install the Claude GitHub App for this repository.
```

Claude 然后可以：
- 手动触发工作流。
- 读取工作流日志和 CI/CD 输出。
- 基于 CI/CD 失败调度任务。
- 当工作流建议更改时直接提交修复。

---

## 使用 Worktrees 的平行会话

当你需要 Claude 在同一存储库中同时处理多个功能而不产生冲突时，请使用 git worktrees。

### 创建 Worktree

在 Code 中，使用 worktrees 生成平行智能体：

```
Create two agents:
1. Agent A in worktree feature-auth: Implement OAuth login.
2. Agent B in worktree feature-stripe: Implement Stripe integration.

Each works independently. Report when complete.
```

每个智能体都获得指向同一存储库的自己的工作目录。Agent A 的 worktree 中的更改在显式合并之前不会影响 Agent B 的工作目录。

### Worktree 配置

对于大型存储库，配置每个 worktree 包含哪些路径：

```json
{
  "worktree": {
    "sparsePaths": [
      "src/auth/",
      "tests/auth/",
      "docs/api/"
    ]
  }
}
```

这使用 git sparse checkout，加快了 monorepos 的 worktree 创建。

### 合并 Worktrees

当两个智能体都完成时：

```
Merge the feature-auth worktree into main.
Then merge feature-stripe into main.
Resolve any conflicts and verify both features work together.
```

Worktrees 显著加快了平行开发速度，无需手动冲突管理。

---

## 何时使用：桌面 vs. CLI vs. 网络

不同的界面在不同的任务中表现出色。这是一个决策树：

### Chat（桌面或网络）

何时使用 Chat：
- 你在探索想法并希望获得对话反馈。
- 你需要对一个概念进行快速澄清。
- 你想上传截图供 Claude 分析。
- 你 **不是** 修改文件。

### Cowork（仅桌面）

何时使用 Cowork：
- 你在进行跨多个文件的研究、分析或知识工作。
- 你希望 Claude 自主完成多步骤任务。
- 你需要电脑使用（macOS）来自动化 UI 交互。
- 你 **不需要** 版本控制。

### Code（桌面或 CLI）

何时使用 Code：
- 你在构建、测试或发布软件。
- 你需要 git 集成和拉取请求。
- 你想要屏幕上的可视化差异。
- 你在处理代码库并希望 Claude 理解项目结构。

### CLI（终端）

何时使用 CLI：
- 你倾向于仅键盘的界面。
- 你在无头环境（CI/CD、远程服务器）中运行 Claude。
- 你想将 Claude 脚本化到你的开发工作流中。
- 你对基于文本的差异很满意。

### 网络（浏览器）

何时使用网络：
- 你想要最快的设置（无需安装）。
- 你在移动设备或低功率机器上。
- 你在共享 Claude 工作区中合作。
- 你 **不需要** 文件系统访问或可视化差异。

### 决策矩阵

| 任务 | Chat | Cowork | Code | CLI | Web |
|------|------|--------|------|-----|-----|
| 快速提问 | ✅ | | | ✅ | ✅ |
| 文件分析 | | ✅ | ✅ | ✅ | ✅ |
| 构建功能 | | | ✅ | ✅ | |
| 可视化差异审查 | | | ✅ | | |
| 电脑使用 | ✅ | ✅ | | | |
| Git/PR 工作 | | | ✅ | ✅ | |
| 研究任务 | | ✅ | | | ✅ |
| 生产部署 | | | ✅ | ✅ | |

---

## 集成模式

### 一起使用 Chat + Code

1. **在 Chat 中探索** — 提出问题，获得解释，理解问题空间。
2. **切换到 Code** — 一旦你知道要构建什么，用清晰的规范转到 Code。
3. **以可视化方式迭代** — 使用 Code 的差异视图进行详细代码审查。
4. **如果需要回到 Chat** — 对于快速澄清，跳回 Chat。

### 对复杂项目使用 Cowork + Code

1. **Cowork：研究阶段** — 收集需求、分析市场数据、竞争风景。
2. **Code：构建阶段** — 基于 Cowork 的发现进行实现。
3. **Cowork：测试与监视阶段** — 运行 QA 测试、计划监视任务。

### 桌面应用作为单一玻璃窗格

对于知识工作者，桌面应用整合工作流：

```
上午：Cowork 选项卡监视隔夜监视报告。
下午：Chat 选项卡讨论发现和战略。
晚上：Code 选项卡基于一天的决定构建解决方案。
```

全部在一个窗口中，在模式间具有持久历史和上下文。

---

## 快速参考：桌面应用键盘快捷方式

| 操作 | macOS | Windows |
|--------|-------|---------|
| 快速访问覆盖 | Option-Tap 两次 | Alt-Tap 两次 |
| 截图 | Option-Shift-C | Alt-Shift-C |
| 聚焦聊天输入 | Cmd-Shift-A | Ctrl-Shift-A |
| 打开差异查看器 | Cmd-D | Ctrl-D |
| 接受差异 | Cmd-Enter | Ctrl-Enter |
| 切换选项卡 | Cmd-[ / Cmd-] | Ctrl-[ / Ctrl-] |
| 打开设置 | Cmd-, | Ctrl-, |

---

## 排查故障

**预览无法加载？**
- 检查你的开发服务器是否在预期端口上运行。
- 验证环境变量是否正确设置。
- 要求 Claude 检查构建输出中的错误。

**电脑使用无法工作？**
- 验证你已授予 Claude 屏幕记录权限（System Settings → Privacy & Security → Screen Recording）。
- 确保你在 macOS 上（Windows 上尚无电脑使用）。
- 重启桌面应用并重试。

**差异视图显示错误的更改？**
- 这通常意味着 Claude 做了你没有预料到的更改。点击"Discard"来撤销，然后在再次尝试之前要求 Claude 解释其方法。

**代码未与 GitHub 同步？**
- 验证你的个人访问令牌是有效的（检查 GitHub 设置中的过期）。
- 确保存储库 URL 正确。
- 尝试断开连接然后重新连接存储库。

---

## 后续步骤

桌面应用是走向更深集成的网关。启用电脑使用后，Cowork 可以编排你的整个工作流 — 运行研究、执行测试和提交报告，全部无需你手动在应用之间切换。

真正的力量在于当你战略性地结合模式时出现：Chat 用于思考，Cowork 用于自主执行，Code 用于构建。

**接下来：** [第 20 章 — 插件与市场](./20-plugins.md) — 用第三方工具扩展 Claude Code。

---

## 参考资料

- [Claude 桌面应用导航教程](https://claude.com/resources/tutorials/navigating-the-claude-desktop-app)
- [Cowork 快速开始指南](https://support.claude.com/en/articles/13345190-get-started-with-cowork)
- [电脑使用安全指南](https://support.claude.com/en/articles/computer-use-safety)
