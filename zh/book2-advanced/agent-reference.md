# 附录 A：Agent 类型速查表

> Claude Code 中可用的 Sub-agent 类型汇总，快速查找适合你任务的 agent。

---

## 如何使用 Sub-agents

```bash
# 启动 sub-agent 执行特定任务
claude "使用 architect agent 设计这个新功能的技术方案"

# 显式指定 agent 类型
claude --agent code-review "审查 src/payment/ 目录下所有文件"

# 在已有 session 中启动 sub-agent
> 启动一个 test-runner agent 持续监听测试结果
```

---

## 开发类 Agent

| Agent 类型 | 核心职责 | 典型任务 |
|-----------|---------|---------|
| **architect** | 系统设计与技术决策 | 设计新功能架构、评估技术方案、创建 ADR |
| **coder** | 代码实现 | 实现功能、修复 bug、代码重构 |
| **code-reviewer** | 代码审查 | PR 审查、安全检查、最佳实践验证 |
| **refactorer** | 代码重构 | 消除重复、改善结构、现代化老代码 |
| **debugger** | 调试排查 | 定位 bug 根因、分析堆栈跟踪、复现问题 |
| **test-writer** | 测试编写 | 单元测试、集成测试、E2E 测试 |
| **test-runner** | 持续测试 | 监听变更、自动运行测试、报告失败 |
| **doc-writer** | 文档编写 | API 文档、README、内联注释 |

---

## 分析类 Agent

| Agent 类型 | 核心职责 | 典型任务 |
|-----------|---------|---------|
| **codebase-analyst** | 代码库分析 | 理解项目结构、依赖分析、技术债评估 |
| **performance-analyst** | 性能分析 | 识别瓶颈、分析 profiling 数据、提出优化方案 |
| **security-auditor** | 安全审计 | 漏洞扫描、依赖检查、安全最佳实践 |
| **dependency-manager** | 依赖管理 | 升级依赖、解决冲突、移除未使用包 |

---

## 运维类 Agent

| Agent 类型 | 核心职责 | 典型任务 |
|-----------|---------|---------|
| **devops** | CI/CD 配置 | 编写 GitHub Actions、优化构建流程 |
| **database-admin** | 数据库管理 | Schema 设计、Migration 编写、查询优化 |
| **infrastructure** | 基础设施 | Terraform/Docker 配置、环境搭建 |
| **log-analyst** | 日志分析 | 分析错误日志、发现异常模式 |

---

## 协调类 Agent

| Agent 类型 | 核心职责 | 典型任务 |
|-----------|---------|---------|
| **orchestrator** | 任务编排 | 分解复杂任务、协调多个 sub-agents |
| **planner** | 计划制定 | 将需求分解为具体任务列表 |
| **reviewer** | 工作验收 | 验证 sub-agent 的输出质量 |

---

## 并行 Agent 工作流示例

### 大型功能开发

```
用户请求："实现用户评论系统"

Orchestrator Agent 分解任务：
├── Architect Agent → 设计数据模型和 API
├── Coder Agent A → 实现后端 API
├── Coder Agent B → 实现前端组件（并行）
├── Test-writer Agent → 编写测试（并行）
└── Doc-writer Agent → 更新 API 文档（并行）

最终：Reviewer Agent 验收所有输出
```

### 代码库健康检查

```
Health-check Workflow（并行）：
├── Security-auditor Agent → 安全漏洞扫描
├── Performance-analyst Agent → 性能问题识别
├── Dependency-manager Agent → 过期依赖检查
└── Codebase-analyst Agent → 技术债评估

汇总报告生成
```

---

## 在 CLAUDE.md 中定义 Agent 偏好

```markdown
## Sub-agent 配置

### 默认并发数
- 大型任务：最多 3 个并行 agent
- 快速任务：1 个 agent 即可

### 特定场景的 agent 选择
- 修改认证相关代码时：必须同时运行 security-auditor
- 修改数据库 schema 时：先运行 architect，再运行 coder
- PR 提交前：必须运行 code-reviewer 和 test-runner
```

---

## Agent 使用注意事项

**并发限制**：同时运行的 agent 越多，token 消耗越快，成本也成倍增加。建议只在真正可以并行的任务上使用多 agent。

**上下文共享**：Sub-agents 可以共享父 agent 的 context，但各有独立的工作空间。协调 agent 之间的工作成果需要明确设计交接机制。

**错误处理**：如果一个 agent 失败，orchestrator 需要决定是重试、换策略，还是向上报错。在 CLAUDE.md 中定义错误处理策略可以减少中断。
