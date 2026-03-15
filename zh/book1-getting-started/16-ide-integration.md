# 第十六章：IDE 集成

## 在哪里使用 Claude Code？

Claude Code 最初是一个纯命令行工具。但现在，它已经能在多种开发环境里运行，包括你可能已经在用的代码编辑器。

本章介绍几种主要的使用方式，帮你选择最适合自己的。

---

## VS Code 插件

VS Code 是目前最流行的代码编辑器，Claude Code 为它提供了官方插件，体验非常完整。

### 安装

在 VS Code 里按 `Cmd+Shift+X`（Mac）或 `Ctrl+Shift+X`（Windows/Linux）打开扩展市场，搜索 "Claude Code"，点击安装。

或者直接访问：
```
VS Code 扩展市场 → 搜索 "Claude Code" → 安装
```

安装后，你会在编辑器里看到几个新的入口：
- 右上角编辑器工具栏：一个闪光图标（打开文件时可见）
- 左侧活动栏：Claude Code 图标（随时可见）
- 底部状态栏：右下角的 "✱ Claude Code" 字样

### 核心功能

**直观的代码差异显示**

VS Code 插件最大的优势是：当 Claude 要修改你的代码时，它会以**左右对比**的方式显示修改前后的差异，而不是终端里的 `+/-` 符号。这让你能更直觉地看清楚改了什么。

**选中代码直接提问**

在编辑器里选中一段代码，Claude Code 自动感知到你的选择。然后在对话框里直接问：

```
解释一下这段代码是做什么的
```

```
这里有没有潜在的性能问题？
```

插入文件引用快捷键：`Option+K`（Mac）/ `Alt+K`（Windows），会自动插入 `@文件名#行号范围`。

**@-mention 文件**

在对话框里输入 `@` 然后跟文件名，可以引用特定文件。支持模糊匹配：

```
@auth 这个文件里的 validateToken 函数有什么问题？
```

**会话历史**

VS Code 插件保存了你所有的对话历史。点击顶部的下拉菜单，可以按时间（今天、昨天、最近 7 天）浏览历史，点击任意一条即可恢复。

**计划模式（Plan Mode）**

在 VS Code 里，计划模式有额外的体验提升：Claude 的计划会**自动打开为一个完整的 Markdown 文档**，你可以在文档里加注释、做修改，然后让 Claude 按修改后的计划执行。

### 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd+Shift+X` / `Ctrl+Shift+X` | 打开扩展市场 |
| `Cmd+Shift+P` / `Ctrl+Shift+P` | 命令面板，输入 "Claude Code" |
| `Cmd+Esc` / `Ctrl+Esc` | 在编辑器和 Claude 对话框之间切换焦点 |
| `Option+K` / `Alt+K` | 插入当前文件和选中行的 @-mention |
| `Cmd+Shift+Esc` / `Ctrl+Shift+Esc` | 在新标签页打开 Claude |
| `Cmd+N` / `Ctrl+N` | 新建对话（在 Claude 对话框聚焦时） |
| `Shift+Enter` | 多行输入（不发送） |

### 在 VS Code 里切换权限模式

点击对话框底部的模式指示器，可以在三种模式之间切换。或者在设置里搜索 `claudeCode.initialPermissionMode` 设置默认模式。

---

## Cursor 集成

Cursor 是一个基于 VS Code 构建的 AI 编辑器，内置了 AI 功能。

Claude Code 也可以在 Cursor 里运行，安装方式和 VS Code 几乎完全一样：

在 Cursor 的扩展市场搜索 "Claude Code" 并安装，所有功能都相同。

```
Cursor 扩展市场 → 搜索 "Claude Code" → 安装
```

**Cursor 用户注意：** Cursor 本身已经有 AI 辅助功能。安装 Claude Code 插件后，你有了两套 AI 工具。你可以：
- 用 Cursor 内置的功能做行内补全
- 用 Claude Code 做需要跨文件、多步骤的复杂任务

两者可以互补，不必非选其一。

---

## JetBrains 插件

如果你用 IntelliJ IDEA、PyCharm、WebStorm 或其他 JetBrains 系列 IDE，也有官方插件可用。

### 安装

1. 打开 JetBrains IDE
2. 菜单：Settings → Plugins
3. 搜索 "Claude Code Beta"
4. 点击 Install，重启 IDE

或者访问 JetBrains 插件市场：https://plugins.jetbrains.com 搜索 "Claude Code"

### 主要功能

JetBrains 插件提供：
- 对话面板（类似 VS Code）
- 代码差异可视化查看
- 选中代码传入对话上下文

注意：JetBrains 插件目前标注为 Beta 版，功能相对 VS Code 版本略少，但核心功能已完整可用。

---

## 纯终端工作流

如果你喜欢纯命令行环境，不需要任何 IDE，Claude Code 的终端体验同样完整——事实上，CLI 有一些插件版本没有的功能。

### 启动

```bash
cd 你的项目目录
claude
```

### 终端专属功能

**Tab 补全**

在终端里，Claude Code 支持 Tab 键补全命令、文件名和 slash 命令（`/` 开头的命令），这在图形界面版本里没有。

**`!` 快捷方式**

在终端里，在 Claude 对话框内输入 `!` 开头的内容，会直接当作 shell 命令执行，不需要让 Claude 来做判断：

```
! git status
! ls -la
! npm list
```

这在需要快速查看某些信息时很方便。

**管道（Pipe）**

终端版本可以通过管道接收输入：

```bash
# 把日志内容传给 Claude 分析
tail -n 100 app.log | claude -p "有没有异常信息？"

# 让 Claude 审查 git diff
git diff | claude -p "这些改动有没有明显的问题？"
```

**非交互模式**

终端版本支持单次命令模式，适合脚本或 CI：

```bash
claude -p "帮我检查 src/utils.js 里有没有未使用的变量"
```

### 在终端里接入 VS Code

如果你主要用终端，但偶尔想用 VS Code 的可视化差异界面，可以运行：

```
/ide
```

这会把当前终端会话连接到已打开的 VS Code，文件差异会在 VS Code 里展示。

---

## 选择适合你的方式

没有绝对的最佳选择，取决于你的使用习惯和需求：

### 推荐 VS Code 插件，如果：
- 你已经在用 VS Code 或 Cursor
- 你是新手，想要更直观的界面
- 你重视代码差异的可视化显示
- 你希望在编辑代码和问 Claude 之间快速切换

### 推荐 JetBrains 插件，如果：
- 你的主力 IDE 是 IntelliJ、PyCharm 等
- 不想额外开一个终端窗口

### 推荐纯终端，如果：
- 你已经习惯命令行工作流
- 你需要用到管道（pipe）功能
- 你在远程服务器上工作（SSH）
- 你希望把 Claude Code 集成到脚本或 CI 流程里

### 混合使用

很多用户的实际做法是：
- 平时写代码用 VS Code + 插件
- 需要复杂的自动化任务时切换到终端

两种方式共享同样的配置文件（CLAUDE.md、Memory、settings.json），切换没有任何代价。

---

## 各平台功能对比

| 功能 | 终端 CLI | VS Code 插件 | JetBrains 插件 |
|------|----------|--------------|----------------|
| 基本对话 | 完整 | 完整 | 完整 |
| 代码差异显示 | 文字形式 | 可视化对比 | 可视化对比 |
| @-mention 文件 | 支持 | 支持 | 支持 |
| Tab 补全 | 支持 | 不支持 | 不支持 |
| `!` 命令快捷方式 | 支持 | 不支持 | 不支持 |
| 管道（Pipe）输入 | 支持 | 不支持 | 不支持 |
| 会话历史 | 支持 | 支持（可视化更好） | 支持 |
| 计划模式 | 支持 | 支持（Markdown 展示）| 支持 |
| 检查点/回滚 | 支持 | 支持（鼠标操作）| 支持 |

---

## 小结

- **VS Code 插件**：最完整的图形界面体验，推荐大多数用户
- **Cursor**：与 VS Code 插件完全相同，可与 Cursor 内置 AI 互补
- **JetBrains**：适合 JetBrains 用户，功能完整（Beta 版）
- **纯终端**：最灵活，有独特的管道和脚本功能
- 所有方式**共享配置**，可以自由混合使用

---

**下一步：** [术语表](./glossary.md) | [常见问题](./troubleshooting.md) | [快捷键](./keyboard-shortcuts.md)
