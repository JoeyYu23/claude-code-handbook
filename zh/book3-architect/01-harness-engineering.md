# 第 1 章：工作框架工程

工作框架工程（Harness Engineering）是指设计一套*工程化系统*，使 Claude Code 在项目、会话和团队中的行为方式得到规范和管控。你不必接受 Claude 的默认行为，而是主动将 CLAUDE.md 指令、Hooks、Skills、Agents 和 Settings 组合成一个"工作框架"——一个可编程的 AI 工作环境，强制执行你的质量标准、自动化繁琐检查，并让复杂工作流变得可靠。

这个比喻非常贴切：工作框架既不是马，也不是骑手，而是连接两者的精心设计的装备——控制方向、保障安全、均匀分配负荷。没有它，原始力量难以驾驭；有了它，即便是新手也能指挥强大的机器。

本章教你构建工作框架，让 Claude Code 按照*你*想要的方式运行。

---

## 什么是工作框架？

工作框架是一套多层配置，它：

1. **声明行为期望** — CLAUDE.md 告诉 Claude 什么对你重要
2. **强制质量门禁** — Hooks 阻止不安全或未经审查的变更
3. **传授可复用模式** — Skills 为 Claude 提供可靠的工作流
4. **委派专项工作** — Agents 在独立上下文中隔离处理特定任务
5. **限制危险操作** — Settings 和权限建立安全边界

没有工作框架，Claude 在孤立状态下运行。每次对话都从零开始，你必须重新解释你的优先级、代码风格、测试标准和团队规范。Claude 往往因缺乏上下文而做出不必要的判断。

有了工作框架，Claude 在一个*有设计的系统*中运行。它启动时就带有你的偏好上下文，在提交代码前自动执行质量检查，知道该调用哪些 Skills，也明白何时应该分叉到专门的 Agent 而非在主上下文中猜测。

结果：更少的上下文说明，更少的失败，更少的意外。

---

## 工作框架的五个层次

一个完整的工作框架包含五个层次，各自承担不同职责：

### 第一层：CLAUDE.md — 行为指令

CLAUDE.md 是位于 `~/.claude/`（个人级）或 `.claude/`（项目级）的纯文本文件，用于告知 Claude 你的价值观、风格和约束。

**它包含什么：**
- 开发理念（例如"优先编辑已有文件；保持最小改动"）
- 代码质量标准（函数大小、命名规范、注释规则）
- 项目特定上下文（技术栈、测试命令、部署流程）
- 应急处理方案（出问题时怎么办）
- 价值观（隐私、自动化、团队规范）

**工作原理：**
Claude 在每次会话启动时读取 CLAUDE.md，并将其视为影响所有决策的"系统上下文"。它是声明式的，而非命令式的——你陈述什么重要，而不是规定 Claude 的每一个具体动作。

**示例个人 CLAUDE.md（虚构用户 alice）：**

```markdown
# Alice 的开发工作框架

## 理念
- 优先迭代改进：先构建最小版本，再逐步完善
- 将错误视为学习机会，而非失败
- 代码可读性 > 聪明的优化

## 代码质量
- 函数不超过 50 行
- 变量名应清楚表达意图
- 避免宽泛的 try/catch 块
- 关键路径采用测试驱动开发

## 项目上下文
- 技术栈：React + Node.js
- 测试命令：`npm test`
- 代码规范工具：ESLint + Prettier
- 必须在 5 秒内可运行

## 价值观
- 安全：代码中不含 API 密钥
- 隐私：不推送个人数据
- 可复现性：所有工作纳入 git 管理
```

这**不是** Claude 必须逐条遵守的清单，而是 Claude 用来做出更好判断的上下文。

### 第二层：Hooks — 响应式自动化

Hooks 是在 Claude 执行特定操作时自动触发的 Shell 脚本、HTTP 请求或 AI 提示。它们在不打断工作流的情况下强制执行质量门禁。

**常见 Hook 模式：**

| 触发时机 | 示例 | 用途 |
|---------|---------|---------|
| 提交前 | 对修改的文件运行 Linter | 防止风格违规 |
| 文件编辑后 | 验证 YAML 语法 | 即时发现配置错误 |
| Shell 命令执行前 | 检查命令是否在白名单中 | 防止意外破坏 |
| Agent 启动后 | 记录创建了哪个 Agent | 追踪决策模式 |

**示例 Hook（虚构 acme-app 项目）：**

```json
{
  "Stop": [
    {
      "type": "command",
      "command": ".claude/hooks/verify-before-commit.sh",
      "timeout": 30
    }
  ],
  "Edit": [
    {
      "glob": "src/**/*.ts",
      "type": "command",
      "command": ".claude/hooks/lint-typescript.sh",
      "async": true
    }
  ]
}
```

当 Claude 尝试提交（Stop 触发器）时，此 Hook 运行验证脚本。脚本返回退出码 0 则提交继续，返回 2 则提交被阻止并显示错误信息。

Hooks 是强制执行层。CLAUDE.md *建议*，Hooks *要求*。

### 第三层：Skills — 可复用能力

Skills 是教 Claude 如何可靠执行特定任务的 Markdown 文件。你不必在每个项目中重复造轮子，而是构建一个 Claude 可以按需或自动调用的 Skills 库。

**Skills 的结构：**

每个 Skill 包含：
- 声明名称、描述和元数据的 YAML 前置信息
- Claude 被调用时遵循的 Markdown 指令
- 可选的辅助文件（模板、示例、脚本）供参考

**示例 Skill（虚构 acme-app 项目）：**

```yaml
---
name: test-push
description: Run full test suite before pushing to origin. Ensures no broken commits go upstream.
allowed-tools: Bash(npm test, git push *)
---

## Before pushing:

1. **Run the test suite:** `npm test`
2. **Check git status:** `git status`
3. **Review uncommitted changes:** Are there any unexpected files?
4. **Report results:** Tell the user if tests passed and git is clean
5. **Only after tests pass:** Push with `git push origin main`

If any test fails, stop and ask the user to fix it first.
```

当你输入 `/test-push` 时，Claude 严格按照这些指令执行。当 Claude 准备自行推送代码时，它会在上下文中看到这个 Skill，并在相关情况下自动调用。

### 第四层：Agents — 专职工作者

Agents 是专注的 Claude 子实例，在独立环境中运行，拥有各自的系统提示和工具访问权限。当你希望将大型任务拆分成更小的、可独立验证的部分时，就可以使用 Agents。

**常见 Agent 模式：**

| Agent | 专业方向 | 工具访问 | 示例 |
|-------|---|---|---|
| Explore | 快速代码搜索与分析 | 只读 | 在规划前了解新代码库 |
| Plan | 代码库研究与规格制定 | 只读 | 在实现前收集需求 |
| Review | 代码质量与安全评估 | 只读 | 合并前的同行评审 |
| Validator | Schema 与 API 合约检查 | Read、Bash | 验证数据格式和集成 |

**何时使用 Agents：**

- **上下文隔离：** 正在处理复杂的 10 文件功能，不想让探索性搜索的噪音污染主上下文
- **专项判断：** 需要一个专注的"代码评审员"，不受实现细节干扰
- **并行工作：** 希望在另一个 Agent 开始实现的同时调研需求
- **Token 预算：** 需要在严格的 Token 限制内工作，希望将高消耗操作隔离出去

**示例 Agent 配置（虚构）：**

```yaml
---
name: Code Reviewer
context: fork
model: claude-opus
tools: Read
system_prompt: |
  You are an expert code reviewer. Examine pull requests for:
  - Security issues (input validation, injection risks)
  - Performance bottlenecks
  - Unclear code that violates project style
  Do not suggest minor refactorings. Focus on bugs and clarity.
---

When reviewing code, follow this checklist:

1. Read the PR description first
2. List all changed files
3. For each critical change, ask:
   - Could this fail at scale?
   - Could this be exploited?
   - Does this violate project style?
4. Report only critical issues
```

### 第五层：Settings 与权限 — 安全边界

Settings 是配置文件（通常是 `.claude/` 中的 `settings.json`），用于限制 Claude 可以使用哪些工具以及在什么条件下使用。

**关键配置类型：**

- **allowed-tools：** Claude 可以运行哪些 Bash 命令（及其参数）
- **blocked-commands：** Claude 绝对不能运行的 Shell 命令
- **edit-restrictions：** Claude 可以修改哪些文件（例如禁止编辑 `.env`）
- **permission-mode：** 读取、执行、编辑或全栈模式
- **force-branch：** 要求所有 git 操作在特定分支上进行
- **require-approval：** 危险操作前需要人工确认

**示例 settings.json（虚构 acme-app 项目）：**

```json
{
  "force-branch": "main",
  "blocked-commands": [
    "rm -rf",
    "sudo",
    "kill -9"
  ],
  "allowed-tools": {
    "Bash": ["npm test", "npm build", "git *"],
    "Write": {
      "glob": ["src/**/*.ts", "src/**/*.tsx"],
      "blocked": [".env", ".env.local", "secrets.json"]
    }
  },
  "require-approval": {
    "triggers": ["git push", "npm publish"],
    "prompt": "Do you approve this action?"
  }
}
```

有了这套配置，Claude 在任何情况下都不能运行 `rm -rf`，不能编辑 `.env`，且在推送 git 前必须等待你的确认。

---

## 设计原则

有效的工作框架遵循五条原则：

### 原则一：声明式而非命令式

陈述*什么*对你重要，而不是*Claude 在每个场景中应该怎么做*。

差（命令式）："当用户要求重构时，你必须先运行 Linter，再运行测试，然后请求批准。"

好（声明式）："我们优先保证正确性。Lint 和测试是不可商量的底线。我们采用测试驱动开发。"

Claude 会从声明中推断正确的行为。你不需要微管理每一个步骤。

### 原则二：故障安全的默认值

设置保守的默认值。危险操作需要*明确选择开启*，而不是选择关闭。

差："Claude 可以删除文件，除非被明确禁止。"

好："Claude 不能删除文件。如需允许删除，必须显式批准或将该操作添加到 allowed-tools。"

### 原则三：可观察的行为（日志与日志记录）

工作框架应当透明。你必须能够回答：
- Claude 做出了哪些决策？
- 哪些 Hooks 运行了，为什么？
- 启动了哪些 Agents？
- 应用了哪些规则？

使用 Hooks 将决策记录到文件或外部系统。使用日志记录创建对话的永久记录。这不是监控，而是理解你的工作框架在做什么。

### 原则四：分层强制

不同层次的强制力度不同：

1. **CLAUDE.md** — 软引导（Claude 应当遵循，但不被阻止忽略）
2. **Hooks** — 中等强制（Hooks 可以阻止操作，但通过脚本实现，非绝对）
3. **Settings** — 硬性强制（Settings 从根本上阻止工具被使用）

设计良好的工作框架同时使用这三个层次：CLAUDE.md 管口味，Hooks 保质量，Settings 守安全。

### 原则五：可组合性

Skills 和 Agents 应该是可组合的构建块，而非单体脚本。每个 Skill 应该把一件事做好。每个 Agent 应该有清晰的职责范围。它们应该协同工作，而不产生相互依赖。

差：一个涵盖测试、Lint、发布和通知的单一"deploy" Skill。

好：独立的"test"、"lint"、"release"和"notify" Skills，在工作流中组合使用。

---

## 计划→工作→审查模式

最成熟的工作框架遵循三阶段循环：

### 阶段一：计划

在写任何代码之前，先建立一份契约。计划者 Agent（或用户）记录：
- 要构建什么？
- 怎么判断它完成了？
- 存在哪些风险？
- 实现顺序是什么？

输出：`Plans.md`，包含清晰的验收标准。

### 阶段二：工作

工作 Agent（或你的主 Claude 会话）按计划实现。工作进行时：
- Hooks 强制质量门禁（Lint、测试）
- 自我审查 Skills 验证工作是否符合计划
- 子 Agents 处理专项任务（安全审查、性能分析）

输出：已完成、已测试、已审查的代码。

### 阶段三：审查

合并前，审查 Agent 从多个角度检查工作：
- 是否符合计划？
- 是否存在安全问题？
- 是否存在性能瓶颈？
- 是否遵循代码风格？
- 是否存在边界情况？

输出：已批准、已记录、可合并的代码。

只有审查通过后，代码才会合并。这个循环确保代码到达 main 分支时，已经经过多个视角的检查并通过了多道质量门禁。

---

## 模式目录：常见工作框架模式

### 模式一：自动质量

**目标：** 在每次文件编辑时自动运行 Lint 和测试。

**实现方式：**

1. 创建一个在每次文件编辑时触发的 Hook
2. Hook 运行 ESLint 和格式化工具
3. 如果 Lint 失败，Hook 阻止编辑并显示错误信息

**示例 Hook：**

```json
{
  "Edit": [
    {
      "glob": "src/**/*.{ts,tsx}",
      "type": "command",
      "command": ".claude/hooks/lint-ts.sh",
      "timeout": 20
    }
  ]
}
```

**好处：** Claude 永远不会提交未经 Lint 的代码。你再也不需要问"你 Lint 了吗？"

### 模式二：日志记录

**目标：** 为所有 Claude 的决策和工作创建不可变的日志。

**实现方式：**

1. 创建一个在每个主要事件（Agent 启动、提交、工具使用）时触发的 Hook
2. Hook 将内容写入 `.claude/journal/<date>.md`
3. 每条记录包含时间戳、操作和上下文

**示例日志条目：**

```markdown
## 2025-03-26

### 09:15 — Agent spawned: Explore
- Reason: Understanding new codebase section
- Duration: 3m 42s
- Result: Found 7 relevant files

### 09:20 — Commit: feat: add user authentication
- Files: 3 modified, 2 added
- Tests: 12 new, all passing
- Hooks: lint ✓, test ✓, security ✓
```

**好处：** 拥有完整记录。调试变得更容易。你可以追踪 Claude 行为中的规律。

### 模式三：安全门禁

**目标：** 防止破坏性操作在未明确批准的情况下执行。

**实现方式：**

1. 使用 settings.json 屏蔽危险命令
2. 创建一个安全实现"危险"操作的 Skill（带确认步骤）
3. 用户通过调用该 Skill 代替原始命令

**示例：**

```json
{
  "blocked-commands": ["rm -rf", "git reset --hard"]
}
```

转而创建 `/safe-delete` Skill：

```yaml
---
name: safe-delete
description: Safely delete files with confirmation
---

1. Ask user: "Delete {{file}}? This cannot be undone."
2. Only if user confirms, run: rm {{file}}
3. Report: "File deleted."
```

**好处：** 防止意外破坏。传授安全操作模式。

### 模式四：领域专长

**目标：** 向 Claude 提供它默认不具备的领域特定知识。

**实现方式：**

1. 为每个领域创建 Skill（AWS 部署、GraphQL Schema 设计等）
2. Skill 包含最佳实践、常见陷阱和示例
3. Claude 在相关情况下自动调用

**示例 Skill（虚构）：**

```yaml
---
name: deploy-aws-lambda
description: Deploy Node.js code to AWS Lambda with best practices for cold starts, IAM, and monitoring.
---

When deploying to AWS Lambda:

1. **Choose the right memory:** 128 MB is too small; start with 1024 MB
2. **Bundle dependencies:** Ensure node_modules is included in the zip
3. **Use environment variables** for secrets, never hardcode
4. **Set appropriate timeout:** 60 seconds is common, but depends on use case
5. **Monitor CloudWatch Logs:** Always check logs after deployment
```

**好处：** Claude 随时获得专家指导，无需你每次解释。

### 模式五：记忆

**目标：** 在会话之间共享知识。

**实现方式：**

1. 在 `.claude/CLAUDE.md` 中存储项目上下文
2. 使用 Hooks 在新模式出现时更新 CLAUDE.md
3. 使用日志记录创建可搜索的项目历史
4. 在 `DECISIONS.md` 文件中存储常见决策

**示例 DECISIONS.md（虚构）：**

```markdown
# Architecture Decisions

## 2025-03-20 — Use React hooks instead of class components
- Decided: All new code must use hooks
- Rationale: Simpler, composable, easier to test
- Exception: Existing class components are left as-is

## 2025-03-15 — API responses use camelCase
- Decided: API always returns `firstName`, not `first_name`
- Rationale: Consistency with JavaScript conventions
- Enforced by: OpenAPI schema validation
```

**好处：** Claude 记住过去的决策和原因。你不需要每次会话都重新解释架构。

---

## 构建你的第一个工作框架：分步指南

以下是为虚构项目 `acme-app` 构建可运行工作框架的步骤：

### 第一步：创建 CLAUDE.md

```bash
mkdir -p acme-app/.claude
cat > acme-app/.claude/CLAUDE.md << 'EOF'
# ACME App Development Harness

## Philosophy
- Prioritize correctness and user safety
- Code clarity beats clever optimizations
- All changes go through tests and review
- Team-friendly: document decisions

## Code Quality
- TypeScript strict mode enabled
- Functions under 50 lines
- All async operations must have error handling
- No broad try/catch blocks

## Testing
- Jest for unit tests (`npm test`)
- Playwright for e2e tests (`npm run test:e2e`)
- Coverage must stay above 70%
- Before pushing: all tests must pass

## Deployment
- Only deploy from main branch
- Deployment requires manual approval
- Always run pre-deployment checklist
EOF
```

### 第二步：创建 Hook 配置

```bash
cat > acme-app/.claude/hooks.json << 'EOF'
{
  "Edit": [
    {
      "glob": "src/**/*.ts",
      "type": "command",
      "command": ".claude/hooks/lint.sh",
      "async": true
    }
  ],
  "Stop": [
    {
      "type": "command",
      "command": ".claude/hooks/pre-commit.sh",
      "timeout": 30
    }
  ]
}
EOF
```

### 第三步：创建 Hook 脚本

```bash
mkdir -p acme-app/.claude/hooks

cat > acme-app/.claude/hooks/lint.sh << 'EOF'
#!/bin/bash
# Lint TypeScript files

FILE=$1
npx eslint "$FILE" --fix 2>&1

if [ $? -ne 0 ]; then
  echo "Linting failed for $FILE"
  exit 2
fi

exit 0
EOF

chmod +x acme-app/.claude/hooks/lint.sh

cat > acme-app/.claude/hooks/pre-commit.sh << 'EOF'
#!/bin/bash
# Run tests before committing

npm test --coverage 2>&1

if [ $? -ne 0 ]; then
  echo "Tests failed. Fix before committing."
  exit 2
fi

exit 0
EOF

chmod +x acme-app/.claude/hooks/pre-commit.sh
```

### 第四步：创建 Skill

```bash
mkdir -p acme-app/.claude/skills/test-and-push

cat > acme-app/.claude/skills/test-and-push/SKILL.md << 'EOF'
---
name: test-and-push
description: Run full test suite and push to origin only if tests pass
---

## Before pushing to origin:

1. Run the test suite: `npm test`
2. Check coverage: Coverage must be > 70%
3. Check git status: Are there uncommitted changes?
4. If all checks pass: `git push origin main`
5. If any check fails: Stop and report the error

Only push if all tests pass.
EOF
```

### 第五步：创建 Settings

```bash
cat > acme-app/.claude/settings.json << 'EOF'
{
  "force-branch": "main",
  "blocked-commands": [
    "rm -rf",
    "git reset --hard",
    "npm publish"
  ],
  "allowed-tools": {
    "Bash": ["npm test", "npm run build", "git *"],
    "Edit": {
      "blocked": [".env", ".env.local", ".aws"]
    }
  },
  "require-approval": {
    "triggers": ["git push"]
  }
}
EOF
```

### 第六步：测试工作框架

1. 在 `acme-app` 目录中启动 Claude Code 会话
2. 问 Claude："What do you know about this project?"
3. Claude 应读取 `.claude/CLAUDE.md` 并描述工作框架
4. 要求 Claude 做一次测试编辑（例如"Add a console.log to src/main.ts"）
5. Hook 应该运行并强制执行 Lint
6. 验证 Claude 无法编辑 `.env`（被 Settings 阻止）

---

## 反模式：不应该做什么

### 反模式一：过度配置

**问题：** 为一个小项目创建了 50 个 Hooks、30 个 Skills 和 5 个 Agents。

**为何失败：** 工作框架变成维护负担。Hooks 相互冲突，Skills 重复，Claude 花大量时间读配置而不是做工作。

**解决方法：** 从最小化开始。只有在 Claude 没有某个层次就会出问题时，才添加那一层。单个 CLAUDE.md + 两个 Hooks 通常就够用了。

### 反模式二：层次冲突

**问题：** CLAUDE.md 说"始终先测试"，但 Settings 允许跳过测试。Hooks 强制 TypeScript 严格模式，但某个 Skill 禁用了它。

**为何失败：** Claude 收到相互矛盾的指令，陷入瘫痪。工作框架的可信度崩溃。

**解决方法：** 各层次应该相互强化，而非相互矛盾。关键事项在 Settings 层强制，灵活事项保留在 CLAUDE.md。

### 反模式三：频繁阻断的 Hooks

**问题：** 某个 Hook 因规则过于严苛，80% 的情况下都会阻断 Claude 的工作。

**为何失败：** Claude 学会绕过 Hook 而非尊重它。你不得不花时间解释各种例外情况。

**解决方法：** 让规则切实可行。如果规则阻断得太频繁，说明规则本身有问题，应修改或删除。

### 反模式四：被弃置的日志和决策记录

**问题：** 设置了日志系统，却从不阅读。创建了 DECISIONS.md，却不更新。

**为何失败：** 工作框架记录了决策，但你没有从中获益。Claude 忘记了过去的决策，因为它们不在记忆中。

**解决方法：** 每周回顾日志。出现新模式时更新 DECISIONS.md。使用 `/memory` 重新加载过去的决策。

### 反模式五：在 CLAUDE.md 中硬编码具体细节

**问题：** CLAUDE.md 中写着："处理 dashboard 时，始终使用 react-grid-layout 库。"

**为何失败：** CLAUDE.md 变成维护噩梦。你无法在不修改 CLAUDE.md 的情况下更改决策，而且它因过于具体而失去可复用性。

**解决方法：** 保持 CLAUDE.md 通用和永恒。用 Skills 处理具体模式，用决策文件记录项目特定的选择。

---

## 参考资料

1. **Anthropic Engineering Blog** — "Effective Harnesses for Long-Running Agents" ([anthropic.com/engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents))
2. **Anthropic Engineering Blog** — "Harness Design for Long-Running Application Development" ([anthropic.com/engineering](https://www.anthropic.com/engineering/harness-design-long-running-apps))
3. **HumanLayer Blog** — "Skill Issue: Harness Engineering for Coding Agents" ([humanlayer.dev/blog](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents))
4. **GitHub — Chachamaru127/claude-code-harness** — Plan-Work-Review cycle implementation ([github.com](https://github.com/Chachamaru127/claude-code-harness))
5. **GitHub — ChrisWiles/claude-code-showcase** — Real-world harness configurations ([github.com](https://github.com/ChrisWiles/claude-code-showcase))
6. **Claude Code Official Docs** — Custom Skills & Agents ([claude.ai](https://claude.ai))

---

## 关键要点

- 工作框架不是配置文件，而是一套*工程化系统*，使 Claude Code 的行为可靠且可预测。
- 五个层次——CLAUDE.md、Hooks、Skills、Agents、Settings——各自承担不同职责。
- 有效的工作框架遵循五条原则：声明式、故障安全、可观察、分层、可组合。
- 计划→工作→审查循环确保每个阶段的质量。
- 从最小化开始，只有在 Claude 没有某个层次就会出问题时才添加复杂性。
- 你的工作框架是一个活的系统，每季度回顾一次，随着模式涌现不断精炼。

---

**接下来：** [第 2 章 — Agent 团队](./02-agent-teams.md) — 编排多个 Claude Code 会话协同工作。
