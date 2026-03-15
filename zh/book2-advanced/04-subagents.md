# 第四章：Sub-agents 详解

## 什么是 Sub-agent？

Sub-agent 是 Claude Code 生成的专门子进程。每个 sub-agent 都有：

- **独立的上下文窗口**：不共享主对话的历史
- **专属的系统提示词**：定义它的行为和专业域
- **受限的工具访问**：只能使用被授权的工具
- **独立的权限模式**：可以与主会话不同

这与 Skills 不同。Skills 在主对话的上下文中执行；Sub-agent 是真正隔离的进程，做完事情后把结果"汇报"给主对话。

> 重要限制：Sub-agent 不能再生成 sub-agent（不能嵌套）。需要多层嵌套时，使用 [agent teams](https://code.claude.com/docs/en/agent-teams.md) 或通过主对话串联。

---

## 内置 Sub-agents

Claude Code 自带几个内置 sub-agent：

### Explore（探索 agent）

**用途**：读取和分析代码库，不做任何修改

- **模型**：Haiku（快速、低延迟）
- **工具**：只读工具（Read、Grep、Glob 等；禁用 Write、Edit）
- **调用时机**：当 Claude 需要理解代码库但不需要修改时

主对话在需要搜索信息时会自动委托给 Explore agent。搜索产生的大量输出留在 Explore 的上下文里，只有相关的摘要回到主对话——这样主对话的上下文窗口不会被搜索结果塞满。

### Plan（规划 agent）

**用途**：在进入计划模式时收集上下文

- **模型**：继承主对话
- **工具**：只读工具
- **调用时机**：plan mode 下，Claude 需要理解代码库再呈现计划时

防止无限嵌套：sub-agent 不能再生成 sub-agent，所以 Plan agent 用只读工具直接探索，而不是再生成 Explore agent。

### General-purpose（通用 agent）

**用途**：复杂的多步骤任务，需要同时探索和修改

- **模型**：继承主对话
- **工具**：全部工具
- **调用时机**：任务既需要读取又需要写入，且有多个依赖步骤时

---

## 创建自定义 Sub-agent

Sub-agent 是带 YAML frontmatter 的 Markdown 文件：

```markdown
---
name: code-reviewer
description: 专业代码审查，自动在代码改动后触发
tools: Read, Grep, Glob, Bash
model: sonnet
---

你是一位资深代码审查者，确保代码质量和安全性。

被调用时：
1. 运行 git diff 查看最近改动
2. 专注于已修改的文件
3. 立即开始审查

审查清单：
- 代码清晰可读
- 函数和变量命名得当
- 没有重复代码
- 有适当的错误处理
- 没有暴露的密钥或 API key
- 有输入验证
- 测试覆盖率足够
- 性能考虑充分

反馈分优先级：
- 严重问题（必须修复）
- 警告（应该修复）
- 建议（可以改进）

每个问题提供具体的修复示例。
```

### 存放位置

| 位置 | 路径 | 优先级 |
|------|------|--------|
| CLI 参数 `--agents` | 当前 session | 1（最高）|
| 项目级 | `.claude/agents/<name>.md` | 2 |
| 用户级 | `~/.claude/agents/<name>.md` | 3 |
| 插件 | 插件的 `agents/` 目录 | 4（最低）|

同名 sub-agent 以高优先级为准。

---

## Frontmatter 字段完整参考

```yaml
---
name: my-agent                    # 必须，唯一标识符（小写字母和连字符）
description: 何时委托给此 agent   # 必须，Claude 用此决定何时委托
tools: Read, Grep, Bash           # 可用工具，省略则继承全部
disallowedTools: Write, Edit      # 明确禁止的工具
model: sonnet                     # 模型：sonnet/opus/haiku/继承
permissionMode: default           # 权限模式
maxTurns: 20                      # 最大轮数
skills:                           # 预加载的 skills
  - api-conventions
  - error-handling
mcpServers:                       # 此 agent 可用的 MCP 服务器
  - github
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
hooks:                            # 此 agent 的 hooks
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./validate.sh"
memory: user                      # 持久记忆范围：user/project/local
background: true                  # 始终后台运行
isolation: worktree               # 在独立 git worktree 中运行
---
```

---

## 模型选择策略

| 模型 | 适用场景 | 成本 |
|------|---------|------|
| `haiku` | 快速搜索、简单查找、高并发任务 | 低 |
| `sonnet` | 大多数代码任务、平衡点 | 中 |
| `opus` | 复杂架构决策、深度分析 | 高 |
| `inherit` | 使用主对话的模型（默认）| 同主对话 |

实际应用原则：**把 Haiku 用于大量小任务，把 Opus 留给真正复杂的推理**。

---

## 权限模式

`permissionMode` 控制 sub-agent 如何处理权限确认：

| 模式 | 行为 |
|------|------|
| `default` | 标准权限检查，有弹窗提示 |
| `acceptEdits` | 自动接受文件编辑，其他操作仍需确认 |
| `dontAsk` | 自动拒绝权限提示（白名单工具仍正常工作）|
| `bypassPermissions` | 跳过所有权限检查 |
| `plan` | 只读模式（计划模式） |

> `bypassPermissions` 慎用！它完全跳过权限检查，agent 可以执行任何操作。

---

## 前台 vs 后台 Agent

### 前台 Agent（默认）

阻塞主对话，直到完成。权限提示和问题会传给你。

```
使用 code-reviewer agent 审查我最近的改动
```

### 后台 Agent

并发运行，你继续工作。启动前 Claude Code 会预先询问所需权限，之后自动处理。

```
在后台运行 test-runner agent 跑完整测试套件
```

或者按 **Ctrl+B** 把当前运行中的任务推入后台。

**后台 agent 的权限机制**：
1. 启动时预先申请权限
2. 运行中继承这些权限
3. 遇到超出预申请范围的操作时，自动拒绝（而不是弹窗打断你）
4. 如果因权限不足失败，可以在前台恢复并重试

用 `/tasks` 查看后台任务状态。

---

## Agent 隔离：Worktrees

设置 `isolation: worktree` 让 agent 在独立的 git worktree 中运行：

```yaml
---
name: experimental-refactor
description: 在隔离环境中尝试大型重构
isolation: worktree
---

在这个隔离的 worktree 中进行实验性重构。
如果没有做任何改动，worktree 会自动清理。
```

Worktree 隔离的好处：
- Agent 的改动不影响你的工作目录
- 实验失败了，直接丢弃 worktree
- 可以安全地运行破坏性操作

---

## 预加载 Skills

用 `skills` 字段把 skill 内容注入到 agent 的上下文中：

```yaml
---
name: api-developer
description: 按照团队规范实现 API 端点
skills:
  - api-conventions      # 完整内容预加载到 agent 上下文
  - error-handling-patterns
---

实现 API 端点，遵循预加载 skills 中定义的规范和模式。
```

注意：Sub-agent 不会自动继承父对话的 skills，必须在 `skills` 字段中明确列出。

---

## 持久记忆

让 sub-agent 在跨 session 积累知识：

```yaml
---
name: codebase-expert
description: 对这个代码库有深度了解的专家
memory: project
---

你是这个代码库的专家。在工作过程中，把你发现的模式、约定、
关键架构决策记录到 memory 文件中。下次被调用时先读取 memory。

## 记忆更新原则

遇到以下情况时更新记忆：
- 发现不在文档中的代码约定
- 理解了某个模块的设计意图
- 发现了常见的 bug 模式
- 学到了有效的调试策略
```

记忆范围：
- `user`：`~/.claude/agent-memory/<name>/`（跨所有项目）
- `project`：`.claude/agent-memory/<name>/`（项目专属，可提交）
- `local`：`.claude/agent-memory-local/<name>/`（项目专属，不提交）

---

## Agent 之间的通信

Sub-agents 不能直接互相通信，但可以通过主对话间接协调：

### 模式 1：串联

```
使用 researcher agent 分析认证模块的架构，
然后把它的发现传给 developer agent 实现改进。
```

主对话接收 researcher 的输出，然后把相关信息传给 developer。

### 模式 2：并行 + 汇总

```
同时启动三个 agent：
- 用 backend-reviewer 审查 src/api/
- 用 frontend-reviewer 审查 src/components/
- 用 security-scanner 扫描全部代码的安全问题

等三个都完成后，汇总结果。
```

### 模式 3：通过文件通信

Agent 之间可以通过临时文件传递大量数据：

```yaml
---
name: data-processor
description: 处理数据并写入临时文件供其他 agent 使用
---

处理数据并将结果写入 /tmp/analysis-result.json。

结果格式：
{
  "timestamp": "...",
  "findings": [...],
  "metrics": {...}
}
```

---

## 成本与性能考量

### Token 成本

每个 sub-agent 都有自己的上下文窗口，都会产生 token 消耗。

**节省成本的策略**：
- 用 Haiku 处理简单的探索/搜索任务
- 为 sub-agent 设置 `maxTurns` 限制
- 用精确的工具白名单（`tools` 字段），防止 agent 做不必要的操作
- 让 sub-agent 返回摘要而非全量输出

**预估成本**：

```bash
# 监控 sub-agent 的 token 用量
/cost
```

### 延迟考量

- 启动 sub-agent 有额外开销（大约 2-5 秒）
- 适合：耗时任务、不需要即时响应的任务
- 不适合：简单快速查询（用 `/btw` 更好）

### 什么时候不应该用 Sub-agent

- 任务需要频繁来回交互（在主对话里直接做更快）
- 多个阶段共享大量上下文（传递上下文的开销大于收益）
- 简单的单文件改动
- 时效性要求高的任务

---

## 管理 Sub-agents

### 使用 /agents 命令

```
/agents
```

提供交互式界面：
- 查看所有 agent（内置、用户级、项目级）
- 创建新 agent（引导式或让 Claude 生成）
- 编辑现有 agent
- 删除 agent
- 查看哪些 agent 因同名被覆盖

### 命令行列出

```bash
claude agents
```

显示所有已配置的 agent，按来源分组，标注哪些被更高优先级覆盖。

### 禁用特定 Agent

在 settings.json 中禁用：

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

或命令行：

```bash
claude --disallowedTools "Agent(Explore)"
```

---

## CLI 参数定义 Agent

通过 `--agents` 参数在启动时定义临时 agent（不保存到磁盘）：

```bash
claude --agents '{
  "code-reviewer": {
    "description": "代码审查专家，在代码改动后自动触发",
    "prompt": "你是资深代码审查者，关注质量、安全和最佳实践。",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "调试专家，处理错误和测试失败",
    "prompt": "你是专业调试者，分析错误根因并提供修复方案。"
  }
}'
```

适用场景：CI/CD 脚本、快速测试、一次性自动化任务。

---

## 实战示例：Bug 修复 Sub-agent

```markdown
---
name: debugger
description: 调试错误和测试失败的专家。遇到任何问题时自动触发。
tools: Read, Edit, Bash, Grep, Glob
---

你是专业调试者，擅长根因分析。

被调用时：
1. 捕获错误信息和堆栈跟踪
2. 确认复现步骤
3. 定位失败位置
4. 实现最小化修复
5. 验证解决方案

调试流程：
- 分析错误信息和日志
- 检查近期代码改动
- 形成并验证假设
- 添加策略性调试日志
- 检查变量状态

每个问题提供：
- 根因解释
- 支持诊断的证据
- 具体修复代码
- 测试方法
- 预防建议

专注修复底层问题，而非表面症状。
```

---

## 本章总结

Sub-agent 的核心价值：

1. **上下文隔离**：把产生大量输出的任务（跑测试、抓日志）隔离到独立上下文
2. **工具约束**：强制 agent 只能使用特定工具
3. **并行执行**：多个 agent 同时工作在不同部分
4. **专业分工**：每个 agent 在特定领域深度专精
5. **成本控制**：用 Haiku 处理简单任务，降低总成本

下一章我们看 Agent 类型大全——100+ 种专业 agent 的速查指南。

---

**下一章：** [Agent 类型大全](./05-agent-catalog.md)
