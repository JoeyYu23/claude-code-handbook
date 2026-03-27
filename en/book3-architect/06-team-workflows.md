# Chapter 20: Team Workflows

## Claude Code as a Team Tool

Individual developers using Claude Code effectively is one thing. A team using it consistently is another — and considerably more valuable. When a team shares conventions, tools, and Claude configurations, every member benefits from the accumulated knowledge. Code review gets faster. Onboarding gets shorter. Standards get enforced without manual reminder.

This chapter covers the patterns that make Claude Code a force multiplier at the team level: shared CLAUDE.md configurations, consistent code review, PR automation, onboarding workflows, and team conventions.

---

## Sharing CLAUDE.md Across a Team

The foundational step for team-level Claude Code use is committing a CLAUDE.md to your repository. When every developer pulls the repository, they get the same Claude configuration that encodes your team's standards.

**What belongs in the shared CLAUDE.md:**

- Build, test, and lint commands
- Architectural conventions (where code lives, what patterns to use)
- Repository workflow (branch naming, commit format, PR conventions)
- Non-obvious environment requirements
- Team-specific gotchas

**What should stay out:**

- Personal preferences (each developer has `~/.claude/CLAUDE.md` for those)
- Credentials or environment variables
- Overly prescriptive instructions that reduce Claude's flexibility

**Initial setup:**

```bash
# Generate a starter CLAUDE.md from your project structure
claude
/init
```

Claude analyzes your codebase and generates a starting CLAUDE.md. Review it, add team-specific conventions, remove any incorrect inferences, and commit it.

**Evolving the CLAUDE.md over time:**

Treat CLAUDE.md like any other code artifact. When the team encounters a recurring issue — Claude keeps doing something wrong, a convention is repeatedly violated — add a rule to CLAUDE.md and commit it. Review the file in retrospectives. Prune instructions that no longer reflect reality.

---

## Consistent Code Review with Claude

Claude Code can perform a first-pass code review before human review, catching mechanical issues so human reviewers can focus on design and logic.

**The review skill:**

Create a shared review skill in `.claude/skills/review-pr/SKILL.md`:

```markdown
---
name: review-pr
description: Review the current branch changes for common issues
---
Review all changes in this branch against main.

Check for:
1. Missing tests for new functionality
2. Unhandled error cases
3. Security issues (injection, missing auth checks, exposed secrets)
4. Consistency with patterns in the existing codebase
5. Missing input validation on API endpoints
6. Performance concerns (N+1 queries, missing indexes for new queries)

For each issue found:
- Reference the specific file and line number
- Explain the concern
- Suggest the specific fix

At the end, give an overall assessment: Ready for review / Needs changes before review.
```

Any developer can run `/review-pr` before submitting a PR. This catches the easy issues before a human reviewer has to spend time on them.

**GitHub Actions integration:**

For automatic review on every PR, use the Claude Code GitHub Action:

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          direct_prompt: |
            Review the changes in this PR.
            Focus on correctness, security, and adherence to our standards in CLAUDE.md.
            Post a review comment summarizing your findings.
```

This runs Claude Code on every PR and posts a review comment automatically. The review catches mechanical issues consistently, regardless of which team member submitted the code.

---

## PR Automation

Beyond review, Claude Code can handle the mechanical parts of PR creation:

**Automated PR skill:**

```markdown
---
name: submit-pr
description: Create a pull request for the current branch
---
Prepare and submit a pull request for the current branch.

1. Review git log to understand all commits in this branch
2. Write a PR title following conventional commit format: type(scope): description
3. Write a PR description covering:
   - What changes were made and why
   - Testing approach
   - Any deployment considerations
   - Screenshots for UI changes (if applicable)
4. Create the PR using `gh pr create`
5. Add appropriate labels based on change type (bug, feature, refactor, docs)
```

Any developer runs `/submit-pr` when their feature is ready. The PR description is consistent and complete every time.

**Automated changelog:**

```markdown
---
name: update-changelog
description: Update CHANGELOG.md with changes since last release
---
Update CHANGELOG.md with all changes since the last version tag.

1. Run `git log $(git describe --tags --abbrev=0)..HEAD --oneline` to get commits
2. Group commits by type: Features, Bug Fixes, Performance, Documentation
3. Write human-readable descriptions (not just commit messages)
4. Add the new section under the [Unreleased] heading
5. Show me the diff for review before committing
```

---

## Onboarding New Team Members

CLAUDE.md significantly reduces new developer onboarding time. But a dedicated onboarding skill makes it even more effective:

**Create `.claude/skills/onboard/SKILL.md`:**

```markdown
---
name: onboard
description: Onboarding walkthrough for new team members
---
Guide the new team member through a codebase orientation.

1. Read CLAUDE.md and summarize the key conventions
2. Explain the project directory structure
3. Walk through how to run the development environment
4. Show the test strategy and how to run tests
5. Explain the git workflow and PR process
6. Identify 2-3 good "starter" tasks from recent GitHub issues
7. Ask if they have any questions

Be welcoming and thorough. Assume no prior familiarity with this codebase.
```

A new developer runs `/onboard` in their first session. Claude walks them through the codebase based on your CLAUDE.md and project structure, answers questions, and suggests first tasks — all without requiring a senior engineer to spend the time.

**Supplementary onboarding pattern:**

For teams with complex onboarding, create a dedicated onboarding doc that CLAUDE.md references:

```markdown
# CLAUDE.md (excerpt)
For new team members: read docs/ONBOARDING.md first.
It covers the development environment setup, key architectural decisions,
and common pitfalls to avoid.
```

---

## Knowledge Sharing Through Skills

Skills in `.claude/skills/` are checked into version control, which means the team's accumulated workflow knowledge is shared automatically:

**Common team skills to build:**

```
.claude/skills/
├── fix-issue/        # Fix a GitHub issue end-to-end
├── review-pr/        # Code review before submitting
├── submit-pr/        # Create a well-formed PR
├── db-migration/     # Create and test a database migration
├── add-endpoint/     # Add a new API endpoint following team patterns
├── onboard/          # New developer orientation
└── deploy-check/     # Pre-deployment checklist
```

Each of these encodes team knowledge in executable form. New developers do not need to memorize the PR checklist — they run `/submit-pr`. Engineers who do not write migrations often do not need to know the migration workflow by heart — they run `/db-migration`.

**Building skills as a team:**

The best skills emerge from real workflows. When someone notices they are repeating the same multi-step process:

1. Ask Claude to write a skill for it: "Write a skill for our team that automates the database migration workflow we always do manually"
2. Review and refine the skill
3. Commit it to `.claude/skills/`
4. Announce it to the team (a comment in Slack, a mention in standup)

Over time, the skills directory becomes a library of encoded team expertise.

---

## Team Conventions

Some team conventions are better enforced through hooks than CLAUDE.md instructions. The difference: hooks are deterministic and run regardless of what Claude is doing; CLAUDE.md instructions are advisory.

**Enforce commit message format:**

```json
// .claude/settings.json (checked into version control)
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/validate-commit-msg.sh",
            "description": "Validate conventional commit format"
          }
        ]
      }
    ]
  }
}
```

```bash
# .claude/hooks/validate-commit-msg.sh
#!/bin/bash
# Validates that Claude's git commit messages follow conventional commits
# Only runs on git commit commands
if echo "$CLAUDE_TOOL_INPUT" | grep -q "git commit"; then
  if ! echo "$CLAUDE_TOOL_INPUT" | grep -qE "^git commit.*\"(feat|fix|refactor|docs|test|chore|perf)(\(.+\))?: .+\""; then
    echo "Commit message must follow conventional commits: type(scope): description" >&2
    exit 1
  fi
fi
exit 0
```

**Block writes to protected directories:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"$CLAUDE_TOOL_INPUT\" | python3 .claude/hooks/check-protected-paths.py'",
            "description": "Block writes to migrations directory without explicit confirmation"
          }
        ]
      }
    ]
  }
}
```

---

## Managing Claude Code at the Organization Level

For larger organizations, managed settings and managed CLAUDE.md files enable consistent configuration across all developers without requiring individual setup:

**Managed CLAUDE.md** (deployed by IT to system paths):
```
macOS: /Library/Application Support/ClaudeCode/CLAUDE.md
Linux: /etc/claude-code/CLAUDE.md
```

This file loads for all users on the machine and cannot be excluded by individual settings. Use it for organization-wide standards: security policies, compliance requirements, approved tool lists.

**Managed MCP servers:**
```
macOS: /Library/Application Support/ClaudeCode/managed-mcp.json
Linux: /etc/claude-code/managed-mcp.json
```

This gives every developer the approved set of MCP tools (internal tools, approved external services) without requiring individual setup.

For monitoring usage at the team level, Claude Code exposes OpenTelemetry metrics that can be fed into your existing observability stack for per-developer and per-project token usage tracking.

---

**Next up:** [Chapter 7 — Remote Connection](./07-remote-connection.md) — Working across machines, devices, and locations.
