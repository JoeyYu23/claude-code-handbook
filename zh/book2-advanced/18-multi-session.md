# 第十八章：多 Session 工作流

> 跨越多个 session 持续推进长期项目——交接策略、状态保持、平行 session 协作。

---

## 为什么需要多 Session 工作流？

单个 Claude Code session 有自然的生命周期限制：
- Context window 有容量上限
- session 关闭后对话历史不自动恢复
- 长时间任务难以在一个 session 内完成

真实的项目工作可能跨越数天甚至数周。掌握多 session 工作流，是把 Claude Code 变成长期工作伙伴的关键。

---

## 跨 Session 规划工作

### 将大任务拆解为 Session 单元

好的 session 规划原则：每个 session 聚焦一个有明确结束条件的子任务。

```
❌ 差的规划：
"重构整个支付模块" → 一个 session 根本跑不完

✓ 好的规划：
Session 1: 分析现有支付模块，产出架构改进方案（文档）
Session 2: 重构 payment-service.ts（核心逻辑层）
Session 3: 更新所有 API handlers 适配新接口
Session 4: 更新测试覆盖，确保 100% 通过
Session 5: 更新相关文档和 CHANGELOG
```

### 在 CLAUDE.md 中维护工作状态

用 CLAUDE.md 作为跨 session 的状态文件：

```markdown
# CLAUDE.md — 当前工作状态

## 进行中的任务：支付模块重构

### 已完成
- [x] 架构分析和方案设计（2024-01-14）
- [x] payment-service.ts 核心重构（2024-01-15）

### 进行中
- [ ] API handlers 适配（下一个 session 继续）
  - 已完成：checkout.ts, refund.ts
  - 待处理：subscription.ts, webhook.ts

### 关键决策记录
- 新架构使用 Event Sourcing 模式
- 向下兼容旧 API，通过适配层转换
- 错误码统一为 PAY_XXX 格式

### 下次 session 的入口点
从 `src/api/handlers/subscription.ts` 开始
参考 `src/api/handlers/checkout.ts` 的改造方式
```

---

## Session 之间的交接策略

### 策略一：结束时写交接文档

每个 session 结束前，让 Claude 生成交接摘要：

```
> 我们今天的 session 要结束了。
  请帮我：
  1. 总结今天完成了什么（3-5 条）
  2. 记录遇到的重要问题和解决方案
  3. 列出明确的下一步行动（按优先级）
  4. 把这些内容更新到 CLAUDE.md 的"当前工作状态"部分
```

### 策略二：结束时做 /compact 并 commit

```bash
# session 结束前
1. /compact   # 压缩历史，保存精华
2. 更新 CLAUDE.md
3. git add -A && git commit -m "feat: 完成 payment-service 重构核心逻辑"
```

### 策略三：新 session 的热启动

新 session 开始时，用一句话让 Claude 快速回到状态：

```
> 继续我们的支付模块重构工作。
  先读取 CLAUDE.md 了解当前状态，然后从 subscription.ts 开始。
```

因为 CLAUDE.md 在 session 开始就被加载，Claude 几乎立刻就能进入上次的工作节奏。

---

## Agent Teams：并行处理独立工作流

Claude Code 支持 Agent Teams——多个 agent 并行运行，每个 agent 拥有独立的 context window。这是处理可分解为独立工作流的大型任务时最高效的模式。

**启动并行 agent：**

```text
并行启动三个 agent：
1. Agent A：在 src/auth/ 中实现用户认证 endpoint
2. Agent B：为所有认证 endpoint 编写单元测试
3. Agent C：更新认证模块的 OpenAPI 文档

各 agent 独立工作，完成后汇报结果。
```

每个 agent 在独立的 context window 中运行。一个 agent 中大量的文件读取、探索和分析不会影响其他 agent 的 context 预算。结果以摘要形式返回到协调 session。

**使用 Git Worktrees 进行并行开发：**

对于需要在同一仓库中工作而不产生冲突的 agent，使用 git worktrees。`claude -w` 标志（或 `--worktree`）创建或使用命名的 worktree：

```bash
# 创建并进入名为 "feature-oauth" 的 worktree
claude -w feature-oauth

# 或使用完整标志
claude --worktree feature-auth
```

Claude Code 在 `../<repo>-<name>/` 创建新的 git worktree 并在那里启动 session。每个 worktree 是指向同一仓库的独立工作目录——一个 worktree 中的更改不会影响另一个，直到显式合并。

对于大型仓库的稀疏检出，配置要包含的路径：

```json
// .claude/settings.json
{
  "worktree": {
    "sparsePaths": ["src/auth/", "tests/auth/", "docs/api/"]
  }
}
```

**何时使用 Agent Teams vs 顺序工作：**

- **Agent Teams：** 真正独立的任务（不同模块、不同文件集、无共享状态）
- **顺序工作：** 每一步依赖上一步的任务（设计→实现→测试，在同一代码库中）

并行 agent 的效率提升在每个独立任务预计消耗 20,000+ token 时最为显著——将探索和分析委托给隔离 agent 可以防止主 session 的 context 压力。

---

## 长期项目管理（天/周级别）

### 项目状态文档体系

对于跨越多周的项目，建议维护以下文档结构：

```
my-project/
├── CLAUDE.md              # 活跃的工作状态（频繁更新）
├── docs/
│   ├── ARCHITECTURE.md    # 架构决策（稳定，较少改动）
│   ├── ADR/               # Architecture Decision Records
│   │   ├── 001-event-sourcing.md
│   │   └── 002-api-versioning.md
│   └── CHANGELOG.md       # 变更历史
└── .claude/
    └── memory/            # Claude 的自动学习记录
```

### CLAUDE.md 的双层结构

```markdown
# CLAUDE.md

## 稳定层（不常变化）
### 技术栈
- ...
### 代码规范
- ...

---

## 活跃状态层（每次 session 更新）
### 当前 Sprint 目标（Sprint 23，截止 2024-01-26）
- [ ] 完成支付模块重构
- [ ] 上线 A/B 测试框架
- [x] 修复高优先级 bug #456

### 今天的具体任务
- 继续 subscription.ts 的重构
- 入口点：第 145 行的 handleRenew 函数
```

---

## Session 恢复

Claude Code 保留了 session 历史，可以恢复之前的对话。

### 查看历史 Session

```bash
# 列出最近的 session
claude --resume

# 或在 session 中
/sessions
```

输出示例：

```
Recent sessions:
  1. [支付模块重构] 2024-01-15 14:32  ← 最近的
  2. [Auth bug 修复] 2024-01-15 09:15
  3. [API 设计讨论] 2024-01-14 16:45
  4. [代码审查] 2024-01-14 11:20

Select a session to resume, or press Enter for new session:
```

### 恢复 Session 的注意事项

恢复的 session 会**重新加载完整的对话历史**，但：
- 文件内容不会随磁盘变化而更新（Claude 可能看到旧版本）
- 如果你 resume 一个很旧的 session，可能需要手动告诉 Claude 哪些东西变了

推荐做法：如果 session 已经超过 24 小时，不如开新 session，用 CLAUDE.md 作为桥接。

---

## 最佳实践总结

```
开始每个 session：
□ 告诉 Claude 从 CLAUDE.md 了解当前状态
□ 明确指定这个 session 的目标
□ 如果是恢复工作，说明"我们上次做到哪里了"

工作过程中：
□ 完成一个子任务就 commit（小步快跑）
□ 关键决策立即更新到 CLAUDE.md
□ Context 到 50% 时考虑 /compact

结束每个 session：
□ 让 Claude 生成工作摘要
□ 更新 CLAUDE.md 中的任务状态
□ Commit 所有变更
□ 记录"下个 session 从哪里开始"
```

---

**下一章：** [CLAUDE.md 最佳实践](./19-claude-md-patterns.md)
