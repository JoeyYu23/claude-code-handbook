# 第十八章：多 Session 工作流

## 跨越多天的工作

大多数 Claude Code 入门示例展示的都是单个 session：打开它，完成某件事，关闭它。但专业开发工作并不能在一次坐下来的时间里完成。功能需要数天，迁移需要数周，复杂重构需要多个专注 session 加上中间的审查。

使用 Claude Code 进行多 session 工作需要刻意设计。没有设计，你每次开始都要重新解释 context；有了设计，Claude 能接续上次的进度，随着时间积累对项目的了解，与你合作越久效果越好。

本章涵盖跨 session 规划工作、在 session 之间维护状态，以及有效管理长期项目的机制和策略。

---

## Resume 机制

Claude Code 在本地保存所有对话历史。恢复上一个 session 非常简单：

```bash
# 继续最近的 session
claude --continue

# 交互式选择近期 session
claude --resume
```

`--continue` 标志是回到进行中工作的最快方式。`--resume` 标志在你同时推进多个并行工作流时更为有用。

**为 session 命名以便查找：**

```text
/rename feature-payment-refund
```

或在开始一个专注于特定任务的 session 时：

```bash
claude --continue "oauth-migration"
```

命名的 session 在 `--resume` 列表中比以第一条消息命名的 session 容易找到得多。

---

## 跨 Session 规划工作

对于任何将跨越多个 session 的项目，在开始时投入时间写一个合适的计划是值得的。好的计划有双重作用：它既指导 Claude 完成工作，也作为 session 之间的交接文档。

**Session 零：规划与规格说明**

在写任何代码之前，先开一个专门的规划 session：

```text
I'm going to implement a password reset flow for our app.
Let me describe the requirements, then I want you to create
a detailed implementation plan with specific tasks I can
work through in separate sessions.

Requirements:
- Users can request a reset via email
- Secure token with 1-hour expiry
- Token invalidated after single use
- Rate limited to 3 attempts per hour per email

Create SPEC.md with the implementation plan broken into
discrete, independently completable tasks. Each task should
be completable in a 1-2 hour session.
```

Claude 会产出一个结构化的规格说明，你可以系统地逐步推进，每个 session 都有明确的起点和完成标准。

**将 SPEC.md 作为 session 入口：**

有了规格说明后，在 CLAUDE.md 中添加以下内容：

```markdown
At the start of each session, read SPEC.md and TASKS.md.
Ask me which task to work on today.
```

开启新 session 时：

```text
Read SPEC.md and TASKS.md.
We're working on the password reset feature.
Last session completed Task 2 (email service integration).
Today let's work on Task 3: the reset token handler.
```

---

## Session 之间的状态维护

**WORK_IN_PROGRESS 模式：**

session 结束前，让 Claude 写一份交接文档：

```text
We're wrapping up for today. Write WORK_IN_PROGRESS.md with:
1. What was completed this session (specific files changed, decisions made)
2. Current state of the code (what works, what's incomplete)
3. Next steps, in order
4. Any open questions or decisions deferred
5. Any gotchas discovered that will matter for the next session

Make it a re-entry briefing for tomorrow's session.
```

下次 session 开始时：

```text
Read WORK_IN_PROGRESS.md and brief me on where we are.
Then let's continue with the next steps.
```

**自动记忆实现环境 context 积累：**

自动记忆会被动积累项目知识。在一个项目上工作了几个 session 之后，Claude 会记得：

- 哪些测试命令有效
- 环境配置要求
- 代码库中使用的架构模式
- 你对它默认行为的修正

这种被动积累本身就很有价值。你不需要主动管理它——让它自动运行即可。

**将 git 提交作为 session 标记：**

严格的提交策略让多 session 的 context 恢复更容易。在 session 中，在自然的完成节点让 Claude 提交：

```text
We've got the token generation working and tested.
Make a commit with a descriptive message summarizing this work.
```

开始新 session 时：

```text
Show me the last 5 commits to remind me where we are.
```

git 历史作为已完成工作的权威记录，比对话历史更可靠。

---

## Session 之间的交接策略

不同的情况适合不同的交接策略。

**当天恢复（短暂休息）：**

使用 `claude --continue`。完整的对话历史完好无损，无需特殊交接。

**次日恢复：**

```bash
claude --continue
```

然后引导 Claude 进入状态：

```text
It's the next day. Remind me: what were we working on and where did we leave off?
```

Claude 会总结 session 历史。继续之前，确认摘要准确无误。

**离开一周后恢复：**

一周前的 context 可能已经过时——你很可能已经做了其他改动、合并了 PR，或者需求发生了变化。此时，用显式 context 注入开启新 session 往往比继续旧 session 更有效：

```bash
claude  # 新 session，不用 --continue
```

然后：

```text
I'm returning to the password-reset feature after a week.
Read SPEC.md, WORK_IN_PROGRESS.md, and show me the git log for the last 10 commits.
Brief me on the current state before we continue.
```

**并行工作流：**

对于同时推进多个独立功能的项目，使用独立的命名 session：

```bash
# 功能 A 的 session
claude --continue "feature-payment-refund"

# 功能 B 的 session
claude --continue "feature-user-segments"
```

每个 session 积累特定于其工作流的 context。将不相关的 context 混在同一个 session 中，是造成混乱和质量下降的常见原因。

---

## 长期项目：天和周的维度

对于跨越数周的项目，将 Claude 配置视为项目本身的一部分来对待。

**随项目成长的项目级 CLAUDE.md：**

随着项目演进，保持 CLAUDE.md 持续更新：

```text
Update CLAUDE.md to add the API conventions we established today.
Specifically: REST endpoints follow the pattern /api/v2/{resource}/{id},
and all handlers validate with the RequestSchema pattern from src/schemas/.
```

经过多周项目，你的 CLAUDE.md 会成为一个高质量的项目知识库。

**跨多个 session 推进项目规格说明：**

```
SPEC.md 任务列表（跨 session 管理）：

## Phase 1: Foundation（已完成）
- [x] 数据库 schema 设计
- [x] 带邮箱验证的用户模型
- [x] 基础认证接口

## Phase 2: Features（进行中）
- [x] 密码重置流程
- [ ] OAuth Google 登录（下一个）
- [ ] OAuth GitHub 登录
- [ ] API 限流

## Phase 3: Production Readiness
- [ ] 监控与告警
- [ ] 性能测试
- [ ] 安全审计
```

任务完成后更新此文件：

```text
Mark 'Password reset flow' as complete in SPEC.md.
OAuth Google login is next — read the spec for that task and
start with the implementation plan.
```

**将分支作为 session 边界：**

对于多周功能，将 Claude session 与 git 分支对齐。每个 session 在一个分支上工作。这保持变更整洁，并且可以清楚地看到每个 session 产出了什么：

```text
Create a branch called feature/oauth-google and switch to it.
We're starting a new feature today.
```

session 结束时：

```text
Commit everything on the current branch.
Push the branch.
Write a brief session summary to WORK_IN_PROGRESS.md.
```

---

## Agent Teams：跨独立 Context 的并行工作

Claude Code 支持 Agent Teams——多个 agent 并行工作，每个 agent 拥有独立的 context window。这是处理可分解为独立工作流的大型任务时效率最高的模式。

**派生并行 agent：**

```text
Spawn three agents in parallel:
1. Agent A: Implement the user authentication endpoints in src/auth/
2. Agent B: Write unit tests for all auth endpoints
3. Agent C: Update the OpenAPI documentation for the auth module

Each agent should work independently. Report back when complete.
```

每个 agent 在独立的 context window 中运行。一个 agent 中大量的文件读取、探索和分析，不会影响其他 agent 的 context 预算。结果以摘要形式返回到编排 session。

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

当每个独立任务预计会消耗 20,000+ token 时，并行 agent 的效率提升最为显著——将探索和分析委托给隔离 agent 可以防止主 session 的 context 压力。

---

## Session 历史与恢复

Claude Code 将所有对话历史持久化保存在 `~/.claude/` 目录中，这些历史会永久保留，直到你手动清除。

列出近期 session：

```bash
claude --resume
```

这会显示一个包含近期 session 名称、最后活动时间和第一条消息的交互式列表。

**从崩溃或中断的 session 中恢复：**

如果 session 意外结束（终端关闭、断电），`claude --continue` 会精确从上次中断的地方恢复 session，包括所有进行中的工作。Claude Code 在每次操作前都会创建检查点，所以你可以在继续之前审查已完成的内容。

**使用 Rewind 进行 session 恢复：**

```text
/rewind
```

这会打开 rewind 菜单。你可以将对话状态恢复到 session 历史中的任意检查点，并可选择同步恢复文件状态。这在你想撤销多个步骤并尝试不同方案时非常有用。

---

## 多 Session 项目模板

以下是融合本章所有模式的长期项目起步模板：

**CLAUDE.md 补充内容：**
```markdown
# Session 协议
每次 session 开始时：
1. 读取 SPEC.md 了解项目和当前阶段
2. 如果存在 WORK_IN_PROGRESS.md，读取它
3. 展示最近 5 次 git 提交
4. 询问今天要处理哪个任务

每次 session 结束时：
1. 提交已完成的工作
2. 更新 WORK_IN_PROGRESS.md，记录当前状态和下一步
3. 在 SPEC.md 中标记已完成的任务
```

**开始每个 session：**
```bash
claude --continue "project-name"
```

**结束每个 session：**
```text
We're done for today. Please:
1. Commit all completed work
2. Update WORK_IN_PROGRESS.md
3. Mark any completed tasks in SPEC.md
```

这个模式将 Claude 从一个 per-session 的工具，转变为真正的项目协作者——在数周工作中积累知识、保持连续性。

---

**下一章：** [第十九章 — 桌面应用与 Computer Use](./19-desktop-app.md) — Chat、Cowork、Code 三种模式以及自主 UI 控制。
