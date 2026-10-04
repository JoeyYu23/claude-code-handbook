# Verification and Evals at Scale

> Verified on 2026-10-04 with Claude Code 2.1.289.

When one agent wrote a few hundred lines a day, a careful human could read all of them. When several agents write thousands of lines a day, nobody can. Thorsten Ball put it bluntly in September 2026: "Code review will die. I mean: it's already dead." Geoffrey Huntley argues that software "doesn't need to be readable by a human" any more; "it needs to be explainable to a human." Addy Osmani takes a more careful line: "You don't need to have read every line, but you should be able to explain what the change does, what it touches and why it's safe to ship."

They disagree on how far this goes, but they agree on the direction. Reading code stops being the main gate, and checks take its place. This chapter is about building those checks:

1. Tasks that verify themselves.
2. Done-checks the agent cannot skip.
3. Evals for setups you use again and again.
4. Review agents, and how to keep them from drowning you in findings.
5. What humans still check when nobody reads every line.

Book 1's [Check the Work](/en/book1-getting-started/12-check-the-work) covers the basics for a single task. This chapter is about doing it for every task, across many agents, without you in the loop.

## 1. Tasks that verify themselves

Boris Cherny, who leads Claude Code at Anthropic, described in a 2026 interview how he had Claude Code rewrite the Electron Claude desktop app in Swift. As John Gruber quoted it, the instruction was: "I want you to run the Electron app in the Mac virtual machine, screenshot it, and then look pixel by pixel. Compare it to the Swift version. Don't stop until you're done." The task had been running for about two weeks when he described it.

Whatever you think of the result (Gruber was not impressed by the app itself), the shape of the task is the point. It has a goal, a check the agent can run on its own (screenshot and compare), and a stop condition tied to that check. The Claude Code best-practices guide explains why this matters: "Claude stops when the work looks done. Without a check it can run, 'looks done' is the only signal available, and you become the verification loop."

A check is anything that returns a signal the agent can read in the conversation:

| Kind of work | A check the agent can run |
| :- | :- |
| Logic, APIs, data handling | A test suite, or one new failing test that must pass |
| Builds, types, migrations | Build or type-check exit code |
| Output formats, reports, codegen | A script that diffs output against a fixture |
| UI | A screenshot compared against a design or the old version; see [Agents That See](/en/book2-advanced/14-agents-that-see) |
| A running app | The bundled `/verify` skill, which builds and runs your app to confirm a change instead of relying on tests or type checks |
| Data extraction | `claude -p ... --output-format json --json-schema '<schema>'`, so malformed output fails loudly |

A self-verifying task spec has four parts. The docs describe the most useful specs as ones that name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step. In practice:

```text
Goal: CSV export includes the `currency` column for every invoice row.
Files: src/export/csv.ts and its tests. Do not change the public API.
Out of scope: the PDF exporter, styling, unrelated refactors.
Done when: `npm test -- export` passes, a new test covers a multi-currency
invoice, and `node scripts/export-sample.js | diff - fixtures/sample.csv`
prints nothing. Show me the test output and the diff command's result.
```

The last sentence matters. Ask for evidence, not a claim: the command, its output, the screenshot. Reading evidence is faster than re-running the check yourself, and it works for sessions you were not watching.

### Protect the oracle

A check is only useful if the agent cannot quietly change it. Anthropic's November 2025 write-up on harnesses for long-running agents found agents marking features done without testing them properly, and its harness had to tell the coding agent that removing or editing tests was unacceptable. Instructions help. Enforcement is better.

Two ways to keep the agent away from the tests while it implements:

- **Write tests and code in separate sessions.** The best-practices guide suggests having one Claude write tests and another write code to pass them. Commit the tests first.
- **Deny edits to the test directory for the implementing session.** Pass a deny rule at launch:

```bash
claude --settings '{"permissions":{"deny":["Edit(tests/**)"]}}'
```

`Edit` rules cover every built-in tool that edits files, and a relative deny pattern like `tests/**` matches a `tests` directory at any depth under the current directory. Deny rules do not stop a script the agent runs from writing files itself; for that you need the [sandbox](/en/book3-architect/09-containment-and-security).

### Check that it worked

Give the agent a task with a deliberately failing check, for example a fixture that expects a column the code does not produce. The agent should iterate until the check passes and show you the passing output. If it reports success without showing evidence, tighten the "done when" sentence.

## 2. Done-checks the agent cannot skip

A check in the prompt works when you are watching. Unattended runs need the check enforced. The docs describe four levels, from least setup to most:

| Level | How | Who decides "done" |
| :- | :- | :- |
| In the prompt | "Run the tests and iterate until they pass" | The agent doing the work |
| `/goal` | A completion condition, checked after every turn | A separate small model reading the transcript |
| Stop hook | A script that blocks the turn from ending until it passes | Your script |
| Second opinion | A verification subagent or workflow that tries to refute the result | A fresh model with only the diff and the criteria |

### `/goal`

`/goal` sets a condition and keeps Claude working, turn after turn, until it holds:

```text
/goal all tests in test/auth pass, `npm run lint` exits 0, and no file under test/ is modified; or stop after 20 turns
```

After each turn, Claude Code sends the condition and the conversation to the small fast model, which returns not met, met, or impossible. Two details decide whether a goal works:

- **The evaluator does not run commands or read files.** It judges only what Claude has surfaced in the conversation. Write conditions that Claude's own output can demonstrate, such as a test result, an exit code or a clean `git status`.
- **Bound it.** Add a turn or time clause. Claude Code also stops the loop when Claude stops making progress, and returns control with the goal still set.

`/goal` works in non-interactive runs too: `claude -p "/goal CHANGELOG.md has an entry for every PR merged this week"`. It does not change the permission mode; for unattended turns, run it in auto mode.

### A Stop hook that runs the tests

`/goal` asks a model whether the condition holds. A Stop hook runs your own check, so the answer does not depend on a model's reading of a transcript. This hook runs the test suite when Claude tries to end a turn, but only if the working tree has changed, and blocks the stop while tests fail:

```bash
#!/usr/bin/env bash
# .claude/hooks/tests-must-pass.sh
cd "$CLAUDE_PROJECT_DIR" || exit 0
[ -z "$(git status --porcelain)" ] && exit 0   # nothing changed: allow the stop
if out=$(npm test 2>&1); then
  exit 0                                       # tests pass: allow the stop
fi
jq -n --arg log "$(printf '%s' "$out" | tail -n 40)" '{
  hookSpecificOutput: {
    hookEventName: "Stop",
    decision: "block",
    reason: "Tests are failing",
    additionalContext: ("The test suite fails. Fix the cause, not the tests. Last lines:\n" + $log)
  }
}'
```

Register it in `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/tests-must-pass.sh",
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

Why `additionalContext`: for a Stop hook, the `reason` field is shown to you, not to Claude. Claude sees the text in `additionalContext`, so the failing lines go there. Make the script executable with `chmod +x`.

Two cautions. Stop fires at the end of every turn, including turns where you only asked a question, so keep the check fast or scope it (the `git status` line is a crude version of that). And Claude Code stops honoring a Stop hook's block after a run of consecutive blocks without progress, so a hook cannot trap a session forever; the [hooks guide](https://code.claude.com/docs/en/hooks-guide) documents the cap and the `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` variable for raising it. [Hooks](/en/book2-advanced/09-hooks) in Book 2 covers the event model in full.

If the check needs judgment rather than a script, a Stop hook can use `type: "prompt"` (a single model call that returns `ok` and a `reason`) or `type: "agent"` (a subagent that can read files and run commands before deciding). Agent hooks are marked experimental in the docs; prefer command hooks for anything you rely on.

### Check that it worked

On a throwaway branch, break a test on purpose, then ask Claude for an unrelated small edit. When it tries to finish, the hook should block, and Claude's next message should mention the failing test. Run `/hooks` to confirm the hook is registered if nothing happens.

## 3. Evals: when the same kind of task repeats

Verification asks: is this change right? An eval asks: does this setup (a skill, a plugin, a prompt, an instruction file) reliably lead to right results across many tasks? You need evals once a setup is used repeatedly or by other people, because a single good run tells you almost nothing about a non-deterministic agent.

### Principles worth borrowing

Hamel Husain and Shreya Shankar's evals guide (September 2026) is written for LLM products in general, and its core advice transfers directly:

- **Error analysis first.** Look at real traces and name the failures before you write any eval. They call it "the most important activity in evals."
- **Binary pass or fail.** Not 1-to-5 scores, which make labels inconsistent.
- **Code checks before model judges.** Use assertions and regexes where you can; save LLM judges for failures that really need judgment, and check judges against your own labels.
- **No generic metrics.** Evaluate the failures you actually see.

### `claude plugin eval`

If your setup is a plugin, including a skills-directory plugin of the kind `claude plugin init` scaffolds under `~/.claude/skills/`, `claude plugin eval` is the built-in way to test it. It needs version 2.1.269 or later. Each case is a directory with a `prompt.md` and one or more graders:

```text
evals/release-notes/
├── prompt.md
└── graders/
    ├── mentions-breaking.md
    └── skill-fired.md
```

`prompt.md` holds the request, written the way a user would type it, plus run limits:

```markdown
---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Draft release notes for these changes: removed the v1 /export endpoint,
added a currency column to CSV export, fixed a crash on empty invoices.
```

A free regex grader checks the result; a `tool_used` grader checks that your skill produced it:

```markdown
---
type: regex
pattern: "(?:breaking|removed)[^\\n]*v1 /export"
flags: i
---
```

```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?release-notes"'
---
```

Run it from the plugin root:

```bash
claude plugin eval . --runs 5 --threshold 0.8 --max-cost-usd 5
```

Each case runs several times (three by default), and again with no plugin loaded. The report shows a `WITH` score, a `W/OUT` score and the difference, `Δ`, which is what the plugin contributed. If a case scores 1.0 both with and without the plugin, the plugin is not what made it pass. `--threshold` makes the command exit 1 when a case scores below it, so the same line gates CI. `--max-cost-usd` aborts with partial results if the run gets expensive.

Grader types: `regex`, `tool_used`, `tool_order` and `file_exists` are computed from the transcript and files and cost nothing; `llm` and `baseline` call a judge model. Every run and every judge call is a real model call on your account. `claude plugin eval init` interviews you and drafts cases and graders if you would rather not start from blank files.

### Evals for apps you build on the Claude API

For your own Claude-powered application (not your Claude Code setup), the bundled `/claude-api` skill has `build-eval` and `hillclimb` subcommands (version 2.1.259 or later) that build an eval set and then iteratively improve the app against it. Hamel Husain reviewed this tool on 2026-09-30. He found it strong at discovering issues out of the box, but criticized it for pushing you to write evals before looking at data, for reviewing annotations in markdown files rather than a proper labeling interface, and for bundling four distinct failure checks into one evaluator. His conclusion: "If an eval tool doesn't put looking at data at the center of your workflow, it's not worth using." Do your own error analysis first, then use the tool to scale what you found, and split evaluators so each checks one failure.

### Check that it worked

A useful eval fails when it should. Make a change you know is worse (delete a key step from the skill) and re-run `claude plugin eval`. The score or `Δ` should drop. If it does not, your graders are not measuring what you care about.

## 4. Review agents

A reviewer in a fresh context sees the diff and the criteria, not the reasoning that produced the change, so it judges the result on its own terms. Claude Code ships several:

- **`/code-review`** reviews the current diff, or a PR, branch or path you pass, for correctness bugs. It runs as a background subagent with its own context, so it does not fill your conversation. At `low` and `medium` effort it reports only its most confident findings; `high` through `max` broaden coverage and may include findings it is less sure about. `--fix` applies the findings, `--comment` posts them on the pull request, and `--max-findings` (version 2.1.288 or later) changes how many it reports.
- **`/code-review ultra`** (alias `/ultrareview`) runs a deeper multi-agent review in a cloud sandbox. `claude ultrareview` runs it from a script and prints the findings.
- **`/simplify`** runs four parallel agents looking for cleanup (reuse, simplification, efficiency, level of abstraction). It does not look for bugs.
- **`/security-review`** reviews your branch's changes for vulnerabilities.
- **Code Review for GitHub** (research preview, Team and Enterprise) reviews PRs automatically. Several agents look for different classes of issue, then a verification step checks candidates against actual code behavior to filter false positives. It reads `CLAUDE.md` and a review-only `REVIEW.md` from the repository. The docs put the average cost at $15 to $25 per review, billed separately from plan usage.

For checks the built-ins do not cover, such as "does this diff implement the plan?", write your own reviewer subagent:

```markdown
---
name: plan-checker
description: Checks a finished diff against PLAN.md. Use after implementation, before opening a PR.
tools: Read, Grep, Glob, Bash
---
You check finished work against its plan. You did not write this code.

1. Read PLAN.md and list every requirement and named edge case.
2. Read the diff with `git diff main...HEAD`.
3. For each requirement: implemented or not, with file:line evidence.
4. For each edge case: is there a test that exercises it? Run it.
5. List any change outside the plan's scope.

Report only gaps that affect correctness or a stated requirement.
Style preferences are not findings. If everything holds, say so in one line.
```

Save it as `.claude/agents/plan-checker.md`. The last two lines are the important ones. The best-practices guide warns that "a reviewer prompted to find gaps will usually report some, even when the work is sound," and that chasing every finding leads to over-engineering. Tell reviewers what counts as a finding and that "nothing found" is an acceptable answer.

For many findings at once, a dynamic workflow can fan out reviewers and then have independent agents adversarially check each finding before it is reported; the docs' own example prompt is "audit every route handler under src/routes/ for missing authentication checks, and adversarially verify each finding before reporting it." [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) covers adversarial review and its limits, including the shared blind spots of agents built on the same model.

### Check that it worked

Plant a bug you know about (an off-by-one in a loop, an unscoped database query) on a branch and run `/code-review`. A review setup you can trust finds it. Then run it on a clean, correct change: if it still produces a page of findings, tighten what counts as a finding.

## 5. What to check when nobody reads every line

If humans stop reading every diff, what do they still check? The practitioners cited above point to the same few places.

- **The request.** Ball predicts that "most bugs won't be 'coding' bugs. They'll be 'you asked for the wrong thing' bugs." The spec, the acceptance criteria and the "done when" line are now the highest-leverage thing a human reviews.
- **The tests.** Osmani: "Tests as an independent check on an author you don't fully trust will be the most valuable code you own." Read the tests even when you skip the implementation. Check that they test the requirement, and that the agent did not change them to pass.
- **The evidence.** Test output, screenshots, the command and its result. If the evidence is missing, the work is not done.
- **The blast radius.** Osmani again: "Agents do the first pass and humans cover blast radius."
- **An explanation on demand.** Huntley's point: ask the agent to explain the change, what it touches and what could break, and judge the explanation. If it cannot explain it clearly, neither can you, and it should not ship.

Turn this into a policy by risk. The tiers below are a starting point, not a standard; adjust them to your system:

| Tier | Examples | Gate before merge |
| :- | :- | :- |
| Low | Internal tools, copy, styling, test-only changes | Automated checks pass; `/code-review` at default effort |
| Medium | Business logic, new endpoints, data transformations | The above, plus a human reviews the spec and the tests and reads the agent's explanation |
| High | Auth, payments, permissions, data migrations, deletion, infrastructure | The above, plus a human reads the diff, tests were written separately from the code, and the rollout can be reversed |

[Team Workflows](/en/book3-architect/12-team-workflows) covers how to apply tiers like these across a team.

### Check that it worked

Take your last ten merged agent changes and sort them into tiers. For each, ask whether the gate in the table actually ran. Any high-tier change that merged on automated checks alone is the gap to close first.

<!-- AUTHOR-DATA: optional example from the author's own work of a verification gate catching a bug that a human would not have read, with numbers if available -->

## Key takeaways

- When nobody reads every line, the check is the gate. Give every task a check the agent can run, a stop condition, and a request for evidence.
- Keep the agent away from its own oracle: separate test-writing from implementing, and deny test edits while implementing.
- Enforce "done" for unattended work with `/goal` (a model judges the transcript) or a Stop hook (your script decides).
- Use evals for setups you reuse. Start from real failures, prefer binary code checks, and compare against a no-plugin baseline with `claude plugin eval`.
- Review agents help when you tell them what counts as a finding. Humans review the request, the tests, the evidence and the blast radius.

## Sources

- Thorsten Ball, "What I believe about the future of software development", 2026-09-19. https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/
- Geoffrey Huntley, "software doesn't need to be readable anymore. it needs to be explainable.", 2026-10-02. https://ghuntley.com/readable/
- Addy Osmani, "The Code Nobody Reads", 2026-09-28. https://addyo.substack.com/p/the-code-nobody-reads
- John Gruber, Daring Fireball, on Boris Cherny's Swift rewrite of the Claude app, 2026-08-02 (quoting Cherny's interview at ycrootaccess.com). https://daringfireball.net/linked/2026/08/02/cherny-claude-swift
- Justin Young, "Effective harnesses for long-running agents", Anthropic Engineering, 2025-11-26. https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Hamel Husain and Shreya Shankar, "AI Evals: Everything You Need to Know", 2026-09-18. https://hamel.dev/blog/posts/evals-faq/index.html
- Hamel Husain, "Claude's new auto eval tool", 2026-09-30. https://hamel.dev/blog/posts/claude-auto-evals/index.html
- Anthropic, Claude Code docs, accessed 2026-10-04: "Best practices" https://code.claude.com/docs/en/best-practices ; "Keep Claude working toward a goal" https://code.claude.com/docs/en/goal ; "Hooks reference" https://code.claude.com/docs/en/hooks ; "Automate actions with hooks" https://code.claude.com/docs/en/hooks-guide ; "Configure permissions" https://code.claude.com/docs/en/permissions ; "Test plugins with evals" https://code.claude.com/docs/en/plugin-evals ; "Code Review" https://code.claude.com/docs/en/code-review ; "Commands" https://code.claude.com/docs/en/commands ; "Skills" https://code.claude.com/docs/en/skills ; "Create custom subagents" https://code.claude.com/docs/en/sub-agents ; "Orchestrate subagents at scale with dynamic workflows" https://code.claude.com/docs/en/workflows
- Claude Code 2.1.289 CLI help (`claude --help`, `claude plugin eval --help`), 2026-10-04.
