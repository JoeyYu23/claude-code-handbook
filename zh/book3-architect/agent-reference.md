# 附录 A：Agent 类型参考

本参考文档涵盖 Claude Code 中可用的主要 agent 类型，包括内置 agent 角色和常见的自定义子 agent 模式。设计多 agent 工作流时可将此文档作为快速参考。

---

## 内置 Agent 角色

以下是 Claude Code 在不同配置下所扮演的主要角色：

| Agent 类型 | 描述 | 适用场景 | 可用工具 |
|------------|------|----------|---------|
| **交互式 agent** | 标准的 Claude Code session。接收指令、读取文件、编写代码、运行命令。 | 所有标准开发工作。 | 全部工具：Read、Write、Edit、Bash、Glob、Grep、WebFetch 以及已配置的 MCP 工具 |
| **子 agent** | 在独立 context window 中运行的派生 agent，将结果汇报给父 agent。 | 隔离会消耗大量主 context 的探索任务；并行研究任务。 | 通过 agent 定义文件（`tools:` 字段）配置 |
| **计划模式 agent** | Claude 在只读分析模式下运行（Shift+Tab 切换）。 | 架构审查、了解陌生代码库、变更前的安全探索。 | Read、Glob、Grep、WebFetch — 无 Write/Edit/Bash |
| **非交互式 agent** | 通过 `claude -p "..."` 调用的 Claude Code。无交互 session，结果输出到 stdout。 | CI 流水线、脚本、批量处理、自动化工作流。 | 全部工具，或通过 `--allowedTools` 限制 |
| **远程控制 agent** | 可通过 web 或移动端访问的本地 Claude Code 进程。 | 从非本地设备继续工作。 | 与交互式 agent 相同（完整本地工具） |
| **云端 agent** | 运行在 Anthropic 托管虚拟机上的 web 版 Claude Code。 | 无需本地环境即可工作；并行云端 session。 | 受虚拟机环境限制；无本地文件系统 |

---

## 子 Agent 目录

子 agent 以 markdown 文件的形式定义在 `.claude/agents/` 目录中。以下是按功能分类整理的常见子 agent 模式：

### 代码质量类 Agent

| 子 Agent 名称 | 描述 | 适用场景 | 推荐工具 |
|--------------|------|----------|---------|
| **security-reviewer** | 审查代码中的注入漏洞、缺失的权限校验、暴露的密钥、不安全的依赖。 | 合并任何涉及认证、支付或数据访问代码的 PR 之前。 | Read、Grep、Glob |
| **test-writer** | 为现有代码生成单元测试和集成测试，遵循仓库中已有的测试模式。 | 功能实现后；为未覆盖的遗留代码补充测试时。 | Read、Write、Bash（测试运行器） |
| **type-checker** | 审查 TypeScript/Python 类型注解，发现缺失类型、错误泛型、不安全的类型转换。 | 大型重构后；为 JavaScript 代码库添加类型时。 | Read、Bash（tsc/mypy） |
| **linter-fixer** | 批量修复跨文件的 lint 错误和格式问题。 | 批量清理任务；迁移到新 lint 规则时。 | Read、Write、Bash（linters） |
| **doc-writer** | 生成或更新内联文档、JSDoc/docstring、README 文件。 | 公共 API 实现后；维护文档时效性时。 | Read、Write |

### 研究与分析类 Agent

| 子 Agent 名称 | 描述 | 适用场景 | 推荐工具 |
|--------------|------|----------|---------|
| **codebase-explorer** | 探索陌生代码库、绘制架构图、识别关键文件和模式。 | 新项目入职；理解继承的代码时。 | Read、Glob、Grep |
| **dependency-auditor** | 审查 package.json/requirements.txt，发现过时、存在漏洞或不必要的依赖。 | 重大发布前；季度依赖审查。 | Read、Bash（npm audit / pip-audit）、WebFetch |
| **performance-profiler** | 分析代码中的性能问题：N+1 查询、不必要的重渲染、算法复杂度。 | 性能排查；生产上线前。 | Read、Grep、Bash |
| **migration-planner** | 分析代码库的变更需求，产出包含影响评估的分步迁移计划。 | 大型重构；库升级；架构变更。 | Read、Glob、Grep |
| **dead-code-detector** | 查找未使用的函数、不可达代码、孤立文件。 | 清理冲刺；大型重构前。 | Read、Glob、Grep、Bash |

### 基础设施与 DevOps 类 Agent

| 子 Agent 名称 | 描述 | 适用场景 | 推荐工具 |
|--------------|------|----------|---------|
| **ci-debugger** | 分析 CI/CD 失败：读取日志、定位根因、提出修复方案。 | 流水线故障原因不明显时。 | Read、Bash、WebFetch |
| **dockerfile-reviewer** | 审查 Dockerfile 的最佳实践：层缓存、安全性、镜像大小。 | 构建生产镜像前；Dockerfile 重构时。 | Read |
| **terraform-reviewer** | 审查 Terraform 配置的安全性、成本效率和最佳实践。 | 应用基础设施变更前。 | Read、Bash（terraform plan） |
| **log-analyzer** | 分析应用日志或错误日志，识别模式和根本原因。 | 生产事故；错误率异常上升时。 | Read、Bash、已配置的 MCP 工具 |

### 产品与设计类 Agent

| 子 Agent 名称 | 描述 | 适用场景 | 推荐工具 |
|--------------|------|----------|---------|
| **accessibility-checker** | 审查 UI 代码的 WCAG 合规性、ARIA 属性、键盘导航。 | 发布 UI 功能前；无障碍访问审计时。 | Read、Bash（axe）、browser MCP |
| **ui-reviewer** | 截取 UI 状态截图并与设计规范对照审查。 | 前端实现审查；视觉回归检测。 | Read、browser MCP |
| **api-designer** | 审查或设计 REST/GraphQL API，关注一致性、REST 最佳实践和版本控制策略。 | 实现新 API 资源前。 | Read |

---

## 子 Agent 定义格式

所有子 agent 定义文件均为 `.claude/agents/` 目录下的 markdown 文件：

```markdown
---
name: agent-name
description: 何时以及为何使用此 agent。供 Claude 判断何时应委托任务。
tools: Read, Grep, Glob, Bash    # 逗号分隔列表；默认使用全部工具
model: sonnet                     # 可选：sonnet（默认）、opus、haiku
---

你是一名 [角色描述]。

[agent 应执行的操作说明]
[检查内容、分析方法、输出成果]
[输出格式要求]
```

**工具选项：**

| 工具 | 描述 |
|------|------|
| `Read` | 读取文件内容 |
| `Write` | 写入文件（创建或覆盖） |
| `Edit` | 编辑现有文件（字符串替换） |
| `Bash` | 执行 shell 命令 |
| `Glob` | 按模式查找文件 |
| `Grep` | 用正则表达式搜索文件内容 |
| `WebFetch` | 获取并处理 web URL |
| `mcp__[server]__[tool]` | 特定 MCP 工具 |

**模型选择指南：**

- `haiku` — 简单、重复性任务；大批量作业；高频自动化
- `sonnet` — 默认选择；大多数编码任务；调查与审查
- `opus` — 复杂的架构推理；疑难 bug 调试；跨多文件的综合分析

---

## 多 Agent 编排模式

### 调查员 + 实施者模式

```
主 session                        子 agent：codebase-explorer
     |                                   |
     |-- "调查 auth 的实现方式"           |
     |                                   |-- 读取大量文件
     |                                   |-- 绘制 auth 系统结构图
     |<-- 摘要报告 --------------------- |
     |
     |-- （根据摘要实施变更）
```

调查员子 agent 在隔离环境中执行耗费资源的文件读取，只有其摘要进入主 context。

### 编写者 + 审查者模式

```
Session A（编写者）               Session B（审查者）
     |                                   |
     |-- 实现功能                        |
     |-- 提交到分支                      |
     |                                   |-- 读取分支 diff
     |                                   |-- 审查问题
     |                                   |-- 发布审查意见
     |<-- 审查反馈 --------------------- |
     |-- 处理反馈                        |
```

### 并行研究模式

```
主 session
     |
     |-- 派生：security-reviewer
     |-- 派生：performance-profiler
     |-- 派生：dependency-auditor
     |
     |<-- 安全报告
     |<-- 性能报告
     |<-- 依赖报告
     |
     |-- 综合所有报告
     |-- 问题优先级排序
```

并行运行三个独立分析 agent 比在主 context 中依次运行速度快得多。

---

## Agent SDK

如需构建超出 Claude Code 内置子 agent 系统能力的完全自定义 agent 工作流，[Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) 提供了对 Claude Code 工具和编排能力的编程式访问。

以下场景适合使用 Agent SDK：

- 需要超出简单委托的自定义编排逻辑
- 作为 agent 循环的一部分与外部系统集成
- 对工具访问权限和权限进行精细控制
- 构建以 Claude Code 能力为底座的产品
- 以编程方式派生和协调 agent 团队

**快速示例：**

```typescript
import { AgentRuntime } from "@anthropic-ai/agent-sdk";

const runtime = new AgentRuntime({
  model: "claude-sonnet-4-6",
  tools: ["Read", "Write", "Bash"],
});

const result = await runtime.run(
  "Analyze src/auth/ and produce a security audit report"
);
```

SDK 负责处理 context 管理、工具执行和结果流式传输。完整文档见 [platform.claude.com/docs/en/agent-sdk/overview](https://platform.claude.com/docs/en/agent-sdk/overview)。

---

*多 agent 模式的详细内容请参见《Book 2》中的 [第 4 章 — 子 Agent 详解](/zh/book2-advanced/04-subagents) 和 [第 6 章 — 并行 Agent 编排](/zh/book2-advanced/06-parallel-agents)。*
