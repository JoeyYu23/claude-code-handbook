# Agent Catalog

> Verified on 2026-10-04 with Claude Code 2.1.289.

A general-purpose subagent can do anything, but a specialized one does its job with fewer mistakes: a narrow prompt, only the tools it needs, and a model sized to the work. This chapter lists the agent types Claude Code ships with, explains where your own agent files live, and gives a set of ready-to-use definitions you can copy into `.claude/agents/`.

For how subagents run (background, nesting, forks, caching), read [Subagents](/en/book2-advanced/05-subagents) first. The full field-by-field reference is in the [Agent Type Reference](/en/book3-architect/agent-reference).

## Built-in agent types

Claude Code registers these types in interactive sessions. Each inherits the main conversation's permission rules.

| Type | Model | Tools | Claude uses it for |
|---|---|---|---|
| `Explore` | The main conversation's model (with Fable as the main model on a subscription, the model the `opus` alias points to) | Read-only; Write and Edit denied | Searching and understanding code. Claude passes a thoroughness level: quick, medium or very thorough |
| `Plan` | Inherits from the main conversation | Read-only | Research during plan mode |
| `general-purpose` | `CLAUDE_CODE_SUBAGENT_MODEL` if set, else the main model | Every tool available to subagents | Tasks that need both exploration and edits |
| `claude` | None of its own; follows the subagent model order | Every tool available to subagents | Catch-all; also the default agent for sessions dispatched from agent view |
| `statusline-setup` | Sonnet | Not documented | Running `/statusline` |
| `claude-code-guide` | Haiku | Not documented | Questions about Claude Code itself |
| `fork` | Same as the main session | Same as the main session | A side task that needs the whole conversation (fork mode only) |

Three changes from early 2026 are worth knowing:

- **Explore is no longer a Haiku agent.** To get cheap exploration back, define your own agent named `Explore` with `model: haiku` (see the catalog below). A user or project agent with a built-in's name overrides it.
- **Explore and Plan skip your CLAUDE.md files** and the git status snapshot to stay fast. Every other built-in and custom agent loads both unless its file sets `omitClaudeMd: true`.
- **Explore and Plan are one-shot.** They return no agent ID, so Claude cannot resume them. Use `general-purpose` or a custom agent for work you expect to continue.

To remove built-ins:

- Block one type with a permission rule, for example `"deny": ["Agent(Explore)"]`, or `claude --disallowedTools "Agent(Explore)"`.
- Set `CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS=1` to remove only Explore and Plan.
- In `-p` mode and the Agent SDK, set `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS=1` to remove all built-ins and supply your own.
- Deny the `Agent` tool itself to stop all delegation.

## Where custom agent files live

An agent is a Markdown file with YAML frontmatter. The body is its system prompt. When two agents share a name, the higher-priority location wins:

| Priority | Location | Scope |
|---|---|---|
| 1 (highest) | `.claude/agents/` inside the managed settings directory | Organization |
| 2 | `--agents '<json>'` on the command line | This session only |
| 3 | `.claude/agents/` | This project (check it into git) |
| 4 | `~/.claude/agents/` | All your projects |
| 5 (lowest) | A plugin's `agents/` directory | Where the plugin is enabled |

Details that matter when you keep a catalog:

- **Subfolders are fine.** Claude Code scans `agents/` recursively, so `agents/review/` and `agents/research/` work. Identity comes only from the `name` field. In a plugin, the subfolder becomes part of the name: `agents/review/security.md` in plugin `my-plugin` registers as `my-plugin:review:security`.
- **Names must be unique** across the whole tree. Two files with the same name in one `agents/` directory load in filesystem order, not a documented one. `/doctor` reports such duplicates. Names cannot contain `:` or start with `-`.
- **Edits apply live.** Claude Code watches both directories and picks up a changed file within seconds. Restart only after creating the first file in an `agents/` directory that did not exist when the session started, or after editing agents under an `--add-dir` directory.
- **Broken files are skipped silently.** A file with no `name`, no `description`, a `---` that is not on line 1, or YAML that does not parse is skipped (the reason goes to the `--debug` log). Check a directory before you rely on it:

  ```bash
  claude plugin validate .claude/agents
  ```

- **Plugin agents are restricted.** For security, plugin agents ignore the `hooks`, `mcpServers` and `permissionMode` fields. Copy the file into `.claude/agents/` if you need them.
- **Descriptions cost context.** Every agent's description is loaded so Claude can choose. When the combined descriptions of your non-built-in agents pass 15,000 tokens, Claude Code warns at startup. Keep descriptions to a sentence or two and put detail in the body, which loads only when the agent runs.

## Frontmatter at a glance

Only `name` and `description` are required. Field names are camelCase and must match exactly; an unknown field is ignored without an error.

| Field | What it does |
|---|---|
| `tools` / `disallowedTools` | Allowlist / denylist. `disallowedTools` is applied first. `mcp__<server>` matches a whole MCP server |
| `model` | `sonnet`, `opus`, `haiku`, `fable`, a full model ID, or `inherit` |
| `effort` | `low`, `medium`, `high`, `xhigh`, `max` (available levels depend on the model) |
| `permissionMode` | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`. Ignored when the main session is in `bypassPermissions`, `acceptEdits` or auto mode |
| `maxTurns` | Turn cap; output past it is returned marked as partial |
| `skills` | Skills whose full text is preloaded at startup |
| `mcpServers` | MCP servers only this agent gets, by name or inline |
| `hooks` | Hooks active only while this agent runs |
| `memory` | `user`, `project` or `local` persistent memory directory |
| `background` | `true` keeps it in the background even when Claude wants to wait |
| `isolation` | `worktree` gives it a temporary git worktree |
| `omitClaudeMd` | `true` skips user, project and local CLAUDE.md files |
| `color` | Display color in the task list |
| `initialPrompt` | First user turn when the agent runs as the main session |
| `experimental.cacheTtl` | `5m` or `1h` prompt cache lifetime for this agent's requests |

The first edition listed an `auto` effort level and a `disable-model-invocation` field for agents. Neither is valid in agent files today.

## How to choose and scope an agent

Answer three questions before writing one:

1. **What does it hand back?** A summary of research needs read-only tools. A code change needs Edit and a way to check its own work.
2. **What is the blast radius?** Agents that only read are safe by construction. Agents that write, run commands or call external services need tighter `tools`, a `PreToolUse` hook, or a worktree.
3. **How long should it run?** Quick lookups get a small model and a low `maxTurns`. Long analysis gets a stronger model and more turns.

Then write a description that routes. "Code review specialist" is vague. "Reviews code for quality and security. Use immediately after writing or modifying code" tells Claude when to pick it. If the agent ships in a plugin, `claude plugin eval` can measure how reliably Claude delegates to it across realistic prompts (see [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods)).

## The catalog

Each definition below is a complete file. Save it under `.claude/agents/<name>.md` (or `~/.claude/agents/`) and adjust the commands to your stack.

### Code reviewer

Read-only, so it stays on analysis instead of drifting into fixes.

```markdown
---
name: code-reviewer
description: Reviews recent changes for correctness, security and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
maxTurns: 20
---

You are a senior code reviewer.

1. Run `git diff HEAD~1` (or the range you were given) to see the changes.
2. Review the modified files for:
   - Critical: security holes, broken logic, missing error handling
   - Warning: missing tests, unclear names, duplicated code
   - Suggestion: readability
3. Report three sections, Critical / Warning / Suggestion, each finding with file:line.

Do not comment on style unless it hurts readability. Do not edit files.
```

### Security auditor

A stronger model and more turns for threat analysis.

```markdown
---
name: security-auditor
description: Security review of authentication, input handling, file operations and external calls. Use before merging changes in those areas.
tools: Read, Grep, Glob, Bash
model: opus
maxTurns: 25
---

You are an application security engineer. Run `git diff main...HEAD` to see what changed.

Look for injection (SQL, shell, path), broken authentication or authorization,
secrets in code, missing input validation, insecure direct object references,
missing rate limits, and vulnerable dependencies.

For each finding give: severity (Critical/High/Medium/Low), file:line,
what is wrong, how it could be exploited, and a concrete fix.
```

### Refuter

New in this edition. Its only job is to try to disprove a claim another agent made. Use it on findings you are about to act on. See [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) for why a second agent agreeing is not proof, and why a different model helps.

```markdown
---
name: refuter
description: Tries to disprove one specific finding or claim from another agent. Use before acting on a bug report, review finding or "tests pass" claim.
tools: Read, Grep, Glob, Bash
model: sonnet
maxTurns: 15
---

You receive one claim. Assume it is wrong and try to show that.

- Reproduce it: run the test, the command, or read the exact lines cited.
- Look for the simplest explanation that makes the claim false.
- Report one verdict: CONFIRMED (with the evidence you produced yourself),
  REFUTED (with the counter-evidence), or UNVERIFIABLE (and what is missing).

Never report CONFIRMED on the strength of the original agent's description.
```

### Test writer

```markdown
---
name: test-writer
description: Writes tests for existing or newly changed code. Use after implementing a feature or when asked to add coverage.
tools: Read, Grep, Glob, Write, Edit, Bash
model: sonnet
---

Write tests for the code you are pointed at, following the framework and patterns
already used in the repository (check package.json, pyproject.toml, go.mod or Gemfile).

For each function: the normal path, edge cases (empty input, boundaries, null),
and expected failures. Mock external services.

Run the tests you wrote. Fix failures in the tests, not in the code under test,
unless the code is clearly wrong; in that case stop and report it.
```

### Flaky test detector

```markdown
---
name: flaky-detector
description: Finds tests that fail intermittently and explains why. Use when CI fails and passes on retry.
tools: Bash, Read, Grep
model: sonnet
---

Run the named tests five times in a row and record pass or fail for each run.

Then read the test code for common causes: time-dependent assertions, unseeded
randomness, real network calls, hardcoded paths or ports, shared global state,
and races in async code.

Report which tests failed, how often, and the most likely cause for each.
```

### Fast explorer (overrides the built-in Explore)

Because a user or project agent named `Explore` replaces the built-in, this file moves Claude's own codebase searches onto a cheaper model.

```markdown
---
name: Explore
description: Fast read-only codebase search. Use to find files, symbols and how a feature works before changing it.
tools: Read, Grep, Glob
model: haiku
maxTurns: 30
---

Explore the area you were asked about and return:
1. Key files with full paths
2. Main functions or classes and what they do
3. How data enters, changes and leaves
4. Where to start making a change

Stay under 500 words. Cite file:line.
```

### Read-only database analyst

The prompt asks for SELECT only; the hook enforces it. This pattern comes straight from the official docs.

```markdown
---
name: db-reader
description: Runs read-only SQL to answer questions about the data. Use for reports and data exploration.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a data analyst with read-only access. Write SELECT queries, run them,
and present results as a table with a one-paragraph explanation.
If asked to change data, explain what would be needed instead.
```

The script reads the hook's JSON from stdin and exits with code 2 to block writes:

```bash
#!/bin/bash
# ./scripts/validate-readonly-query.sh
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then
  echo "Blocked: only SELECT queries are allowed" >&2
  exit 2
fi
exit 0
```

Run `chmod +x ./scripts/validate-readonly-query.sh`, or the hook fails instead of blocking. Hooks in a project agent run only after you accept the workspace trust dialog for that folder. See [Hooks](/en/book2-advanced/09-hooks).

### Dependency auditor

```markdown
---
name: dep-auditor
description: Checks dependencies for known vulnerabilities and urgent updates. Use before releases.
tools: Bash, Read
model: haiku
maxTurns: 10
---

Run the audit tool for this project (npm audit, pip-audit, govulncheck ./...,
or bundle audit). List every High and Critical issue with its identifier.
Then list outdated packages and mark which updates are security-relevant.
Output a short, prioritized remediation list.
```

### Isolated refactorer

`isolation: worktree` gives each run its own git worktree, so a large mechanical change cannot collide with your checkout or with another agent. See [Worktrees](/en/book2-advanced/08-worktrees).

```markdown
---
name: refactorer
description: Applies a mechanical refactor across many files in an isolated worktree. Use for renames, API migrations and codemods.
isolation: worktree
model: sonnet
---

Apply the requested refactor to every affected file. Run the test suite.
Commit on the worktree's branch with a clear message, then report the branch name,
the files changed and the test result.
```

The worktree is removed automatically if the agent makes no changes. By default it branches from your repository's default branch, not your current `HEAD`; set `worktree.baseRef` to `"head"` if the refactor must build on unpushed work.

### Coordinator (main-session agent)

When you run an agent as the main session with `claude --agent coordinator`, the `Agent(type, ...)` syntax in `tools` limits which subagents it may start. This allowlist works only for the main-session agent; inside an ordinary subagent's file, the list in parentheses is ignored.

```markdown
---
name: coordinator
description: Splits a task across the refactorer and test-writer agents and merges their reports.
tools: Agent(refactorer, test-writer), Read, Bash
model: opus
---

Break the task into independent pieces. Give each piece to refactorer or
test-writer with exact file lists. Collect their reports and produce one summary
with what changed, what was tested, and what still needs a human decision.
```

## Running a catalog agent

| Want | Do |
|---|---|
| Let Claude decide | Name it in plain language: "Use the code-reviewer agent on my last commit" |
| Guarantee it runs | Type `@`, pick it from the typeahead, or type `@agent-code-reviewer` |
| Run the whole session as it | `claude --agent code-reviewer` (or set `"agent": "code-reviewer"` in `.claude/settings.json`) |
| Run it as a background session | `claude --agent code-reviewer --bg "address review comments on PR 1234"` |
| Dispatch it from agent view | Start the prompt with its name, or mention it with `@code-reviewer` |
| Try a definition without a file | `claude --agents '{"reviewer": {"description": "Reviews code", "prompt": "You are a code reviewer"}}'` |

### Check that it worked

1. Save one agent, for example `code-reviewer`, and validate the directory:

   ```bash
   claude plugin validate .claude/agents
   ```

2. In a session, type `@` and confirm the agent appears in the typeahead as `code-reviewer (agent)`.
3. Ask Claude to use it. The transcript shows a row such as `code-reviewer(Review last commit)`, and `/tasks` lists it with the model it ran on.
4. If it does not appear, run `claude --debug` and look for a skip reason (missing `description`, YAML parse error, a `:` in the name).

## Sources

- "Create custom subagents", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/sub-agents
- "Manage multiple agents with agent view", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/agent-view
- "Run parallel sessions with worktrees", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/worktrees
- "Commands", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- `claude --help` and `claude plugin validate --help`, Claude Code 2.1.289, run 2026-10-04.
