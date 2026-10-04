# Custom Skills

> Verified on 2026-10-04 with Claude Code 2.1.289.

A skill is a reusable set of instructions that Claude loads when it is relevant, or that you run by name with `/skill-name`. Skills are the cheapest way to teach Claude Code a procedure: the body costs nothing until it is used. But every skill also has a small, permanent cost, and a library of fifty skills written over a year can quietly make every session worse. This chapter covers how to write a skill, and then how to keep a skill library healthy.

Custom commands and skills are now the same thing. A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy`. Old command files keep working, but new work should use the skill format, which adds supporting files and more frontmatter.

## What a skill is

A skill is a directory with a `SKILL.md` file. The file has two parts:

1. **YAML frontmatter** between `---` markers: when and how the skill runs.
2. **Markdown content**: the instructions Claude follows once the skill is invoked.

Claude knows a skill exists because its name and `description` sit in a skill listing that is in context on every turn. The body loads only when you or Claude invoke the skill. Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard, with extensions such as invocation control, subagent execution and shell injection.

```yaml
---
description: Summarizes uncommitted changes and flags anything risky. Use when the user asks what changed, wants a commit message, or asks to review their diff.
---

## Current changes

!`git diff HEAD`

## Instructions

Summarize the changes above in two or three bullet points, then list any risks
such as missing error handling, hardcoded values, or tests that need updating.
If the diff is empty, say there are no uncommitted changes.
```

Save this as `~/.claude/skills/summarize-changes/SKILL.md`. The directory name becomes the command, `/summarize-changes`. The `` !`git diff HEAD` `` line runs before Claude sees the skill, and its output replaces the line, so Claude works from the real diff.

## Where skills live

| Location | Path | Loads in |
|---|---|---|
| Enterprise | `.claude/skills/<name>/SKILL.md` in the managed settings directory | Every user on machines where the organization deploys it |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects on this machine |
| Project | `.claude/skills/<name>/SKILL.md` | This repository; commit it to share |
| Nested | `<subdir>/.claude/skills/<name>/SKILL.md` | Sessions started in or below `<subdir>`, or once Claude touches files there |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Wherever the plugin is enabled, as `/plugin-name:skill-name` |

When two skills share a name, enterprise beats personal and personal beats project. Plugin skills never collide because they are namespaced. A skill with the same name as a bundled skill or built-in command replaces it in a local terminal session, but not its aliases: a project `code-review` skill replaces `/code-review`, while `/review` still runs the bundled one.

Personal skills do not reach cloud or Cowork sessions. To use a skill there, enable it on your claude.ai account, which limits you to the six frontmatter fields in the Agent Skills spec.

## Frontmatter reference

All fields are optional; `description` is the one to always write. Field names must match exactly. Claude Code silently ignores a field it does not recognize, and a YAML parse error loads the skill with no fields at all.

| Field | Purpose |
|---|---|
| `name` | Command name. Defaults to the directory name |
| `description` | What the skill does and when to use it. Claude matches requests against it |
| `when_to_use` | Extra trigger phrases, appended to the description |
| `argument-hint` | Autocomplete hint, such as `[issue-number]` |
| `arguments` | Named positional arguments, for `$name` substitution |
| `disable-model-invocation` | `true`: only you can run it. Also removes the description from Claude's context |
| `user-invocable` | `false`: hidden from the `/` menu; only Claude can run it |
| `allowed-tools` | Tools pre-approved **for the turn that invokes the skill**. Does not restrict anything |
| `disallowed-tools` | Tools removed from Claude's pool while the skill is active |
| `model` | Model for the rest of the current turn, or for the forked subagent with `context: fork` |
| `effort` | `low`, `medium`, `high`, `xhigh` or `max`, depending on the model |
| `context` | `fork` runs the skill in a subagent |
| `agent` | Which subagent type runs a forked skill (default `general-purpose`) |
| `background` | With `context: fork`, `false` waits for the result instead of running in the background |
| `hooks` | Hooks registered when the skill is invoked; they stay active for the rest of the session |
| `paths` | Globs; Claude auto-loads the skill only when working with matching files |
| `shell` | `bash` (default) or `powershell` for injected commands |

The combined `description` and `when_to_use` text is cut at 1,536 characters in the listing, so put the key use case first.

::: warning `allowed-tools` grants, it does not restrict
It is tempting to read `allowed-tools: Read, Grep, Glob` as "this skill can only read". It does not mean that. `allowed-tools` pre-approves the listed tools for one turn; every other tool stays callable under your normal permission rules. To keep a skill from using a tool, list it in `disallowed-tools`, or add a deny rule. Note also that a project skill's `allowed-tools` applies even in a `-p` run in a folder you never trusted, so read the `allowed-tools` of skills checked into a repository before you run Claude Code there.
:::

## Writing a task skill

This skill commits staged changes. It is a task with side effects, so only you should trigger it:

```yaml
---
name: commit
description: Stage and commit the current changes with a conventional commit message
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(git diff *)
---

1. Run `git diff --staged` to see what is staged.
2. Write a Conventional Commits message (`feat:`, `fix:`, `refactor:`, `docs:`,
   `test:`, `chore:`). Subject under 72 characters. Add a body only if the
   "why" is not obvious from the diff.
3. Commit, then show the result with `git log --oneline -1`.
```

If Claude tries to run a `disable-model-invocation` skill on its own, Claude Code blocks the call and tells it not to reproduce the steps another way. Expect Claude to suggest that you run `/commit` yourself.

### Arguments

`$ARGUMENTS` expands to everything typed after the command. `$ARGUMENTS[0]`, or the shorthand `$0`, is the first argument, `$1` the second, and so on, with shell-style quoting:

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
argument-hint: <component> <from> <to>
---

Migrate the $0 component from $1 to $2. Preserve all existing behavior and tests.
```

`/migrate-component SearchBar React Vue` fills all three. If a skill gets arguments but has no placeholder, Claude Code appends `ARGUMENTS: <value>` so nothing is lost. Other substitutions include `${CLAUDE_SKILL_DIR}` (the skill's own folder, useful for bundled scripts), `${CLAUDE_PROJECT_DIR}` and `${CLAUDE_SESSION_ID}`.

### Bundled scripts without permission prompts

Use the same variable in the body and in `allowed-tools`, and the script runs without a prompt:

```yaml
---
name: render-chart
description: Render a chart from a CSV file
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)
---

Run `${CLAUDE_SKILL_DIR}/scripts/render.sh <csv-file>` to render the chart.
```

### Shell injection, carefully

`` !`command` `` (or a fenced block opened with ` ```! `) runs before Claude sees the skill. Three rules catch people out:

- A failing command aborts the whole invocation, and Claude never sees the skill. Append `|| true` to a check that exits non-zero on findings.
- Injected commands never prompt. Outside auto mode, a command your rules would ask about aborts the invocation; pre-approve it with `allowed-tools`.
- Organizations can turn injection off with `"disableSkillShellExecution": true`. Each command is then replaced with a placeholder.

### Running a skill in a subagent

`context: fork` runs the skill in a fresh subagent of the type named in `agent`. The subagent does not see your conversation, so the skill must stand on its own. Since 2.1.218 a forked skill runs in the background by default and its result arrives when done; set `background: false` when the next step needs the result. A forked skill that runs in the background edits outside your checkpoints, so `/rewind` will not undo its changes.

## How skills stay in context

Understanding the lifecycle explains most "Claude stopped following my skill" reports.

- **The listing is always on.** Every skill Claude can invoke adds its name and description to every turn, used or not. The listing's budget is 1% of the model's context window. When it overflows, Claude Code drops descriptions from your least-used skills first, which removes the keywords Claude matches on.
- **The body stays once loaded.** An invoked skill enters the conversation as one message and stays across turns. Claude Code does not re-read the file, so a step like "run the tests" is read once; "run the tests after every edit" keeps applying.
- **Compaction keeps only the start.** After auto-compaction, Claude Code re-attaches the most recent invocation of each skill, keeping its first 5,000 tokens, within a combined 25,000-token budget filled from the most recent skill backward. Put the important rules at the top.
- **`allowed-tools` is per turn.** The grant clears when you send your next message, even though the instructions stay.

## Keeping a skill library healthy

### Measure cost and use with `/skill-doctor`

`/skill-doctor` (2.1.252 and later) shows what each of your skills costs in context and how often it is used. It flags listed skills that have never been invoked and tells you where to turn each one off. Start with the never-used skills that cost the most. In an interactive session the report opens in the `/plugin` manager's **Stats** tab; with `-p` it prints as text. It needs feature-flag fetching and does not run over Remote Control.

`/doctor` also estimates the listing's total cost and its biggest contributors, and the Skills row in `/context` shows the size of the listing after the budget is applied.

### Turn skills down without deleting them

The `skillOverrides` setting changes visibility without editing `SKILL.md`, which is useful for skills checked into a shared repository. The `/skills` menu writes it for you: highlight a skill, press `Space` to cycle states, `Esc` to save to `.claude/settings.local.json`.

```json
{
  "skillOverrides": {
    "legacy-context": "name-only",
    "deploy": "off"
  }
}
```

| Value | Listed to Claude | In `/` menu |
|---|---|---|
| `"on"` | Name and description | Yes |
| `"name-only"` | Name only | Yes |
| `"user-invocable-only"` | Hidden | Yes |
| `"off"` | Hidden | Hidden |

`name-only` is the useful middle ground: the skill stays available but stops spending description budget. Plugin skills ignore `skillOverrides`; manage those through `/plugin`.

### Keep the body short

Keep `SKILL.md` under 500 lines and move reference material to supporting files that Claude reads only when needed:

```text
api-reference/
├── SKILL.md            # overview and navigation
├── endpoints.md        # loaded when needed
├── error-codes.md      # loaded when needed
└── scripts/
    └── check.sh        # executed, not loaded
```

Once loaded, every line of the body is a recurring token cost for the rest of the session. State what to do; skip the narration of why.

### Audit for stale instructions

Run `/doctor prompt-audit` after a model upgrade. It checks your `CLAUDE.md` files, skills, agents and commands for outdated or conflicting instructions and for prompting patterns written for older models. Addy Osmani makes the case in "Audit your Agent files" (August 2026): agent instructions have a half-life as models improve, files grow every time someone patches a misbehavior with a new rule, and the bloat lowers adherence. He says he now runs `/doctor` every few weeks and makes each instruction earn its place again.

To find skills whose frontmatter does not parse, run:

```bash
claude plugin validate ~/.claude/skills
claude plugin validate .claude/skills
```

### Prove a skill helps

Seeing a skill trigger proves Claude found it, not that it helped. The check is a baseline comparison: run a few realistic prompts in fresh sessions with the skill on and again with it set to `"off"` in `skillOverrides`, then compare. Two tools automate this. The `skill-creator` plugin (`/plugin install skill-creator@claude-plugins-official`) runs with-skill vs without-skill comparisons, blind A/B tests between two versions, and description tuning that measures how often the skill triggers on prompts that should and should not trigger it. For a skill that ships in a plugin, `claude plugin eval` does the same with graders and a CI exit code; see [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods).

## When a skill hurts

A skill is not free, and some make things worse. Watch for these:

- **It never runs.** It still pays the listing cost on every turn of every session. `/skill-doctor` finds these.
- **It triggers on the wrong requests.** A vague description ("helps with code") pulls the skill into unrelated work and loads a body that steers Claude off course. Make the description specific, or set `disable-model-invocation: true`.
- **It encodes a rule that must always hold.** Skills are guidance Claude applies with judgment, and Claude can drift from them, especially after compaction. If a rule must never be broken (no edits to `migrations/`, always run the formatter), make it a [hook](/en/book2-advanced/09-hooks). You can keep the hook with the skill through its `hooks` frontmatter.
- **It duplicates what the model already does.** A baseline run that scores the same with and without the skill means the skill is only adding tokens. Instructions written to coax an older model are the usual suspects, which is why `/doctor prompt-audit` looks for them.
- **It conflicts with another instruction.** Two skills, or a skill and `CLAUDE.md`, that disagree make behavior depend on which one loaded last. `/doctor prompt-audit` flags many of these.
- **It grants more than it should.** A repository skill with broad `allowed-tools` widens what Claude can do without a prompt for anyone who runs Claude Code in that repo.

## Troubleshooting

**The skill is not in the `/` menu.** Check the path (`.claude/skills/<name>/SKILL.md`), that the frontmatter's opening `---` is the very first line, and that nested skills only load once Claude touches their directory. Run `/reload-skills` after adding a skill mid-session.

**Claude does not use the skill.** Ask "What skills are available?" to see whether it is listed, then sharpen the description with words users actually say. If you have many skills, the description may have been dropped from the listing; check `/context` and `/skill-doctor`.

**The skill triggers too often.** Narrow the description, add `paths`, or set `disable-model-invocation: true`.

**Personal skills disappeared.** Look in `~/.claude/skills/.trash/` and move the folder back before the 30-day retention sweep.

### Check that it worked

1. Create the `summarize-changes` skill above, edit any file in a git repository, start `claude`, and ask "What did I change?". Claude should invoke the skill and summarize your real diff.
2. Run `/skills` and confirm the skill is listed; press `t` to sort by token count.
3. Run `/skill-doctor` and confirm the new skill shows a context cost and a usage count of at least one.
4. Run `claude plugin validate ~/.claude/skills` in your shell. It should end with `✔ Validation passed`.

## Sources

- Extend Claude with skills, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/skills
- Commands reference (`/skill-doctor`, `/skills`, `/doctor`), Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- What's new, Week 36 (August 31 – September 4, 2026): `/skill-doctor`, Anthropic. https://code.claude.com/docs/en/whats-new/2026-w36
- Claude Code changelog, 2.1.283 (2026-09-25): `/doctor prompt-audit`, Anthropic. https://code.claude.com/docs/en/changelog
- Agent Skills open standard, agentskills.io, accessed 2026-10-04. https://agentskills.io
- Addy Osmani, "Audit your Agent files", 2026-08-27. https://addyo.substack.com/p/audit-your-agent-files
