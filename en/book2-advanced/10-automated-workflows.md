# Automated Workflows

> Verified on 2026-10-04 with Claude Code 2.1.289.

Claude Code is also a command you can call from scripts, CI jobs and other programs. This chapter covers three layers of automation:

1. **`claude -p`**: one non-interactive run inside a shell script or pipeline.
2. **GitHub Actions**: the same engine triggered by repository events.
3. **Dynamic workflows**: a script that Claude writes and a runtime executes, fanning one task out to dozens or hundreds of subagents.

Running agents on a timer (routines, cron, launchd) is covered in [Scheduled Agents and Routines](/en/book3-architect/06-scheduled-agents-routines). Hooks, which automate what happens inside a session, are in [Hooks](/en/book2-advanced/09-hooks).

## `claude -p`: one run, no conversation

Add `-p` (or `--print`) and Claude Code runs the prompt, prints the result and exits:

```bash
claude -p "What does the auth module do?"
```

It reads stdin, so it fits in a pipe:

```bash
cat build-error.txt | claude -p 'concisely explain the root cause of this build error' > output.txt
```

The exit code is 0 on success and non-zero when the run fails, so scripts can branch on it. A failure inside the run, such as missing credentials, is printed as the result on stdout rather than stderr. Piped stdin is capped at 10 MB; for bigger inputs, write a file and name it in the prompt.

One small trap: when nothing is piped in, Claude Code waits a few seconds for stdin and prints a warning before going on. In scripts that pipe nothing, add `< /dev/null`.

### Start from a clean slate with `--bare`

By default a `-p` run loads everything an interactive session would: your `CLAUDE.md`, skills, plugins, hooks, MCP servers and auto memory, from both the project and `~/.claude`. That makes a CI result depend on whoever's machine it runs on. `--bare` skips all of that auto-discovery:

```bash
claude --bare -p "Summarize README.md" --allowedTools "Read"
```

In bare mode Claude has the Bash, file read and file edit tools, and nothing you do not pass explicitly. Load what you need with flags: `--append-system-prompt` (or `-file`), `--settings`, `--mcp-config`, `--agents`, `--plugin-dir`. Bare mode never reads OAuth credentials or the keychain, so it needs `ANTHROPIC_API_KEY` (or an `apiKeyHelper` in `--settings`); cloud providers use their own credentials as usual. The docs recommend `--bare` for scripted runs and say it will become the default for `-p` in a future release.

::: warning `-p` trusts the folder
An interactive session asks before trusting a new folder and before connecting a project's `.mcp.json` servers. A `-p` run asks nothing: it runs the hooks in the repo's `.claude/settings.json` and connects its MCP servers even in a folder you have never opened. Before scripting `claude -p` over a repository you did not write, use `--bare` or read its `.claude/` directory first.
:::

### Permissions when nobody is watching

A `-p` run cannot stop to ask you. Decide up front what it may do:

- **`--allowedTools`** pre-approves tools with permission-rule syntax: `"Read,Edit"`, or `"Bash(git diff *),Bash(git commit *)"`. The space before `*` matters: `Bash(git diff*)` would also match `git diff-index`.
- **`--tools`** limits which built-in tools exist at all. `--tools ""` gives Claude none, which suits a pure review of piped text.
- **`--permission-mode`** sets the baseline. `dontAsk` denies anything that would prompt (good for locked-down CI); `acceptEdits` lets Claude write files; `auto` lets the classifier review each action. A run that sets no mode starts in the built-in default, which can be `auto`, so set the one you want.
- **`--permission-prompts none`** (v2.1.259 and later) tells Claude that nobody can approve a request, so it does not wait or retry. Useful in scheduled jobs.
- **`--dangerously-skip-permissions`** skips every check. The CLI's own help recommends it only for sandboxes with no internet access.

```bash
claude -p "Update the dependency pins and run the tests" \
  --permission-mode auto --permission-prompts none
```

[Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions) explains what the auto-mode classifier allows and blocks.

### Machine-readable output

`--output-format` picks the shape: `text` (default), `json` (one object at the end) or `stream-json` (one JSON event per line). The JSON object carries `result`, `session_id`, `is_error`, `num_turns`, usage and `total_cost_usd`, a client-side estimate that can differ from your bill.

Check `is_error`, not only the exit code. In one of our test runs the API refused the request for lack of credit: the object said `"subtype": "success"`, but `is_error` was `true` and `result` held the error message.

For data you will parse, add `--json-schema`. The validated object lands in `structured_output`:

```bash
claude -p "Extract the main function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output'
```

`stream-json` with `--verbose` and `--include-partial-messages` streams tokens as they arrive. Messages from subagents carry the `parent_tool_use_id` of the call that started them; `--forward-subagent-text` adds their text and thinking too. The first event, `system/init`, lists the MCP servers and plugins that loaded, with `mcp_server_errors` and `plugin_errors` when something did not, so a CI job can fail loudly on a missing server instead of quietly running without it.

### Put a ceiling on every run

- **`--max-turns N`** stops after N agentic turns and exits with an error. (It is in the CLI reference but not in `claude --help`.)
- **`--max-budget-usd 5.00`** stops when estimated spend reaches the cap. Subagent spend counts, and once the cap is hit no new subagent can start.
- **`--model`** takes an alias (`sonnet`, `opus`, `haiku`, `fable`) or a full model name. Routine jobs such as labelling or changelog drafts rarely need the largest model.

If Claude starts a background subagent or workflow, `claude -p` waits for it, because its result is part of the output. The wait ends after 10 minutes of continuous idling (`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` changes that). If a supervisor kills the run with SIGTERM, it exits with code 143 and records no result for the unfinished turn.

### Conversations across calls

`--continue` resumes the most recent conversation in this directory; `--resume <id>` resumes a specific one:

```bash
session_id=$(claude -p "Start a review of src/billing" --output-format json | jq -r '.session_id')
claude -p "Now focus on the database queries" --resume "$session_id"
```

User-invoked skills and saved workflows work in `-p`: put `/skill-name` in the prompt and Claude Code expands it.

## Recipes

### A project-specific linter

Pipe the diff in so Claude needs no shell access to read it:

```json
{
  "scripts": {
    "lint:claude": "git diff main | claude -p \"you are a typo linter. for each typo in this diff, report filename:line on one line and the issue on the next. return nothing else.\""
  }
}
```

### A CI gate that fails on critical findings

Ask for structured output, then let `jq` decide the exit code:

```bash
#!/bin/bash
# ci/security-gate.sh: fail the build if the diff has a critical finding
set -euo pipefail
SCHEMA='{"type":"object","properties":{"findings":{"type":"array","items":{"type":"object","properties":{"severity":{"type":"string","enum":["critical","high","medium","low"]},"file":{"type":"string"},"summary":{"type":"string"}},"required":["severity","file","summary"]}}},"required":["findings"]}'

git diff origin/main...HEAD | claude --bare -p \
  "Review this diff for security problems. Report each one as a finding." \
  --tools "" --max-turns 3 --output-format json --json-schema "$SCHEMA" > review.json

jq '.structured_output.findings' review.json
jq -e '.is_error == false and ([.structured_output.findings[] | select(.severity == "critical")] | length == 0)' review.json
```

When we fed it a diff that concatenated user input into a SQL query, it returned a `critical` SQL-injection finding and the final `jq -e` exited 1, failing the job. Treat a gate like this as a second pair of eyes, not a guarantee: [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) covers why one model's "no findings" is weak evidence.

### Staged scripts

Chaining `-p` calls is still a good fit when each step has a clear pass/fail check:

```bash
claude -p "Run the test suite. If anything fails, output FAIL: and a summary. Otherwise output PASS." \
  --allowedTools "Bash(npm test)" --max-turns 5 < /dev/null | grep -q "^PASS" || exit 1

claude -p "Draft a Keep a Changelog entry for the commits since the last tag. Output only Markdown." \
  --allowedTools "Bash(git log *),Bash(git describe *)" --max-turns 3 < /dev/null > NEXT_CHANGES.md
```

Keep commits, tags and pushes in plain shell, after a human or a check has looked at the output.

## GitHub Actions

The official action is `anthropics/claude-code-action@v1`. The fastest setup is `/install-github-app` inside Claude Code in a github.com repository: it installs the Claude GitHub App, stores your credential as a secret and opens a pull request with the workflow file. For a subscription instead of API billing, generate a token with `claude setup-token` and pass it as `claude_code_oauth_token`.

Respond to `@claude` in issue and PR comments:

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

With a `prompt` input the action runs in automation mode on any event, including a schedule. For a plain-text prompt, Claude has no shell or GitHub API access until you grant it, so name the tools:

```yaml
on:
  schedule:
    - cron: "0 9 * * *"
jobs:
  report:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: read
      id-token: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Generate a summary of yesterday's commits and open issues"
          claude_args: |
            --model claude-opus-5-5
            --allowedTools "mcp__github__list_commits,mcp__github__list_issues"
```

`claude_args` accepts any CLI flag, which is where `--max-turns` and `--model` go now; workflows still on `@beta` with inputs like `max_turns` need moving to `@v1`. The `prompt` can also be a skill (`/skill-name`, after `actions/checkout`) or a plugin skill installed with the `plugin_marketplaces` and `plugins` inputs. GitHub withholds secrets from runs triggered by fork pull requests, so reviews only run on branches in the same repository.

Each run costs Actions minutes and model tokens. Cap both: `--max-turns` in `claude_args`, a job `timeout-minutes`, and GitHub's `concurrency` controls.

## Dynamic workflows: many agents from one script

A subagent is one worker that Claude spawns and supervises turn by turn. A **dynamic workflow** moves the plan out of Claude's head and into a JavaScript script: Claude writes the script, a runtime executes it in the background, and the loops, branching and intermediate results live in script variables instead of Claude's context. Claude sees only the final answer.

| | Subagents | Dynamic workflow |
| :- | :- | :- |
| Who decides what runs next | Claude, turn by turn | The script |
| Where intermediate results live | Claude's context window | Script variables |
| What you can rerun | The worker definition | The whole orchestration |
| Typical scale | A few tasks per turn | Dozens to hundreds of agents |
| After an interruption | The turn restarts | Resumable in the same session |

Reach for one when a task is bigger than one context can hold, or when the same step runs over many items: a sweep of every route handler, a 500-file migration, a research question that needs sources checked against each other. Because the orchestration is code, it can also bake in a quality pattern, such as having independent agents try to refute each other's findings before anything is reported.

Dynamic workflows are on paid plans, the Anthropic API, Bedrock, Google Cloud and Foundry. On Pro, switch them on in `/config`.

### Start one

- **Try the built-in one:** `/deep-research <question>` fans out web searches, cross-checks sources, votes on each claim and returns a cited report.
- **Ask for one:** say "use a workflow to ..." or put the keyword `ultracode` in your prompt:

  ```text
  use a workflow to audit every route handler under src/routes/ for missing authentication checks, and adversarially verify each finding before reporting it
  ```

- **Let Claude decide:** `/effort ultracode` makes Claude plan a workflow for every substantive task in the session. It uses many more tokens per request; turn it off with `/effort ultracode off` for routine work.

Before a run starts, Claude Code shows the planned phases with options to run, view the raw script, or cancel (`Ctrl+G` opens the script in your editor). In auto mode you are asked only on the first launch. `/workflows` lists runs and opens a live view of each phase with agent counts, tokens and elapsed time; `p` pauses, `x` stops, `s` saves.

### Save and rerun

Press `s` on a run in `/workflows` to save its script to `.claude/workflows/` (shared with the repo) or `~/.claude/workflows/` (just you). It becomes a `/<name>` command. A saved script looks like this:

```javascript
export const meta = {
  name: 'audit-routes',
  description: 'Audit every route handler for missing auth checks',
}

const found = await agent('List every .ts file under src/routes/.', {
  schema: { type: 'object', required: ['files'], properties: { files: { type: 'array', items: { type: 'string' } } } },
})

const audits = await pipeline(found.files, file =>
  agent(`Audit ${file} for missing authentication checks.`, { label: file }),
)

return audits.filter(Boolean)
```

`agent()` spawns one subagent (with `schema` it returns validated JSON), `pipeline()` runs one per item, `parallel()` runs a set at once, `phase()` groups agents in the progress view, and a global `args` carries input such as a list of paths. `Date.now()` and `Math.random()` throw inside the script, so a resumed run repeats the same calls. The script cannot touch files or the shell itself; agents do that. Run `/workflow-authoring` before editing a script by hand. Plugins can ship workflows too, namespaced as `/<plugin>:<name>`.

### Workflows in headless runs

The `ultracode` keyword is deliberately ignored in a prompt passed with `-p`, as it is in webhook payloads and scheduled prompts, so text from outside cannot start a large run. A saved workflow does run headless when you name it and allow it:

```bash
claude -p "/audit-routes" --allowedTools "Workflow(audit-routes),Read" < /dev/null
```

`Workflow` alone in an allow rule approves every workflow. We checked this with a two-agent saved workflow under `claude -p`: it ran both agents and returned their combined report.

### Limits and cost

The runtime caps a run at 16 concurrent agents by default (`CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` raises it, up to 256), 4,096 items per `pipeline()` or `parallel()` call, and 1,000 agents in total. A run can use far more tokens than doing the same task in conversation, and on a subscription that draws on your usage limits. Claude Code shows a `Large workflow` warning when a run schedules more than 25 agents or projects more than 1.5 million tokens; the warning advises, it does not stop anything.

Control the spend before it happens:

- Run the workflow on one directory first, read the per-agent token counts in `/workflows`, then widen it.
- Set a size guideline with `/config workflowSizeGuideline=small` (fewer than 5 agents), `medium` (fewer than 10, the default on most plans) or `large` (fewer than 50). It is advice to Claude, not a cap.
- Ask for a smaller model on stages that do not need the strongest one.
- Turn workflows off entirely with `"disableWorkflows": true` in settings or `CLAUDE_CODE_DISABLE_WORKFLOWS=1`.

<!-- AUTHOR-DATA: token cost of one real workflow run (agents, tokens, minutes) compared with doing the same task in a single conversation -->

[Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents) covers when a fleet of agents helps and when it just burns tokens; [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured) covers measuring what it costs you.

### Check that it worked

- **A `-p` script:** run it by hand with `--output-format json` and check `jq '.is_error, .num_turns, .total_cost_usd'`. `is_error` should be `false`, and the turn count should be well under your `--max-turns`.
- **A CI gate:** feed it a diff with a known problem and confirm the job fails, then a clean diff and confirm it passes. A gate that has never failed has not been tested.
- **GitHub Actions:** comment `@claude` with a small request on a test PR. Claude should reply in the thread; if not, check the workflow run log and that the app is installed on the repository.
- **A workflow:** after the run, open `/workflows`, select it and confirm every phase finished and no agent shows as failed. A saved workflow should appear in `/` autocomplete under its name.

## Sources

- Run Claude Code programmatically (headless), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/headless
- CLI reference, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/cli-reference
- `claude --help`, Claude Code 2.1.289, run 2026-10-04.
- Claude Code GitHub Actions, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/github-actions
- Orchestrate subagents at scale with dynamic workflows, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/workflows
- Hooks reference: Workspace trust, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/hooks#workspace-trust
