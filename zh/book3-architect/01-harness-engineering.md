# 第 1 章：工程化系统

工程化系统是设计一个*工程化系统*的实践，该系统规范了 Claude Code 在项目、会话和团队中的行为方式。与其接受 Claude 的默认行为，你故意将 CLAUDE.md 指令、钩子、技能、智能体和设置组合成一个"工程化系统" — 一个可编程的 AI 工作环境，强制你的标准、自动化繁琐的检查并使复杂的工作流可靠。

隐喻是恰当的：工程化系统不是马或骑手。这是仔细设计的设备连接它们 — 控制方向、强制安全并有效分配负载。没有它，原始力量是不可预测的。有了它，即使新手也可以引导强大的机器。

本章教你构建工程化系统，使 Claude Code 以*你*想要的方式工作。

---

## 什么是工程化系统？

工程化系统是一个多层配置，它：

1. **声明行为期望** — CLAUDE.md 告诉 Claude 什么对你很重要
2. **强制质量门** — 钩子防止不安全或未经审查的更改
3. **教授可复用模式** — 技能为 Claude 提供可靠的工作流
4. **委托专注工作** — 智能体在独立上下文中隔离离散任务
5. **限制危险操作** — 设置和权限建立安全栏

没有工程化系统，Claude 隔离运行。每次对话都是新的。你必须重新解释你的优先级、你的代码风格、你的测试标准、你的团队实践。Claude 经常做不必要的决定，因为它缺乏关于什么对你很重要的上下文。

有了工程化系统，Claude 在一个*设计的系统*内运行。它以你的偏好的上下文启动。在提交代码之前自动运行质量检查。它知道哪些技能要使用。它理解何时分叉到专门智能体而不是在主上下文中猜测。

结果：较少的上下文解释、较少的失败、较少的惊喜。

---

## 工程化系统的五个层

一个完整的工程化系统有五个层，每个服务于一个不同的角色：

### 第 1 层：CLAUDE.md — 行为指令

CLAUDE.md 是 `~/.claude/`（个人）或 `.claude/`（项目级）中的纯文本文件，教 Claude 你的价值观、风格和限制。

**它包含：**
- 开发理念（例如，"倾向编辑现有文件；最小更改"）
- 代码质量标准（函数大小、命名、评论）
- 项目特定上下文（技术栈、测试命令、部署过程）
- 应急过程（某些东西破裂时做什么）
- 价值观（隐私、自动化、团队实践）

**它如何工作：**
Claude 在每个会话启动时读取 CLAUDE.md 并将其视为"系统上下文"，形成所有决定。它是声明性的，不是命令性的 — 你陈述什么很重要，不是 Claude 应该采取的每个行动。

**示例个人 CLAUDE.md（虚构用户 alice）：**

```markdown
# Alice 的开发工程化系统

## 哲学
- 倾向迭代细化：构建最小版本，然后改进
- 假设错误是学习，不是失败
- 代码可读性 > 聪明的优化

## 代码质量
- 函数少于 50 行
- 变量名应该解释意图
- 避免宽泛的 try/catch 块
- 关键路径的测试优先

## 项目上下文
- 技术：React + Node.js
- 测试命令：`npm test`
- 提示：ESLint + Prettier
- 必须在 5 秒内可运行

## 价值观
- 安全：代码中无 API 密钥
- 隐私：永不推送个人数据
- 可重现性：所有工作在 git 中
```

这 **不是** Claude 必须遵循的检查清单。这是 Claude 用来做更好决定的上下文。

### 第 2 层：钩子 — 反应式自动化

钩子是 shell 脚本、HTTP 请求或 AI 提示，当 Claude 采取特定操作时自动运行。它们强制质量门而不中断你的工作流。

**常见钩子模式：**

| 触发器 | 示例 | 目的 |
|---------|---------|---------|
| 提交前 | 在更改文件上运行提示 | 防止风格违规 |
| 文件编辑后 | 验证 YAML 语法 | 立即捕获配置错误 |
| 在 shell 命令前 | 检查命令是否在允许列表中 | 防止意外破坏 |
| 智能体生成后 | 记录哪个智能体被创建 | 追踪决策模式 |

**示例钩子（虚构 acme-app 项目）：**

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

当 Claude 尝试提交（Stop 触发器）时，这个钩子运行验证脚本。如果脚本返回退出代码 0，提交继续。如果返回 2，提交被阻止并出现错误消息。

钩子是强制层。当 CLAUDE.md *建议*时，钩子 *需要*。

### 第 3 层：技能 — 可复用能力

技能是教 Claude 如何可靠地执行特定任务的 markdown 文件。与其在每个项目上重新发明轮子，你构建一个 Claude 可以自动调用的技能库。

**技能解剖：**

每个技能有：
- 声明技能名称、描述和元数据的 YAML 前言
- Claude 在调用技能时遵循的 markdown 指令
- 支持文件的可选部分（模板、示例、脚本）作为参考

**示例技能（虚构 acme-app 项目）：**

```yaml
---
name: test-push
description: 推送前运行完整测试套件。确保没有破坏的提交上游。
allowed-tools: Bash(npm test, git push *)
---

## 推送前：

1. **运行测试套件：** `npm test`
2. **检查 git 状态：** `git status`
3. **审查未提交的更改：** 有任何意外的文件吗？
4. **报告结果：** 告诉用户测试是否通过以及 git 是否干净
5. **仅在测试通过后：** 用 `git push origin main` 推送

如果任何测试失败，停止并要求用户先修复它。
```

当你输入 `/test-push` 时，Claude 完全遵循这些指令。当 Claude 即将自己推送代码时，它看到这个技能在上下文中并在相关时自动调用。

### 第 4 层：智能体 — 专注的工作者

智能体是专注的 Claude 子实例，工作隔离，有其自己的系统提示和工具访问。当你想将大任务拆分成较小的独立可验证的片段时，你使用智能体。

**常见智能体模式：**

| 智能体 | 专业化 | 工具访问 | 示例 |
|-------|---|---|---|
| 探索 | 快速代码搜索与分析 | 仅读 | 在计划前理解新代码库 |
| 计划 | 代码库研究以获得规范 | 仅读 | 在实现前收集需求 |
| 审查 | 代码质量与安全评估 | 仅读 | 合并前的同行审查 |
| 验证器 | 模式与 API 合同检查 | 读、Bash | 验证数据格式和集成 |

**何时使用智能体：**

- **上下文隔离：** 你在处理复杂的 10 文件功能，不想要探索搜索噪音在你的主上下文中
- **专门判断：** 你想要一个专注的"代码审查员"，不受实现细节分散
- **平行工作：** 你想在另一个智能体开始实现时研究需求
- **令牌预算：** 你需要在严格的令牌限制内工作，想要隔离昂贵的操作

**示例智能体配置（虚构）：**

```yaml
---
name: Code Reviewer
context: fork
model: claude-opus
tools: Read
system_prompt: |
  你是一位专家代码审查员。检查拉取请求以查找：
  - 安全问题（输入验证、注入风险）
  - 性能瓶颈
  - 违反项目风格的不清楚代码
  不建议小的重构。专注于错误和清晰。
---

审查代码时，遵循这个检查清单：

1. 首先读取 PR 描述
2. 列出所有更改的文件
3. 对于每个关键更改，询问：
   - 这可能在规模上失败吗？
   - 这可能被利用吗？
   - 这违反项目风格吗？
4. 仅报告关键问题
```

### 第 5 层：设置与权限 — 安全栏

设置是限制 Claude 可以使用哪些工具以及在什么条件下的配置文件（通常是 `.claude/` 中的 `settings.json`）。

**关键设置类型：**

- **allowed-tools：** Claude 可以运行哪些 bash 命令（及其参数）
- **blocked-commands：** Claude 必须永不运行的 shell 命令
- **edit-restrictions：** Claude 可以修改哪些文件（例如，阻止编辑 `.env`）
- **permission-mode：** 读、执行、编辑或全堆栈
- **force-branch：** 需要所有 git 工作在特定分支上
- **require-approval：** 危险操作前的人类批准

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

有了这个配置，Claude 无法在任何情况下运行 `rm -rf`，无法编辑 `.env`，并且在推送到 git 前必须等待你的批准。

---

## 设计原则

有效的工程化系统遵循五个原则：

### 原则 1：声明性而不是命令性

陈述*什么*对你很重要，不是*Claude 在每个场景中应该如何工作*。

坏（命令性）："当用户要求你重构时，你必须运行提示、运行测试，然后要求批准。"

好（声明性）："我们优先考虑正确性。提示和测试是不可协商的。我们使用测试优先开发。"

Claude 从声明推断正确的行为。你不微管理每一步。

### 原则 2：故障安全默认值

设置保守的默认值。需要 *选择加入* 危险操作，不是选择退出。

坏："Claude 可以删除文件，除非被告知否则。"

好："Claude 无法删除文件。要允许删除，你必须显式批准或将操作添加到 allowed-tools。"

### 原则 3：可观察行为（日志与日志）

工程化系统应该是透明的。你必须能够回答：
- Claude 做了哪些决定？
- 哪些钩子运行及为什么？
- 哪些智能体被生成？
- 哪些规则被应用？

使用钩子记录决定到文件或外部系统。使用日志创建对话的永久记录。这不是关于监视 — 这是关于理解你的工程化系统在做什么。

### 原则 4：分层强制

不同的层强制不同的严格级别：

1. **CLAUDE.md** — 软指导（Claude 应该遵循，但不被阻止忽视）
2. **钩子** — 中等强制（钩子可以阻止操作，但是脚本化的，不是不可能的）
3. **设置** — 硬强制（设置防止工具完全使用）

设计良好的工程化系统使用所有三个层。CLAUDE.md 对于品味、钩子对于质量、设置对于安全。

### 原则 5：组合性

技能和智能体应该是可组合的构建块，不是整体脚本。每个技能应该做一件事做得好。每个智能体应该有清晰的责任。它们应该一起工作而不创建依赖关系。

坏：一个包括测试、提示、发布和通知的单一"部署"技能。

好：分离的"测试"、"提示"、"发布"和"通知"技能。在工作流中组合它们。

---

## 计划→工作→审查模式

最成熟的工程化系统遵循三个阶段的循环：

### 阶段 1：计划

在写任何代码前，建立一个合同。计划者智能体（或用户）文档：
- 将构建什么？
- 我们如何知道它完成了？
- 哪些风险存在？
- 实现顺序是什么？

输出：`Plans.md`，清晰的接受标准。

### 阶段 2：工作

工作智能体（或你的主 Claude 会话）实现计划。当工作发生时：
- 钩子强制质量门（提示、测试）
- 自审查技能验证工作与计划匹配
- 子智能体处理专门任务（安全审查、性能分析）

输出：完成、测试、审查的代码。

### 阶段 3：审查

在合并前，审查智能体从多个角度检查工作：
- 它与计划匹配吗？
- 有安全问题吗？
- 有性能瓶颈吗？
- 它遵循代码风格吗？
- 有边缘案例吗？

输出：批准、文档化、合并准备就绪的代码。

只有在审查通过后代码才合并。这个循环确保到达时间，代码已被多个角度检查并通过多个质量门。

---

## 模式目录：常见工程化系统模式

### 模式 1：自动质量

**目标：** 在每个文件编辑上自动运行提示和测试。

**实现：**

1. 创建在每个文件编辑上激活的钩子
2. 钩子运行 eslint 和任何格式化器
3. 如果提示失败，钩子用错误消息阻止编辑

**示例钩子：**

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

**好处：** Claude 永不提交未提示的代码。你永不需要问"你提示了吗？"

### 模式 2：日志

**目标：** 创建所有 Claude 决定和工作的不可改变日志。

**实现：**

1. 创建在每个主要事件上激活的钩子（智能体生成、提交、工具使用）
2. 钩子写到 `.claude/journal/<date>.md`
3. 每个条目包括时间戳、操作和上下文

**示例日志条目：**

```markdown
## 2025-03-26

### 09:15 — 智能体生成：探索
- 原因：理解新代码库部分
- 持续时间：3m 42s
- 结果：找到 7 个相关文件

### 09:20 — 提交：feat: add user authentication
- 文件：3 个修改、2 个添加
- 测试：12 个新、全部通过
- 钩子：提示 ✓，测试 ✓，安全 ✓
```

**好处：** 你有完整的记录。调试变得更容易。你可以追踪 Claude 行为中的模式。

### 模式 3：安全门

**目标：** 防止破坏性操作，除非明确批准。

**实现：**

1. 使用 settings.json 阻止危险命令
2. 创建安全实现"危险"操作的技能（有确认）
3. 用户调用技能而不是原始命令

**示例：**

```json
{
  "blocked-commands": ["rm -rf", "git reset --hard"]
}
```

与其，创建一个 `/safe-delete` 技能：

```yaml
---
name: safe-delete
description: 安全删除带确认的文件
---

1. 询问用户："删除 {{file}}？这无法撤销。"
2. 仅如果用户确认，运行：rm {{file}}
3. 报告："文件已删除。"
```

**好处：** 防止意外破坏。教授安全模式。

### 模式 4：专业知识

**目标：** 用默认情况下没有的域特定知识为 Claude 提供。

**实现：**

1. 为每个域创建技能（AWS 部署、GraphQL 模式设计等）
2. 技能包括最佳实践、常见陷阱、示例
3. Claude 在相关时自动调用

**示例技能（虚构）：**

```yaml
---
name: deploy-aws-lambda
description: 用冷启动、IAM 和监视最佳实践将 Node.js 代码部署到 AWS Lambda。
---

部署到 AWS Lambda 时：

1. **选择正确的内存：** 128 MB 太小；从 1024 MB 开始
2. **捆绑依赖：** 确保 node_modules 包含在 zip 中
3. **环境变量用于秘密，永不硬编码**
4. **设置适当的超时：** 60 秒常见，但取决于用例
5. **监视 CloudWatch 日志：** 部署后总是检查日志
```

**好处：** Claude 拥有即时专家指导而不需要每次解释。

### 模式 5：记忆

**目标：** 跨会话共享知识。

**实现：**

1. 在 `.claude/CLAUDE.md` 中存储项目上下文
2. 当新模式出现时使用钩子来更新 CLAUDE.md
3. 使用日志创建可搜索的项目历史
4. 在 `DECISIONS.md` 文件中存储常见决定

**示例 DECISIONS.md（虚构）：**

```markdown
# 架构决定

## 2025-03-20 — 用 React 钩子而不是类组件
- 已决定：所有新代码必须使用钩子
- 原因：更简单、可组合、更容易测试
- 异常：现有类组件按原样留下

## 2025-03-15 — API 响应使用 camelCase
- 已决定：API 总是返回 `firstName`，不是 `first_name`
- 原因：与 JavaScript 约定一致
- 强制方式：OpenAPI 模式验证
```

**好处：** Claude 记住过去的决定和原因。你不需要每个会话重新解释架构。

---

## 构建你的第一个工程化系统：分步骤

这是如何为虚构项目 `acme-app` 构建工作工程化系统：

### 步骤 1：创建 CLAUDE.md

```bash
mkdir -p acme-app/.claude
cat > acme-app/.claude/CLAUDE.md << 'EOF'
# ACME App 开发工程化系统

## 哲学
- 优先考虑正确性和用户安全
- 代码清晰度击败聪明的优化
- 所有更改通过测试和审查
- 团队友好：文档化决定

## 代码质量
- TypeScript 严格模式启用
- 函数少于 50 行
- 所有异步操作必须有错误处理
- 无宽泛 try/catch 块

## 测试
- Jest 单位测试（`npm test`）
- Playwright e2e 测试（`npm run test:e2e`）
- 覆盖必须超过 70%
- 推送前：所有测试必须通过

## 部署
- 仅从 main 分支部署
- 部署需要手动批准
- 总是运行前部署检查清单
EOF
```

### 步骤 2：创建钩子配置

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

### 步骤 3：创建钩子脚本

```bash
mkdir -p acme-app/.claude/hooks

cat > acme-app/.claude/hooks/lint.sh << 'EOF'
#!/bin/bash
# 提示 TypeScript 文件

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
# 提交前运行测试

npm test --coverage 2>&1

if [ $? -ne 0 ]; then
  echo "Tests failed. Fix before committing."
  exit 2
fi

exit 0
EOF

chmod +x acme-app/.claude/hooks/pre-commit.sh
```

### 步骤 4：创建技能

```bash
mkdir -p acme-app/.claude/skills/test-and-push

cat > acme-app/.claude/skills/test-and-push/SKILL.md << 'EOF'
---
name: test-and-push
description: 运行完整测试套件并仅在测试通过时推送到原点
---

## 推送到原点前：

1. 运行测试套件：`npm test`
2. 检查覆盖：覆盖必须 > 70%
3. 检查 git 状态：有任何未提交的更改吗？
4. 如果所有检查通过：`git push origin main`
5. 如果任何检查失败：停止并报告错误

仅在所有测试通过时推送。
EOF
```

### 步骤 5：创建设置

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

### 步骤 6：测试工程化系统

1. 在 `acme-app` 目录启动 Claude Code 会话
2. 要求 Claude："What do you know about this project?"
3. Claude 应该读取 `.claude/CLAUDE.md` 并描述工程化系统
4. 要求 Claude 做一个测试编辑（例如，"Add a console.log to src/main.ts"）
5. 钩子应该运行并强制提示
6. 验证 Claude 无法编辑 `.env`（被设置阻止）

---

## 反模式：不要做什么

### 反模式 1：过度配置

**问题：** 你为小项目创建 50 个钩子、30 个技能和 5 个智能体。

**为什么失败：** 工程化系统变成维护负担。钩子冲突。技能重复。Claude 花时间读配置而不是做工作。

**修复：** 从最小开始。仅添加工程化系统层当 Claude 在没有它们时失败。单个 CLAUDE.md + 两个钩子通常足够。

### 反模式 2：冲突的层

**问题：** CLAUDE.md 说"总是测试优先"，但设置允许跳过测试。钩子强制 TypeScript 严格模式，但技能禁用它。

**为什么失败：** Claude 获得矛盾的指令并变得瘫痪。工程化系统信誉被打破。

**修复：** 层应该加强，不冲突。如果某些东西关键，在设置层强制。如果灵活，保留在 CLAUDE.md 中。

### 反模式 3：经常阻止的钩子

**问题：** 钩子 80% 的时间阻止 Claude 工作，因为规则太严格。

**为什么失败：** Claude 学会绕过钩子而不是尊重它。你花时间解释异常。

**修复：** 做出规则现实。如果规则阻止太频繁，这是一个坏规则。修改或删除它。

### 反模式 4：放弃的日志与决定

**问题：** 你设置日志，但永不读它。你创建 DECISIONS.md，但不更新它。

**为什么失败：** 工程化系统记录决定，但你不受益。Claude 忘记过去的决定，因为它们不在记忆中。

**修复：** 每周审查日志。当新模式出现时更新 DECISIONS.md。使用 `/memory` 重新加载过去的决定。

### 反模式 5：在 CLAUDE.md 中硬编码特定

**问题：** CLAUDE.md 包含："处理仪表板时，总是使用 react-grid-layout 库。"

**为什么失败：** CLAUDE.md 变成维护噩梦。你无法改变决定而不编辑 CLAUDE.md。它变得太特定于可复用。

**修复：** 保持 CLAUDE.md 一般和无时间限制。用技能处理具体模式。用决定文件处理项目特定的选择。

---

## 参考资料

1. **Anthropic 工程博客** — "有效的长期运行智能体工程化系统" ([anthropic.com/engineering](https://www.anthropic.com/engineering))
2. **Anthropic 工程博客** — "长期运行应用开发的工程化系统设计" ([anthropic.com/engineering](https://www.anthropic.com/engineering))
3. **HumanLayer 博客** — "技能问题：编码智能体工程化系统" ([humanlayer.dev/blog](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents))
4. **GitHub — Chachamaru127/claude-code-harness** — 计划-工作-审查循环实现 ([github.com](https://github.com/Chachamaru127/claude-code-harness))
5. **GitHub — ChrisWiles/claude-code-showcase** — 真实工程化系统配置 ([github.com](https://github.com/ChrisWiles/claude-code-showcase))
6. **Claude Code 官方文档** — 自定义技能与智能体 ([claude.ai](https://claude.ai))

---

## 关键要点

- 工程化系统不是配置。这是一个*工程化系统*，使 Claude Code 行为可靠和可预测。
- 五层 — CLAUDE.md、钩子、技能、智能体、设置 — 每个服务于不同的目的。
- 有效的工程化系统遵循五个原则：声明性、故障安全、可观察、分层、可组合。
- 计划-工作-审查循环确保每个阶段的质量。
- 从最小开始。仅当 Claude 在没有它们时失败时添加复杂性。
- 你的工程化系统是活的系统。季度审查它。随着模式出现进行细化。

---

## 下一章

一旦你理解工程化系统作为系统，第 2 章涵盖**信息架构** — 如何结构化 CLAUDE.md、技能和智能体使它们从单独项目扩展到大型团队。
