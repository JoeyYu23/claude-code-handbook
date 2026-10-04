# Skill Composition

> Verified on 2026-10-04 with Claude Code 2.1.289.

One skill does one job. Real work is a chain: research, plan, implement, check, ship. Composition is how you connect small skills so that each phase gets only the context it needs, instead of one long conversation where exploration clutters the implementation and the implementation clutters the review.

This chapter assumes you can write a skill. If not, start with [Custom Skills](/en/book2-advanced/02-custom-skills).

## Pattern 1: Stack skills in one message

Since 2.1.199 you can put several skills at the start of one message. Claude Code loads each of them and passes the trailing text to every one as its arguments:

```text
/write-tests /fix-issue 123
```

Both skills load, and both receive `123` as `$ARGUMENTS`. Claude then works on the issue with the test-writing rules and the fix procedure in view at once. This is the simplest composition there is, and it is the current example worth copying: keep cross-cutting guidance (testing rules, review checklists, house style) in small inline skills and stack them in front of task skills when needed.

The rules:

- Up to six skills expand: the first plus five more.
- Expansion stops at the first token that is not an inline, user-invocable skill. A skill that runs as a forked subagent, such as `/code-review`, ends the chain, and so does one whose arguments may start with a slash command, such as `/loop`. That token and everything after it become the arguments.
- Stacking does not merge permissions in any special way. Each skill's `allowed-tools` applies for that turn as usual.

## Pattern 2: Research in a fork, act in the main thread

Exploration is expensive in context. Put it in a skill with `context: fork`, so a subagent reads the files and only its summary comes back:

```yaml
---
name: research
description: Research a feature area and return a structured summary
context: fork
agent: Explore
background: false
---

Research the $ARGUMENTS area of the codebase. Return:
1. Relevant files with paths
2. Key functions and types
3. Patterns in use
4. Integration points for new work
5. Known debt or risks

No more than 500 words.
```

Then run your task skill:

```text
/research authentication module
/implement add refresh-token support to the authentication module
```

Two details matter for chaining. First, a forked skill runs in the background by default since 2.1.218; `background: false` makes the turn wait, so the summary is in the conversation before you run the next step. Second, the forked subagent does not see your conversation, so the skill must state the whole task. The built-in Explore and Plan agents also skip `CLAUDE.md` to keep their context small; if your conventions live there, use `general-purpose` or a custom agent.

## Pattern 3: Fresh data at invocation time

Shell injection makes a skill pull live state every time it runs, so a chain never works from stale input:

```yaml
---
name: sprint-plan
description: Plan the open issues in the current sprint
disable-model-invocation: true
context: fork
agent: Explore
background: false
allowed-tools: Bash(gh *)
---

## Current sprint issues
!`gh issue list --milestone "Current Sprint" --json number,title,body,labels`

## Task
Group the issues by area, mark dependencies between them, size each S/M/L,
and propose an order. Output a markdown table.
```

If an injected command fails, the whole invocation aborts and Claude never sees the skill. Use `|| true` on commands that can legitimately exit non-zero.

## Pattern 4: Reference skills and task skills

A shared library works best when it separates knowledge from actions:

```text
.claude/skills/
├── api-conventions/   # reference: user-invocable: false, paths: src/api/**
├── commit/            # task: disable-model-invocation: true
├── deploy/            # task: disable-model-invocation: true
└── component/         # task with templates/ beside SKILL.md
```

Reference skills set `user-invocable: false` so they stay out of the `/` menu, and `paths` so Claude loads them only when working on matching files. Task skills with side effects set `disable-model-invocation: true` so Claude never decides on its own that the code "looks ready" to deploy.

To give a custom subagent the same knowledge, list the skills in the subagent's `skills` field. Those skills are preloaded in full when the subagent starts, rather than listed by description. See [Subagents](/en/book2-advanced/05-subagents).

## Pattern 5: Skills that bring their own hooks

A skill can register [hooks](/en/book2-advanced/09-hooks) in its frontmatter. They are registered when the skill is invoked and stay active for the rest of the session, not only while the skill runs:

```yaml
---
name: refactor
description: Refactor code without changing behavior
disable-model-invocation: true
hooks:
  Stop:
    - hooks:
        - type: command
          command: "${CLAUDE_PROJECT_DIR}/.claude/hooks/run-tests.sh"
---

Refactor $ARGUMENTS: extract long functions, remove duplication, improve names.
Do not change behavior. Run the tests after every edit.
```

Use this for rules that must hold every time. A skill's instructions can fade after compaction; a hook fires on its event regardless.

## Pattern 6: Fan out with the right tool

An older pattern had a skill shell out to several `claude -p` processes to run reviews in parallel. That still works, but there are now better-fitting tools:

- **Subagents**, which Claude starts on its own or through `/subtask`, for a few parallel side tasks whose results return to the conversation.
- **`/batch <instruction>`**, a bundled skill that splits a large change into 5 to 30 independent units, each in its own worktree and background subagent.
- **Dynamic workflows**, scripts that fan work out across many subagents. See [Automated Workflows](/en/book2-advanced/10-automated-workflows).

A coordinator skill can describe the phases ("run the security and test checks, stop if either fails, then open the PR") and let Claude choose among these.

## Design rules

- **Keep each skill to one job.** `/commit` commits. A `/commit-and-review` skill is harder to reuse and harder to evaluate.
- **Design outputs as inputs.** Tables and fixed headings are easier for the next step to consume than prose.
- **Fork the expensive reads.** Anything that opens dozens of files belongs in `context: fork`.
- **Commit project skills with the code** so they change when the code does.

## Debugging a chain

1. Run each skill alone to find the failing step.
2. Use `/btw` to ask what Claude currently has in context before the next step.
3. Check `/context` between steps; if a step bloats it, fork that step.
4. If one skill triggers another by accident, tighten its description or set `disable-model-invocation: true`.

### Check that it worked

Create two small inline skills, `write-tests` and `fix-issue`, then send `/write-tests /fix-issue 123`. Claude's first reply should follow both sets of instructions, and both should show `123` as the argument. If only the first one applies, check that the second is not a forked skill, which ends the chain.

## Sources

- Commands reference (stacking skills), Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- Extend Claude with skills (pass arguments, run skills in a subagent, inject dynamic context, hooks in skills), Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/skills
