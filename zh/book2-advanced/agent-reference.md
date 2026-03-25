# 附录 A：Agent 类型速查表

本附录涵盖 Claude Code 中可用的主要 agent 类型，包括内置 agent 角色和常见的自定义 subagent 模式。在设计多 agent 工作流时可作为快速参考。

---

## 内置 Agent 角色

以下是 Claude Code 在不同配置下扮演的主要角色：

| Agent 类型 | 描述 | 适用场景 | 可用工具 |
|------------|------|---------|---------|
| **交互式 agent** | 标准 Claude Code session。接受指令、读取文件、编写代码、运行命令。 | 所有标准开发工作。 | 全部工具：Read、Write、Edit、Bash、Glob、Grep、WebFetch 及配置的 MCP 工具 |
| **Subagent** | 在独立 context window 中运行的派生 agent，将结果报告给父 agent。 | 隔离会填满主 context 的探索；并行研究任务。 | 通过 agent 定义文件的 `tools:` 字段配置 |
| **Plan-mode agent** | Claude 以只读分析模式运行（Shift+Tab 切换）。 | 架构审查、理解陌生代码库、变更前的安全探索。 | Read、Glob、Grep、WebFetch——无 Write/Edit/Bash |
| **非交互式 agent** | 通过 `claude -p "..."` 调用，无交互 session，输出到 stdout。 | CI 流水线、脚本、批量处理、自动化工作流。 | 全部工具，或通过 `--allowedTools` 限制 |
| **Remote Control agent** | 可通过 Web 或移动端访问的本地 Claude Code 进程。 | 从非本地设备继续工作。 | 与交互式 agent 相同（完整本地工具） |
| **Cloud agent** | Web 端 Claude Code，在 Anthropic 托管的 VM 上运行。 | 无需本地环境工作；并行云端 session。 | 受 VM 环境限制；无本地文件系统 |

---

## Subagent 目录

Subagent 定义为 `.claude/agents/` 中的 markdown 文件。以下是按功能分类的常见 subagent 模式：

### 代码质量类 Agent

| Subagent 名称 | 描述 | 适用场景 | 推荐工具 |
|--------------|------|---------|---------|
| **security-reviewer** | 审查代码中的注入漏洞、缺失的认证检查、暴露的 secrets、不安全的依赖。 | 合并任何涉及认证、支付或数据访问的 PR 之前。 | Read、Grep、Glob |
| **test-writer** | 为现有代码生成单元测试和集成测试，遵循仓库中已有的测试模式。 | 实现功能后；为未测试的遗留代码添加覆盖率时。 | Read、Write、Bash（测试运行器） |
| **type-checker** | 审查 TypeScript/Python 类型注解，发现缺失类型、错误泛型、不安全的类型转换。 | 大型重构后；向 JavaScript 代码库添加类型时。 | Read、Bash（tsc/mypy） |
| **linter-fixer** | 修复多个文件中的 lint 错误和格式问题。 | 批量清理任务；迁移到新 lint 规则时。 | Read、Write、Bash（linters） |
| **doc-writer** | 生成或更新内联文档、JSDoc/docstrings、README 文件。 | 实现公开 API 后；保持文档时效性时。 | Read、Write |

### 研究与分析类 Agent

| Subagent 名称 | 描述 | 适用场景 | 推荐工具 |
|--------------|------|---------|---------|
| **codebase-explorer** | 探索陌生代码库，绘制架构图，识别关键文件和模式。 | 加入新项目时；理解继承的代码时。 | Read、Glob、Grep |
| **dependency-auditor** | 审查 package.json/requirements.txt 中过时、存在漏洞或不必要的依赖。 | 重大发布前；季度依赖审查时。 | Read、Bash（npm audit / pip-audit）、WebFetch |
| **performance-profiler** | 分析代码中的性能问题：N+1 查询、不必要的重渲染、算法复杂度。 | 性能调查；生产发布前。 | Read、Grep、Bash |
| **migration-planner** | 分析代码库变更请求，产出带影响评估的逐步迁移计划。 | 大型重构；库升级；架构变更时。 | Read、Glob、Grep |
| **dead-code-detector** | 查找未使用的函数、不可达代码、孤立文件。 | 清理 sprint；大型重构前。 | Read、Glob、Grep、Bash |

### 基础设施与 DevOps 类 Agent

| Subagent 名称 | 描述 | 适用场景 | 推荐工具 |
|--------------|------|---------|---------|
| **ci-debugger** | 分析 CI/CD 失败：读取日志，识别根本原因，提出修复建议。 | 流水线失败原因不明显时。 | Read、Bash、WebFetch |
| **dockerfile-reviewer** | 审查 Dockerfile 的最佳实践：层缓存、安全性、镜像大小。 | 构建生产镜像前；Dockerfile 重构时。 | Read |
| **terraform-reviewer** | 审查 Terraform 配置的安全性、成本效率和最佳实践。 | 应用基础设施变更前。 | Read、Bash（terraform plan） |
| **log-analyzer** | 分析应用日志或错误日志，识别模式和根本原因。 | 生产事故；错误率飙升时。 | Read、Bash、配置的 MCP 工具 |

### 产品与设计类 Agent

| Subagent 名称 | 描述 | 适用场景 | 推荐工具 |
|--------------|------|---------|---------|
| **accessibility-checker** | 审查 UI 代码的 WCAG 合规性、ARIA 属性、键盘导航。 | 发布 UI 功能前；无障碍审计时。 | Read、Bash（axe）、browser MCP |
| **ui-reviewer** | 截取 UI 状态截图，与设计规范对比审查。 | 前端实现审查；视觉回归检查时。 | Read、browser MCP |
| **api-designer** | 审查或设计 REST/GraphQL API 的一致性、REST 最佳实践、版本策略。 | 实现新 API 资源前。 | Read |

---

## Subagent 定义格式

所有 subagent 定义均为 `.claude/agents/` 目录下的 markdown 文件：

```markdown
---
name: agent-name
description: 何时以及为何使用此 agent。Claude 用此决定何时委托任务。
tools: Read, Grep, Glob, Bash    # 逗号分隔；默认为所有工具
model: sonnet                     # 可选：sonnet（默认）、opus、haiku
---

你是一个 [角色描述]。

[agent 应做什么的说明]
[检查什么、如何分析、产出什么]
[输出格式期望]
```

**工具选项：**

| 工具 | 描述 |
|------|------|
| `Read` | 读取文件内容 |
| `Write` | 写入文件（创建或覆盖） |
| `Edit` | 编辑现有文件（字符串替换） |
| `Bash` | 执行 shell 命令 |
| `Glob` | 查找匹配模式的文件 |
| `Grep` | 用正则表达式搜索文件内容 |
| `WebFetch` | 抓取并处理 Web URL |
| `mcp__[server]__[tool]` | 特定 MCP 工具 |

**模型选择指南：**

- `haiku` — 简单重复任务；大批量作业；高并发自动化
- `sonnet` — 默认；大多数编码任务；调查和审查
- `opus` — 复杂架构推理；疑难调试；跨多文件的综合分析

---

## 多 Agent 编排模式

### 调查员 + 实现者模式

```
主 session                      Subagent: codebase-explorer
     |                               |
     |-- "调查认证是如何工作的"       |
     |                               |-- 读取多个文件
     |                               |-- 绘制认证系统图
     |<-- 摘要报告 ------------------|
     |
     |-- （基于摘要实现变更）
```

调查员 subagent 在隔离环境中进行昂贵的文件读取；只有摘要进入主 context。

### 编写者 + 审查者模式

```
Session A（编写者）              Session B（审查者）
     |                               |
     |-- 实现功能                    |
     |-- 提交到分支                  |
     |                               |-- 读取分支 diff
     |                               |-- 审查问题
     |                               |-- 发布审查评论
     |<-- 审查反馈 ------------------|
     |-- 处理反馈                    |
```

### 并行研究模式

```
主 session
     |
     |-- 启动：security-reviewer
     |-- 启动：performance-profiler
     |-- 启动：dependency-auditor
     |
     |<-- 安全报告
     |<-- 性能报告
     |<-- 依赖报告
     |
     |-- 综合所有报告
     |-- 优先排列问题
```

并行运行三个独立分析 agent 比在主 context 中顺序运行速度更快。

---

## Agent SDK

对于需要超越 Claude Code 内置 subagent 系统的完全自定义 agent 工作流，[Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) 提供对 Claude Code 工具和编排能力的编程访问。

Agent SDK 适用于以下场景：

- 超越简单委托的自定义编排逻辑
- 将外部系统集成到 agent 循环中
- 对工具访问和权限的精细控制
- 构建由 Claude Code 能力驱动的产品
- 以编程方式启动和协调 agent teams

**快速示例：**

```typescript
import { AgentRuntime } from "@anthropic-ai/agent-sdk";

const runtime = new AgentRuntime({
  model: "claude-sonnet-4-6",
  tools: ["Read", "Write", "Bash"],
});

const result = await runtime.run(
  "分析 src/auth/ 并生成安全审计报告"
);
```

SDK 处理 context 管理、工具执行和结果流式传输。完整文档见 [platform.claude.com/docs/en/agent-sdk/overview](https://platform.claude.com/docs/en/agent-sdk/overview)。

---

*详细的多 agent 模式见[第四章——Sub-agents 详解](./04-subagents.md)和[第六章——并行 Agent 编排](./06-parallel-agents.md)。*
