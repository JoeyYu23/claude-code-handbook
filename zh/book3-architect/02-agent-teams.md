# 第 2 章：Agent 团队

## 什么是 Agent 团队？

想象一下，你用单个 Claude Code Agent 构建产品——让它写后端，完成后再让它写前端。写前端的时候，后端就闲着，等你发下一条指令。

现在换一种方式：*多个 Claude Code Agent 并行工作*。一个写后端，一个写测试，另一个审查代码。它们通过共享任务列表协调工作，相互交接任务，最后向你汇报结果。这就是 Agent 团队。

一个**团队**由以下部分组成：

- **一个主导 Agent**（编排者）——负责与你沟通并协调团队工作。
- **多个队友 Agent**（执行者）——认领任务、执行任务，并将完成情况报告到共享任务列表。
- **一个共享任务列表**——所有 Agent 看到相同的待完成工作列表。
- **Agent 间通信**——Agent 可以互相提问和共享上下文。

结果是工作进展更快，因为 Agent 不会被动等待你的指令，而是持续认领任务并并行执行。

---

## 何时使用团队、子 Agent 还是单独运行

在深入讲解如何组建团队之前，我们先弄清楚*何时*应该使用团队。这很重要：并不是所有项目都适合团队协作，在单个 Agent 就能胜任的地方强行引入团队结构只会徒增复杂性。

### 适合使用单个 Agent 的情况：

- **工作本质上是顺序性的。** 你在调试一个需要深入上下文的问题，每一步都依赖上一步的结果，无法并行。
- **项目规模小**（1–3 个文件，预估工作量少于 2 小时）。团队协调的开销超过了节省的时间。
- **需要紧密的反馈循环。** 你在探索设计空间，需要根据中间结果快速迭代。

### 适合使用子 Agent（在对话中直接启动 Agent）的情况：

- **工作并行但耦合松散。** 需要两个 Agent 处理不同关注点（一个负责前端配置，一个负责后端验证），但不需要共享任务列表或频繁协调。
- **希望保持简单。** 子 Agent 更容易设置——直接在 Claude Code 中要求它原地启动即可。
- **工作自然分解为 2–3 个部分。** 超过这个数量就难以追踪进展了。

### 适合使用 Agent 团队的情况：

- **多个 Agent 需要在一个共享任务列表上工作。** 有大量积压任务（20 个以上），能从持续并行执行中受益。
- **工作需要频繁交接。** 任务 A 必须在任务 B 之前完成，且任务是增量式发现的。共享任务列表自动处理这些依赖关系。
- **希望主导 Agent 专注于编排而非执行。** 主导 Agent 协调团队并向你汇报，队友 Agent 负责实际执行。
- **项目规模大且复杂。** 涉及 9 个以上文件、多个子系统，预估工作量超过 4 小时。
- **重视可观察性。** 团队提供清晰的视图：谁在做什么、什么被阻塞、什么已完成。

**心智模型：** 团队适用于*流水线式工作流*——有明确的任务队列和多个执行者。单个 Agent 适用于*探索性对话*——你在和 Claude Code 一起思考问题。

---

## 启用 Agent 团队

Agent 团队是 Claude Code 的实验性功能，使用前需要开启功能标志：

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

或者将其添加到 Shell 配置文件（`.zshrc`、`.bashrc`），使其永久生效：

```bash
echo 'export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1' >> ~/.zshrc
source ~/.zshrc
```

启用后，通过以下方式启动一个团队：

```
I want to use agent teams for this project. Can you set up a team with a lead and 3 teammates to build acme-app?
```

Claude Code 将创建团队结构，并展示所有 Agent 的状态。

---

## 团队架构

了解团队的内部结构有助于你更有效地使用它。

### 主导 Agent

主导 Agent 是你的主要沟通对象。你和主导 Agent 交谈，主导 Agent 负责：

- **接受你的任务** — 你用自然语言描述高层次的工作需求。
- **创建结构化任务** — 将你的请求拆解成具体任务，添加到共享任务列表中。
- **协调团队** — 跟进进度，重新分配被阻塞的任务，上报问题。
- **向你汇报** — 所有任务完成后，总结已完成的工作。

主导 Agent *不*执行具体的实现工作——它的职责是编排。这一点很重要：如果主导 Agent 也陷入写代码的工作中，它就会成为瓶颈。

### 队友 Agent

队友 Agent 是执行者，它们负责：

- **认领任务** — 当某个任务可用且其依赖项已满足时，队友认领该任务。
- **执行任务** — 读取文件、编写代码、运行测试、调试错误，任务需要什么就做什么。
- **报告完成** — 完成后将任务标记为已完成，并附上工作摘要。
- **提出问题** — 任务不明确或遇到阻碍时，可以使用 `SendMessage` 向主导 Agent 或其他队友寻求说明。

经验法则：大多数项目配置 2–4 个队友 Agent 最为合适。只有 1 个队友时基本等同于顺序工作；8 个以上时协调开销大于执行收益。

### 共享任务列表

所有 Agent 看到同一份任务列表，它是待完成工作的唯一真实来源。

一个典型的任务如下所示：

```json
{
  "id": "task-001",
  "title": "Write API endpoint for user registration",
  "description": "Create POST /api/auth/register that accepts email and password, validates them, stores user in DB, and returns JWT token.",
  "status": "open",
  "assigned_to": null,
  "dependencies": [],
  "created_at": "2025-03-26T10:00:00Z"
}
```

任务有以下**状态**：
- `open` — 尚未被认领。
- `in_progress` — 某个队友已认领并正在执行。
- `blocked` — 任务无法继续（等待其他任务完成、需要说明或遇到错误）。
- `completed` — 已完成。

### Agent 间通信

Agent 通过 `SendMessage` 进行通信，任何 Agent 都可以向其他 Agent（包括主导 Agent 或队友）发送消息。

示例：某个队友遇到问题，向主导 Agent 发送消息：

```
[Teammate-02 → Lead]
Task task-003 is blocked. The API endpoint expects a user ID from auth middleware, but the middleware task (task-001) isn't done yet. Should I mock the middleware or wait?
```

主导 Agent 立即回复，队友解除阻塞，工作继续推进。

这比等你注意到问题并手动介入要快得多，也更清晰。

---

## 显示模式

Agent 团队可以用不同方式展示进度，具体选择取决于你的环境和偏好。

### 自动（默认）

Claude Code 为你的终端选择最佳显示模式，通常是：

```
[Lead] ✓ Ready to accept tasks
[Teammate-01] idle
[Teammate-02] idle
[Teammate-03] idle

team>
```

团队会渲染一行状态，显示每个 Agent 的状态。你输入任务，团队执行。

### 进程内模式

所有 Agent 在同一个终端会话中运行，所有 Agent 的输出都流向同一个终端，适合实时观察团队工作：

```
[Lead] Breaking down your request into tasks...
[Teammate-01] Claiming task-001: Write API endpoint...
[Teammate-02] Claiming task-002: Write frontend component...
[Teammate-03] Task task-003 is blocked waiting for task-002
```

### TMUX 模式

Agent 团队会打开一个 TMUX 会话，每个 Agent 占一个窗格。你可以切换窗格观察单个 Agent 的工作，也可以同时查看所有窗格。

启用方式：

```bash
export CLAUDE_CODE_DISPLAY_MODE=tmux
```

### ITERM2 模式

如果你在 macOS 上使用 iTerm2，可以在独立的 iTerm2 标签页中打开每个 Agent：

```bash
export CLAUDE_CODE_DISPLAY_MODE=iterm2
```

---

## 创建你的第一个团队

让我们通过一个具体示例来操作：构建一个简单的待办事项应用"acme-app"，包含后端（Node.js/Express）和前端（React）。

### 第一步：初始化项目

```bash
mkdir acme-app
cd acme-app
git init
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

### 第二步：请求组建团队

在 Claude Code 对话中：

```
I want to build a to-do app with a React frontend and Express backend.
I'd like to use a team of 3 agents (1 lead, 2 teammates) to parallel-develop.
Lead: orchestrates and handles frontend.
Teammate-01: handles backend API.
Teammate-02: handles database schema and migrations.

Can you set up the team?
```

Claude Code 会回复类似以下内容：

```
Setting up agent team for acme-app...

Team composition:
- Lead (alice-lead): Orchestration + Frontend
- Teammate-01 (alice-backend): Backend API
- Teammate-02 (alice-db): Database + Schema

Team initialized. Shared task list is ready.

Lead> What should I have the team build first?
```

### 第三步：描述高层次工作需求

你向主导 Agent 提出一个完整的、高层次的请求：

```
Build the core app:
1. Database schema for users and todos
2. Express API with endpoints: GET /todos, POST /todos, PATCH /todos/:id, DELETE /todos/:id
3. React frontend with a form to add todos and a list to display them
4. Basic authentication (login/register) so users only see their own todos
```

主导 Agent 在内部将其拆解为任务列表，并分配给各队友：

```
[Lead] Creating tasks...
- task-001: Database schema (users, todos tables) → Teammate-02
- task-002: Express setup + auth middleware → Teammate-01
- task-003: API endpoints for todos CRUD → Teammate-01
- task-004: React frontend structure → Lead
- task-005: Todo list component → Lead
- task-006: Add todo form → Lead
- task-007: Integration tests → Teammate-01

[Teammate-02] Claiming task-001...
[Teammate-01] Claiming task-002...
[Lead] Claiming task-004...

```

工作并行推进。队友认领任务、执行并标记完成。主导 Agent 协调全局并关注阻塞情况。

### 第四步：监控进度

你不需要微观管理，定期查看一下进度即可：

```
Lead, what is the status?
```

主导 Agent 回复摘要：

```
Progress update:
✓ task-001: Database schema completed (Teammate-02)
✓ task-002: Express + auth middleware done (Teammate-01)
  task-003: API endpoints in progress (Teammate-01, 60% done)
  task-004: React structure done, moving to component work (Lead)
⏳ task-005: Blocked until task-003 (API contracts needed)

Estimated completion: 15 minutes
```

### 第五步：处理阻塞情况

有时队友会遇到问题：

```
[Teammate-01 → Lead]
task-003 is blocked. The database doesn't have a users table yet — task-001 said it created one but the migration hasn't run. Should I mock the DB or wait?
```

主导 Agent 响应（必要时你也可以介入）：

```
[Lead → Teammate-01]
Teammate-02, can you run the migration immediately?

[Teammate-02]
Running migration now...
✓ Migration complete. Users and todos tables created.

[Teammate-01]
Unblocking. Resuming task-003.
```

这一切无需你介入，团队自行协调。

### 第六步：完成与审查

所有任务完成后：

```
[Lead] All tasks complete. Summary:
✓ Database schema (Teammate-02)
✓ Express API with 5 endpoints (Teammate-01)
✓ React frontend with form and list (Lead)
✓ Integration tests (Teammate-01)

The app is ready. You can find:
- Backend in src/backend/
- Frontend in src/frontend/
- Database migrations in migrations/

Next steps: run `npm install && npm run dev` to start both servers.
```

你可以审查代码、运行应用并进行迭代。

---

## 任务管理

任务是团队工作的基本单元。理解如何创建、更新和管理任务，是高效使用团队的核心。

### TaskCreate

当主导 Agent 创建任务时：

```
[Lead] Creating task-001:
  Title: "Write API endpoint for user registration"
  Description: "POST /api/auth/register. Accept email, password. Validate. Store in DB. Return JWT token."
  Assigned to: (open)
  Dependencies: []
```

你也可以直接告诉主导 Agent 创建任务：

```
Create a new task: "Write unit tests for auth middleware"
```

主导 Agent 将其添加到列表中，供队友认领。

### TaskUpdate

当队友认领任务时：

```
[Teammate-01 → Task task-001]
Status: in_progress
```

完成时：

```
[Teammate-01 → Task task-001]
Status: completed
Summary: Implemented POST /api/auth/register with email validation, bcrypt hashing, and JWT generation. Added to src/backend/routes/auth.js.
```

### TaskGet

任何 Agent 都可以查看任务详情以了解要做什么：

```
[Teammate-01]
Getting details for task-003...
Title: Write API endpoint for user registration
Description: POST /api/auth/register...
Status: open
Dependencies: [task-001, task-002]
```

如果依赖项尚未完成，该任务会保持阻塞状态，直到所有依赖完成。

### 任务依赖

依赖关系对于保证正确性至关重要。例如：

```
task-003 (Write API endpoints) depends on [task-001 (Database schema), task-002 (Auth middleware)]
```

任务列表系统*强制执行*依赖关系。队友在 task-001 和 task-002 标记为完成之前无法认领 task-003。这防止了竞争条件，确保工作按正确顺序推进。

创建任务时，仔细考虑依赖关系：

```
Lead, create these tasks with dependencies:
1. "Set up database connection" (no dependencies)
2. "Create users table" (depends on 1)
3. "Create todos table" (depends on 1)
4. "Write auth endpoints" (depends on 2)
5. "Write todo API" (depends on 3)
6. "Write React frontend" (depends on 4 and 5)
```

主导 Agent 会设置依赖图，队友会按正确顺序自动认领任务。

### 认领与完成任务

当任务变为可用（所有依赖完成，状态为 open）时，任何空闲的队友都可以认领：

```
[Teammate-02] Polling for available tasks...
Found: task-001 (open, no dependencies)
Claiming task-001...
Status: in_progress
```

队友完成工作后，报告进度并标记完成：

```
[Teammate-02] task-001 complete.
Created: migrations/001_create_users_table.sql
Created: migrations/002_create_todos_table.sql
Ran migrations against development database.
```

---

## 通信模式

随着团队规模增大，通信变得越来越重要。主要有两种通信模式：`SendMessage` 和共享文件。

### 何时使用 SendMessage

以下情况使用 `SendMessage`：

- **需要立即获得另一个 Agent 的回复。** "Teammate-02，我需要知道数据库 Schema 是否完成，才能继续我的工作。"
- **问题简短且有上下文。** "你用的是 bcrypt 还是 argon2 加密密码？"
- **需要来回交流。** 发送消息，获得回复，继续追问。

示例：

```
[Teammate-01 → Teammate-02]
I'm implementing the POST /todos endpoint. Does the todos table have an owner_id column, or should I store that separately?

[Teammate-02 → Teammate-01]
It has owner_id. Foreign key to users(id). That's in the migration if you need to double-check.

[Teammate-01]
Perfect, unblocked.
```

### 何时使用共享文件

以下情况使用共享文件（提交到 git，或创建专门的 `README.md`）：

- **信息量大或复杂。** API 规格文档、设计决策记录、部署指南。
- **多个 Agent 需要长期引用它。** 不是一次性的问题。
- **需要版本管理。** Git 提交为决策创建审计记录。

示例：主导 Agent 创建 `API_SPEC.md`：

```markdown
# API Specification

## POST /todos
Request:
  {
    "title": "string",
    "description": "string?",
    "due_date": "ISO 8601 date?"
  }
Response:
  {
    "id": "uuid",
    "title": "string",
    ...
    "created_at": "ISO 8601",
    "owner_id": "uuid"
  }
```

Teammate-01 和 Teammate-02 在实现过程中都参考这份文件，API 契约保持一致。

### 通过任务列表协调

任务列表*本身*就是一种协调机制。通过正确设置依赖关系，你无需发送消息就能确保 Agent 按正确顺序工作：

```
task-002 (Implement auth middleware) depends on task-001 (Database schema)
```

Teammate-01 在 task-001 完成前根本无法认领 task-002，所以你不需要发消息说"等 Teammate-02 完成"，系统自动执行这个约束。

---

## 实际应用模式

让我们看看三种在真实项目中常见的团队结构。

### 模式一：前后端并行开发

**团队构成：** 主导 Agent（编排者）、Teammate-01（后端）、Teammate-02（前端）

**任务分解：**
1. 主导 Agent 创建 API 规格（设计文档）
2. Teammate-01 按规格实现后端
3. Teammate-02 按规格实现前端
4. 任务 2 和 3 并行进行（前端初期使用 Mock API）
5. 后端完成后，开始前后端集成
6. 主导 Agent 编写集成测试

**为何有效：** 前端和后端在集成之前基本上是独立的。提前写好清晰的规格，队友可以并行工作，将阻塞降至最低。

**关键任务依赖：**
```
API Spec (design doc) [no deps]
Backend Implementation [depends on API Spec]
Frontend Implementation [depends on API Spec]
Integration Tests [depends on Backend and Frontend]
E2E Tests [depends on Integration Tests]
```

### 模式二：研究→实现流水线

**团队构成：** 主导 Agent（研究）、Teammate-01（实现）、Teammate-02（测试）

**工作流程：**
1. 主导 Agent 研究问题（"如何处理数据库的并发写入？"）并输出设计文档。
2. Teammate-01 阅读设计文档并实现。
3. Teammate-02 编写测试以验证实现是否符合设计。
4. 如果测试失败，Teammate-02 通知主导 Agent，主导 Agent 澄清设计，Teammate-01 修复代码。

**为何有效：** 将研究与实现分离，避免了过度分析。主导 Agent 深入思考的同时，队友在执行，验证工作并行进行。

### 模式三：编码→测试→审查三角

**团队构成：** 主导 Agent（代码审查）、Teammate-01（实现）、Teammate-02（测试）

**工作流程：**
1. Teammate-01 实现功能。
2. Teammate-02 编写测试并运行。
3. 测试通过后，Teammate-02 标记"测试完成"。
4. 主导 Agent 审查代码（阅读 Teammate-01 的代码），检查测试，给出批准或要求修改。
5. 如需修改，Teammate-01 重新实现，Teammate-02 重新测试。

**为何有效：** 持续的质量门禁。只有测试和审查都通过，工作才算"完成"，防止 Bug 溜进来。

---

## 限制与注意事项

Agent 团队很强大，但有真实的局限性。了解这些可以帮你节省时间。

### Token 消耗

每个 Agent 维护自己的上下文。一个 4 个 Agent 工作 2 小时的团队，Token 消耗可能是单个 Agent 的 4 倍。如果成本是考量因素，保持团队规模较小（2–3 个 Agent），或仅将其用于独立的项目。

### 上下文延迟

Agent 对彼此正在做什么没有完美的实时可见性。如果 Teammate-01 创建了一个新文件，Teammate-02 立即需要读取，可能会有短暂的延迟。通常是毫秒级，但对于非常大的代码库可能更长。

**缓解方法：** 创建其他 Agent 需要用到的内容时，使用 `SendMessage` 通知它们。

### 死锁

如果依赖关系设置不当，任务可能出现死锁（虽然罕见）。例如：

```
Task A depends on Task B
Task B depends on Task A
```

两个任务都无法被认领，团队会陷入停滞。

**预防方法：** 设置依赖关系时，问自己："是否存在循环依赖？"通常答案是否，但值得检查一下。

### 通信开销

8 个 Agent 的团队协调开销远大于 2 个 Agent。随着团队规模增大，你可能会遇到收益递减的情况。

**经验法则：** 从 2–3 个队友开始。如果工作仍然存在瓶颈（一个 Agent 频繁等待另一个），再增加队友。如果达到 5 个以上队友仍有瓶颈，问题不在于并行化——而是你的任务相互依赖太紧密。

### 主导 Agent 成为瓶颈

如果主导 Agent 还要承担所有实现工作，它就会成为瓶颈。团队的意义在于让主导 Agent 负责编排，让队友负责执行。

**最佳实践：** 团队设计上，主导 Agent *只*负责创建任务、协调阻塞和汇报进度，让队友去写代码。

---

## 参考资料

1. **Claude Code 官方文档**
   https://code.claude.com/docs/en/agent-teams
   Agent 团队功能、API 和最佳实践的权威来源。

2. **"How to Set Up and Use Claude Code Agent Teams"** by darasoba
   https://darasoba.medium.com/how-to-set-up-and-use-claude-code-agent-teams-and-actually-get-great-results-9a34f8648f6d
   Medium 教程，涵盖团队初始化、显示模式和常见模式。

3. **Gentleman-Programming/agent-teams-lite** on GitHub
   规格驱动开发的开源示例，使用 9 个子 Agent。展示了如何将大型项目分解为并行任务。

4. **"From Tasks to Swarms - Agent Teams in Claude Code"** by alexop.dev
   探索从单个 Agent 扩展到大型团队的博客文章，包含真实世界的架构示例。

5. **"30 Tips for Claude Code Agent Teams"** on Substack
   实用技巧，涵盖任务命名规范、依赖关系模式、通信策略以及如何调试卡住的团队。

---

**接下来：** [第 3 章 — 计划任务与自动化循环](./03-scheduled-tasks.md)
