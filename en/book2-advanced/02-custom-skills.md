# Chapter 2: Custom Skills

Skills are Claude Code's mechanism for extending its behavior with reusable, shareable workflows. A skill is a Markdown file with optional YAML frontmatter that teaches Claude how to perform a specific task — either when you invoke it explicitly with `/skill-name`, or automatically when Claude detects the skill is relevant to what you are asking.

If you have used the built-in `/batch` or `/simplify` commands, you have already used skills. Those are bundled skills that ship with Claude Code. This chapter covers how to write your own.

---

## What a Skill Actually Is

A skill is a directory containing a `SKILL.md` file. The file has two parts:

1. **YAML frontmatter** (between `---` markers) — configuration metadata that tells Claude when and how to invoke the skill.
2. **Markdown content** — the instructions Claude follows when the skill runs.

When you type `/my-skill`, Claude reads the `SKILL.md`, follows the instructions in the markdown body, and uses the permissions defined in the frontmatter. When you do not invoke it directly, Claude still knows the skill exists because its `description` field is always loaded into context — so Claude can invoke it automatically when relevant.

Skills follow the [Agent Skills open standard](https://agentskills.io), which means they work across multiple AI tools, not just Claude Code.

---

## Skill File Format

Here is a minimal skill:

```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
```

The `name` becomes the slash command. The `description` is what Claude reads to decide when to invoke the skill automatically. The markdown body is what Claude reads when the skill is actually running.

---

## Skill Directory Structure

Each skill lives in its own directory:

```text
my-skill/
├── SKILL.md           # Main instructions (required)
├── template.md        # Template for Claude to fill in (optional)
├── examples/
│   └── sample.md      # Example output showing expected format (optional)
└── scripts/
    └── validate.sh    # Script Claude can execute (optional)
```

The `SKILL.md` is the entrypoint. Supporting files are loaded by Claude only when the instructions reference them — they do not consume context unless needed. This lets you build rich skills with detailed reference material without paying context cost upfront.

---

## Where to Store Skills

| Location | Path | Applies to |
|---|---|---|
| Enterprise | Managed settings | All users in your organization |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<skill-name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | Where plugin is enabled |

Personal skills are available everywhere on your machine. Project skills are scoped to one repo and can be checked into version control for your team. When a skill exists at multiple levels with the same name, the higher-priority level wins (enterprise > personal > project).

---

## Frontmatter Reference

All frontmatter fields are optional except that `description` is strongly recommended.

```yaml
---
name: deploy
description: Deploy the application to production. Invoke manually; do not trigger automatically.
disable-model-invocation: true
allowed-tools: Bash(./scripts/deploy.sh *)
argument-hint: [environment]
context: fork
agent: Explore
model: opus
effort: high
hooks:
  Stop:
    - hooks:
        - type: command
          command: "./scripts/verify-deploy.sh"
---
```

| Field | Purpose |
|---|---|
| `name` | The slash command name. Defaults to directory name. Lowercase, hyphens, max 64 chars. |
| `description` | What the skill does and when to use it. Claude reads this to decide when to load the skill. |
| `argument-hint` | Shown in autocomplete. Example: `[issue-number]` or `[filename] [format]`. |
| `disable-model-invocation` | Set `true` to prevent Claude from triggering this skill automatically. Use for workflows with side effects. |
| `user-invocable` | Set `false` to hide from the `/` menu. Use for background knowledge that users should not invoke directly. |
| `allowed-tools` | Tools Claude can use without asking permission when this skill is active. |
| `model` | Model to use when this skill runs. Accepts aliases like `haiku` or full model IDs. |
| `effort` | Effort level for the model when this skill runs: `low`, `medium`, `high`, `max`, or `auto`. |
| `context` | Set `fork` to run in an isolated subagent context. |
| `agent` | Which subagent type to use when `context: fork` is set. |
| `hooks` | Lifecycle hooks scoped to this skill's execution lifetime. |

---

## Creating Your First Skill

This walkthrough creates a skill that generates a conventional git commit message from your staged changes.

**Step 1: Create the skill directory**

```bash
mkdir -p ~/.claude/skills/commit
```

**Step 2: Write the SKILL.md**

```yaml
---
name: commit
description: Generate a conventional commit message from staged changes and commit
disable-model-invocation: true
allowed-tools: Bash(git *)
---

Generate and commit staged changes with a conventional commit message.

1. Run `git diff --staged` to see what is staged
2. Analyze the changes to understand what was modified and why
3. Write a commit message following Conventional Commits format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code restructuring
   - `docs:` for documentation changes
   - `test:` for test changes
   - `chore:` for maintenance tasks
4. The subject line must be under 72 characters
5. If there is a meaningful "why" behind the changes, add it as a body paragraph
6. Run `git commit -m "<message>"` to create the commit
7. Show the resulting commit with `git log --oneline -1`
```

**Step 3: Test it**

Stage some changes, then run:

```text
/commit
```

Claude reads the diff, analyzes the changes, and produces a commit message like `feat: add rate limiting to authentication endpoints`.

The `disable-model-invocation: true` flag is critical here. You do not want Claude to commit your code automatically when it thinks a task is done — only when you explicitly invoke `/commit`.

---

## Passing Arguments

Skills support arguments through the `$ARGUMENTS` placeholder:

```yaml
---
name: fix-issue
description: Fix a GitHub issue by number
disable-model-invocation: true
allowed-tools: Bash(gh *), Read, Edit, Bash(npm test)
argument-hint: <issue-number>
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Run `gh issue view $ARGUMENTS` to read the issue description
2. Understand the requirements and acceptance criteria
3. Find the relevant files in the codebase
4. Implement the fix with tests
5. Run the test suite to verify the fix
6. Create a commit referencing the issue: `git commit -m "fix: <description> (#$ARGUMENTS)"`
```

Usage:

```text
/fix-issue 847
```

For multiple positional arguments, use `$ARGUMENTS[0]`, `$ARGUMENTS[1]`, etc., or the shorthand `$0`, `$1`, `$2`:

```yaml
---
name: migrate-module
description: Migrate a module from one framework to another
---

Migrate the $0 module from $1 to $2.

Keep all existing tests passing. Preserve the public API contract.
Document any breaking changes in a MIGRATION.md file.
```

Usage:

```text
/migrate-module UserAuth Express Fastify
```

---

## Dynamic Context with Shell Commands

The `!`command`` `` syntax runs a shell command before the skill content is sent to Claude. The output is substituted inline, so Claude receives real data rather than the command itself.

```yaml
---
name: pr-summary
description: Summarize the changes in the current pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context

- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`
- PR description: !`gh pr view --json title,body`

## Your task

Provide a concise summary of this pull request including:
1. What changed and why (based on the description and diff)
2. The key implementation decisions
3. Potential risks or things reviewers should focus on
```

When this skill runs, the four shell commands execute first, their output is inserted, and Claude receives a fully-populated prompt with the actual PR data.

This is preprocessing at skill invocation time. Claude never sees the backtick commands — only their results.

---

## Controlling Who Invokes a Skill

Two frontmatter fields let you control who can invoke a skill:

**`disable-model-invocation: true`**: Only you can invoke the skill with `/skill-name`. Claude cannot trigger it automatically. Use for anything with side effects — deployments, commits, notifications.

**`user-invocable: false`**: The skill is hidden from the `/` menu. Claude can load it automatically when relevant, but you cannot invoke it directly. Use for background reference material — things like "here are the API conventions for this codebase" that Claude should know about but that are not actions you would consciously take.

| Configuration | You invoke | Claude invokes | When loaded |
|---|---|---|---|
| Default | Yes | Yes | Description always in context; full skill loads on invocation |
| `disable-model-invocation: true` | Yes | No | Not loaded until you invoke |
| `user-invocable: false` | No | Yes | Description always in context; full skill loads when Claude uses it |

---

## Restricting Tools

Use `allowed-tools` to limit what Claude can do when a skill is active:

```yaml
---
name: safe-audit
description: Audit the codebase for issues without making any changes
allowed-tools: Read, Grep, Glob
---

Audit the codebase and produce a report of:
1. Dead code (functions defined but never called)
2. Duplicate logic that could be consolidated
3. Missing error handling
4. TODO comments that have been there over 6 months

Do not make any changes. Report only.
```

With `allowed-tools: Read, Grep, Glob`, the skill cannot write, edit, or run bash commands — even if the user normally allows those tools.

---

## Real-World Skill Examples

**Code style enforcer** — automatically triggered when Claude edits Python files:

```yaml
---
name: python-style
description: Python coding conventions for this project. Load when reading or writing Python code.
user-invocable: false
---

This project follows these Python conventions:

- Type hints on all public function signatures
- Docstrings in Google format for all public functions and classes
- Maximum line length: 100 characters
- Use `pathlib.Path` instead of `os.path`
- Use `logging` not `print()` for any operational output
- All exceptions must be caught explicitly; never use bare `except:`

When generating or modifying Python code, verify these rules are followed.
```

**Changelog generator:**

```yaml
---
name: changelog
description: Generate a changelog entry for the current release
disable-model-invocation: true
allowed-tools: Bash(git *)
argument-hint: [version]
---

Generate a changelog entry for version $ARGUMENTS.

1. Run `git log $(git describe --tags --abbrev=0)..HEAD --oneline` to get commits since last tag
2. Group commits by type: Features, Bug Fixes, Performance, Documentation, Internal
3. Write the entry in Keep a Changelog format
4. Prepend it to the CHANGELOG.md file
5. Show the entry for review
```

**Database migration helper:**

```yaml
---
name: migration
description: Generate a database migration file from a schema change description
disable-model-invocation: true
allowed-tools: Bash(python manage.py *), Read
argument-hint: <description of schema change>
---

Generate a Django database migration for: $ARGUMENTS

1. Read the current models in `app/models.py`
2. Understand what schema change is needed
3. Write the migration operations in Django migration format
4. Create the file at `app/migrations/XXXX_<snake_case_description>.py` using the correct sequential number
5. Verify the migration is valid by running `python manage.py sqlmigrate app <migration_name> --no-color`
```

---

## Supporting Files

When a skill needs substantial reference material, keep `SKILL.md` focused and move the detail into supporting files:

```text
api-reference/
├── SKILL.md            # Overview and navigation (keep under 500 lines)
├── endpoints.md        # All endpoint documentation
├── authentication.md   # Auth flows and examples
└── error-codes.md      # Error reference
```

In `SKILL.md`, reference the supporting files so Claude loads them when needed:

```markdown
## API Reference Skill

When working with this API:

- For endpoint documentation, see [endpoints.md](endpoints.md)
- For authentication flows, see [authentication.md](authentication.md)
- For error handling, see [error-codes.md](error-codes.md)

Apply the patterns in these files when generating or reviewing API calls.
```

Claude only loads the referenced files when the task actually requires them, keeping context usage efficient.

---

## Troubleshooting

**Skill not appearing in `/` menu:** Verify the `SKILL.md` file exists in a properly named directory under `.claude/skills/` or `~/.claude/skills/`. Check that the `name` field uses only lowercase letters, numbers, and hyphens.

**Claude not triggering the skill automatically:** Sharpen the `description` field with more specific trigger phrases. If a user says "how does this function work?", the description should contain phrases like "explaining how code works" or "understanding code behavior."

**Skill triggering when you do not want it:** Add `disable-model-invocation: true` to the frontmatter, or make the description more specific about when it applies.

**Too many skills overloading context:** Skill descriptions are loaded at startup up to a budget of approximately 2% of the context window (with a fallback of 16,000 characters). If you have many skills, less-used ones may be excluded. Run `/context` to check for warnings. You can override the limit with the `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable.

---

**Next up:** [Chapter 3 — Skill Composition](./03-skill-composition.md) — Chaining skills together, building workflow libraries, and patterns for advanced skill design.
