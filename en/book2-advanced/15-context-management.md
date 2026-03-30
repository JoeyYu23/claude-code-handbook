# Chapter 15: Context Window Management

## The Constraint That Governs Everything

Most best practices for using Claude Code effectively trace back to a single constraint: the context window.

The context window is the total amount of information Claude can "see" and reason about at once. Every message you send, every file Claude reads, every command output, every tool call result — all of it accumulates in the context window. Once it fills up, older content has to be summarized or dropped.

This matters for one reason above all others: **LLM performance degrades as the context window fills**. A Claude session with a half-full context window performs noticeably better than one with a nearly-full context window. Instructions get "forgotten." Connections between earlier decisions and current code become weaker. The frequency of subtle mistakes increases.

Understanding what fills the context window, how to monitor it, and how to manage it deliberately is one of the highest-leverage skills in using Claude Code at a professional level.

---

## What Fills the Context Window

Not all context is equal in size. Here is roughly how context accumulates during a typical session:

**High-cost sources:**
- Long file reads (Claude reading a 2,000-line file consumes a lot of tokens)
- Command output with verbose logging (a full test suite output, `npm install` logs)
- Large diffs (a 500-line PR diff adds up quickly)
- MCP tool results with large payloads (database query results with many rows)
- Repeated re-reading of the same files across multiple turns

**Medium-cost sources:**
- Conversation history (each exchange adds tokens from both sides)
- Error messages with stack traces
- Code snippets included in your prompts

**Low-cost sources:**
- Short messages and acknowledgments
- Tool calls that return minimal output
- Concise yes/no decisions

The practical implication: a Claude session that reads many large files will hit context pressure faster than a session focused on targeted, small edits.

---

## Monitoring Context Usage

Claude Code's interactive mode shows a progress indicator for context usage. When you approach limits, you will see warnings. For more precise monitoring, add a custom status line to your shell:

```bash
# In your Claude Code session, check context usage
/status
```

For automated monitoring, Claude Code supports OpenTelemetry metrics that expose token usage. For most developers, the built-in visual indicator is sufficient — just pay attention to it.

You can also ask Claude directly:

```text
How full is your context window right now? What are the largest
contributors to context usage in this session?
```

Claude Code will give you an honest assessment.

---

## The `/compact` Command

When context is getting full, `/compact` is your primary tool. It summarizes the conversation history into a condensed representation, freeing space for continued work while preserving the most important information.

**Basic compaction:**
```text
/compact
```

Claude automatically summarizes the session, keeping key decisions, file states, code patterns, and task status.

**Directed compaction:**
```text
/compact Focus on preserving the API design decisions and the list of files modified
```

Directed compaction is more reliable for complex sessions. Tell Claude what matters most and it will bias the summary toward that content.

**What survives compaction well:**
- Decisions about architecture and approach
- Lists of files that were modified
- Key requirements and constraints
- Code patterns and style decisions made during the session

**What compaction compresses or loses:**
- Detailed reasoning chains
- Intermediate exploration steps
- Discarded approaches (intentionally)
- Verbose error messages that were already resolved

**CLAUDE.md can guide compaction behavior.** Add instructions like this to ensure critical context always survives:

```markdown
# Compaction Instructions
When compacting, always preserve:
- The complete list of files modified in this session
- Any TODO items that were explicitly deferred
- Test commands that were confirmed to work
- Database migration steps that have been applied
```

---

## Auto-Compaction

Claude Code automatically compacts the conversation when you approach context limits, without requiring manual intervention. Auto-compaction kicks in before the window is completely full, preserving more context than a last-minute manual compact would.

You can observe auto-compaction happening: Claude Code will display a brief message when it compacts, and the context indicator resets to a lower level.

Auto-compaction is not a reason to stop managing context deliberately. Auto-compaction at the last moment (when the window is nearly full) produces lower-quality summaries than proactive compaction at a logical breakpoint.

**The strategic insight:** compact intentionally, at natural transition points in your work, before the window is under pressure. This gives you control over what the summary captures and what it discards.

---

## Strategic Compaction at Logical Breakpoints

The most effective context management strategy is to compact at the right moment, not just when the window is full. Logical breakpoints include:

**After completing a major feature:**
```text
/compact We finished implementing the OAuth flow. Preserve: files modified,
the session/token architecture decisions, and any edge cases we discussed.
```

**Before switching focus areas:**
```text
/compact We're done debugging the payment service for now and switching to
the notification system. Preserve the list of payment service fixes applied,
but we don't need the detailed debugging steps.
```

**After resolving a complex bug:**
```text
/compact The memory leak is fixed. Preserve: the root cause (event listener
not cleaned up in ComponentA), the fix applied, and the test we added.
Discard the failed approaches.
```

**Before a task that will read many files:**
```text
/compact before I read the entire authentication module, let me compact
the session to make room. Preserve current task: implementing password reset.
```

---

## Keeping Context Focused

Beyond compaction, several habits keep context pressure low:

**Use subagents for investigation.**
When Claude needs to explore a large codebase to answer a question, that exploration consumes your context. Delegate research to subagents instead:

```text
Use a subagent to explore how the authentication module handles session expiry.
Report back with a summary — I don't need the detailed file reads in this context.
```

The subagent does the exploration in a separate context window and reports a concise summary back to your session.

**Be specific about what Claude reads.**
`"Read the auth module"` causes Claude to read every file in the auth directory. `"Read src/auth/session.ts specifically"` reads one file.

```text
# Less efficient
Read the authentication module and understand how sessions work.

# More efficient
Read src/auth/session.ts and specifically explain how token refresh is handled.
```

**Use `/btw` for quick side questions.**
Introduced in v2.1.72 (March 10, 2026), the `/btw` command opens a side conversation that does not accumulate in the main context. It reuses the parent conversation's prompt cache, so there is no additional context cost:

```text
/btw what's the syntax for a TypeScript conditional type?
```

The answer appears in a dismissible overlay and never enters your conversation history. You can run `/btw` even while Claude is actively processing a response — it runs independently without interrupting the main turn. Think of it as the inverse of a subagent: a subagent gets full tool access but starts with no context, while `/btw` gets your full context but has zero tool access. It cannot read files, run commands, or search — it answers only from what is already in context.

This makes `/btw` perfect for quick lookups ("what was the name of that function?", "what's the syntax for X?") without polluting your working session.

**Clear context between unrelated tasks.**
The `/clear` command resets context completely. Use it when switching to a genuinely unrelated task:

```text
/clear
```

This is more aggressive than `/compact` — it discards everything. Use it when the current conversation's history provides no value for your next task.

---

## Signs You Are Running Low on Context

Watch for these behavioral signals that indicate context pressure:

- **Claude asks about things already discussed** earlier in the session
- **Instructions from CLAUDE.md stop being followed** consistently (though CLAUDE.md is re-injected after compaction)
- **Code quality regresses** — Claude starts making mistakes it was not making earlier
- **Claude refers to the wrong version** of a file or function (reading stale context)
- **Responses become vaguer** and less grounded in your codebase's specifics

When you notice any of these, compact immediately. Do not try to push through with an overfull context window — the quality degradation compounds.

---

## Tips for Long Sessions

Long sessions that span hours of work require a different approach than quick single-task sessions.

**Name your sessions descriptively.**
```text
/rename oauth-migration-2025-03-12
```

This makes it easier to resume the right session and helps Claude maintain orientation about the purpose of the work.

**Resume with context injection.**
When resuming a session after a break:
```bash
claude --continue
```

Then remind Claude of where you left off before diving back in:
```text
We were working on the OAuth callback handler. Last session we got the
authorization code exchange working but had not yet handled token refresh.
The modified files are src/auth/oauth.ts and src/auth/session.ts.
Continue from where we left off.
```

**Checkpoint-based workflow for multi-day projects.**
For projects spanning multiple days, treat the end of each session like a handoff document: ask Claude to write a brief summary to a notes file before you stop:

```text
Before we end this session, write a brief WORK_IN_PROGRESS.md file covering:
1. What was accomplished today
2. What state the code is currently in
3. What the next steps are
4. Any open questions or decisions deferred

This will be my re-entry point for tomorrow.
```

At the start of the next session:
```text
Read WORK_IN_PROGRESS.md and pick up where we left off.
```

---

**Next up:** [Chapter 16 — Token Optimization](./16-token-optimization.md) — Reducing costs and maximizing output quality through smart token management.
