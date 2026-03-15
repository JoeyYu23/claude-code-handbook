# Chapter 7: Large Project Patterns

Small tasks fit in a single conversation. Large projects do not. This chapter covers the patterns for maintaining momentum and quality across multi-session, multi-agent work — and includes a concrete case study of building a full-stack application with Claude Code.

---

## Sizing Your Project

The first decision is recognizing when you need a structured approach vs. a simple conversation. Use these thresholds as a starting point:

| Project Size | File Count | Recommended Approach |
|---|---|---|
| Small | 1-3 files | Direct conversation |
| Medium | 4-8 files | 1-2 parallel agents |
| Large | 9+ files | Architect → Coders → Review |

A "file count" here means the number of files that need to be created or significantly modified, not the total codebase size. A project that touches 3 files in a 10,000-file codebase is still a small project.

Other signals that suggest a structured approach:
- Multiple people will review the output (quality gates matter)
- The feature involves multiple layers (database, API, frontend)
- Work will span multiple sessions over days or weeks
- Mistakes are expensive to undo (production system, complex migrations)

---

## The Architect → Coders → Review Workflow

This is the core pattern for large projects. It separates concerns across three phases, each with different agent types and different goals.

### Phase 1: The Architect

The Architect phase produces a complete plan before any code is written. This is not just notes — it is a structured specification that the Coder agents can implement independently.

Run the Architect with high effort and the most capable model:

```text
/effort max
Enter plan mode and architect the following feature:

[Feature description]

The architecture document must include:
1. Database schema changes (exact column names and types)
2. API endpoints (method, path, request/response schema)
3. Frontend component tree
4. Data flow diagrams (as ASCII art)
5. External service integrations
6. Migration strategy (if modifying existing data)
7. Testing strategy

Split the implementation into parallel work streams. For each stream:
- Name the stream
- List the exact files to create or modify
- Describe what the stream does without touching other streams' files

This plan will be given directly to Coder agents. Write it for them, not for a human reader.
```

The output of the Architect phase is a document — saved to `ARCHITECTURE.md` or a similar file — that becomes the input to the Coder phase.

### Phase 2: The Coders

Once the architecture is approved, each Coder agent receives its specific work stream:

```text
Implement Work Stream 2: API Layer

Architecture specification:
[paste or reference the architecture doc]

Your specific stream:
- Files to create: src/api/notifications.ts, src/api/middleware/auth.ts
- Files to modify: src/api/router.ts
- Do not touch: frontend/, database/, or any file not listed above

Run tests for your stream when complete. Open a PR when done.
Do not ask questions — if something is ambiguous, make a reasonable assumption and document it in a comment.
```

The "do not touch files outside your stream" constraint is critical. Without it, agents from different streams may conflict on shared files.

For maximum speed, spawn all Coder agents in parallel:

```text
Spawn these three Coder agents in parallel. Give each agent only its stream specification:
1. Database stream agent
2. API stream agent
3. Frontend stream agent

Each should work independently and open a separate PR when done.
```

### Phase 3: The Reviewer

After all Coders finish, run review agents. These can also run in parallel:

```text
Run three parallel review agents on the code changes in the notification-system PRs:
1. Security review agent: focus on auth, input validation, data exposure
2. Integration review agent: verify the streams connect correctly (API calls DB correctly, frontend calls API correctly)
3. Quality review agent: coverage gaps, error handling, code clarity

Merge the three reviews into a prioritized action list.
```

After the review is addressed, run an integration test pass:

```text
Run the full test suite including integration tests.
If any tests fail, fix them sequentially.
Do not move on until all tests pass.
```

---

## Managing Context Across Sessions

Large projects span multiple sessions. Each session starts fresh, but you can persist context through several mechanisms.

### CLAUDE.md as Persistent Memory

Your project's `CLAUDE.md` is the primary cross-session memory mechanism. After the Architect phase, append the key decisions to `CLAUDE.md`:

```markdown
## Notification System (added 2025-03)

Architecture decisions:
- Notifications stored in PostgreSQL `notifications` table (not Redis)
- Email delivery via SendGrid (not SES) — account at notifications@company.com
- Frontend polling interval: 30 seconds (not WebSocket — revisit in v2)
- Rate limit: max 100 notifications per user per day

Current status: Database and API complete. Frontend in progress.
Open PRs: #234 (DB), #235 (API) — both approved, pending integration merge
```

At the start of the next session, Claude reads this and instantly knows the context.

### Session Naming

Use the `--name` flag or `/rename` command to give sessions meaningful names:

```bash
claude -n "notification-system-frontend"
```

Then resume by name:

```bash
claude -r "notification-system-frontend"
```

### Architecture Documents as Checkpoints

The architecture document from Phase 1 is a checkpoint. Any new session can read it and understand the full plan. Keep it updated as decisions change.

For very long projects, maintain a `STATUS.md` file:

```markdown
# Notification System Status

## Completed
- [x] Database migration (PR #234, merged)
- [x] API endpoints (PR #235, merged)

## In Progress
- [ ] Frontend components (PR #236, under review)
- [ ] Email templates (not started)

## Blocked
- Email templates blocked on SendGrid account setup (ticket #847)

## Next Session
Start with: frontend PR review feedback in PR #236
```

---

## The Two-Round Review Rule

For code quality without endless iteration, enforce a maximum of two fix rounds in the Review phase.

**Round 1:** Full review. All issues identified and fixed.

**Round 2:** If Round 1 fixes introduced new issues, one more pass to address them.

**Escalate or accept after Round 2:** If issues remain after two rounds, either accept the remaining issues as known debt (document in `CLAUDE.md`) or escalate to human review. Never let Claude loop indefinitely.

```text
Review the changes in PR #236. Fix all Critical and High severity issues.
This is round 1 of maximum 2 review rounds. Be thorough.
```

After fixes:

```text
This is round 2 and the final review pass. Focus only on any new issues introduced
by the round 1 fixes. Accept any existing Low severity issues — do not fix them in
this pass. Document accepted issues in code comments.
```

---

## Handling Long-Running Work

Some projects take days or weeks. Keep them on track with these practices:

**End each session with a summary:** Before closing Claude Code, run `/compact` and then ask for a status summary to append to `STATUS.md`. This becomes the starting point for the next session.

**Start each session with context loading:** Begin the new session with:

```text
Read CLAUDE.md and STATUS.md. Tell me the current project status in 3 bullet points, then confirm you are ready to continue.
```

**Use branches per feature stream:** Each parallel work stream should be on its own branch. This makes it easy to review, merge, or discard individual streams independently.

**Checkpoint before risky operations:** Before a large refactor or schema migration, ensure everything is committed and the current tests pass:

```text
Before starting the refactoring phase:
1. Confirm all current tests pass
2. Create a git checkpoint commit: "chore: pre-refactor checkpoint"
3. Then begin the refactoring
```

---

## Case Study: Building a Full-Stack Task Manager

Here is a condensed walkthrough of building a full-stack task management application using the Architect → Coders → Review pattern.

**Project:** A task manager with user authentication, task CRUD, real-time updates, and an API.

**Session 1: Architecture**

```text
/init
/effort high

Architect a full-stack task manager with these requirements:
- User auth (registration, login, JWT)
- Task CRUD with priorities and due dates
- Real-time updates via WebSocket
- REST API (Node.js/Express)
- PostgreSQL database
- React frontend

Output a complete architecture document as ARCHITECTURE.md.
Split implementation into exactly 4 parallel streams:
1. Database + migrations
2. Auth API (register, login, refresh, logout)
3. Tasks API (CRUD + WebSocket)
4. React frontend

For each stream, list exact files to create. No stream should modify another stream's files.
```

After reviewing the output architecture document and approving it, save it to `ARCHITECTURE.md`.

**Session 2: Parallel Implementation**

```text
Read ARCHITECTURE.md. We are in the Coder phase.

Spawn 4 parallel agents simultaneously. Each receives only its stream from ARCHITECTURE.md:
- Agent 1: Database stream
- Agent 2: Auth API stream
- Agent 3: Tasks API stream
- Agent 4: React frontend stream

Each agent should:
1. Implement all files in their stream
2. Write tests for their code
3. Run their tests and fix failures
4. Create a commit with message "feat: [stream name] implementation"

Report back when all 4 are complete with a summary of what each stream produced.
```

**Session 3: Integration and Review**

```text
Read ARCHITECTURE.md and STATUS.md.

Phase 1 - Integration check:
Run the full application (all services) and verify:
- User can register and log in
- JWT tokens work correctly
- Task CRUD operations work end-to-end
- WebSocket updates propagate to frontend

Phase 2 - Parallel review:
Run security review, performance review, and test coverage check in parallel.

Phase 3 - Fix critical issues:
Fix any Critical or High severity issues from the reviews. Maximum 2 fix rounds.

Phase 4 - Final status:
Update STATUS.md with completion status and any known issues.
```

This three-session workflow produces a complete, reviewed full-stack application. The key advantages over ad-hoc conversation:

- Each phase has a clear goal and end condition
- Parallel implementation reduces total time
- The architecture document prevents coordination errors
- Review cycles have explicit limits
- Status documentation ensures continuity across sessions

---

## Anti-Patterns to Avoid

**Skipping the architect phase:** Jumping directly to implementation without a plan leads to integration failures, inconsistent patterns, and wasted work when architectural decisions conflict.

**Mixing streams:** Allowing Coder agents to modify files outside their stream creates race conditions and merge conflicts.

**Unbounded review loops:** Without a maximum, review cycles can spiral as each round of fixes introduces new small issues.

**Losing cross-session context:** Not updating `CLAUDE.md` and `STATUS.md` means the next session starts cold, re-discovering decisions that were already made.

**Over-parallelizing:** Not every large project benefits from parallel agents. If the work is strongly sequential — where each step depends on the output of the previous — parallelism adds coordination overhead without speed benefit.

---

**Next up:** [Chapter 8 — Hook System Deep Dive](./08-hooks.md) — What hooks are, how to configure them, and real examples for auto-formatting, linting, and notifications.
