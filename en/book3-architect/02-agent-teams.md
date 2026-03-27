# Chapter 2: Agent Teams

## What Are Agent Teams?

Imagine building a product with a single Claude Code agent — you ask it to write the backend, it does. Then you ask it to write the frontend, and while it is writing the frontend, the backend is idle waiting for your next instruction.

Now imagine instead that you could have *multiple Claude Code agents working in parallel*. One writes the backend. Another writes tests. A third reviews the code. They coordinate through a shared task list, hand work off to each other, and report back to you with the results. That is agent teams.

A **team** consists of:

- **One lead agent** (the orchestrator) — This agent interacts with you and coordinates the team's work.
- **Multiple teammate agents** (workers) — These agents claim tasks, execute them, and report completion back to the shared task list.
- **A shared task list** — All agents see the same list of work to be done.
- **Inter-agent messaging** — Agents can ask each other questions and share context.

The result is that work happens faster because agents are not blocked waiting for you to give instructions — they are continuously pulling tasks and executing in parallel.

---

## When to Use Teams vs. Sub-agents vs. Solo

Before diving into how to set up a team, let us be clear about *when* you should use teams in the first place. This is important: not every project benefits from teams, and forcing a team structure where a solo agent would work fine adds complexity for no gain.

### Use a solo agent when:

- **The work is inherently sequential.** You are debugging a problem that requires deep context. Each step informs the next. No parallelization possible.
- **The project is small** (1–3 files, <2 hours of work estimated). The coordination overhead of a team exceeds the time saved.
- **You need tight feedback loops.** You are exploring a design space and want to iterate rapidly based on intermediate results.

### Use sub-agents (spawn agents from within your conversation) when:

- **Work is parallel but loosely coupled.** You need two agents to work on different concerns (one on frontend config, one on backend validation), but they do not need to share a task list or coordinate frequently.
- **You want to keep it simple.** Sub-agents are easier to set up — you just ask Claude Code to spawn them in-place.
- **The work naturally decomposes into 2–3 chunks.** More than that and you lose track of what is happening.

### Use agent teams when:

- **Multiple agents need to work on one shared task list.** You have a large backlog (20+ tasks) and benefit from continuous parallel execution.
- **Work requires frequent hand-offs.** Task A must be done before Task B, and tasks are discovered incrementally. A shared task list automates these dependencies.
- **You want the lead agent to focus on orchestration, not execution.** The lead coordinates the team and reports to you; teammates execute work.
- **The project is large and complex.** 9+ files, multiple subsystems, estimated 4+ hours of work.
- **You value observability.** Teams provide a clear view of what is happening: who is working on what, what is blocked, what is done.

**Mental model:** Teams are for *factory workflows* where you have a clear queue of work and multiple workers. Solo agents are for *exploratory conversations* where you are thinking alongside Claude Code.

---

## Enabling Agent Teams

Agent teams are an experimental feature in Claude Code. To use them, you must enable the feature flag:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

Alternatively, add it to your shell profile (`.zshrc`, `.bashrc`) so it is always on:

```bash
echo 'export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1' >> ~/.zshrc
source ~/.zshrc
```

Once enabled, you can spawn a team by starting a conversation with:

```
I want to use agent teams for this project. Can you set up a team with a lead and 3 teammates to build acme-app?
```

Claude Code will create the team structure and show you the state of all agents.

---

## Team Architecture

Understanding the internal structure of a team helps you use it effectively.

### The Lead Agent

The lead agent is your primary contact. You talk to the lead. The lead:

- **Accepts tasks from you** — You describe high-level work in natural language.
- **Creates structured tasks** — The lead breaks down your request into discrete tasks and adds them to the shared task list.
- **Coordinates the team** — The lead checks on progress, reassigns blocked tasks, and escalates problems.
- **Reports back to you** — Once all tasks are complete, the lead summarizes what was accomplished.

The lead agent does *not* execute implementation work — its job is orchestration. This is important: in large teams, if the lead got bogged down in writing code, it would become a bottleneck.

### Teammate Agents

Teammates are the workers. They:

- **Claim tasks from the list** — When a task is available and its dependencies are met, a teammate claims it.
- **Execute the task** — They read files, write code, run tests, debug errors, whatever the task requires.
- **Report completion** — Once done, they mark the task as complete and include a summary of what they did.
- **Ask questions** — If a task is unclear or blocked, teammates can use `SendMessage` to ask the lead or other teammates for clarification.

A good rule of thumb: aim for 2–4 teammates for most projects. With 1 teammate, you are mostly doing sequential work. With 8+ teammates, you spend more time coordinating than executing.

### The Shared Task List

All agents see the same task list. It is the single source of truth for what needs to be done.

A task typically looks like this:

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

Tasks have a **status**:
- `open` — Not yet claimed.
- `in_progress` — A teammate has claimed it and is working.
- `blocked` — The task cannot proceed (waiting for another task to finish, needs clarification, or hit an error).
- `completed` — Done.

### Inter-Agent Messaging

Agents communicate through `SendMessage`, which allows any agent to send a message to another agent (including the lead or a teammate).

Example: A teammate hits an issue and sends a message to the lead:

```
[Teammate-02 → Lead]
Task task-003 is blocked. The API endpoint expects a user ID from auth middleware, but the middleware task (task-001) isn't done yet. Should I mock the middleware or wait?
```

The lead responds immediately, the teammate unblocks, and work continues.

This is faster and clearer than the teammate waiting for you to notice the problem and intervene.

---

## Display Modes

Agent teams can display their progress in different ways. Which one you use depends on your environment and preference.

### Auto (default)

Claude Code chooses the best display mode for your terminal. Usually this means:

```
[Lead] ✓ Ready to accept tasks
[Teammate-01] idle
[Teammate-02] idle
[Teammate-03] idle

team>
```

The team renders a status line showing each agent's state. You type tasks and the team executes them.

### In-process

All agents run in the same terminal session. Output from all agents streams to the same terminal. This is useful for watching the team work in real time:

```
[Lead] Breaking down your request into tasks...
[Teammate-01] Claiming task-001: Write API endpoint...
[Teammate-02] Claiming task-002: Write frontend component...
[Teammate-03] Task task-003 is blocked waiting for task-002
```

### TMUX

Agent teams open a TMUX session with one pane per agent. You can switch between panes to watch individual agents work, or view all panes at once.

Enable with:

```bash
export CLAUDE_CODE_DISPLAY_MODE=tmux
```

### ITERM2

If you use iTerm2 on macOS, you can open each agent in a separate iTerm2 tab:

```bash
export CLAUDE_CODE_DISPLAY_MODE=iterm2
```

---

## Creating Your First Team

Let us build a concrete example: a simple to-do app called "acme-app" with a backend (Node.js/Express) and frontend (React).

### Step 1: Initialize Your Project

```bash
mkdir acme-app
cd acme-app
git init
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

### Step 2: Request a Team

In your Claude Code conversation:

```
I want to build a to-do app with a React frontend and Express backend.
I'd like to use a team of 3 agents (1 lead, 2 teammates) to parallel-develop.
Lead: orchestrates and handles frontend.
Teammate-01: handles backend API.
Teammate-02: handles database schema and migrations.

Can you set up the team?
```

Claude Code will respond with something like:

```
Setting up agent team for acme-app...

Team composition:
- Lead (alice-lead): Orchestration + Frontend
- Teammate-01 (alice-backend): Backend API
- Teammate-02 (alice-db): Database + Schema

Team initialized. Shared task list is ready.

Lead> What should I have the team build first?
```

### Step 3: Define High-Level Work

You give the lead one coherent, high-level request:

```
Build the core app:
1. Database schema for users and todos
2. Express API with endpoints: GET /todos, POST /todos, PATCH /todos/:id, DELETE /todos/:id
3. React frontend with a form to add todos and a list to display them
4. Basic authentication (login/register) so users only see their own todos
```

The lead breaks this down internally into a task list and distributes work to teammates:

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

Work proceeds in parallel. Teammates pull tasks, execute, and mark them done. The lead coordinates and watches for blockers.

### Step 4: Monitor Progress

You do not need to micromanage. Check in periodically:

```
Lead, what is the status?
```

The lead responds with a summary:

```
Progress update:
✓ task-001: Database schema completed (Teammate-02)
✓ task-002: Express + auth middleware done (Teammate-01)
  task-003: API endpoints in progress (Teammate-01, 60% done)
  task-004: React structure done, moving to component work (Lead)
⏳ task-005: Blocked until task-003 (API contracts needed)

Estimated completion: 15 minutes
```

### Step 5: Handle Blockers

Sometimes a teammate hits an issue:

```
[Teammate-01 → Lead]
task-003 is blocked. The database doesn't have a users table yet — task-001 said it created one but the migration hasn't run. Should I mock the DB or wait?
```

The lead responds (and you can help if needed):

```
[Lead → Teammate-01]
Teammate-02, can you run the migration immediately?

[Teammate-02]
Running migration now...
✓ Migration complete. Users and todos tables created.

[Teammate-01]
Unblocking. Resuming task-003.
```

This happens without you needing to intervene. The team self-coordinates.

### Step 6: Complete and Review

Once all tasks are done:

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

You can then review the code, run the app, and iterate.

---

## Task Management

Tasks are the unit of work in a team. Understanding how to create, update, and manage them is central to using teams effectively.

### TaskCreate

When the lead creates a task:

```
[Lead] Creating task-001:
  Title: "Write API endpoint for user registration"
  Description: "POST /api/auth/register. Accept email, password. Validate. Store in DB. Return JWT token."
  Assigned to: (open)
  Dependencies: []
```

You can also create tasks directly by asking the lead:

```
Create a new task: "Write unit tests for auth middleware"
```

The lead adds it to the list and makes it available for teammates.

### TaskUpdate

When a teammate claims a task:

```
[Teammate-01 → Task task-001]
Status: in_progress
```

When it is done:

```
[Teammate-01 → Task task-001]
Status: completed
Summary: Implemented POST /api/auth/register with email validation, bcrypt hashing, and JWT generation. Added to src/backend/routes/auth.js.
```

### TaskGet

Any agent can inspect a task to understand what needs to be done:

```
[Teammate-01]
Getting details for task-003...
Title: Write API endpoint for user registration
Description: POST /api/auth/register...
Status: open
Dependencies: [task-001, task-002]
```

If dependencies are not yet done, the task remains blocked until they are complete.

### Task Dependencies

Dependencies are critical for correctness. For example:

```
task-003 (Write API endpoints) depends on [task-001 (Database schema), task-002 (Auth middleware)]
```

The task list system *enforces* dependencies. A teammate cannot claim task-003 until task-001 and task-002 are marked complete. This prevents race conditions and ensures work happens in the right order.

When you create tasks, think about dependencies:

```
Lead, create these tasks with dependencies:
1. "Set up database connection" (no dependencies)
2. "Create users table" (depends on 1)
3. "Create todos table" (depends on 1)
4. "Write auth endpoints" (depends on 2)
5. "Write todo API" (depends on 3)
6. "Write React frontend" (depends on 4 and 5)
```

The lead will set up the dependency graph, and teammates will pull tasks in the correct order automatically.

### Claiming and Completing Tasks

When a task becomes available (all dependencies done, status = open), any available teammate can claim it:

```
[Teammate-02] Polling for available tasks...
Found: task-001 (open, no dependencies)
Claiming task-001...
Status: in_progress
```

The teammate works on it, reports progress if needed, and marks it done:

```
[Teammate-02] task-001 complete.
Created: migrations/001_create_users_table.sql
Created: migrations/002_create_todos_table.sql
Ran migrations against development database.
```

---

## Communication Patterns

As your team grows, communication becomes important. There are two main patterns: `SendMessage` and shared files.

### When to Use SendMessage

Use `SendMessage` when:

- **You need an immediate response** from another agent. "Teammate-02, I need to know if the database schema is done before I can continue."
- **The question is brief and contextual.** "Did you use bcrypt or argon2 for password hashing?"
- **You want a conversation.** Send a message, get a response, follow up.

Example:

```
[Teammate-01 → Teammate-02]
I'm implementing the POST /todos endpoint. Does the todos table have an owner_id column, or should I store that separately?

[Teammate-02 → Teammate-01]
It has owner_id. Foreign key to users(id). That's in the migration if you need to double-check.

[Teammate-01]
Perfect, unblocked.
```

### When to Use Shared Files

Use shared files (commit to git, or create a specific `README.md`) when:

- **The information is large or complex.** An API specification document, a design decision log, a deployment guide.
- **Multiple agents need to reference it over time.** Not a one-off question.
- **You want to version it.** Git commits create an audit trail of decisions.

Example: The lead creates `API_SPEC.md`:

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

Both Teammate-01 and Teammate-02 reference this file while implementing, and the API contract stays consistent.

### Coordination Through the Task List

The task list is *itself* a coordination mechanism. By setting dependencies correctly, you ensure that agents work in the right sequence without needing explicit messages:

```
task-002 (Implement auth middleware) depends on task-001 (Database schema)
```

Teammate-01 cannot even claim task-002 until task-001 is done. So you do not need to send a message saying "wait for Teammate-02." The system enforces it.

---

## Real-World Patterns

Let us look at three common ways teams are structured in real projects.

### Pattern 1: Frontend + Backend Parallel Development

**Team:** Lead (orchestrator), Teammate-01 (backend), Teammate-02 (frontend)

**Task breakdown:**
1. Lead creates API specification (design document)
2. Teammate-01 implements backend against the spec
3. Teammate-02 implements frontend against the spec
4. Tasks 2 and 3 run in parallel (mock API initially on frontend side)
5. Once backend is done, frontend integration begins
6. Lead writes integration tests

**Why it works:** Frontend and backend are largely independent until integration. By writing a clear spec upfront, teammates can work in parallel and minimize blockers.

**Key task dependencies:**
```
API Spec (design doc) [no deps]
Backend Implementation [depends on API Spec]
Frontend Implementation [depends on API Spec]
Integration Tests [depends on Backend and Frontend]
E2E Tests [depends on Integration Tests]
```

### Pattern 2: Research + Implementation Pipeline

**Team:** Lead (research), Teammate-01 (implement), Teammate-02 (test)

**Workflow:**
1. Lead researches a problem ("How do we handle concurrent writes to the database?") and produces a design document.
2. Teammate-01 reads the design and implements it.
3. Teammate-02 writes tests to verify the implementation matches the design.
4. If tests fail, Teammate-02 messages Lead, who clarifies the design, Teammate-01 fixes it.

**Why it works:** Separating research from implementation prevents analysis paralysis. The lead can think deeply while teammates execute, and verification happens in parallel.

### Pattern 3: Code + Test + Review Triangle

**Team:** Lead (code review), Teammate-01 (implementation), Teammate-02 (testing)

**Workflow:**
1. Teammate-01 implements a feature.
2. Teammate-02 writes tests and runs them.
3. Once tests pass, Teammate-02 marks "testing complete."
4. Lead reviews the code (reads what Teammate-01 wrote), checks tests, and either approves or requests changes.
5. If changes needed, Teammate-01 re-implements and Teammate-02 re-tests.

**Why it works:** Continuous quality gate. Nothing is "done" until both tests and review pass. This prevents bugs from slipping through.

---

## Limitations & Gotchas

Agent teams are powerful, but they have real constraints. Knowing them will save you time.

### Token Usage

Each agent maintains its own context. A team of 4 agents working for 2 hours might use 4x the tokens of a solo agent. If cost is a concern, keep teams small (2–3 agents) or use them only for discrete projects.

### Context Lag

Agents do not have perfect real-time visibility into what other agents are doing. If Teammate-01 creates a new file and Teammate-02 immediately needs to read it, there might be a brief lag before Teammate-02 sees it. Usually this is milliseconds, but with very large codebases it can be longer.

**Mitigation:** Use `SendMessage` to notify other agents when you create something they will need.

### Deadlock

It is possible (though rare) for tasks to deadlock if dependencies are set up incorrectly. For example:

```
Task A depends on Task B
Task B depends on Task A
```

Neither task can be claimed. The team will stall.

**Prevention:** When setting up dependencies, ask yourself: "Is there a circular dependency?" Usually the answer is no, but check.

### Communication Overhead

A team of 8 agents has more coordination overhead than a team of 2. As team size grows, you may hit diminishing returns.

**Rule of thumb:** Start with 2–3 teammates. If the work is still bottlenecked (one agent waiting on another constantly), add a teammate. If you hit 5+ teammates and still have bottlenecks, the issue is not parallelization — it is that your tasks are too interdependent.

### Lead Agent Bottleneck

If the lead agent is also doing all the implementation work, it becomes a bottleneck. The whole point of a team is to let the lead orchestrate while teammates execute.

**Best practice:** Design your team so the lead is *only* creating tasks, coordinating blockers, and reporting progress. Let teammates do the coding.

---

## References

1. **Official Claude Code Documentation**
   https://code.claude.com/docs/en/agent-teams
   The canonical source for agent teams features, APIs, and best practices.

2. **"How to Set Up and Use Claude Code Agent Teams"** by darasoba
   https://darasoba.medium.com/how-to-set-up-and-use-claude-code-agent-teams-and-actually-get-great-results-9a34f8648f6d
   Medium tutorial covering team initialization, display modes, and common patterns.

3. **Gentleman-Programming/agent-teams-lite** on GitHub
   Open-source example of spec-driven development with 9 sub-agents. Shows how to decompose large projects into parallel tasks.

4. **"From Tasks to Swarms - Agent Teams in Claude Code"** by alexop.dev
   Blog post exploring scaling from solo agents to large teams, with real-world architecture examples.

5. **"30 Tips for Claude Code Agent Teams"** on Substack
   Practical tips including task naming conventions, dependency patterns, communication strategies, and debugging stuck teams.

---

**Next up:** [Chapter 3 — Scheduled Tasks & Automation Loops](./03-scheduled-tasks.md)
