# 第二章：自定义 Skills

## Skills 是什么？

Skills 是 Claude Code 的扩展机制。简单说：一个 `SKILL.md` 文件 = 一个新的 `/` 命令。

当你创建 `~/.claude/skills/deploy/SKILL.md`，Claude Code 会自动添加 `/deploy` 命令到你的 `/` 菜单。当这个命令被触发时，`SKILL.md` 的内容就成为 Claude 的指令。

Skills 遵循 [Agent Skills](https://agentskills.io) 开放标准，但 Claude Code 在此基础上增加了：调用控制（由你触发还是 Claude 自动触发）、子 agent 执行、动态上下文注入。

**Skills 与内置命令的核心区别**：

| 特性 | 内置命令（`/clear`）| Skill（`/deploy`） |
|------|--------------------|--------------------|
| 执行方式 | 固定系统逻辑 | 提示词驱动 LLM |
| 可自定义 | 不可以 | 完全自定义 |
| 响应速度 | 即时 | 需要 LLM 处理 |
| 能力边界 | 固定功能 | 可以读写文件、运行命令、调用子 agent |

---

## Skill 文件格式

每个 Skill 是一个目录，核心是 `SKILL.md` 文件：

```
my-skill/
├── SKILL.md           # 主指令文件（必须）
├── template.md        # Claude 可以填充的模板（可选）
├── examples/
│   └── sample.md      # 示例输出，展示预期格式（可选）
└── scripts/
    └── validate.sh    # Claude 可以执行的脚本（可选）
```

`SKILL.md` 结构分两部分：

```yaml
---
# YAML frontmatter（可选，但推荐）
name: my-skill
description: 这个 skill 做什么，以及什么时候用它
---

# 这里是 Markdown 内容
# 这就是 Claude 被调用时看到的指令
```

---

## Frontmatter 完整参考

```yaml
---
name: deploy                          # skill 名称，成为 /deploy 命令
description: 部署应用到生产环境       # Claude 用此决定何时自动加载
argument-hint: [environment]          # 自动补全提示
disable-model-invocation: true        # 只允许你手动触发，Claude 不会自动用
user-invocable: false                 # 只有 Claude 能调用，不出现在菜单
allowed-tools: Read, Grep, Bash       # 此 skill 激活时允许的工具（无需确认）
model: sonnet                         # 此 skill 使用的模型
context: fork                         # 在独立子 agent 中运行
agent: Explore                        # 搭配 context: fork 使用的 agent 类型
hooks:                                # 此 skill 生命周期内的 hooks
  PostToolUse:
    - matcher: "Edit"
      hooks:
        - type: command
          command: "./lint.sh"
---
```

所有字段都是可选的。只有 `description` 是强烈推荐的——Claude 用它来判断何时自动激活这个 skill。

---

## 创建你的第一个 Skill

我们创建一个 `git-commit` skill，教 Claude 按照特定规范写提交信息。

### 第一步：创建目录

Personal skills（所有项目共享）放在 `~/.claude/skills/`：

```bash
mkdir -p ~/.claude/skills/git-commit
```

### 第二步：编写 SKILL.md

创建 `~/.claude/skills/git-commit/SKILL.md`：

```yaml
---
name: git-commit
description: 按照 Conventional Commits 规范提交代码。当用户说"提交"、"commit"或"帮我写提交信息"时使用。
disable-model-invocation: true
allowed-tools: Bash(git *)
---

按照 Conventional Commits 规范提交当前改动。

## 操作步骤

1. 运行 `git diff --cached` 查看暂存的改动
2. 如果没有暂存内容，先运行 `git status` 了解情况，询问用户是否要暂存所有改动
3. 分析改动，判断提交类型：
   - `feat`: 新功能
   - `fix`: bug 修复
   - `refactor`: 代码重构（不影响功能）
   - `docs`: 文档更新
   - `test`: 测试相关
   - `chore`: 构建工具、依赖等

## 提交信息格式

```
<type>[optional scope]: <description>

[optional body]
```

规则：
- 第一行不超过 72 字符
- description 用中文，以动词开头（如"添加"、"修复"、"优化"）
- 如果改动涉及多个方面，在 body 里详细说明

## 提交前检查

在提交前，确认：
- 没有 `.env` 文件被暂存
- 没有密钥或 token（`sk-`、`ghp_`、`api_key` 等）
- 没有 `console.log` 调试代码

如果发现问题，停止操作并告知用户。
```

### 第三步：测试

```bash
# 暂存一些改动
git add src/auth.py

# 在 Claude Code 中触发 skill
/git-commit
```

或者让 Claude 自动触发：

```
帮我提交这次认证模块的改动
```

---

## Skill 触发机制详解

### 两种触发方式

**方式 1：你手动调用**
```
/git-commit
```

**方式 2：Claude 自动识别并调用**

Claude 会根据 `description` 字段判断当前对话是否匹配某个 skill。例如，你说"帮我提交代码"，Claude 会检查是否有 description 包含"commit"或"提交"的 skill，如果有且没有 `disable-model-invocation: true`，它会自动加载并使用。

### 控制谁能触发

```yaml
# 只有你能触发（Claude 不会自动用）
disable-model-invocation: true

# 只有 Claude 能触发（不出现在 / 菜单）
user-invocable: false
```

**什么时候用 `disable-model-invocation: true`？**

当 skill 有副作用时：部署生产环境、发送邮件、操作数据库。你不希望 Claude 自作主张决定"代码看起来 ready 了，我来部署吧"。

**什么时候用 `user-invocable: false`？**

当 skill 是背景知识，而不是可执行动作时。例如"旧系统架构说明"——Claude 应该在相关问题出现时自动参考它，但用户直接 `/旧系统架构说明` 没有意义。

---

## Skill 存放位置

| 位置 | 路径 | 适用范围 |
|------|------|---------|
| 企业级 | 见托管设置文档 | 组织所有用户 |
| 个人级 | `~/.claude/skills/<skill>/SKILL.md` | 你的所有项目 |
| 项目级 | `.claude/skills/<skill>/SKILL.md` | 当前项目 |
| 插件 | `<plugin>/skills/<skill>/SKILL.md` | 插件启用的地方 |

优先级：企业 > 个人 > 项目。同名 skill 以高优先级为准。

### Monorepo 的自动发现

在 monorepo 中，Claude Code 会自动发现嵌套目录的 skills。如果你在编辑 `packages/frontend/` 中的文件，Claude Code 也会查找 `packages/frontend/.claude/skills/`。这让每个子包都能有自己的专属 skill。

---

## 传递参数给 Skill

使用 `$ARGUMENTS` 占位符：

```yaml
---
name: fix-issue
description: 修复 GitHub issue
disable-model-invocation: true
argument-hint: <issue-number>
---

修复 GitHub issue $ARGUMENTS，遵循项目编码规范。

1. 阅读 issue 描述，理解需求
2. 找到相关代码文件
3. 实现修复
4. 编写测试
5. 创建提交
```

使用时：

```
/fix-issue 456
```

Claude 收到的指令变成："修复 GitHub issue 456，遵循项目编码规范。"

### 按位置访问多个参数

```yaml
---
name: migrate-component
description: 将组件从一个框架迁移到另一个
---

将 $0 组件从 $1 迁移到 $2。
保留所有现有行为和测试。
```

```
/migrate-component SearchBar React Vue
```

`$0` = SearchBar，`$1` = React，`$2` = Vue。

---

## 动态上下文注入

用 `!`命令`` 语法在 skill 内容发送给 Claude 之前执行 shell 命令，将输出注入到提示词中：

```yaml
---
name: pr-review
description: 审查当前 PR 的变更
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## PR 上下文
- PR diff: !`gh pr diff`
- PR 评论: !`gh pr view --comments`
- 变更文件列表: !`gh pr diff --name-only`
- 当前分支: !`git branch --show-current`

## 你的任务

审查这个 PR，关注：
1. 逻辑正确性
2. 边界情况处理
3. 安全问题
4. 代码风格和可读性

以评论格式给出具体、可操作的反馈。
```

当这个 skill 运行时：
1. 每个 `!`命令`` 先被执行
2. 输出替换占位符
3. Claude 收到的是包含真实 PR 数据的完整提示词

这是预处理，不是 Claude 执行的代码——Claude 只看到最终结果。

---

## 支持文件：构建复杂 Skill

对于复杂 skill，可以把详细内容分散到多个文件：

```
api-conventions/
├── SKILL.md              # 概览和导航（必须，建议 < 500 行）
├── rest-patterns.md      # REST API 设计规范
├── error-formats.md      # 错误格式标准
└── examples/
    ├── good-endpoint.md  # 好的 API 设计示例
    └── bad-endpoint.md   # 反模式示例
```

在 `SKILL.md` 中引用：

```markdown
## 附加资源

- REST API 模式详见 [rest-patterns.md](rest-patterns.md)
- 错误格式标准详见 [error-formats.md](error-formats.md)
- 好的 API 示例：[examples/good-endpoint.md](examples/good-endpoint.md)
```

好处：`SKILL.md` 保持简洁，大型参考文档只在需要时加载，不会每次都占据上下文空间。

---

## 限制工具访问

用 `allowed-tools` 为 skill 定义工具白名单：

```yaml
---
name: safe-explorer
description: 以只读模式浏览代码库
allowed-tools: Read, Grep, Glob
---

仔细分析 $ARGUMENTS，只读取文件，不做任何修改。
```

这个 skill 激活时，Claude 只能使用 Read、Grep、Glob——不需要用户逐一确认。这既提升了流畅度，又严格限制了权限范围。

---

## 实战示例：代码审查 Skill

这是一个实际可用的代码审查 skill：

```yaml
---
name: code-review
description: 审查指定文件或最近改动的代码质量
allowed-tools: Read, Grep, Glob, Bash(git *)
---

## 审查范围

$ARGUMENTS

如果没有提供参数，审查最近的 git 改动（`git diff HEAD~1`）。

## 审查维度

按优先级排列：

### P0：必须修复
- 安全漏洞（SQL 注入、XSS、未验证的用户输入）
- 逻辑错误（会导致错误结果或崩溃）
- 数据泄露风险（日志中打印敏感信息等）

### P1：建议修复
- 性能问题（N+1 查询、不必要的循环）
- 缺失的错误处理
- 测试覆盖率不足

### P2：可以改进
- 可读性问题
- 代码重复
- 命名不清晰

## 输出格式

对于每个问题：
1. 文件名和行号
2. 问题描述
3. 改进建议（附代码示例）

最后给出总体评分（1-10）和一句话总结。
```

使用：

```
/code-review src/payment/
/code-review                # 审查最近改动
```

---

## 共享 Skill 的策略

**项目团队共享**：把 `.claude/skills/` 提交到版本控制。团队成员 clone 项目后自动获得这些 skill。

**个人 skill 库**：`~/.claude/skills/` 中的 skill 跨所有项目可用，非常适合你的个人工作流程。

**通过插件分发**：如果你想给更广泛的社区分享 skill，可以打包成 Claude Code 插件，包含 `skills/` 目录。

---

## 调试技巧

### Skill 没有触发？

1. 检查 description 是否包含用户会说的关键词
2. 运行 `什么 skills 可用？` 确认 skill 出现在列表中
3. 换个说法，更贴近 description 的语言
4. 直接用 `/skill-name` 手动触发测试

### Skill 触发太频繁？

1. 让 description 更具体
2. 添加 `disable-model-invocation: true`（只允许手动触发）

### Claude 看不到全部 skill？

Skill description 会加载进上下文。如果 skill 太多，可能超过字符预算（默认是上下文窗口的 2%，约 16,000 字符）。运行 `/context` 检查是否有关于 skill 被排除的警告。

可以用环境变量调整限制：

```bash
export SLASH_COMMAND_TOOL_CHAR_BUDGET=32000
```

---

## 本章总结

Skills 是 Claude Code 最强大的个性化机制之一。核心概念回顾：

- **SKILL.md** = skill 的灵魂，YAML frontmatter 控制行为，Markdown 内容是指令
- **`description` 字段** 决定 Claude 何时自动使用 skill
- **`disable-model-invocation: true`** 对有副作用的 skill 至关重要
- **`$ARGUMENTS`** 让 skill 接受动态参数
- **`context: fork`** 让 skill 在独立子 agent 中运行
- **支持文件** 让复杂 skill 保持可维护性

下一章，我们深入 Skill 组合——如何让多个 skill 协同工作，构建复杂的自动化工作流。

---

**下一章：** [Skill 组合](./03-skill-composition.md)
