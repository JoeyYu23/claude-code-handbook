# Chapter 6: Parallel Agent Orchestration

Running agents sequentially is powerful. Running them in parallel multiplies that power. This chapter covers how to design, run, and manage parallel agent workflows — from the simple case of two independent research tasks to complex orchestration of dozens of agents across an entire codebase.

---

## The Parallel Opportunity

Consider a codebase with 50 independent modules that need to be migrated from one framework to another. Sequential migration would take 50 agent runs, each waiting for the previous to finish. Parallel migration can run all 50 simultaneously, completing the entire migration in the time of one agent run.

This is not hypothetical. The built-in `/batch` skill does exactly this: it analyzes a codebase, decomposes work into 5-30 independent units, and spawns one background agent per unit in an isolated git worktree.

---

## When Parallelism Works

Parallelism requires task independence. Two tasks are independent when:

- They modify different files (no merge conflicts)
- Neither depends on the output of the other
- They can be reviewed and merged separately

Classic independent tasks:
- Migrating different components to a new framework
- Adding tests to different modules
- Translating documentation into different languages
- Running different types of code review (security, performance, quality)
- Processing different branches or feature areas

Tasks that are NOT independent:
- Writing the database schema and the code that uses it
- Implementing an API endpoint and the frontend that calls it
- Refactoring a base class and all of its subclasses (touching shared files)

When tasks have dependencies, run them sequentially with the output of each feeding into the next.

---

## Running Agents in Parallel: The Basics

The simplest way to request parallel work is to ask Claude directly:

```text
Research the authentication, database, and API modules in parallel using separate agents.
I need to understand the current state of each before we start the refactor.
```

Claude will spawn three sub-agents, each exploring its module independently. All three run concurrently. When all three finish, Claude synthesizes the findings and reports back.

You can make this more explicit:

```text
Run the following three tasks in parallel using background agents:
1. Run the full test suite and report failures
2. Check for any security vulnerabilities in the auth module
3. Generate documentation for all public APIs

Report back when all three are complete.
```

Using the term "background agents" signals that you want concurrent execution. You can keep working in your main conversation while the agents run.

---

## The Coordinator Pattern

For complex workflows, design a coordinator agent that manages the parallel work:

```markdown
---
name: migration-coordinator
description: Coordinates parallel migration of multiple components
tools: Bash, Read, Glob
model: opus
maxTurns: 50
---

You are a migration coordinator. Your job is to:

1. **Analyze the scope**: Use Glob to find all components matching the pattern
2. **Assess independence**: Verify that components can be migrated independently
3. **Assign work**: For each component, spawn a background agent with specific migration instructions
4. **Monitor progress**: Check on agents as they complete
5. **Handle failures**: If an agent fails, assess whether it can be retried or needs human intervention
6. **Synthesize results**: Collect all migration summaries and produce a final report

When spawning migration agents, give each explicit instructions that include:
- Exactly which files to modify
- The target framework version and patterns to use
- How to run tests for that component
- What to include in the completion report
```

The coordinator runs with Opus for complex reasoning about work distribution. The worker agents can run with Sonnet for the actual migration work.

---

## The `/batch` Skill for Large-Scale Parallel Work

The built-in `/batch` skill is the most powerful tool for parallel work across a codebase. It:

1. Researches the codebase to understand the scope
2. Decomposes the work into 5-30 independent units
3. Presents a plan for your approval
4. Spawns one background agent per unit in an isolated git worktree
5. Each agent implements its unit, runs tests, and opens a pull request
6. Reports back with the PR URLs

```text
/batch migrate src/ from class components to functional React components
```

```text
/batch add TypeScript types to all JavaScript files in lib/
```

```text
/batch write unit tests for all functions in utils/ that have no test coverage
```

The worktree isolation is critical: each agent works in its own copy of the repository, so agents cannot conflict with each other even if they touch similar areas.

---

## Independent vs Dependent Task Detection

Before designing a parallel workflow, explicitly verify independence:

```text
I want to parallelize the following tasks. Tell me which ones are independent
and which have dependencies that require sequencing:

1. Add input validation to the user registration endpoint
2. Add input validation to the payment endpoint
3. Create a shared validation utility library
4. Update the user model to add a `validated_at` timestamp
5. Add validation tests to the test suite
```

In this example:
- Tasks 1 and 2 depend on Task 3 (they use the shared library)
- Task 4 is independent
- Task 5 depends on Tasks 1 and 2

The correct execution order:
- Phase 1 (parallel): Tasks 3 and 4
- Phase 2 (parallel): Tasks 1 and 2
- Phase 3: Task 5

---

## Monitoring Background Agents

While agents run in the background, you can check their status:

```text
/tasks
```

This shows all background tasks, their current status, and how many turns they have taken. For a named task:

```text
What's the status of the authentication migration agent?
```

Claude will check the agent's progress and report back.

If you want to be notified when an agent completes, you can set up a hook (covered in Chapter 8) that sends a notification. For CLI usage, the `--print` flag in combination with background monitoring works well for automated pipelines.

---

## Handling Agent Failures

Background agents can fail for several reasons:

- The task turned out to be more complex than expected
- A permission was needed that was not pre-approved
- The agent hit its `maxTurns` limit
- A tool call errored (test failure, compilation error, etc.)

**For permission failures:** Resume the agent in the foreground. You will be able to respond to the permission prompt interactively.

**For complexity failures:** Inspect the agent transcript at `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl` to understand where it got stuck. Then either increase `maxTurns`, provide additional context in the prompt, or break the task into smaller pieces.

**For error failures:** The agent will typically report the error in its completion message. Use that information to decide whether to retry, manually fix the issue, or escalate.

A resilient parallel workflow always includes a failure handling strategy:

```text
Run the migration for all 20 components in parallel. For each component:
- If migration succeeds: open a PR
- If migration fails: log the component name and error to migration-failures.md, do not open a PR
- Continue with other components regardless of individual failures

At the end, report: successful migrations, failed migrations with error summaries.
```

---

## Real-World Example: Large Feature Implementation

Here is how to implement a substantial new feature using parallel agents.

**Scenario:** Adding a notification system to a web application. The system needs a database schema, API endpoints, frontend components, email templates, and tests.

**Step 1: Research Phase (parallel)**

```text
Spawn three parallel research agents:
1. Explore the existing user system to understand User model structure and auth patterns
2. Explore the existing API patterns to understand endpoint conventions
3. Explore the frontend component patterns to understand the UI framework conventions

Wait for all three, then synthesize the findings.
```

**Step 2: Architecture Decision (sequential)**

```text
Based on the research findings, propose an architecture for the notification system.
Include: database schema, API endpoints, React component structure, email template approach.
Wait for my approval before proceeding.
```

**Step 3: Implementation (parallel)**

After approving the architecture:

```text
Implement the notification system using parallel agents, one per area:

Agent 1 - Database: Create migrations for notifications table and user_notification_settings table
Agent 2 - API: Implement GET /notifications, POST /notifications/read, DELETE /notifications endpoints
Agent 3 - Frontend: Create NotificationBell, NotificationList, and NotificationItem components
Agent 4 - Email: Create HTML email templates for each notification type

Each agent should write tests for their area. Run /batch if the workload is larger than expected.
```

**Step 4: Integration (sequential)**

```text
Now that all parallel implementations are done, create the integration layer:
- Wire the API to the database
- Connect the frontend components to the API
- Set up the email sending from the notification creation endpoint
- Run the full test suite
```

**Step 5: Review (parallel)**

```text
Run parallel review agents:
1. Security review of the new endpoints
2. Performance review (especially the query patterns)
3. Accessibility review of the frontend components
```

This workflow completes a substantial feature much faster than sequential development, while maintaining quality through parallel review.

---

## Context Cost of Parallel Results

One important consideration: when multiple parallel agents complete, their results all return to your main conversation. If each of 10 agents produces a 2,000-token summary, that is 20,000 tokens added to your context at once.

Manage this by:
- Instructing agents to produce concise summaries (not full reports)
- Having a coordinator agent aggregate results and return only the key points
- Using `/compact` after large parallel workflows to compress the accumulated context
- Breaking large parallel workflows into phases rather than running everything at once

---

## Agent Teams for Extended Parallelism

Sub-agents work within a single session. For work that requires sustained parallelism over a long period — or where each parallel worker needs its own extended context — Agent Teams provide a different model where each worker has a fully independent session.

Agent Teams are covered in the Claude Code documentation under `/en/agent-teams`. The key distinction: sub-agents share context inheritance from the parent session, while Agent Teams are fully independent sessions that coordinate through the parent.

For most parallel work, sub-agents with `context: fork` or background execution are sufficient. Consider Agent Teams when individual parallel tasks themselves need to be very long-running or require more context than fits in a sub-agent's window.

---

**Next up:** [Chapter 7 — Large Project Patterns](./07-large-projects.md) — The Architect → Coders → Review workflow, sizing decisions, and a case study of building a full-stack application.
