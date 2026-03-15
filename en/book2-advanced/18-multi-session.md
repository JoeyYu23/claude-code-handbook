# Chapter 18: Multi-session Workflows

## Work That Spans Days

Most introductory Claude Code examples show a single session: you open it, accomplish something, close it. But professional development work does not fit in one sitting. Features take days. Migrations take weeks. Complex refactors require multiple focused sessions with review in between.

Multi-session work with Claude Code requires deliberate design. Without it, you re-explain context every time you start. With it, Claude picks up where you left off, accumulates knowledge about your project over time, and becomes more effective the longer you work together.

This chapter covers the mechanics and strategies for planning work across sessions, maintaining state between them, and managing long-running projects effectively.

---

## The Resume Mechanism

Claude Code saves all conversation history locally. Resuming a previous session is straightforward:

```bash
# Continue the most recent session
claude --continue

# Choose from recent sessions interactively
claude --resume
```

The `--continue` flag is the fastest path back into ongoing work. The `--resume` flag is more useful when you are juggling multiple parallel workstreams.

**Name your sessions for findability:**

```text
/rename feature-payment-refund
```

Or when starting a session focused on a specific task:

```bash
claude --continue "oauth-migration"
```

Named sessions are far easier to find in `--resume` than sessions named by their first message.

---

## Planning Work Across Sessions

For any project that will span multiple sessions, invest time at the start writing a proper plan. A good plan does double duty: it guides Claude through the work and serves as the handoff document between sessions.

**Session zero: planning and specification**

Start a dedicated planning session before writing any code:

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

Claude will produce a structured spec that you can work through systematically, with each session having a clear starting point and completion criteria.

**SPEC.md as session entry point:**

Once you have a spec, add this to your CLAUDE.md:

```markdown
At the start of each session, read SPEC.md and TASKS.md.
Ask me which task to work on today.
```

When you start a new session:

```text
Read SPEC.md and TASKS.md.
We're working on the password reset feature.
Last session completed Task 2 (email service integration).
Today let's work on Task 3: the reset token handler.
```

---

## Maintaining State Between Sessions

**The WORK_IN_PROGRESS pattern:**

Before ending a session, ask Claude to write a handoff document:

```text
We're wrapping up for today. Write WORK_IN_PROGRESS.md with:
1. What was completed this session (specific files changed, decisions made)
2. Current state of the code (what works, what's incomplete)
3. Next steps, in order
4. Any open questions or decisions deferred
5. Any gotchas discovered that will matter for the next session

Make it a re-entry briefing for tomorrow's session.
```

Starting the next session:

```text
Read WORK_IN_PROGRESS.md and brief me on where we are.
Then let's continue with the next steps.
```

**Auto memory for ambient context:**

Auto memory accumulates project knowledge passively. After several sessions on a project, Claude remembers:

- Which test commands work
- Environment setup requirements
- Architectural patterns used in the codebase
- Corrections you have made to its defaults

This ambient accumulation is valuable on its own. You do not need to actively manage it — just let it run.

**Git commits as session markers:**

A disciplined commit strategy makes multi-session context recovery easier. Ask Claude to commit at natural completion points during a session:

```text
We've got the token generation working and tested.
Make a commit with a descriptive message summarizing this work.
```

When starting a fresh session:

```text
Show me the last 5 commits to remind me where we are.
```

Git history serves as a ground-truth record of what has been completed, more reliable than conversation history.

---

## Handoff Strategies Between Sessions

Different contexts call for different handoff strategies.

**Same-day resume (short break):**

Use `claude --continue`. The full conversation history is intact. No special handoff needed.

**Next-day resume:**

```bash
claude --continue
```

Then orient Claude:

```text
It's the next day. Remind me: what were we working on and where did we leave off?
```

Claude will summarize the session history. Confirm the summary is accurate before continuing.

**After a week-long break:**

Context from a week ago may be stale — you've likely made other changes, merged PRs, or the requirements shifted. A fresh session with explicit context injection often works better than continuing:

```bash
claude  # New session, not --continue
```

Then:

```text
I'm returning to the password-reset feature after a week.
Read SPEC.md, WORK_IN_PROGRESS.md, and show me the git log for the last 10 commits.
Brief me on the current state before we continue.
```

**Parallel workstreams:**

For projects where you are working on multiple independent features simultaneously, use separate named sessions:

```bash
# Feature A session
claude --continue "feature-payment-refund"

# Feature B session
claude --continue "feature-user-segments"
```

Each session accumulates context specific to its workstream. Mixing unrelated context in a single session is a common source of confusion and quality degradation.

---

## Long-Running Projects: Days and Weeks

For projects spanning weeks, treat your Claude configuration as part of the project itself.

**Project-specific CLAUDE.md that grows with the project:**

Keep your CLAUDE.md current as the project evolves:

```text
Update CLAUDE.md to add the API conventions we established today.
Specifically: REST endpoints follow the pattern /api/v2/{resource}/{id},
and all handlers validate with the RequestSchema pattern from src/schemas/.
```

Over a multi-week project, your CLAUDE.md becomes a high-quality project knowledge base.

**Running a project spec through multiple sessions:**

```
SPEC.md Task List (managed across sessions):

## Phase 1: Foundation (Complete)
- [x] Database schema design
- [x] User model with email verification
- [x] Basic auth endpoints

## Phase 2: Features (In Progress)
- [x] Password reset flow
- [ ] OAuth Google login (next)
- [ ] OAuth GitHub login
- [ ] API rate limiting

## Phase 3: Production Readiness
- [ ] Monitoring and alerting
- [ ] Performance testing
- [ ] Security audit
```

Update this file as tasks complete:

```text
Mark 'Password reset flow' as complete in SPEC.md.
OAuth Google login is next — read the spec for that task and
start with the implementation plan.
```

**Using branches as session boundaries:**

For multi-week features, align Claude sessions with git branches. Each session works on one branch. This keeps changes clean and makes it easy to see exactly what each session produced:

```text
Create a branch called feature/oauth-google and switch to it.
We're starting a new feature today.
```

At session end:

```text
Commit everything on the current branch.
Push the branch.
Write a brief session summary to WORK_IN_PROGRESS.md.
```

---

## Session History and Recovery

Claude Code persists all conversation history locally in `~/.claude/`. This history is preserved indefinitely until you clear it.

To list recent sessions:

```bash
claude --resume
```

This shows an interactive list of recent sessions with their names, last activity time, and first message.

**Recovering from a crashed or interrupted session:**

If a session ended unexpectedly (terminal closed, power failure), `claude --continue` resumes the most recent session exactly where it left off, including any in-progress work. Claude Code checkpoints before each action, so you can review what was done before continuing.

**Rewind for session recovery:**

```text
/rewind
```

This opens the rewind menu. You can restore conversation state to any checkpoint in the session history, and optionally restore file state to match. This is useful when you want to undo several steps and try a different approach.

---

## Multi-Session Project Template

Here is a starter template for a long-running project, combining the patterns from this chapter:

**CLAUDE.md additions:**
```markdown
# Session Protocol
At the start of each session:
1. Read SPEC.md to understand the project and current phase
2. Read WORK_IN_PROGRESS.md if it exists
3. Show me the last 5 git commits
4. Ask which task to work on today

At the end of each session:
1. Commit completed work
2. Update WORK_IN_PROGRESS.md with current state and next steps
3. Mark completed tasks in SPEC.md
```

**Starting each session:**
```bash
claude --continue "project-name"
```

**Ending each session:**
```text
We're done for today. Please:
1. Commit all completed work
2. Update WORK_IN_PROGRESS.md
3. Mark any completed tasks in SPEC.md
```

This pattern transforms Claude from a per-session tool into a genuine project collaborator that accumulates knowledge and maintains continuity across weeks of work.

---

**Next up:** [Chapter 19 — CLAUDE.md Best Practices](./19-claude-md-patterns.md) — Battle-tested configurations for every project type.
