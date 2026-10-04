# Team Workflows

> Verified on 2026-10-04 with Claude Code 2.1.289.

One developer with a good agent setup is productive. A team with a shared one is more than the sum of its members: everyone gets the same conventions, the same checks and the same tools, and one person's fix to the setup helps everybody. A team also has problems a solo developer does not. Pull requests arrive faster than people can read them, someone has to own what ships, and an administrator has to decide which models and tools are allowed at all.

This chapter covers five things: sharing the setup through the repository, turning code review into verification, automating team routines, enforcing conventions in the harness, and the admin controls a team lead or IT department can set.

## 1. Share the setup through the repository

Everything a teammate needs to get the same agent behavior should arrive with `git clone`. Personal preferences stay out.

| File | Committed? | What belongs in it |
| :- | :- | :- |
| `CLAUDE.md` (or `AGENTS.md`, imported from `CLAUDE.md`) | Yes | Build and test commands, conventions that differ from defaults, what not to touch |
| `.claude/settings.json` | Yes | Permission rules, hooks, required plugins |
| `.claude/skills/`, `.claude/agents/` | Yes | Team skills and subagents |
| `.mcp.json` | Yes, without secrets | Shared MCP servers; credentials come from `${VAR}` environment variables |
| `REVIEW.md` | Yes | Review-only rules for Code Review |
| `.claude/settings.local.json` | No | Personal overrides for one project. Claude Code keeps it out of git when it creates the file; add it to `.gitignore` if you create it by hand |
| `~/.claude/CLAUDE.md`, `~/.claude/settings.json` | No | Personal preferences across all projects |

Start the shared instruction file with `/init`, then cut it down. [CLAUDE.md and Agent-File Patterns](/en/book3-architect/03-claude-md-patterns) covers what actually changes agent behavior, and [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) covers putting these files under code-owner review so that rules do not change every time someone has an opinion.

### Require the team's plugins

If your team packages skills, agents and hooks as plugins, the repository can register the marketplace and turn the plugins on for everyone who opens it. In `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": { "source": "github", "repo": "acme-corp/claude-plugins" }
    }
  },
  "enabledPlugins": {
    "release-notes@acme-tools": true
  }
}
```

Claude Code applies `extraKnownMarketplaces` from a repository only after the developer accepts the workspace trust dialog for that folder. A plugin that the marketplace lists by relative path then loads from the marketplace. A plugin whose entry points at an external source has to be installed once by each developer with `claude plugin install <name>@<marketplace> --scope project`. [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods) covers building the marketplace itself.

### Check that it worked

Clone the repository into a fresh directory, start `claude`, accept the trust prompt, and run `/plugin`, `/skills` and `/memory`. A new teammate should see the team's plugins, skills and instruction file without having set anything up by hand.

## 2. Review becomes verification

The first edition said Claude could do a first-pass review "so human reviewers can focus on design and logic." That assumed humans still read every pull request. On many teams, they no longer can.

Gergely Orosz's September 2026 survey of how companies are handling this ("What is happening with code reviews?") cites GitHub data showing that the number of pull requests opened has increased fivefold over the period he examines, with pull requests and commits nearly doubling since the end of 2025 alone. Teams are responding in several ways: humans review the AI's review instead of the code; changes are triaged by blast radius; humans review the plan, the tests and the database schema rather than the implementation; teams produce less code; a minority still review everything by hand; and a few skip human review entirely. One company he describes, Duckbill, triaged by risk and nearly doubled its weekly merged pull requests (+94%), while the share merged within an hour rose from 28% to 45%.

Addy Osmani gives the principle: "Agents do the first pass and humans cover blast radius." He also gives the limit: your own cognitive bandwidth "does not scale in the same way" as the number of agents you can run. The job of a team's review process is to spend that limited attention where it matters, and to make sure a named person still owns what ships. [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals) has a three-tier policy (low, medium and high risk) and what each tier must pass. This section turns that policy into something a team runs every day.

### Write the policy into the pull request

Make the author, human or agent, supply what the reviewer needs. A pull request template does this for every PR:

```markdown
<!-- .github/pull_request_template.md -->
## Request
What was asked for, and the acceptance criteria. Link the issue or plan.

## Risk tier
- [ ] Low: internal tools, copy, styling, test-only
- [ ] Medium: business logic, endpoints, data transformations
- [ ] High: auth, payments, permissions, migrations, deletion, infrastructure

## Evidence
Commands run and their output (tests, build, screenshots).

## What could break
The agent's explanation of what this touches and how it could fail.
```

The "What could break" section puts Geoffrey Huntley's point into practice: code that nobody reads line by line still has to be explainable. Ask the agent for the explanation and judge it. If the explanation is muddled, the change is not ready.

### Route reviewers by tier

- **Every PR gets an automated first pass.** Use Code Review for GitHub (Team and Enterprise, research preview) or the GitHub Action workflow in section 3. A human reads the review's findings, not the diff. [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) covers how to keep those findings precise.
- **Medium-tier PRs** get a human review of the request, the tests and the explanation. Orosz's "review the plan, tests and schema, not the implementation" fits here. When the plan is wrong, catching it before implementation is much cheaper, so review plans in the issue, before any code exists.
- **High-tier PRs** also need a human who reads the diff. Enforce that with GitHub's `CODEOWNERS` and branch protection on the risky paths, not with a reminder:

```text
# .github/CODEOWNERS
/db/migrations/   @acme/data-owners
/src/auth/        @acme/security
/infra/           @acme/platform
```

Osmani's caution applies to the whole scheme: the number of checks is not quality. Review the tiers every few months against what actually broke.

<!-- AUTHOR-DATA: optional, the share of the author's team PRs that land in each tier, and how review time changed after adopting tiers -->

### Check that it worked

Open a test pull request that touches a high-tier path. It should request review from the right code owners and be blocked from merging without their approval. The automated review should post, and the template sections should be filled in. Then open a low-tier PR and confirm it can merge on automated checks alone.

## 3. Automate the team's routines

### Built-ins first

Several things the first edition built as custom skills now ship with Claude Code. Use them before writing your own:

- `/code-review` reviews a diff, branch or PR for correctness bugs. `--comment` posts the findings on the pull request.
- `/security-review` reviews the branch's changes for vulnerabilities.
- `/team-onboarding` generates an onboarding guide from your own Claude Code usage over the past 30 days: sessions, commands and MCP servers. A teammate pastes it as their first message. On Pro, Max, Team and Enterprise plans it also returns a share link a teammate can open directly in Claude Code.
- `companyAnnouncements` in settings shows a message at startup, for example a link to the team's agent guidelines.

### Team skills for what is specific to you

Write skills for workflows the built-ins do not know about: your migration procedure, your release checklist, your PR conventions. A PR-submission skill from the first edition still works and pairs well with the template above:

```markdown
---
name: submit-pr
description: Open a pull request for the current branch using the team template. Use when the user asks to open, create or submit a PR.
disable-model-invocation: true
---
1. Read `git log main..HEAD` and `git diff main...HEAD` to understand the whole branch.
2. Fill every section of .github/pull_request_template.md. Pick the risk tier
   from the paths touched; anything under db/migrations, src/auth or infra is High.
3. Under Evidence, run the test suite and paste the command and its result.
4. Under "What could break", explain what the change touches and how it could fail.
5. Create the PR with `gh pr create`. Do not merge.
```

Save it as `.claude/skills/submit-pr/SKILL.md` and commit it. `disable-model-invocation: true` keeps Claude from opening PRs on its own initiative; developers run `/submit-pr`. If your team also uses other agents, see [Portability](/en/book3-architect/11-portability) for keeping shared skills in a format every tool reads. [Custom Skills](/en/book2-advanced/02-custom-skills) covers writing skills in depth.

### Review in CI with the GitHub Action

The fastest setup is `/install-github-app` from inside Claude Code in a github.com repository. It installs the Claude GitHub App, adds the secret, and opens a pull request with the workflow. To write the workflow yourself, this one, from the docs, runs the `code-review` plugin on every pull request:

```yaml
# .github/workflows/claude-review.yml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]
jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
      issues: read
      id-token: write
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          plugin_marketplaces: "https://github.com/anthropics/claude-code.git"
          plugins: "code-review@claude-code-plugins"
          prompt: "/code-review:code-review --comment ${{ github.repository }}/pull/${{ github.event.pull_request.number }}"
          claude_args: '--allowedTools "mcp__github_inline_comment__create_inline_comment"'
```

Three details: `--comment` makes Claude post inline comments (without it, findings go only to the run log). The `claude_args` line is required because the action starts the inline-comment tool only when `--allowedTools` names it. And on public repositories, GitHub withholds secrets from fork pull requests, so this runs only on branches in the same repository. If you authenticate with a Claude subscription, replace the `anthropic_api_key` line with <code v-pre>claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}</code>. Add `--max-turns` to `claude_args` to bound cost (the flag is documented in the CLI reference but hidden from `claude --help`). [Automated Workflows](/en/book2-advanced/10-automated-workflows) covers scheduled and event-driven runs.

### Check that it worked

Run `/submit-pr` on a small branch and confirm the PR has every template section filled, including real test output. Push a commit to an open PR and confirm the review workflow runs and posts comments, or a summary comment when it finds nothing.

## 4. Conventions the harness enforces

An instruction in `CLAUDE.md` is advice. A rule the team cannot afford to see broken needs enforcement, and the best place for it is usually below the agent, where it also catches humans and other agents.

**Commit messages: use a git hook, not an agent hook.** The first edition did this with a Claude Code hook. A git `commit-msg` hook is simpler and applies to everyone. When it rejects a commit made by Claude, the error lands in the conversation and Claude fixes the message itself.

```bash
#!/usr/bin/env bash
# .githooks/commit-msg
pattern='^(feat|fix|refactor|docs|test|chore|perf|ci)(\([^)]+\))?!?: .+'
if ! head -n 1 "$1" | grep -qE "$pattern"; then
  echo "Commit message must look like 'type(scope): description'." >&2
  exit 1
fi
```

Make it executable with `chmod +x`, and have each clone run `git config core.hooksPath .githooks` (put that line in your setup script). Local hooks can be skipped, so repeat the check in CI for the merge.

**Protected paths: use permission rules, not a script.** To require confirmation before Claude edits migrations and to stop it from bypassing git hooks, add rules to the shared `.claude/settings.json`:

```json
{
  "permissions": {
    "ask": ["Edit(db/migrations/**)"],
    "deny": ["Bash(git commit --no-verify *)", "Bash(git push --force *)"]
  }
}
```

`Edit` rules cover every built-in file-editing tool. An explicit `ask` rule prompts even in auto mode. Bash rules match the command text Claude writes, not every way of running the same program (for example, `git commit -n` slips past the rule above). They are guardrails, not a security boundary. CI and branch protection remain the backstop. [Containment and Security](/en/book3-architect/09-containment-and-security) covers real boundaries.

**Agent hooks for what only the agent needs.** Use [hooks](/en/book2-advanced/09-hooks) when the check must run inside the agent's loop. Examples: a Stop hook that keeps Claude working until tests pass, or a hook that adds context before a tool runs. If you port first-edition hooks, fix two common errors. Hooks receive their input as JSON on stdin (for Bash, `jq -r '.tool_input.command'`), not in a `$CLAUDE_TOOL_INPUT` variable. And a hook must exit with code 2 to block; exit code 1 is a non-blocking error and the action goes ahead.

### Check that it worked

Ask Claude to commit with the message "updated stuff". The commit should fail with your hook's message, and Claude should retry with a conforming message. Ask Claude to edit a file under `db/migrations/`; you should get a permission prompt even in auto mode. Run `/permissions` to confirm which rules loaded and from which file.

## 5. Admin controls for teams and organizations

Managed settings let an organization set policy that developers cannot override. [Set up Claude Code for your organization](https://code.claude.com/docs/en/admin-setup) is the official decision map. The essentials follow.

### How settings reach machines

| Mechanism | Delivery | Priority |
| :- | :- | :- |
| Server-managed | claude.ai **Admin Settings > Claude Code > Managed settings** (Team and Enterprise, Owner role) | Highest |
| OS policy | macOS `com.anthropic.claudecode` plist; Windows `HKLM\SOFTWARE\Policies\ClaudeCode` | High |
| File | macOS `/Library/Application Support/ClaudeCode/managed-settings.json`; Linux and WSL `/etc/claude-code/managed-settings.json`; Windows `C:\Program Files\ClaudeCode\managed-settings.json` | Medium |
| Windows user registry | `HKCU\SOFTWARE\Policies\ClaudeCode` (writable without elevation, so not an enforcement channel) | Lowest |

Claude Code fetches server-managed settings at startup and refreshes them hourly. Sessions on Amazon Bedrock, Google Cloud's Agent Platform and Microsoft Foundry do not receive server-managed settings, so use a file or OS policy there. Managed values beat user and project settings. Array settings such as `permissions.deny` merge across sources, so developers can add to managed lists but not remove from them. `availableModels` is the exception: the managed list replaces the others.

### What to enforce

| Goal | Keys |
| :- | :- |
| Only managed permission rules apply; no bypass mode | `allowManagedPermissionRulesOnly`, `permissions.disableBypassPermissionsMode: "disable"` |
| OS-level sandbox with a network allowlist | `sandbox.enabled`, `sandbox.network.allowedDomains` |
| Fixed MCP servers | `managed-mcp.json` (exclusive: users cannot add others), or `managedMcpServers` (provided alongside users' own), plus `allowedMcpServers` and `deniedMcpServers` |
| Approved plugin sources | `strictKnownMarketplaces`, `blockedMarketplaces` |
| Only admin-approved hooks | `allowManagedHooksOnly` |
| Company accounts only | `forceLoginMethod` (`"claudeai"`, `"console"` or `"gateway"`), `forceLoginOrgUUID` |
| Approved API providers only | `allowedProviders` (v2.1.285+) |
| Cost and version guardrails | `maxEffortLevel`, `requiredMinimumVersion`, `requiredMaximumVersion` |
| Organization-wide instructions | A `CLAUDE.md` at the managed policy path; it loads in every session and cannot be excluded |

### Model allow and deny lists

Four keys control which models developers can run:

- `availableModels` restricts the models people can select for the main session, subagents, skills and the advisor.
- `enforceAvailableModels: true` extends that list to the **Default** option. Without it, a developer who picks Default in `/model` gets the account's runtime default, even if it is not on your list.
- `deniedModels` blocks specific models even when `availableModels` would allow them.
- `availableModelsMatch: "exact"` makes each model ID in `availableModels` allow only that version, so a new release stays blocked until you add it.

An entry such as `claude-opus-5` also permits later releases that extend it, such as Opus 5.5, as soon as Claude Code supports them. That is convenient until a new model changes behavior on your codebase before you have evaluated it. This managed configuration allows Opus and Sonnet, holds back Opus 5.5 until you have tested it, and refuses to start versions too old to understand `deniedModels`:

```json
{
  "availableModels": ["opus", "sonnet"],
  "deniedModels": ["claude-opus-5-5"],
  "requiredMinimumVersion": "2.1.283"
}
```

With this list, a developer whose Default would resolve to Opus 5.5 gets the newest permitted Opus instead. `deniedModels` and `availableModelsMatch` need v2.1.283 or later and are read only from managed settings. Claude Code ignores them, with a warning, anywhere else. On Claude Enterprise, admins can also disable models, set an organization default model and cap effort per role from the claude.ai admin console, with server-side enforcement. None of those console controls reach Bedrock, Agent Platform, Foundry or Claude Platform on AWS, where managed settings are the only route.

### See how the team uses it

- **Analytics dashboard** (Team and Enterprise, at claude.ai/analytics/claude-code): usage metrics, contribution metrics with GitHub integration (PRs and lines shipped with Claude Code assistance, public beta), a leaderboard, and CSV export. Console organizations have their own dashboard at platform.claude.com/claude-code.
- **Spend report** in the organization's analytics settings, for per-user token use and spend.
- **OpenTelemetry export** for per-session metrics in your own observability stack. [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured) shows how to use it.

Treat the leaderboard with care. Usage is not output, and a team that optimizes for it will get more usage.

### Check that it worked

On a developer's machine, run `/status`. The `Setting sources` line should show `Enterprise managed settings` with the winning source in parentheses, for example `(file)`. Open `/model`: a denied model should be missing. Launch `claude --model claude-opus-5-5`: Claude Code should drop the blocked model at startup and start on an allowed one.

## 6. Keep the team able to judge the work

A team that delegates most of its coding has a risk that solo developers feel less: nobody left who can tell whether the agent's work is right. An Anthropic study of 52 mostly junior engineers learning a new library found that those using AI assistance scored 50% on a follow-up quiz, against 67% for those coding by hand. The biggest gap was on debugging. Participants who asked the assistant conceptual questions did better than those who only asked for code.

At team level, that suggests three habits:

- **Rotate the high-tier reads.** The person who reads migration and auth diffs this month should not always be the same senior engineer. Pair a junior engineer with them.
- **Ask for explanations, not just code.** Make "What could break" in the PR template a real question, and discuss weak answers in review.
- **Do some work by hand on purpose,** especially in the parts of the system the team must be able to debug at 3 a.m.

[The Builder's Job Now](/en/book3-architect/13-builders-job-now) discusses this in more depth.

## Key takeaways

- Share the setup through the repository: instructions, settings, skills, agents, MCP servers and required plugins. Keep personal preferences in personal files.
- Human review does not scale with agent output. Triage by risk, give every PR an automated first pass, review plans and tests for medium-risk work, and require code owners to read high-risk diffs.
- Enforce conventions below the agent (git hooks, CI, branch protection) and use permission rules for guardrails. Agent hooks are for checks that must run inside the agent's loop.
- Managed settings set policy developers cannot override. Use `availableModels`, `enforceAvailableModels`, `deniedModels` and `availableModelsMatch` to control which models run, and `requiredMinimumVersion` so old clients cannot ignore those keys.
- Keep people who can judge the work: rotate risky reviews, ask for explanations, and keep some hand-work.

## Sources

- Gergely Orosz, "What is happening with code reviews?", The Pragmatic Engineer, 2026-09-08 (partly paywalled). https://newsletter.pragmaticengineer.com/p/what-is-happening-with-code-reviews
- Addy Osmani, "The Code Nobody Reads", 2026-09-28. https://addyo.substack.com/p/the-code-nobody-reads
- Addy Osmani, "Human judgment doesn't leave the software factory. It relocates.", 2026-08-21. https://addyo.substack.com/p/human-judgment-doesnt-leave-the-software
- Geoffrey Huntley, "software doesn't need to be readable anymore. it needs to be explainable.", 2026-10-02. https://ghuntley.com/readable/
- Judy Hanwen Shen and Alex Tamkin, "How AI assistance impacts the formation of coding skills", Anthropic, 2026-01-29. https://www.anthropic.com/research/AI-assistance-coding-skills
- Anthropic, Claude Code docs, accessed 2026-10-04: "Set up Claude Code for your organization" https://code.claude.com/docs/en/admin-setup ; "Configure server-managed settings" https://code.claude.com/docs/en/server-managed-settings ; "Managed settings" https://code.claude.com/docs/en/managed-settings ; "Settings reference" https://code.claude.com/docs/en/settings-reference ; "Settings" https://code.claude.com/docs/en/settings ; "Model configuration" (restrict model selection, block specific models) https://code.claude.com/docs/en/model-config ; "Manage plugins for your organization" https://code.claude.com/docs/en/plugins/org ; "Managed MCP" https://code.claude.com/docs/en/managed-mcp ; "Configure permissions" https://code.claude.com/docs/en/permissions ; "Configure auto mode" https://code.claude.com/docs/en/auto-mode-config ; "Hooks reference" https://code.claude.com/docs/en/hooks ; "Claude Code GitHub Actions" https://code.claude.com/docs/en/github-actions ; "Code Review" https://code.claude.com/docs/en/code-review ; "Commands" https://code.claude.com/docs/en/commands ; "Track team usage with analytics" https://code.claude.com/docs/en/analytics ; "Monitoring" https://code.claude.com/docs/en/monitoring-usage
- Anthropic, Claude Code changelog, 2.1.283 (`deniedModels`, `availableModelsMatch`) and 2.1.285 (`allowedProviders`). https://code.claude.com/docs/en/changelog
- Claude Code 2.1.289 CLI help (`claude --help`), 2026-10-04.
