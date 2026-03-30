# Chapter 1: Harness Engineering

Harness engineering is the practice of designing an *engineered system* that shapes how Claude Code behaves across projects, sessions, and teams. Rather than accepting Claude's default behavior, you intentionally combine CLAUDE.md instructions, hooks, skills, agents, and settings into a "harness" — a programmable AI work environment that enforces your standards, automates tedious checks, and makes complex workflows reliable.

The metaphor is apt: a harness is not the horse or the rider. It is the carefully designed equipment connecting them — controlling direction, enforcing safety, and distributing load efficiently. Without it, raw power is unpredictable. With it, even a novice can direct a powerful machine.

This chapter teaches you to build harnesses that make Claude Code work the way *you* want it to work.

---

## What Is a Harness?

A harness is a multi-layered configuration that:

1. **Declares behavioral expectations** — CLAUDE.md tells Claude what matters to you
2. **Enforces quality gates** — Hooks prevent unsafe or unvetted changes
3. **Teaches reusable patterns** — Skills provide Claude with reliable workflows
4. **Delegates focused work** — Agents isolate discrete tasks in separate contexts
5. **Restricts dangerous operations** — Settings and permissions establish safety rails

Without a harness, Claude operates in isolation. Each conversation starts fresh. You must re-explain your priorities, your code style, your testing standards, your team's practices. Claude often makes unnecessary decisions because it lacks context about what matters to you.

With a harness, Claude operates within a *designed system*. It boots up with context about your preferences. It automatically runs quality checks before committing code. It knows which skills to reach for. It understands when to fork into a specialized agent rather than guess in the main context.

The result: fewer context explanations, fewer failures, fewer surprises.

---

## The Five Layers of a Harness

A complete harness has five layers, each serving a distinct role:

### Layer 1: CLAUDE.md — Behavioral Instructions

CLAUDE.md is a plain-text file in `~/.claude/` (personal) or `.claude/` (project-level) that teaches Claude your values, style, and constraints.

**What it contains:**
- Development philosophy (e.g., "prefer editing existing files; minimal changes")
- Code quality standards (function size, naming, comments)
- Project-specific context (tech stack, test commands, deployment process)
- Emergency procedures (what to do if something breaks)
- Values (privacy, automation, team practices)

**How it works:**
Claude reads CLAUDE.md on every session start and treats it as a "system context" that shapes all decisions. It is declarative, not imperative — you state what matters, not every action Claude should take.

**Example personal CLAUDE.md (fictional user alice):**

```markdown
# Alice's Development Harness

## Philosophy
- Prefer iterative refinement: build minimal version, then improve
- Assume mistakes are learning, not failures
- Code readability > clever optimizations

## Code Quality
- Functions under 50 lines
- Variable names should explain intent
- Avoid broad try/catch blocks
- Test-first for critical paths

## Project Context
- Tech: React + Node.js
- Test command: `npm test`
- Linter: ESLint + Prettier
- Must be runnable in under 5 seconds

## Values
- Security: no API keys in code
- Privacy: never push personal data
- Reproducibility: all work in git
```

This is *not* a checklist Claude must follow. It is context Claude uses to make better decisions.

### Layer 2: Hooks — Reactive Automation

Hooks are shell scripts, HTTP requests, or AI prompts that run automatically when Claude takes specific actions. They enforce quality gates without interrupting your workflow.

**Common hook patterns:**

| Trigger | Example | Purpose |
|---------|---------|---------|
| Before commit | Run linter on changed files | Prevent style violations |
| After file edit | Validate YAML syntax | Catch config errors immediately |
| Before shell command | Check if command is in allowlist | Prevent accidental destruction |
| After agent spawns | Log which agent was created | Track decision patterns |

**Example hook configuration (in `.claude/settings.json`, fictional acme-app project):**

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/verify-before-commit.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "tool == \"Edit\"",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/lint-typescript.sh"
          }
        ]
      }
    ]
  }
}
```

Hooks live inside `settings.json` under the `"hooks"` key — not in a separate file. Each event (like `Stop` or `PostToolUse`) maps to an array of objects containing a `matcher` expression and a `hooks` array. When Claude finishes a response (Stop trigger), this hook runs a verification script. If the script returns exit code 0, the action proceeds. If it returns 2, the action is blocked with an error message.

Hooks are the enforcement layer. While CLAUDE.md *suggests*, hooks *require*.

### Layer 3: Skills — Reusable Capabilities

Skills are markdown files that teach Claude how to perform specific tasks reliably. Rather than reinvent the wheel on every project, you build a library of skills that Claude can invoke automatically or on demand.

**Skill anatomy:**

Each skill has:
- A YAML frontmatter declaring the skill name, description, and metadata
- Markdown instructions that Claude follows when the skill is invoked
- Optional supporting files (templates, examples, scripts) for reference

**Example skill (fictional acme-app project):**

```yaml
---
name: test-push
description: Run full test suite before pushing to origin. Ensures no broken commits go upstream.
allowed-tools: Bash(npm test, git push *)
---

## Before pushing:

1. **Run the test suite:** `npm test`
2. **Check git status:** `git status`
3. **Review uncommitted changes:** Are there any unexpected files?
4. **Report results:** Tell the user if tests passed and git is clean
5. **Only after tests pass:** Push with `git push origin main`

If any test fails, stop and ask the user to fix it first.
```

When you type `/test-push`, Claude follows these instructions exactly. When Claude is about to push code on its own, it sees this skill in its context and invokes it automatically if relevant.

### Layer 4: Agents — Specialized Workers

Agents are focused sub-instances of Claude that work in isolation, with their own system prompt and tool access. You use agents when you want to split a large task into smaller, independently verifiable pieces.

**Common agent patterns:**

| Agent | Specialization | Tool Access | Example |
|-------|---|---|---|
| Explore | Fast code search & analysis | Read-only | Understand a new codebase before planning |
| Plan | Codebase research for specifications | Read-only | Gather requirements before implementation |
| Review | Code quality & security assessment | Read-only | Peer-review work before merge |
| Validator | Schema & API contract checking | Read, Bash | Verify data formats and integrations |

**When to use agents:**

- **Context isolation:** You are working on a complex 10-file feature and do not want exploratory search noise in your main context
- **Specialized judgment:** You want a focused "code reviewer" that is not distracted by implementation details
- **Parallel work:** You want to research requirements while another agent starts implementation
- **Token budgets:** You need to work within strict token limits and want to isolate expensive operations

**Example agent configuration:**

Agent configuration uses YAML frontmatter in `.claude/agents/<name>.md` files. See the [official docs](https://code.claude.com/docs/en/sub-agents) for the current schema.

Here is an illustrative example (verify field names against official documentation):

```markdown
---
name: Code Reviewer
description: Reviews pull requests for security, performance, and style issues
allowed-tools: Read, Glob, Grep
---

When reviewing code, follow this checklist:

1. Read the PR description first
2. List all changed files
3. For each critical change, ask:
   - Could this fail at scale?
   - Could this be exploited?
   - Does this violate project style?
4. Report only critical issues
```

### Layer 5: Settings & Permissions — Safety Rails

Settings are configuration files (typically `settings.json` in `.claude/`) that restrict which tools Claude can use and under what conditions.

**Key setting types:**

- **permissions.allow:** Tool patterns Claude can use without prompting (e.g., `Bash(npm test:*)`, `Read`, `Edit`)
- **permissions.deny:** Tool patterns Claude must never use (e.g., `Bash(rm -rf:*)`, `Bash(sudo:*)`)
- **permissions.defaultMode:** The default permission mode — `default`, `acceptEdits`, `bypassPermissions`, or `plan`

**Example settings.json (fictional acme-app project):**

```json
{
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Bash(npm test:*)",
      "Bash(npm run build:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Read",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)",
      "Bash(kill -9:*)"
    ]
  }
}
```

With this configuration, Claude can freely run tests, builds, and git status checks, but cannot run `rm -rf` or `sudo` under any circumstances. Any tool not in the `allow` list requires your approval before use.

---

## Design Principles

Effective harnesses follow five principles:

### Principle 1: Declarative Over Imperative

State *what matters to you*, not *how Claude should work in every scenario*.

Bad (imperative): "When the user asks you to refactor, you must run the linter, then the tests, then ask for approval."

Good (declarative): "We value correctness first. Linting and testing are non-negotiable. We use test-driven development."

Claude infers the correct behavior from the declaration. You do not micromanage every step.

### Principle 2: Fail-Safe Defaults

Set defaults that are conservative. Require *opt-in* for risky operations, not opt-out.

Bad: "Claude can delete files unless told otherwise."

Good: "Claude cannot delete files. To allow deletion, you must explicitly approve or add the operation to allowed-tools."

### Principle 3: Observable Behavior (Logging & Journaling)

Harnesses should be transparent. You must be able to answer:
- Which decisions did Claude make?
- Which hooks ran and why?
- Which agents were spawned?
- What rules were applied?

Use hooks to log decisions to files or external systems. Use journaling to create a permanent record of conversations. This is not about surveillance — it is about understanding what your harness is doing.

### Principle 4: Layered Enforcement

Different layers enforce different strictness levels:

1. **CLAUDE.md** — Soft guidance (Claude should follow, but is not prevented from ignoring)
2. **Hooks** — Medium enforcement (hooks can block actions, but are scripted, not impossible)
3. **Settings** — Hard enforcement (settings prevent tools from being used at all)

A well-designed harness uses all three layers. CLAUDE.md for taste, hooks for quality, settings for safety.

### Principle 5: Composability

Skills and agents should be composable building blocks, not monolithic scripts. Each skill should do one thing well. Each agent should have a clear responsibility. They should work together without creating dependencies.

Bad: A single "deploy" skill that includes testing, linting, releasing, and notifying.

Good: Separate skills for "test," "lint," "release," and "notify." Combine them in a workflow.

---

## The Plan → Work → Review Pattern

The most mature harnesses follow a three-phase cycle:

### Phase 1: Plan

Before writing any code, establish a contract. The planner agent (or the user) documents:
- What will be built?
- How will we know it is done?
- What risks exist?
- What is the implementation order?

Output: `Plans.md` with clear acceptance criteria.

### Phase 2: Work

The worker agent (or your main Claude session) implements the plan. As work happens:
- Hooks enforce quality gates (linting, testing)
- Self-review skills validate that work matches the plan
- Sub-agents handle specialized tasks (security review, performance analysis)

Output: Completed, tested, reviewed code.

### Phase 3: Review

Before merging, a review agent examines the work from multiple perspectives:
- Does it match the plan?
- Are there security issues?
- Are there performance bottlenecks?
- Does it follow code style?
- Are there edge cases?

Output: Approved, documented, merge-ready code.

Only after review passes does the code merge. This cycle ensures that by the time code reaches main, it has been examined by multiple perspectives and passes multiple quality gates.

---

## Pattern Catalog: Common Harness Patterns

### Pattern 1: Auto-Quality

**Goal:** Run linting and testing automatically on every file edit.

**Implementation:**

1. Create a hook that fires on every file edit
2. Hook runs eslint and any formatters
3. If linting fails, hook blocks the edit with an error message

**Example hook (in `settings.json`):**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "tool == \"Edit\" || tool == \"Write\"",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/lint-ts.sh",
            "timeout": 20
          }
        ]
      }
    ]
  }
}
```

**Benefit:** Claude never commits unlinted code. You never have to ask "did you lint?"

### Pattern 2: Journal

**Goal:** Create an immutable log of all Claude decisions and work.

**Implementation:**

1. Create a hook that logs on every major event (agent spawn, commit, tool use)
2. Hook writes to `.claude/journal/<date>.md`
3. Each entry includes timestamp, action, and context

**Example journal entry:**

```markdown
## 2025-03-26

### 09:15 — Agent spawned: Explore
- Reason: Understanding new codebase section
- Duration: 3m 42s
- Result: Found 7 relevant files

### 09:20 — Commit: feat: add user authentication
- Files: 3 modified, 2 added
- Tests: 12 new, all passing
- Hooks: lint ✓, test ✓, security ✓
```

**Benefit:** You have a complete record. Debugging becomes easier. You can track patterns in Claude's behavior.

### Pattern 3: Safety-Gate

**Goal:** Prevent destructive operations unless explicitly approved.

**Implementation:**

1. Use settings.json to block dangerous commands
2. Create a skill that implements the "dangerous" operation safely (with confirmations)
3. Users invoke the skill instead of raw commands

**Example (in `settings.json`):**

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git reset --hard:*)"
    ]
  }
}
```

Instead, create a skill `/safe-delete`:

```yaml
---
name: safe-delete
description: Safely delete files with confirmation
---

1. Ask user: "Delete {{file}}? This cannot be undone."
2. Only if user confirms, run: rm {{file}}
3. Report: "File deleted."
```

**Benefit:** Prevents accidental destruction. Teaches safe patterns.

### Pattern 4: Expertise

**Goal:** Provide Claude with domain-specific knowledge it does not have by default.

**Implementation:**

1. Create a skill for each domain (AWS deployment, GraphQL schema design, etc.)
2. Skill includes best practices, common pitfalls, examples
3. Claude invokes automatically when relevant

**Example skill (fictional):**

```yaml
---
name: deploy-aws-lambda
description: Deploy Node.js code to AWS Lambda with best practices for cold starts, IAM, and monitoring.
---

When deploying to AWS Lambda:

1. **Choose the right memory:** 128 MB is too small; start with 1024 MB
2. **Bundle dependencies:** Ensure node_modules is included in the zip
3. **Use environment variables** for secrets, never hardcode
4. **Set appropriate timeout:** 60 seconds is common, but depends on use case
5. **Monitor CloudWatch Logs:** Always check logs after deployment
```

**Benefit:** Claude has instant access to expert guidance without you needing to explain it every time.

### Pattern 5: Memory

**Goal:** Share knowledge across sessions.

**Implementation:**

1. Store project context in `.claude/CLAUDE.md`
2. Use hooks to update CLAUDE.md when new patterns emerge
3. Use journaling to create searchable project history
4. Store common decisions in a `DECISIONS.md` file

**Example DECISIONS.md (fictional):**

```markdown
# Architecture Decisions

## 2025-03-20 — Use React hooks instead of class components
- Decided: All new code must use hooks
- Rationale: Simpler, composable, easier to test
- Exception: Existing class components are left as-is

## 2025-03-15 — API responses use camelCase
- Decided: API always returns `firstName`, not `first_name`
- Rationale: Consistency with JavaScript conventions
- Enforced by: OpenAPI schema validation
```

**Benefit:** Claude remembers past decisions and rationales. You do not have to re-explain architecture every session.

---

## Building Your First Harness: Step-by-Step

Here is how to build a working harness for a fictional project `acme-app`:

### Step 1: Create CLAUDE.md

```bash
mkdir -p acme-app/.claude
cat > acme-app/.claude/CLAUDE.md << 'EOF'
# ACME App Development Harness

## Philosophy
- Prioritize correctness and user safety
- Code clarity beats clever optimizations
- All changes go through tests and review
- Team-friendly: document decisions

## Code Quality
- TypeScript strict mode enabled
- Functions under 50 lines
- All async operations must have error handling
- No broad try/catch blocks

## Testing
- Jest for unit tests (`npm test`)
- Playwright for e2e tests (`npm run test:e2e`)
- Coverage must stay above 70%
- Before pushing: all tests must pass

## Deployment
- Only deploy from main branch
- Deployment requires manual approval
- Always run pre-deployment checklist
EOF
```

### Step 2: Create Settings with Hooks

Hooks are configured inside `settings.json`, not in a separate file:

```bash
cat > acme-app/.claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Bash(npm test:*)",
      "Bash(npm run build:*)",
      "Read",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git reset --hard:*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "tool == \"Edit\"",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/lint.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/pre-commit.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
EOF
```

### Step 3: Create Hook Scripts

```bash
mkdir -p acme-app/.claude/hooks

cat > acme-app/.claude/hooks/lint.sh << 'EOF'
#!/bin/bash
# Lint TypeScript files

FILE=$1
npx eslint "$FILE" --fix 2>&1

if [ $? -ne 0 ]; then
  echo "Linting failed for $FILE"
  exit 2
fi

exit 0
EOF

chmod +x acme-app/.claude/hooks/lint.sh

cat > acme-app/.claude/hooks/pre-commit.sh << 'EOF'
#!/bin/bash
# Run tests before committing

npm test --coverage 2>&1

if [ $? -ne 0 ]; then
  echo "Tests failed. Fix before committing."
  exit 2
fi

exit 0
EOF

chmod +x acme-app/.claude/hooks/pre-commit.sh
```

### Step 4: Create a Skill

```bash
mkdir -p acme-app/.claude/skills/test-and-push

cat > acme-app/.claude/skills/test-and-push/SKILL.md << 'EOF'
---
name: test-and-push
description: Run full test suite and push to origin only if tests pass
---

## Before pushing to origin:

1. Run the test suite: `npm test`
2. Check coverage: Coverage must be > 70%
3. Check git status: Are there uncommitted changes?
4. If all checks pass: `git push origin main`
5. If any check fails: Stop and report the error

Only push if all tests pass.
EOF
```

### Step 5: Verify the Settings

The permissions and hooks were already configured in Step 2 inside `settings.json`. Review the file to make sure it covers your needs:

```bash
cat acme-app/.claude/settings.json
```

If you need to add more allowed or denied tools, edit the `permissions.allow` and `permissions.deny` arrays. For example, to allow git push but deny npm publish:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test:*)",
      "Bash(npm run build:*)",
      "Bash(git push:*)",
      "Read",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git reset --hard:*)",
      "Bash(npm publish:*)"
    ]
  }
}
```

### Step 6: Test the Harness

1. Start a Claude Code session in the `acme-app` directory
2. Ask Claude: "What do you know about this project?"
3. Claude should read `.claude/CLAUDE.md` and describe the harness
4. Ask Claude to make a test edit (e.g., "Add a console.log to src/main.ts")
5. The hook should run and enforce linting
6. Verify that Claude cannot run `rm -rf` (blocked by permissions deny list)

---

## Anti-Patterns: What NOT to Do

### Anti-Pattern 1: Over-Configuration

**Problem:** You create 50 hooks, 30 skills, and 5 agents for a small project.

**Why it fails:** Harnesses become maintenance burdens. Hooks conflict. Skills are duplicated. Claude spends time reading configuration instead of doing work.

**Fix:** Start minimal. Add harness layers only when Claude fails without them. A single CLAUDE.md + two hooks is often enough.

### Anti-Pattern 2: Conflicting Layers

**Problem:** CLAUDE.md says "always test first," but settings allow skipping tests. Hooks enforce TypeScript strict mode, but a skill disables it.

**Why it fails:** Claude gets contradictory instructions and becomes paralyzed. Harness credibility breaks down.

**Fix:** Layers should reinforce, not contradict. If something is critical, enforce it at the settings layer. If it is flexible, keep it in CLAUDE.md.

### Anti-Pattern 3: Hooks That Block Frequently

**Problem:** A hook blocks Claude's work 80% of the time because the rule is too strict.

**Why it fails:** Claude learns to work around the hook instead of respecting it. You spend time explaining exceptions.

**Fix:** Make rules realistic. If a rule blocks too often, it is a bad rule. Revise or remove it.

### Anti-Pattern 4: Abandoned Journals & Decisions

**Problem:** You set up a journal, but never read it. You create DECISIONS.md, but do not update it.

**Why it fails:** The harness records decisions, but you do not benefit. Claude forgets past decisions because they are not in memory.

**Fix:** Review your journal weekly. Update DECISIONS.md when new patterns emerge. Use `/memory` to reload past decisions.

### Anti-Pattern 5: Hardcoding Specifics in CLAUDE.md

**Problem:** CLAUDE.md contains: "When working on the dashboard, always use the react-grid-layout library."

**Why it fails:** CLAUDE.md becomes a maintenance nightmare. You cannot change decisions without editing CLAUDE.md. It becomes too specific to be reusable.

**Fix:** Keep CLAUDE.md general and timeless. Use skills for specific patterns. Use decisions files for project-specific choices.

---

## References

1. **Anthropic Engineering Blog** — "Effective Harnesses for Long-Running Agents" (anthropic.com/engineering)
2. **Anthropic Engineering Blog** — "Harness Design for Long-Running Application Development" (anthropic.com/engineering)
3. **HumanLayer Blog** — "Skill Issue: Harness Engineering for Coding Agents" ([humanlayer.dev/blog](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents))
4. **GitHub — Chachamaru127/claude-code-harness** — Plan-Work-Review cycle implementation ([github.com](https://github.com/Chachamaru127/claude-code-harness))
5. **GitHub — ChrisWiles/claude-code-showcase** — Real-world harness configurations ([github.com](https://github.com/ChrisWiles/claude-code-showcase))
6. **Claude Code Official Docs** — Custom Skills & Agents ([claude.ai](https://claude.ai))

---

## Key Takeaways

- A harness is not configuration. It is an *engineered system* that makes Claude Code behavior reliable and predictable.
- Five layers — CLAUDE.md, hooks, skills, agents, settings — each serve distinct purposes.
- Effective harnesses follow five principles: declarative, fail-safe, observable, layered, composable.
- The Plan-Work-Review cycle ensures quality at every stage.
- Start minimal. Add complexity only when Claude fails without it.
- Your harness is a living system. Review it quarterly. Refine as patterns emerge.

---

**Next up:** [Chapter 2 — Agent Teams](./02-agent-teams.md) — orchestrating multiple Claude Code sessions working together.
