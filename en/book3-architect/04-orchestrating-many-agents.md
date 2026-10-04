# Orchestrating Many Agents

> Verified on 2026-10-04 with Claude Code 2.1.289.

Starting ten agents is now easy. Getting ten agents to produce one coherent, correct change is still hard. This chapter is about the second problem.

Claude Code gives you several ways to run work in parallel, from a single session that keeps itself going to a script that drives hundreds of subagents. Each step up buys throughput and costs you something: tokens, coordination overhead, and distance from the code. The people who have pushed furthest, toward what is now called a "software factory", report that the limit is rarely how many agents you can start. It is how much of their output anyone can check, integrate, and stand behind.

## The ladder from one agent to a factory

The official docs list five ways to run work in parallel: subagents, agent view, agent teams, dynamic workflows, and Projects. Add `/goal` at the bottom and a full delivery pipeline at the top, and you get a ladder. The main difference between the rungs is who holds the plan.

| Rung | Mechanism | Who decides what runs next | Where results end up |
|---|---|---|---|
| 1 | `/goal` on one session | The session, checked by a separate evaluator model after every turn | The session's transcript |
| 2 | Subagents and forks | Claude, turn by turn | Summaries returned to the parent session |
| 3 | Background sessions (`claude --bg`, `claude agents`) plus cross-session messaging | You | Each session's own branch and transcript |
| 4 | Agent teams (local) or Projects (cloud) | A lead or coordinator agent | A shared task list, or a thread per task |
| 5 | Dynamic workflows | A script | Script variables; one final report |
| 6 | Software factory | A pipeline of agents and gates, from intake to production | Pull requests, deploys, dashboards |

Climb only when the rung you are on has become the bottleneck. A single well-specified session with a verifiable end state beats a team of five vague ones, and it costs a fraction of the tokens.

## Rung 1: keep one agent going with `/goal`

`/goal` sets a completion condition. After each turn, a small, fast model reads the conversation and returns one of three verdicts: not yet met, met, or impossible. Until the verdict is "met", Claude starts another turn instead of handing control back to you.

```text
/goal all tests in test/auth pass, the lint step is clean, and no file outside src/auth is modified. Stop after 20 turns.
```

Three properties of the evaluator shape how you write conditions:

- **It only reads the transcript.** It does not run commands or open files. "Tests pass" works because Claude runs the tests and the output lands in the conversation. "The code is well designed" does not, because nothing in the transcript can show it.
- **It is a different model from the worker.** Completion is judged by a fresh model, not by the agent that wants to be finished. That is a small version of the main idea in [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents).
- **It does not change permissions.** To let goal turns run unattended, run `/goal` in [auto mode](/en/book1-getting-started/06-auto-mode-and-permissions). In manual mode, Claude still stops for each tool call your rules don't already allow.

A good condition has one measurable end state, a stated check ("`npm test` exits 0"), the constraints that must hold on the way there, and a bound on turns or time. `/goal` also works non-interactively: `claude -p "/goal CHANGELOG.md has an entry for every PR merged this week"` runs the loop to completion in one invocation.

## Rung 2: delegate inside one session

A **subagent** starts with a fresh context, does a side task, and returns a summary. A **fork** is a subagent that inherits the entire conversation so far, so you can hand it a task without re-explaining the background. Because a fork has the same system prompt and tools as its parent, its first request reuses the parent's prompt cache, which makes it cheaper than a fresh subagent for tasks that need the same context.

- `/subtask <task>` starts a fork that runs in the background and reports back into your conversation. It needs v2.1.212 or later; on v2.1.161 through v2.1.211 that command was called `/fork`.
- `/fork [prompt]` copies the whole conversation into a new background session (visible in agent view) that runs alongside the original; `/branch` instead switches you into a branch. (With agent view turned off, or on versions before v2.1.212, `/fork` starts a forked subagent instead.)
- Fork mode is on by default in interactive sessions, so Claude may fork on its own. It is off by default in `claude -p` and the Agent SDK.

Two default limits matter at scale. Subagents can nest up to three layers below the main conversation (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). Once 20 subagents are running in one session, spawning another fails with `Concurrent subagent limit reached` (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`). [Subagents](/en/book2-advanced/05-subagents) covers configuration in depth.

## Rung 3: run several sessions yourself

When tasks are independent and each is big enough to deserve its own conversation, dispatch them as background sessions:

```bash
claude --bg "Fix the date parsing bug in src/parser. Done when npm test -- parser passes."
claude --bg "Add input validation to POST /orders. Done when npm test -- orders passes."
claude agents          # one screen: working, needs input, done
```

A session started with `claude --bg` moves into its own git worktree under `.claude/worktrees/` before it edits files, so parallel sessions don't overwrite each other. `claude agents --json --all` prints every session's `state` (`working`, `blocked`, `done`, `failed`, `stopped`), which is the supported way for a script or another agent to supervise them.

Sessions can also talk to each other. With **cross-session messaging**, Claude finds your other sessions with `ListAgents` and sends plain-text messages with `SendMessage`. You can name a target with an `@` mention such as `@api-worker`. The receiving session is told that the message came from another session, not from you. Claude Code enforces this:

- A message never counts as your approval, so it can't answer a permission prompt.
- The receiving Claude is instructed not to change permission settings, `CLAUDE.md`, or other configuration because another session asked.
- A slash command inside a message arrives as plain text and is never executed.
- Repeated messages are throttled and at most 50 are queued, so a message loop between two sessions stops on its own.

Those rules are a design you should copy into any orchestration you build: a peer agent can inform you, but it cannot give you permission. [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions) and [Worktrees](/en/book2-advanced/08-worktrees) cover the day-to-day mechanics.

## Rung 4: let a coordinator run the team

**Agent teams** turn one session into a lead that spawns teammates, keeps a shared task list, and relays messages through a mailbox. They are experimental and off by default. Turn them on with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in your environment or in the `env` block of `settings.json`. Then ask for teammates in plain language.

The first edition described agent teams as a factory floor for big backlogs. The current docs are more modest, and the limitations explain why:

- Teammates are **not** isolated in worktrees. Two teammates editing the same file overwrite each other, so you must split the work so that each teammate owns its own set of files.
- Token use scales roughly linearly with the number of active teammates. The docs suggest starting with 3 to 5 teammates and about 5 or 6 tasks each.
- If you ask teammates to plan before implementing, **the lead approves their plans automatically, without review**. Plan approval is a coordination step, not a quality gate.
- A session has one team. Teammates can't spawn teammates. In-process teammates are not restored by `/resume`.
- Task status can lag, and dependent tasks then stay blocked until someone nudges them.

What teams do well is the work the docs recommend starting with: research and review, where teammates investigate different angles and challenge each other's findings. To turn "done" into something enforced rather than claimed, attach [hooks](/en/book2-advanced/09-hooks). A `TaskCompleted` hook that exits with code 2 blocks the completion and sends its feedback to the teammate, and `TeammateIdle` does the same when a teammate is about to stop.

**Projects** are the cloud version of a coordinator. You talk to one ongoing conversation at claude.ai/code or in the desktop app, and Claude starts a cloud session (a "thread") for each task. Threads share the project's instructions and memory, keep running when your laptop is closed, and show up in an Overview pane when they need you. Projects are in public beta on Pro and Max plans and not yet available on Team or Enterprise. Other tools have moved the same way: Cursor's changelog announced a coordinator agent that plans and delegates to implementing agents on 2026-09-10.

## Rung 5: put the plan in code with dynamic workflows

With subagents and teams, Claude is the orchestrator and every intermediate result passes through a context window. A **dynamic workflow** moves the plan into a JavaScript script that a runtime executes in the background. Loops, branches, and intermediate results live in script variables, so Claude's context only receives the final answer.

You opt in by asking for a workflow in your prompt, or with the keyword `ultracode`:

```text
ultracode: audit every API endpoint under src/routes/ for missing auth checks. Have a second agent try to reproduce each finding before it is reported.
```

Claude shows the planned phases and asks before the run starts (in auto mode, only on the first launch). `/workflows` lists runs and opens a progress view with agent counts, tokens, and elapsed time per phase. Defaults to know: up to 16 agents run concurrently, at most 1,000 agents per run, and no user input mid-run. If a run does what you want, press `s` in the progress view to save its script as a reusable command. The script itself is written to your session's directory under `~/.claude/projects/`, so you can read and diff it.

Workflows are the right rung when the orchestration should be repeatable and reviewable. A script that says "find, then verify each finding independently, then report only survivors" runs the same way every time. A lead agent improvising the same process may skip a step when its context gets crowded.

::: tip
Setting `/effort ultracode` makes Claude plan a workflow for every substantive task in the session, which uses far more tokens per request. Use the keyword per task unless you mean it for the whole session.
:::

## What a software factory looks like

A software factory goes past running many agents. Agents handle every stage from a request to running code in production, and humans set direction and gates.

Gergely Orosz's account of OpenAI's internal factory (The Pragmatic Engineer, 2026-09-15) describes the shape. Humans define outcomes. Codex gathers context from repositories and internal tools, implements, runs CI, and opens pull requests. Several domain-specialist agents review each change. Changes are classified by risk: high-risk ones can get stricter review, and areas of the codebase can opt in to an agent that auto-approves low-risk pull requests. Agents shepherd deploys and watch production, and a "Perf Factory" finds and proposes fixes for performance regressions. The bottlenecks he reports moved downstream: pull requests per engineer grew sharply, multiplying load on some internal systems, and native mobile releases still wait hours to days on app store review while code takes minutes.

Steve Yegge's "Fences, not Sandboxes" (2026-08-24) reports from an organization of around 50 to 60 agents. His conclusion is that this many agents can only coordinate through written text, so rules that people used to carry in their heads have to become explicit law. He argues for "fences" (in his words, "any mechanism that turns you away if you aren't supposed to be there") and role-based authority, rather than trying to contain agents in ever-higher walls. He also describes a rule lifecycle in which a rule tightens each time it is broken: custom, then warning, then written law, then mechanical enforcement. [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) turns that lifecycle into a change-control process, and [Containment and Security](/en/book3-architect/09-containment-and-security) takes up the fences argument.

## Why factories fail

The counter-argument is just as well documented.

**Nothing in the loop protects design quality.** In "Why Software Factories Fail" (HumanLayer, July 2026), Dex Horthy argues that this is a training problem, not a harness problem. Coding models are rewarded when tests pass, and "there is no penalty for eroding codebase maintainability". Tests give feedback in seconds. Bad architecture shows its cost over weeks or months, the first time a one-line change needs edits in eleven places. Because there is no fast oracle for maintainability, adding more loops and review bots does not fix it. His recommendation is to turn the lights back on: plan up front (product requirements, system architecture, program design, vertical slices), keep a human on design, and accept moving "2-3x faster, safely" over chasing 10x. In the Hacker News discussion, some practitioners pushed back and described setups that lean on adversarial review, formal-method traces and deep programmatic verification. Treat this as an open debate, not a settled result.

**Multi-agent systems fail in their own ways.** The MAST study ("Why Do Multi-Agent LLM Systems Fail?", Cemri et al., 2025) annotated more than 1,600 execution traces across seven frameworks. It sorted 14 failure modes into three groups: system design issues, misalignment between agents, and weak task verification. Its abstract notes that gains over single-agent baselines on popular benchmarks are often minimal. Most items in the checklist below exist because of one of those three groups.

**Throughput moves the bottleneck to review.** Addy Osmani makes the human version of the same point in "Human judgment doesn't leave the software factory. It relocates." (2026-08-21): "my cognitive bandwidth does not scale with the agents", and a higher number of checks does not by itself mean higher quality. If ten agents each open a pull request an hour, review is now the constraint, and anything that makes review weaker makes the whole factory worse.

**Cost grows with the number of agents, not with the value delivered.** Every teammate and every workflow agent has its own context window. Simon Willison's argument for default hard budget caps (2026-10-03) applies directly. For headless runs, `--max-budget-usd` stops spending at a fixed amount. [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured) shows how to measure what a parallel setup actually costs you.
<!-- AUTHOR-DATA: tokens or dollars for one representative task run solo vs. as a 3-teammate agent team, to show the multiplier -->

**Rules live in nobody's head.** Yegge's point again. With one agent, you can fix a misunderstanding in conversation. With fifty, any rule that isn't written down and enforced will be broken somewhere, all the time.

## A design checklist

Before you scale a setup up, check it against this list.

1. **One writer per file.** Partition by directory or module, or isolate writers in worktrees. Never let two agents edit the same file at once.
2. **Every task has a machine-checkable "done".** A test command, a build exit code, an empty queue. If you can't write the check, the task is not ready to delegate.
3. **The checker is not the worker.** Use a separate reviewer, a verifier, a hook, or the `/goal` evaluator. See [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents).
4. **Everything is bounded.** Turns (`--max-turns` in `-p` mode, which is documented in the CLI reference but hidden from `claude --help`, or a clause in the `/goal` condition), spend (`--max-budget-usd`), concurrency, and nesting depth.
5. **State lives in one place.** A task list, an issue tracker, or a script, not scattered chat messages.
6. **Humans sit where mistakes are expensive.** Design before work starts, and merges to the main branch and production after it. Approve those yourself, and let agents handle the rest.
7. **Measure rework, not just throughput.** Count how many agent pull requests merged without changes, and how many were reverted later. Throughput without this number tells you nothing.

## Try it: a two-session fan-out with a merge gate

This exercise runs two independent tasks in parallel and merges them only after each one proves itself. Use a git repository with a test suite.

1. Dispatch two background sessions, each with an explicit done condition and a different area of the code:

   ```bash
   claude --bg "In src/parser only: fix the failing date tests. Done when npm test -- parser passes. Commit on your branch."
   claude --bg "In src/orders only: add validation for negative quantities with a test. Done when npm test -- orders passes. Commit on your branch."
   ```

2. Watch them in `claude agents`. Attach to a row if it shows **Needs input**.
3. When both show done, review each branch: run `/code-review` against it from a fresh session, read the findings, and run the full test suite on the branch.
4. Merge one branch, rerun the full suite, then merge the second. If the second branch conflicts, tell its session what landed (cross-session messaging can do this) and have it rebase.

### Check that it worked

- `claude agents --json --all | jq '.[] | {name, state}'` shows both sessions with state `done`.
- `git worktree list` shows one worktree per session under `.claude/worktrees/`, so neither session wrote to your main checkout.
- After both merges, the full test suite passes on the main branch, and `git log` shows one commit (or one merge) per task.

## Sources

- "Run agents in parallel", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/agents
- "Keep Claude working toward a goal", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/goal
- "Create custom subagents" (forks, nesting, concurrency limits), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/sub-agents
- "Manage multiple agents with agent view", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/agent-view
- "Message your other Claude Code sessions", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/cross-session-messaging
- "Orchestrate teams of Claude Code sessions", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/agent-teams
- "Let Claude coordinate ongoing work with Projects", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/claude-projects
- "Orchestrate subagents at scale with dynamic workflows", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/workflows
- Gergely Orosz, "Inside OpenAI's agentic software factory", The Pragmatic Engineer, 2026-09-15. https://newsletter.pragmaticengineer.com/p/openai-software-factory
- Steve Yegge, "Fences, not Sandboxes", 2026-08-24. https://yegge.ai/essays/fences-not-sandboxes/
- Dex Horthy (HumanLayer), "Why Software Factories Fail", first committed 2026-07-23. https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md
- Mert Cemri et al., "Why Do Multi-Agent LLM Systems Fail?", arXiv:2503.13657, 2025. https://arxiv.org/abs/2503.13657
- Addy Osmani, "Human judgment doesn't leave the software factory. It relocates.", 2026-08-21. https://addyo.substack.com/p/human-judgment-doesnt-leave-the-software
- Simon Willison, "We're going to need default hard budget caps on pretty much everything", 2026-10-03. https://simonwillison.net/2026/Oct/3/default-hard-budget-caps/
- Cursor changelog, "Cursor Projects", 2026-09-10. https://cursor.com/changelog
