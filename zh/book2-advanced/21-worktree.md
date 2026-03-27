# 第 21 章：Worktree 与隔离

当你同时在多个分支上工作或想保护你的主会话免受实验性更改时，Git worktrees 提供了一个强大的隔离机制。本章涵盖如何使用 worktrees 与 Claude Code 来运行多个并行的独立会话，每个都有其自己的隔离上下文和文件系统状态。

---

## 什么是 Git Worktree？

Git worktree 是独立于你的主工作目录存在的存储库检出。与传统的分支切换（在原地修改文件）不同，每个 worktree 是一个指向同一 Git 存储库的不同目录，其中有不同的分支检出。

**为什么这对 Claude Code 很重要：**

当你在单个目录中切换分支时，Claude 的整个上下文会移动 — 所有文件读取都参考新的分支状态。如果你想比较实现或在两个功能上并行工作而不失去上下文，这会引起混淆。

使用 worktrees，你可以：
- 在 feature/auth 的 worktree A 中运行 Claude，在 feature/payments 的 worktree B 中并行运行 Claude
- 每个会话都有独立的上下文和文件系统状态
- 在会话之间切换而不失去进度
- 不冲突地合并或比较工作

**示例场景：**

你在进行大型功能重构的中途时报告了一个关键错误。与其保留工作并切换分支，不如为错误修复创建一个 worktree。Claude 在其自己的目录中处理错误，而你的功能工作保持不变。当错误修复合并到主分支时，切换回功能会话并继续。

---

## `claude -w [name]` — 启动隔离会话

使用 `-w` 标志在 worktree 中启动新的 Claude 会话：

```bash
cd your-project
claude -w bugfix/auth-timeout
```

Claude 自动创建一个名为 `bugfix/auth-timeout` 的新 worktree（如果不存在则创建分支）并在那里启动一个会话。

**在引擎盖下：**

```bash
# Claude 为你运行这个
git worktree add --track -b bugfix/auth-timeout origin/main
cd .git/worktrees/bugfix/auth-timeout
claude --name "bugfix: auth timeout"
```

会话是隔离的：文件读取、写入和 git 操作都在 worktree 内运行。当你退出会话时，worktree 保留（所以你可以稍后恢复它）但不占用终端。

**恢复 worktree 会话：**

```bash
claude -w bugfix/auth-timeout
```

如果 worktree 存在，Claude 连接到它。如果你在那里有会话历史，你可以用 `/resume` 恢复它。如果没有，一个新会话启动。

**列出所有活跃的 worktrees：**

```bash
claude worktree list
```

显示与存储库相关的所有 worktrees、它们的分支以及是否有 Claude 会话当前在运行。

---

## 智能体隔离（Agent Tool 中的 `isolation: "worktree"`）

对于多智能体项目，你可以配置智能体使用 Agent Tool 的 `isolation` 参数来隔离运行：

```json
{
  "name": "architect",
  "model": "opus",
  "instructions": "Design the authentication system",
  "isolation": "worktree"
}
```

当生成时，这个智能体自动：
1. 创建或附加到以智能体命名的 worktree
2. 独立于主会话工作
3. 无法干扰其他智能体的 worktrees 或主目录

**多智能体隔离模式：**

```json
{
  "parallel_agents": [
    {
      "name": "auth-implementation",
      "isolation": "worktree",
      "task": "Implement OAuth flow"
    },
    {
      "name": "database-migration",
      "isolation": "worktree",
      "task": "Add user_roles table"
    },
    {
      "name": "tests-setup",
      "isolation": "worktree",
      "task": "Write integration tests"
    }
  ]
}
```

每个智能体在其自己的 worktree 中运行。如果一个智能体进行了破坏性更改或沿着错误的路径走下去，它不会影响其他智能体。在所有智能体完成后，主会话可以审查、合并和测试合并的更改。

**隔离保证：**

- **文件系统隔离：** 每个 worktree 有其自己的文件状态
- **上下文隔离：** 智能体上下文不会跨越到其他 worktrees
- **Git 隔离：** 一个 worktree 中的提交在显式合并之前不会影响其他
- **工具隔离：** 每个智能体的工具使用被沙箱化到其 worktree（无外部写入）

这不同于简单的分支 — 隔离防止智能体即使通过读取操作也读取或修改彼此的工作。

---

## 使用 Worktrees 的平行开发

最常见的用例：并行开发功能 A 和功能 B 而无需上下文切换。

**设置：**

```bash
cd your-project

# 主目录：保留在 main 分支上
git worktree add --track -b feature/user-api
git worktree add --track -b feature/search-index
```

**平行会话：**

终端 1：
```bash
cd your-project/.git/worktrees/feature/user-api
claude
```

终端 2：
```bash
cd your-project/.git/worktrees/feature/search-index
claude
```

两个会话独立运行。你可以在 API 上工作，同时 Claude 在搜索索引上并行开发。任何会话都看不到另一个的未提交更改。

**合并 worktree 更改：**

一旦两个功能都完成：

```bash
# 在主目录中
git merge feature/user-api
git merge feature/search-index
```

正常解决任何冲突。worktrees 可以在之后清理。

**用例：功能工作期间的错误修复**

你在大型功能重构的中途时报告了一个关键错误。

```bash
# 主目录（feature/refactor 分支）
claude -w hotfix/memory-leak

# 在新终端中
# Claude 处理错误修复，而你的功能工作不受影响
```

你的功能会话保持暂停。错误修复是隔离的。当错误修复合并到 main 时，切换回功能会话并继续。

---

## 清理与管理

Worktrees 很轻，但随时间累积。积极管理它们。

**列出 worktrees：**

```bash
git worktree list
```

示例输出：
```
/Users/dev/project                                    f8a3b1c [main]
/Users/dev/project/.git/worktrees/feature/auth       a2d5e9f [feature/auth]
/Users/dev/project/.git/worktrees/hotfix/database    7c1b4d2 [hotfix/database]
```

**删除 worktree：**

```bash
git worktree remove feature/auth
```

这删除目录并清理 Git 元数据。分支保留；你可以随时为其创建新 worktree。

**修剪陈旧的 worktrees：**

有时 worktree 目录被手动删除但 Git 元数据保留。清理这个：

```bash
git worktree prune
```

这删除 worktree 元数据，用于磁盘上不再存在的目录。

**自动清理：**

添加一个钩子到你的 CLAUDE.md 来提醒开发者清理 worktrees：

```markdown
# Cleanup completed worktrees with:
# git worktree list
# git worktree remove [worktree-name]
```

**删除多个 worktrees：**

```bash
# 删除除 main 外的所有 worktrees（谨慎使用）
git worktree list | grep -v '(main)' | awk '{print $1}' | xargs -I {} git worktree remove {}
```

---

## 非 Git 后备方案

不是所有项目都使用 Git，或一些目录在版本控制之外。Claude Code 支持没有 Git 的类似 worktree 的隔离：

**基于目录的隔离：**

```bash
# 手动创建独立目录
mkdir feature-a feature-b
cp -r src feature-a/
cp -r src feature-b/

# 在每个中运行 Claude
cd feature-a && claude
cd feature-b && claude
```

这提供文件系统隔离但没有版本控制好处。你必须手动合并更改或使用差异工具。

**符号链接隔离：**

```bash
# 创建基于符号链接的 worktree 结构
mkdir worktrees
cd worktrees
cp -r ../src ./feature-a
cp -r ../src ./feature-b
```

不如 Git worktrees 优雅但对非 Git 项目或需要多个副本时很有用。

**沙箱环境：**

对于极端隔离（单独的用户账户、容器、VMs）：

```bash
# 在 Docker 容器中运行
docker run -it -v $(pwd):/project claude-code-dev:latest
```

这不仅隔离目录，还隔离整个环境。

---

## 何时使用 Worktrees

**何时使用 worktrees：**

- 你同时在 2+ 功能上工作，想为每个保留上下文
- 你需要修复错误而不失去当前功能的进度
- 你在运行平行多智能体开发，其中智能体不能相互干扰
- 你的团队使用功能分支，希望每个分支有独立的 Claude 会话
- 你想并排比较实现而不切换分支

**何时不使用 worktrees：**

- 你依次在一个功能上工作（简单分支更简单）
- 你的项目没有 Git 存储库，创建副本不实用
- 你在进行将被丢弃的探索工作（只使用单个分支）
- 上下文太大，多个 worktree 会话超过你的令牌预算

**Worktree 大小考虑：**

每个 worktree 是存储库的完整检出。对于 2 GB 代码库，创建 3 个 worktrees 使用 6 GB 额外磁盘空间。对于大型 monorepos，在创建许多 worktrees 前考虑磁盘使用是否可接受。

---

## 快速参考

| 任务 | 命令 |
|---|---|
| 创建并在 worktree 中启动 | `claude -w branch-name` |
| 恢复 worktree 会话 | `claude -w branch-name` |
| 列出所有 worktrees | `git worktree list` |
| 删除 worktree | `git worktree remove branch-name` |
| 清理陈旧 worktree 元数据 | `git worktree prune` |
| 配置智能体隔离 | 在智能体配置中设置 `isolation: "worktree"` |

---

## 参考资料

- [Git Worktree 文档](https://git-scm.com/docs/git-worktree) — 官方 Git 手册
- [第 6 章：平行智能体编排](./06-parallel-agents.md) — 高效运行多个智能体
- [第 7 章：大型项目模式](./07-large-projects.md) — 架构师-编码员-审查工作流
- [第 18 章：多会话工作流](./18-multi-session.md) — 长期运行项目模式

---

**接下来：** [第 22 章 — 语音、快速模式与尽力级别](./22-voice-fast-effort.md) — 口语输入、速度优化和推理深度控制。
